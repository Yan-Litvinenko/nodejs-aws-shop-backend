import { APIGatewayProxyResult, APIGatewayProxyHandler, APIGatewayProxyEvent } from 'aws-lambda';
import { products } from './products';

export const handler:APIGatewayProxyHandler  = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
      },
      body: JSON.stringify(products),
    };
  } catch (error) {
    console.log("Event: ", event);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' }),
    };
  }
};