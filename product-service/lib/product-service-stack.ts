import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as path from 'path';
import { Construct } from 'constructs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';

export class ProductServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);


    const getProductsList = new NodejsFunction(this, 'get-products-list-api', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'handler',
      entry: path.join(__dirname, './lambdas/get-product-list/index.ts'), 
      bundling: {
        minify: true, 
        sourceMap: true, 
        externalModules: ['aws-sdk'], 
      },
    });

    const getProduct = new NodejsFunction(this, 'get-product-api', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'handler',
      entry: path.join(__dirname, './lambdas/get-product/index.ts'), 
      bundling: {
        minify: true, 
        sourceMap: true, 
        externalModules: ['aws-sdk'], 
      },
    });

    const api = new apigateway.RestApi(this, 'products-api', {
      restApiName: 'Products Service',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS, 
        allowMethods: apigateway.Cors.ALL_METHODS,
      },
    });

    const products = api.root.addResource('products');
    const product = products.addResource('{id}');

    products.addMethod('GET', new apigateway.LambdaIntegration(getProductsList));
    product.addMethod('GET', new apigateway.LambdaIntegration(getProduct));
    
    new cdk.CfnOutput(this, 'get-products-list-api-url', {
      value: api.url,
      description: 'API Gateway URL',
    });
  }
}
