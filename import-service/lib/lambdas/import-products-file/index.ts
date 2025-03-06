import createResponse from '../../../utils/create-reponse';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

const s3Client = new S3Client({});

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const fileName = event.queryStringParameters?.name;

        if (!fileName?.trim()) {
            return createResponse(400, { message: 'File name is required' });
        }

        const command = new PutObjectCommand({
            Bucket: process.env.IMPORT_SERVICE_BUCKET_NAME,
            Key: `uploaded/${fileName}`,
            ContentType: 'text/csv',
        });

        const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });

        return createResponse(200, signedUrl);
    } catch (error) {
        return createResponse(500, { message: 'Internal server error' });
    }
}