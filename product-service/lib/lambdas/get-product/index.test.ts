import { products } from "../../../mock/products";
import { handler } from "./index";
import type { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";

const mockProps = {
    event: {
        pathParameters: { id: '7567ec4b-b10c-48c5-9345-fc73c48a80aa' },
    } as unknown as APIGatewayProxyEvent,
    Context: null as unknown as Context,
    callback: jest.fn()
}

describe('get-product lambda', () => {
    beforeEach(() => {
        mockProps.event.pathParameters = {
            id: '7567ec4b-b10c-48c5-9345-fc73c48a80aa'
        };
    });

    it('should return a product', async () => {
        const reponse = await handler(mockProps.event, mockProps.Context, mockProps.callback) as APIGatewayProxyResult;
        const result = JSON.parse(reponse.body);

        expect(reponse.statusCode).toBe(200);
        expect(result).toEqual(products[0]);
    });

    it('should return a 404 if the product is not found', async () => {
        mockProps.event.pathParameters = { id: '1' };

        const reponse = await handler(mockProps.event, mockProps.Context, mockProps.callback) as APIGatewayProxyResult;
        expect(reponse.statusCode).toBe(404);
    });

    it('should return a 500 if the product is not found', async () => {
        jest.spyOn(Array.prototype, 'find').mockImplementationOnce(() => {
            throw new Error('Database error');
        });


        mockProps.event.pathParameters = { id: '1' };

        const reponse = await handler(mockProps.event, mockProps.Context, mockProps.callback) as APIGatewayProxyResult;

        expect(reponse.statusCode).toBe(500);
    });
});
