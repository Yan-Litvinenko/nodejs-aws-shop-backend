import createResponse from '../../../utils/create-reponse';
import logManager from '../../../utils/log-manager';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';
import type { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client, {
  unmarshallOptions: {
    convertWithoutMapWrapper: true
  }
});

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    logManager(event, "get-product");

    const id: string | undefined = event.pathParameters?.id;
    const [productResult, stockResult] = await Promise.all([
      docClient.send(new GetCommand({
        TableName: process.env.PRODUCTS_TABLE,
        Key: { id }
      })),
      docClient.send(new GetCommand({
        TableName: process.env.STOCKS_TABLE,
        Key: { id }
      }))
    ]);

    const product = {
      ...productResult.Item,
      count: stockResult.Item?.count || 0
    }

    if (!product) {
      return createResponse(404, { message: 'Product not found' });
    }

    return createResponse(200, product);
  } catch (error) {
    return createResponse(500, { message: `Internal server error: ${error}` });

  };
}
