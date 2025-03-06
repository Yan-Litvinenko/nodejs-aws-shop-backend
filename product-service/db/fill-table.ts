import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, BatchWriteCommand } from '@aws-sdk/lib-dynamodb';
import { products } from '../mock/products';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const fillTables = async () => {
    const productItems = products.map((product) => ({
        PutRequest: {
            Item: {
                id: product.id,
                title: product.title,
                description: product.description,
                price: product.price
            }
        }
    }));

    const stockItems = products.map((product) => ({
        PutRequest: {
            Item: {
                id: product.id,
                count: Math.floor(Math.random() * 10) + 1
            }
        }
    }));

    try {
        await docClient.send(new BatchWriteCommand({
            RequestItems: {
                products: productItems,
                stocks: stockItems
            }
        }));
        console.log('Tables filled successfully');
    } catch (error) {
        console.error('Error filling tables:', error);
    }
};

fillTables();