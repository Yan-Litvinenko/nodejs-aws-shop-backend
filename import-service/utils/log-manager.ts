import type { APIGatewayProxyEvent, S3Event } from "aws-lambda";

export default function logManager(event: APIGatewayProxyEvent | S3Event, lambdaName: string) {
    if (!('Records' in event)) {
        const infoObject = {
            path: event.path,
            method: event.httpMethod,
            body: event.body,
            headers: event.headers,
            queryStringParameters: event.queryStringParameters,
            pathParameters: event.pathParameters,
        }

        console.log(`${lambdaName} - incoming request:`, infoObject);
    } else {
        const record = event.Records[0]
        console.log(`${lambdaName} - incoming request:`, record);
    }
}