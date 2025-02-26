#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import * as dotenv from 'dotenv';
import { ProductServiceStack } from '../lib/product-service-stack';

dotenv.config();

const app = new cdk.App();
new ProductServiceStack(app, 'ProductServiceStack', {
  env: {
    account: process.env.AWS_ACCOUNT_ID,
    region: process.env.AWS_REGION
}
});