import csv from 'csv-parser';
import logManager from '../../../utils/log-manager';
import { S3Event } from 'aws-lambda';
import { S3 } from 'aws-sdk';

const s3 = new S3({ signatureVersion: 'v4' });

export const handler = async (event: S3Event) => {
    try {
        logManager(event, 'Import file parser lambda triggered');
        const record = event.Records[0]
        const bucket = record.s3.bucket.name
        const key = decodeURIComponent(record.s3.object.key);

        const s3Stream = s3.getObject({
            Bucket: bucket,
            Key: key
        }).createReadStream();

        await new Promise((resolve, reject) => {
            s3Stream
                .pipe(csv())
                .on('data', (data: string) => {
                    console.log('Parsed record:', data);
                })
                .on('error', reject)
                .on('end', resolve);
        });
    } catch (error) {
        console.error('Error parsing CSV file:', error);
        throw error;
    }
}
