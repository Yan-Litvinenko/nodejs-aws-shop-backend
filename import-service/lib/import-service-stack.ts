import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as s3n from 'aws-cdk-lib/aws-s3-notifications';
import * as path from 'path';
import { Construct } from 'constructs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import 'dotenv/config';

export class ImportServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const importBucket = s3.Bucket.fromBucketName(
      this,
      'ImportBucket',
      process.env.IMPORT_SERVICE_BUCKET_NAME as string
    );

    const importProductsFileLambda = new NodejsFunction(this, 'import-products-file-api', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'handler',
      entry: path.join(__dirname, './lambdas/import-products-file/index.ts'),
      bundling: {
        minify: true,
        sourceMap: true,
        externalModules: ['aws-sdk'],
      },
      environment: {
        IMPORT_SERVICE_BUCKET_NAME: importBucket.bucketName
      }
    });

    const importFileParser = new NodejsFunction(this, 'import-file-parser', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'handler',
      entry: path.join(__dirname, './lambdas/import-file-parser/index.ts'),
      bundling: {
        minify: true,
        sourceMap: true,
        externalModules: ['aws-sdk'],
      },
      environment: {
        IMPORT_SERVICE_BUCKET_NAME: importBucket.bucketName
      }
    });

    importProductsFileLambda.addToRolePolicy(new iam.PolicyStatement({
      actions: [
        's3:PutObject',
        's3:GetObject',
        's3:ListBucket'
      ],
      resources: [
        `${importBucket.bucketArn}`,
        `${importBucket.bucketArn}/*`,
        `${importBucket.bucketArn}/uploaded/*`
      ],
    }));

    importFileParser.addToRolePolicy(new iam.PolicyStatement({
      actions: [
        's3:GetObject',
        's3:PutObject',
        's3:DeleteObject',
        's3:ListBucket'
      ],
      resources: [
        `${importBucket.bucketArn}`,
        `${importBucket.bucketArn}/*`,
        `${importBucket.bucketArn}/uploaded/*`,
        `${importBucket.bucketArn}/parsed/*`
      ],
    }));

    importFileParser.addPermission('S3Permission', {
      principal: new iam.ServicePrincipal('s3.amazonaws.com'),
      action: 'lambda:InvokeFunction',
      sourceArn: importBucket.bucketArn,
    });

    const notification = new s3n.LambdaDestination(importFileParser);

    importBucket.addEventNotification(
      s3.EventType.OBJECT_CREATED_PUT,
      notification,
      { prefix: 'uploaded/' }
    );

    importBucket.addToResourcePolicy(new iam.PolicyStatement({
      actions: ['s3:PutObject'],
      principals: [new iam.ArnPrincipal(importProductsFileLambda.role!.roleArn)],
      resources: [`${importBucket.bucketArn}/uploaded/*`]
    }));

    const api = new apigateway.RestApi(this, 'ImportServiceApi', {
      restApiName: 'Import Service',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
      }
    });

    const importProductsFile = api.root.addResource('import');
    importProductsFile.addMethod('GET', new apigateway.LambdaIntegration(importProductsFileLambda));
  }
}
