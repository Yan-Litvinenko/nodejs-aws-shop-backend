import createResponse from '../../../utils/create-reponse';
import logManager from '../../../utils/log-manager';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, TransactWriteCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import type { APIGatewayProxyResult, APIGatewayEvent } from 'aws-lambda';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    try {
        logManager(event, "create-product");

        const { title, description, price, count } = JSON.parse(event.body || '{}');
        const id = uuidv4();

        if (!title || !description || price === undefined || count === undefined) {
            return createResponse(400, { message: "Invalid request body" });
        }

        await docClient.send(new TransactWriteCommand({
            TransactItems: [
                {
                    Put: {
                        TableName: process.env.PRODUCTS_TABLE,
                        Item: {
                            id,
                            title,
                            description,
                            price
                        }
                    }
                },
                {
                    Put: {
                        TableName: process.env.STOCKS_TABLE,
                        Item: {
                            id,
                            count
                        }
                    }
                },

            ]
        }))


        return createResponse(200, {
            id,
            title,
            description,
            price,
            count
        });
    } catch (error) {
        return createResponse(500, { message: "Internal server error" });
    }
}
