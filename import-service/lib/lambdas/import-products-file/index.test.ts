import { APIGatewayProxyEvent } from 'aws-lambda';
import { handler } from './index';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

jest.mock('@aws-sdk/client-s3', () => ({
    S3Client: jest.fn(() => ({})),
    PutObjectCommand: jest.fn()
}));

jest.mock('@aws-sdk/s3-request-presigner', () => ({
    getSignedUrl: jest.fn().mockResolvedValue('https://mock-signed-url.com')
}));

describe('Import Products File Lambda', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return signed URL when name is provided', async () => {
        const event = {
            queryStringParameters: { name: 'test.csv' }
        } as unknown as APIGatewayProxyEvent;

        const response = await handler(event);

        expect(response.statusCode).toBe(200);
        expect(JSON.parse(response.body)).toBe('https://mock-signed-url.com');
        expect(PutObjectCommand).toHaveBeenCalledWith({
            Bucket: process.env.IMPORT_SERVICE_BUCKET_NAME,
            Key: 'uploaded/test.csv',
            ContentType: 'text/csv'
        });
    });

    it('should return 400 when name is not provided', async () => {
        const event = {
            queryStringParameters: {}
        } as unknown as APIGatewayProxyEvent;

        const response = await handler(event);
        expect(response.statusCode).toBe(400);
        expect(JSON.parse(response.body)).toEqual({ message: 'File name is required' });
    });

    it('should return 500 when there is an error', async () => {
        const event = {
            queryStringParameters: { name: 'test.csv' }
        } as unknown as APIGatewayProxyEvent;

        (getSignedUrl as jest.Mock).mockRejectedValueOnce(new Error('Some error'));

        const response = await handler(event);
        expect(response.statusCode).toBe(500);
        expect(JSON.parse(response.body)).toEqual({ message: 'Internal server error' });
    });
});