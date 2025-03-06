import { S3Event } from 'aws-lambda';
import { GetObjectCommand, CopyObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { handler } from './index';
import { Readable } from 'stream';

const mockSend = jest.fn();

jest.mock('@aws-sdk/client-s3', () => ({
    S3Client: jest.fn().mockImplementation(() => ({
        send: mockSend
    })),
    GetObjectCommand: jest.fn(),
    CopyObjectCommand: jest.fn(),
    DeleteObjectCommand: jest.fn()
}));

describe('Import File Parser Lambda', () => {
    const mockEvent: S3Event = {
        Records: [{
            s3: {
                bucket: {
                    name: 'test-bucket'
                },
                object: {
                    key: 'uploaded/test.csv'
                }
            }
        }]
    } as any;

    beforeEach(() => {
        jest.clearAllMocks();
        mockSend.mockReset();
    });

    it('should process CSV file successfully', async () => {
        const mockReadStream = new Readable({
            read() {
                this.push('id,title,price\n');
                this.push('1,Test Product,10.99\n');
                this.push(null);
            }
        });

        mockSend.mockImplementation((command) => {
            if (command instanceof GetObjectCommand) {
                return Promise.resolve({ Body: mockReadStream });
            }
            if (command instanceof CopyObjectCommand) {
                return Promise.resolve({});
            }
            if (command instanceof DeleteObjectCommand) {
                return Promise.resolve({});
            }
            return Promise.resolve({});
        });

        await handler(mockEvent);

        expect(GetObjectCommand).toHaveBeenCalledWith({
            Bucket: 'test-bucket',
            Key: 'uploaded/test.csv'
        });

        expect(CopyObjectCommand).toHaveBeenCalledWith({
            Bucket: 'test-bucket',
            CopySource: 'test-bucket/uploaded/test.csv',
            Key: 'parsed/test.csv'
        });

        expect(DeleteObjectCommand).toHaveBeenCalledWith({
            Bucket: 'test-bucket',
            Key: 'uploaded/test.csv'
        });
    });

    it('should handle errors during file processing', async () => {
        mockSend.mockRejectedValueOnce(new Error('Failed to read file'));

        await expect(handler(mockEvent)).rejects.toThrow('Failed to read file');
    });

    it('should handle empty CSV file', async () => {
        const mockReadStream = new Readable({
            read() {
                this.push(null);
            }
        });

        mockSend.mockImplementation((command) => {
            if (command instanceof GetObjectCommand) {
                return Promise.resolve({ Body: mockReadStream });
            }
            return Promise.resolve({});
        });

        await handler(mockEvent);

        expect(CopyObjectCommand).toHaveBeenCalled();
        expect(DeleteObjectCommand).toHaveBeenCalled();
    });

    it('should handle malformed CSV data', async () => {
        const mockReadStream = new Readable({
            read() {
                this.push('invalid,csv,format');
                this.push(null);
            }
        });

        mockSend.mockImplementation((command) => {
            if (command instanceof GetObjectCommand) {
                return Promise.resolve({ Body: mockReadStream });
            }
            return Promise.resolve({});
        });

        await handler(mockEvent);

        expect(CopyObjectCommand).toHaveBeenCalled();
        expect(DeleteObjectCommand).toHaveBeenCalled();
    });
});