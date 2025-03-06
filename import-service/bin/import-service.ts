#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import * as dotenv from 'dotenv';
import { ImportServiceStack } from '../lib/import-service-stack';

dotenv.config();

const app = new cdk.App();
new ImportServiceStack(app, 'ImportServiceStack', {
  env: {
    account: process.env.AWS_ACCOUNT_ID,
    region: process.env.AWS_REGION
  }
});