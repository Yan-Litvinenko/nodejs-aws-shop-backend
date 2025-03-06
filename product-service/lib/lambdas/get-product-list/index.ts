import createResponse from '../../../utils/create-reponse';
import logManager from '../../../utils/log-manager';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';
import type { APIGatewayProxyResult, APIGatewayProxyHandler, APIGatewayProxyEvent } from 'aws-lambda';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client, {
  unmarshallOptions: {
    convertWithoutMapWrapper: true
  }
});

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    logManager(event, "get-product-list");

    const [productsResult, stocksResult] = await Promise.all([
      docClient.send(new ScanCommand({
        TableName: process.env.PRODUCTS_TABLE
      })),
      docClient.send(new ScanCommand({
        TableName: process.env.STOCKS_TABLE
      }))
    ]);

    const products = productsResult.Items || [];
    const stocks = stocksResult.Items || [];

    const joinedProducts = products.map((product) => ({
      ...product,
      count: stocks.find((stock) => stock.id === product.id)?.count || 0
    }));

    return createResponse(200, joinedProducts);
  } catch (error) {
    return createResponse(500, { message: `Internal server error: ${error}` });
  };
}
