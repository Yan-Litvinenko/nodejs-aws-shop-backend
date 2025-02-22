import createResponse from '../../../utils/create-reponse';
import { products } from '../../../mock/products';
import type { APIGatewayProxyResult, APIGatewayProxyHandler, APIGatewayProxyEvent } from 'aws-lambda';

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    return createResponse(200, products);
  } catch (error) {
    return createResponse(500, { message: 'Internal server error' });
  };
}
