import createResponse from '../../../utils/create-reponse';
import { products } from '../../../mock/products';
import type { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda';
import type { Product } from '../../../types';

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const id: string | undefined = event.pathParameters?.id;
  const product: Product | undefined = products.find((product) => product.id === id);

  try {
    if (!product) {
      return createResponse(404, { message: 'Product not found' });
    }

    return createResponse(200, product);
  } catch (error) {
    console.log("Event: ", event);
    return createResponse(500, { message: 'Internal server error' });

  };
}
