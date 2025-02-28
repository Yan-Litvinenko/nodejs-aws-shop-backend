import type { APIGatewayProxyEvent } from "aws-lambda";

export default function logManager(event: APIGatewayProxyEvent, lambdaName: string) {
    const infoObject = {
        path: event.path,
        method: event.httpMethod,
        body: event.body,
        headers: event.headers,
        queryStringParameters: event.queryStringParameters,
        pathParameters: event.pathParameters,
    }

    console.log(`${lambdaName} - incoming request:`, infoObject);
}