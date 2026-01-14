import * as cdk from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import { InfraStack } from '../lib/infra-stack';

let template: Template;

beforeAll(() => {
  const app = new cdk.App();
  const stack = new InfraStack(app, 'TestStack', {
    env: { account: '123456789012', region: 'us-east-1' }
  });
  template = Template.fromStack(stack);
});

describe('VPC Configuration', () => {
  test('VPC is created with correct configuration', () => {
    template.hasResourceProperties('AWS::EC2::VPC', {
      EnableDnsHostnames: true,
      EnableDnsSupport: true,
    });
  });

  test('VPC has NAT Gateway', () => {
    template.resourceCountIs('AWS::EC2::NatGateway', 1);
  });

  test('VPC has public and private subnets', () => {
    // VPC with 2 AZs creates multiple subnets (public + private per AZ)
    const subnetCount = template.findResources('AWS::EC2::Subnet');
    expect(Object.keys(subnetCount).length).toBeGreaterThan(0);
  });
});

describe('ECS Configuration', () => {
  test('ECS Cluster is created', () => {
    template.hasResourceProperties('AWS::ECS::Cluster', {
      ClusterName: 'kings-trust-cluster',
    });
  });

  test('Fargate Task Definition has correct resources', () => {
    template.hasResourceProperties('AWS::ECS::TaskDefinition', {
      Cpu: '1024',
      Memory: '2048',
      NetworkMode: 'awsvpc',
      RequiresCompatibilities: ['FARGATE'],
    });
  });

  test('Fargate Service is created with correct configuration', () => {
    template.hasResourceProperties('AWS::ECS::Service', {
      ServiceName: 'kings-trust-nextjs',
      DesiredCount: 1,
      LaunchType: 'FARGATE',
    });
  });

  test('Container has correct environment variables', () => {
    template.hasResourceProperties('AWS::ECS::TaskDefinition', {
      ContainerDefinitions: Match.arrayWith([
        Match.objectLike({
          Name: 'NextJsContainer',
          Environment: Match.arrayWith([
            { Name: 'NODE_ENV', Value: 'production' },
          ]),
        }),
      ]),
    });
  });
});

describe('IAM Permissions', () => {
  test('Task role has Bedrock permissions', () => {
    template.hasResourceProperties('AWS::IAM::Policy', {
      PolicyDocument: {
        Statement: Match.arrayWith([
          Match.objectLike({
            Action: Match.arrayWith([
              'bedrock:InvokeModel',
              'bedrock:InvokeModelWithResponseStream',
            ]),
            Effect: 'Allow',
          }),
        ]),
      },
    });
  });
});

describe('Load Balancer', () => {
  test('Application Load Balancer is created', () => {
    template.hasResourceProperties('AWS::ElasticLoadBalancingV2::LoadBalancer', {
      Name: 'kings-trust-alb',
      Scheme: 'internet-facing',
      Type: 'application',
    });
  });

  test('Target Group has correct health check', () => {
    template.hasResourceProperties('AWS::ElasticLoadBalancingV2::TargetGroup', {
      Port: 3000,
      Protocol: 'HTTP',
      TargetType: 'ip',
      HealthCheckPath: '/',
      HealthCheckIntervalSeconds: 30,
    });
  });

  test('Listener is configured on port 80', () => {
    template.hasResourceProperties('AWS::ElasticLoadBalancingV2::Listener', {
      Port: 80,
      Protocol: 'HTTP',
    });
  });
});

describe('CloudFront Distribution', () => {
  test('CloudFront Distribution is created', () => {
    template.hasResourceProperties('AWS::CloudFront::Distribution', {
      DistributionConfig: Match.objectLike({
        Comment: 'Kings Trust Next.js Application',
        Enabled: true,
      }),
    });
  });

  test('CloudFront redirects HTTP to HTTPS', () => {
    template.hasResourceProperties('AWS::CloudFront::Distribution', {
      DistributionConfig: Match.objectLike({
        DefaultCacheBehavior: Match.objectLike({
          ViewerProtocolPolicy: 'redirect-to-https',
        }),
      }),
    });
  });
});

describe('Auto Scaling', () => {
  test('Auto Scaling Target is configured', () => {
    template.hasResourceProperties('AWS::ApplicationAutoScaling::ScalableTarget', {
      MinCapacity: 1,
      MaxCapacity: 10,
    });
  });

  test('CPU-based scaling policy exists', () => {
    template.hasResourceProperties('AWS::ApplicationAutoScaling::ScalingPolicy', {
      PolicyType: 'TargetTrackingScaling',
      TargetTrackingScalingPolicyConfiguration: Match.objectLike({
        PredefinedMetricSpecification: {
          PredefinedMetricType: 'ECSServiceAverageCPUUtilization',
        },
        TargetValue: 70,
      }),
    });
  });

  test('Memory-based scaling policy exists', () => {
    template.hasResourceProperties('AWS::ApplicationAutoScaling::ScalingPolicy', {
      PolicyType: 'TargetTrackingScaling',
      TargetTrackingScalingPolicyConfiguration: Match.objectLike({
        PredefinedMetricSpecification: {
          PredefinedMetricType: 'ECSServiceAverageMemoryUtilization',
        },
        TargetValue: 80,
      }),
    });
  });
});

describe('CloudWatch Logs', () => {
  test('Log Group is created with correct retention', () => {
    template.hasResourceProperties('AWS::Logs::LogGroup', {
      LogGroupName: '/ecs/kings-trust-nextjs',
      RetentionInDays: 7,
    });
  });
});

describe('Stack Outputs', () => {
  test('LoadBalancerURL output exists', () => {
    template.hasOutput('LoadBalancerURL', {
      Description: 'URL of the Application Load Balancer (HTTP only)',
    });
  });

  test('CloudFrontURL output exists', () => {
    template.hasOutput('CloudFrontURL', {
      Description: 'CloudFront URL with HTTPS',
    });
  });
});

describe('Resource Count Validation', () => {
  test('Correct number of security groups', () => {
    // At least one security group for the service
    const securityGroups = template.findResources('AWS::EC2::SecurityGroup');
    expect(Object.keys(securityGroups).length).toBeGreaterThan(0);
  });

  test('Single ECS service is created', () => {
    template.resourceCountIs('AWS::ECS::Service', 1);
  });

  test('Single CloudFront distribution is created', () => {
    template.resourceCountIs('AWS::CloudFront::Distribution', 1);
  });
});
