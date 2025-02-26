import * as products from '../../../mock/products';
import { handler } from "./index";
import type { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";

const mockProps = {
    event: {} as unknown as APIGatewayProxyEvent,
    Context: null as unknown as Context,
    callback: jest.fn()
}

describe('get-product-list lambda', () => {
    it('should return a product list', async () => {
        const reponse = await handler(mockProps.event, mockProps.Context, mockProps.callback) as APIGatewayProxyResult;
        const result = JSON.parse(reponse.body);

        expect(reponse.statusCode).toBe(200);
        expect(result).toEqual(products.products);
    });

    it('should return a 500 if the product is not found', async () => {
        Object.defineProperty(products, 'products', {
            get: () => { throw new Error('Database error'); }
        });

        mockProps.event.pathParameters = { id: '1' };
        const reponse = await handler(mockProps.event, mockProps.Context, mockProps.callback) as APIGatewayProxyResult;

        expect(reponse.statusCode).toBe(500);
    });
});
