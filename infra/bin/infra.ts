#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib/core';
import { InfraStack } from '../lib/infra-stack';
import { DatabaseStack } from '../lib/database-stack';

const app = new cdk.App();

const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION || 'us-west-2',
};

// Deploy database stack first
const databaseStack = new DatabaseStack(app, 'KingsTrustDatabaseStack', { env });

// Deploy application stack with database secret ARN
const appStack = new InfraStack(app, 'KingsTrustAppStack', {
  env,
  dbSecretArn: cdk.Fn.importValue('KingsTrustDatabaseSecretArn'),
});
