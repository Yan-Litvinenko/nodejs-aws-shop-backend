import createResponse from '../../../utils/create-reponse';
import { products } from '../../../mock/products';
import type { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda';
import type { Product } from '../../../types';

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const id: string | undefined = event.pathParameters?.id;
    const product: Product | undefined = products.find((product) => product.id === id);

    if (!product) {
      return createResponse(404, { message: 'Product not found' });
    }

    return createResponse(200, product);
  } catch (error) {
    return createResponse(500, { message: 'Internal server error' });

  };
}
