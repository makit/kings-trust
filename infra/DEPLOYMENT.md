# Kings Trust Infrastructure Deployment

This CDK project deploys the Kings Trust Next.js application on AWS Fargate with auto-scaling and public load balancer access.

## Architecture

- **VPC**: 2 Availability Zones with public and private subnets
- **ECS Cluster**: Fargate-based container orchestration
- **Application Load Balancer**: Public-facing HTTP endpoint
- **Auto Scaling**: 2-10 tasks based on CPU (70%) and Memory (80%) utilization
- **IAM Permissions**: Task role with Bedrock and DynamoDB access
- **CloudWatch Logs**: Container logs retained for 7 days

## Prerequisites

1. AWS CLI configured with appropriate credentials
2. AWS CDK CLI installed (`npm install -g aws-cdk`)
3. Docker installed and running (required for building container images)
4. Node.js 18+ installed

## Deployment Steps

### 1. Bootstrap CDK (first time only)
```bash
cd infra
cdk bootstrap
```

### 2. Install dependencies
```bash
npm install
```

### 3. Build the project
```bash
npm run build
```

### 4. Review the CloudFormation template
```bash
cdk synth
```

### 5. Deploy the stack
```bash
cdk deploy
```

This will:
- Build the Next.js application Docker image
- Create all AWS resources (VPC, ECS, ALB, etc.)
- Deploy 2 initial Fargate tasks
- Output the load balancer URL

## Post-Deployment

After deployment completes, you'll see an output like:
```
InfraStack.LoadBalancerURL = http://kings-trust-alb-1234567890.us-east-1.elb.amazonaws.com
```

Visit this URL to access your deployed application.

## Configuration

### Environment Variables
To add environment variables to the container, edit [infra-stack.ts](lib/infra-stack.ts) and modify the `environment` section:

```typescript
environment: {
  NODE_ENV: 'production',
  MY_VARIABLE: 'value',
},
```

### Scaling Configuration
Adjust auto-scaling parameters in [infra-stack.ts](lib/infra-stack.ts):
- `minCapacity` / `maxCapacity`: Task count range (currently 2-10)
- `targetUtilizationPercent`: CPU/Memory thresholds (currently 70%/80%)

### Task Resources
Modify compute resources in the task definition:
- `memoryLimitMiB`: Currently 2048 MB
- `cpu`: Currently 1024 (1 vCPU)

## AWS Permissions

The Fargate tasks have the following IAM permissions:
- **Bedrock**: InvokeModel, InvokeModelWithResponseStream
- **DynamoDB**: PutItem, GetItem, UpdateItem, Query, Scan

## Cleanup

To delete all resources:
```bash
cdk destroy
```

## Troubleshooting

### View Container Logs
```bash
aws logs tail /ecs/kings-trust-nextjs --follow
```

### Check Service Status
```bash
aws ecs describe-services --cluster kings-trust-cluster --services kings-trust-nextjs
```

### Docker Build Issues
Ensure Docker is running and you have sufficient disk space. The build happens during `cdk deploy`.

## Cost Optimization

- **Development**: Set `desiredCount: 1` and `minCapacity: 1` to reduce costs
- **Production**: Use the current settings (2-10 tasks) for high availability
- Consider using Fargate Spot for non-critical workloads (requires additional configuration)

## Next Steps

1. Add HTTPS support with ACM certificate
2. Configure custom domain with Route53
3. Add CloudWatch alarms for monitoring
4. Implement CI/CD pipeline
5. Add secrets management with AWS Secrets Manager
