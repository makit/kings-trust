import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as path from 'path';

export interface InfraStackProps extends cdk.StackProps {
  dbSecretArn?: string;
}

export class InfraStack extends cdk.Stack {
  public readonly vpc: ec2.Vpc;

  constructor(scope: Construct, id: string, props?: InfraStackProps) {
    super(scope, id, props);

    // Create VPC with public and private subnets
    this.vpc = new ec2.Vpc(this, 'KingsTrustVpc', {
      maxAzs: 2,
      natGateways: 1,
    });

    // Create ECS Cluster
    const cluster = new ecs.Cluster(this, 'KingsTrustCluster', {
      vpc: this.vpc,
      clusterName: 'kings-trust-cluster',
    });

    // Task Execution Role (for pulling images and writing logs)
    const executionRole = new iam.Role(this, 'TaskExecutionRole', {
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AmazonECSTaskExecutionRolePolicy'),
      ],
    });

    // Task Role (for application permissions - Bedrock access)
    const taskRole = new iam.Role(this, 'TaskRole', {
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
    });

    // Grant Bedrock permissions to the task role
    taskRole.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'bedrock:InvokeModel',
        'bedrock:InvokeModelWithResponseStream',
        'bedrock:InvokeAgent',
      ],
      resources: ['*'],
    }));

    // Grant Secrets Manager access for database credentials
    taskRole.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ['secretsmanager:GetSecretValue'],
      resources: ['*'], // Restrict to specific secret ARN in production
    }));

    // Create Fargate Task Definition
    const taskDefinition = new ecs.FargateTaskDefinition(this, 'NextJsTaskDef', {
      memoryLimitMiB: 2048,
      cpu: 1024,
      executionRole,
      taskRole,
    });

    // Create log group for container logs
    const logGroup = new logs.LogGroup(this, 'NextJsLogGroup', {
      logGroupName: '/ecs/kings-trust-nextjs',
      retention: logs.RetentionDays.ONE_WEEK,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Add container to task definition
    const container = taskDefinition.addContainer('NextJsContainer', {
      image: ecs.ContainerImage.fromAsset(path.join(__dirname, '../../web')),
      logging: ecs.LogDrivers.awsLogs({
        streamPrefix: 'nextjs',
        logGroup,
      }),
      environment: {
        NODE_ENV: 'production',
        BEDROCK_MODEL_ID: 'global.anthropic.claude-sonnet-4-5-20250929-v1:0',
        ...(props?.dbSecretArn && { DB_SECRET_ARN: props.dbSecretArn }),
      },
      portMappings: [
        {
          containerPort: 3000,
          protocol: ecs.Protocol.TCP,
        },
      ],
    });

    // Create Application Load Balancer
    const alb = new elbv2.ApplicationLoadBalancer(this, 'NextJsALB', {
      vpc: this.vpc,
      internetFacing: true,
      loadBalancerName: 'kings-trust-alb',
      // Increase idle timeout to support long-running requests (default is 60s)
      idleTimeout: cdk.Duration.seconds(120),
    });

    // Create target group
    const targetGroup = new elbv2.ApplicationTargetGroup(this, 'NextJsTargetGroup', {
      vpc: this.vpc,
      port: 3000,
      protocol: elbv2.ApplicationProtocol.HTTP,
      targetType: elbv2.TargetType.IP,
      healthCheck: {
        path: '/',
        healthyHttpCodes: '200',
        interval: cdk.Duration.seconds(30),
        timeout: cdk.Duration.seconds(5),
        healthyThresholdCount: 2,
        unhealthyThresholdCount: 3,
      },
      deregistrationDelay: cdk.Duration.seconds(30),
      // Increase target timeout to allow for longer-running requests (LLM calls)
      slowStart: cdk.Duration.seconds(120),
    });

    // Add listener to ALB
    const listener = alb.addListener('NextJsListener', {
      port: 80,
      protocol: elbv2.ApplicationProtocol.HTTP,
      defaultTargetGroups: [targetGroup],
    });

    // Create Fargate Service
    const fargateService = new ecs.FargateService(this, 'NextJsService', {
      cluster,
      taskDefinition,
      desiredCount: 1,
      serviceName: 'kings-trust-nextjs',
      assignPublicIp: false,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      },
      securityGroups: [
        new ec2.SecurityGroup(this, 'ServiceSecurityGroup', {
          vpc: this.vpc,
          description: 'Security group for Next.js Fargate service',
          allowAllOutbound: true,
        }),
      ],
    });

    // Allow ALB to communicate with Fargate service
    fargateService.connections.allowFrom(
      alb,
      ec2.Port.tcp(3000),
      'Allow traffic from ALB'
    );

    // Attach Fargate service to target group
    fargateService.attachToApplicationTargetGroup(targetGroup);

    // Configure Auto Scaling
    const scaling = fargateService.autoScaleTaskCount({
      minCapacity: 1,
      maxCapacity: 10,
    });

    // Scale based on CPU utilization
    scaling.scaleOnCpuUtilization('CpuScaling', {
      targetUtilizationPercent: 70,
      scaleInCooldown: cdk.Duration.seconds(60),
      scaleOutCooldown: cdk.Duration.seconds(60),
    });

    // Scale based on memory utilization
    scaling.scaleOnMemoryUtilization('MemoryScaling', {
      targetUtilizationPercent: 80,
      scaleInCooldown: cdk.Duration.seconds(60),
      scaleOutCooldown: cdk.Duration.seconds(60),
    });

    // Create CloudFront distribution for HTTPS
    const distribution = new cloudfront.Distribution(this, 'NextJsDistribution', {
      defaultBehavior: {
        origin: new origins.LoadBalancerV2Origin(alb, {
          protocolPolicy: cloudfront.OriginProtocolPolicy.HTTP_ONLY,
          // Increase timeouts for long-running requests (LLM API calls, etc.)
          readTimeout: cdk.Duration.seconds(120), // Timeout for reading from origin
          keepaliveTimeout: cdk.Duration.seconds(120), // Keep-alive timeout
        }),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
        cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED, // Disable caching for dynamic content
        originRequestPolicy: cloudfront.OriginRequestPolicy.ALL_VIEWER,
      },
      comment: 'Kings Trust Next.js Application',
    });

    // Output URLs
    new cdk.CfnOutput(this, 'LoadBalancerURL', {
      value: `http://${alb.loadBalancerDnsName}`,
      description: 'URL of the Application Load Balancer (HTTP only)',
    });

    new cdk.CfnOutput(this, 'CloudFrontURL', {
      value: `https://${distribution.distributionDomainName}`,
      description: 'CloudFront URL with HTTPS',
    });
  }
}
