import csv from 'csv-parser';
import logManager from '../../../utils/log-manager';
import { S3Event } from 'aws-lambda';
import { S3Client, GetObjectCommand, CopyObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { Readable } from 'stream';

const s3Client = new S3Client({});

export const handler = async (event: S3Event) => {
    try {
        logManager(event, 'Import file parser lambda triggered');

        if (!event.Records || event.Records.length === 0) {
            console.log('No records found in event');
            return;
        }

        const record = event.Records[0];
        const bucket = record.s3.bucket.name;
        const key = decodeURIComponent(record.s3.object.key);
        const fileName = key.split('/').pop();

        const { Body } = await s3Client.send(new GetObjectCommand({
            Bucket: bucket,
            Key: key
        }));

        if (!Body) {
            throw new Error('Empty file body received from S3');
        }

        await new Promise((resolve, reject) => {
            (Body as Readable)
                .pipe(csv())
                .on('data', (data: any) => {
                    console.log('Parsed CSV record:', data);
                })
                .on('error', (error) => {
                    console.error('Error parsing CSV:', error);
                    reject(error);
                })
                .on('end', () => {
                    console.log('CSV parsing completed');
                    resolve(undefined);
                });
        });


        await s3Client.send(new CopyObjectCommand({
            Bucket: bucket,
            CopySource: `${bucket}/${key}`,
            Key: `parsed/${fileName}`
        }));

        await s3Client.send(new DeleteObjectCommand({
            Bucket: bucket,
            Key: key
        }));
    } catch (error) {
        console.error('Error in handler:', error);
        throw error;
    }
}
