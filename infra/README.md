# Kings Trust Infrastructure

AWS CDK infrastructure for deploying the Kings Trust Next.js application on Fargate with auto-scaling, CloudFront HTTPS, and AWS Bedrock integration.

## Architecture

This stack deploys a production-ready containerized Next.js application with:

### Core Infrastructure
- **VPC**: Multi-AZ deployment across 2 availability zones with public and private subnets
- **ECS Fargate**: Containerized application with 1 vCPU and 2GB RAM per task
- **Application Load Balancer**: HTTP endpoint for CloudFront origin
- **CloudFront**: HTTPS endpoint with AWS-managed SSL certificate
- **Auto Scaling**: 1-10 tasks based on CPU (70%) and memory (80%) utilization

### Security & Permissions
- **Task Role**: AWS Bedrock (InvokeModel) access for AI-powered features
- **Network Security**: Tasks run in private subnets with security group restrictions
- **IAM**: Principle of least privilege with minimal required permissions

### Observability
- **CloudWatch Logs**: Container logs with 7-day retention
- **Health Checks**: ALB health checks on root path with 30s intervals

## Prerequisites

1. **AWS CLI** configured with appropriate credentials
2. **AWS CDK CLI** installed: `npm install -g aws-cdk`
3. **Docker** installed and running (required for building container images)
4. **Node.js 18+** installed

## Quick Start

### First Time Setup

1. Install dependencies:
```bash
npm install
```

2. Bootstrap CDK (first time only per account/region):
```bash
cdk bootstrap
```

### Deploy

```bash
npm run build
cdk deploy
```

Deployment takes approximately 10-15 minutes and includes:
- Building the Next.js Docker image from `../web/`
- Creating VPC, ECS cluster, ALB, and CloudFront distribution
- Deploying initial Fargate task
- Configuring auto-scaling policies

### Post-Deployment

After deployment, you'll see two URLs in the output:

```
InfraStack.LoadBalancerURL = http://kings-trust-alb-xxxxx.region.elb.amazonaws.com
InfraStack.CloudFrontURL = https://dxxxxxxxxxxxxx.cloudfront.net
```

**Use the CloudFront URL** for HTTPS access to your application.

## Configuration

### Environment Variables

Modify container environment in [lib/infra-stack.ts](lib/infra-stack.ts):

```typescript
environment: {
  NODE_ENV: 'production',
  AWS_REGION: this.region,
  BEDROCK_MODEL_ID: 'global.anthropic.claude-sonnet-4-5-20250929-v1:0',
  // Add custom variables here
}
```

### Scaling Configuration

Adjust auto-scaling in [lib/infra-stack.ts](lib/infra-stack.ts):

```typescript
const scaling = fargateService.autoScaleTaskCount({
  minCapacity: 1,  // Minimum tasks
  maxCapacity: 10, // Maximum tasks
});
```

### Task Resources

Modify compute resources:

```typescript
const taskDefinition = new ecs.FargateTaskDefinition(this, 'NextJsTaskDef', {
  memoryLimitMiB: 2048, // 2GB RAM
  cpu: 1024,           // 1 vCPU
  // ...
});
```

## Useful Commands

| Command | Description |
|---------|-------------|
| `npm run build` | Compile TypeScript to JavaScript |
| `npm run watch` | Watch for changes and compile |
| `npm test` | Run Jest unit tests |
| `cdk synth` | Generate CloudFormation template |
| `cdk diff` | Compare deployed stack with current state |
| `cdk deploy` | Deploy stack to AWS |
| `cdk destroy` | Delete all resources |

## Troubleshooting

### View Container Logs
```bash
aws logs tail /ecs/kings-trust-nextjs --follow
```

### Check Service Status
```bash
aws ecs describe-services \
  --cluster kings-trust-cluster \
  --services kings-trust-nextjs
```

### Check Task Status
```bash
aws ecs list-tasks --cluster kings-trust-cluster
```

### Docker Build Issues
- Ensure Docker is running
- Check available disk space
- Verify Dockerfile in `../web/Dockerfile`

### CloudFront Propagation
CloudFront distributions take 15-20 minutes to fully deploy. Check status:
```bash
aws cloudfront list-distributions --query "DistributionList.Items[?Comment=='Kings Trust Next.js Application']"
```

## Cost Optimization

### Development
For lower costs during development:
```typescript
desiredCount: 1,     // Start with 1 task
minCapacity: 1,      // Minimum 1 task
maxCapacity: 2,      // Maximum 2 tasks
```

### Production
Current settings (1-10 tasks) provide high availability and can handle traffic spikes.

### Additional Savings
- Use Fargate Spot for non-critical workloads
- Implement CloudFront caching for static assets
- Schedule scale-down during off-peak hours

## Testing

Run the test suite:
```bash
npm test
```

Tests verify:
- ✅ VPC creation with correct configuration
- ✅ ECS cluster and Fargate service setup
- ✅ IAM roles and policies for Bedrock access
- ✅ CloudFront distribution with HTTPS
- ✅ Auto-scaling configuration

## Architecture Diagram

```
                         ┌─────────────────┐
                         │   CloudFront    │
                         │     (HTTPS)     │
                         └────────┬────────┘
                                  │
                         ┌────────▼────────┐
                         │   ALB (HTTP)    │
                         └────────┬────────┘
                                  │
          ┌───────────────────────┼───────────────────────┐
          │                       │                       │
     ┌────▼────┐            ┌────▼────┐            ┌────▼────┐
     │ Fargate │            │ Fargate │            │ Fargate │
     │  Task   │            │  Task   │            │  Task   │
     └────┬────┘            └────┬────┘            └────┬────┘
          │                      │                      │
          │                      │                      │
     ┌────▼──────────────────────▼──────────────────────▼────┐
     │              Private Subnet (NAT)                      │
     │                                                         │
     │  ┌──────────────────────────────┐                      │
     │  │      Bedrock API             │                      │
     │  │  (AI-Powered Questioning)    │                      │
     │  └──────────────────────────────┘                      │
     └─────────────────────────────────────────────────────────┘
```

## Security

- Container runs as non-root user (`nextjs`)
- Tasks execute in private subnets with no direct internet access
- All outbound traffic routes through NAT Gateway
- IAM roles follow principle of least privilege
- CloudWatch logs for audit trail

## Next Steps

1. **Custom Domain**: Add Route53 DNS and ACM certificate for custom domain
2. **CI/CD Pipeline**: Automate deployments with GitHub Actions or CodePipeline
3. **Monitoring**: Set up CloudWatch alarms for errors and performance
4. **Secrets**: Use AWS Secrets Manager for sensitive configuration
5. **Database Persistence**: Consider adding EFS or S3 for persistent storage needs

## License

See parent repository for license information.
