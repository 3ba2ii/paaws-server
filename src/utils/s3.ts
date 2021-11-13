import AWS from 'aws-sdk';
import { randomBytes } from 'crypto';
import { UploadImageResponse } from './../types/responseTypes';
import { Upload } from './../types/Upload';

require('dotenv-safe').config();

const bucketName = process.env.AWS_BUCKET_NAME;

export class AWSS3 {
  private s3: AWS.S3 = new AWS.S3({
    region: process.env.AWS_BUCKET_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SECRET_KEY,
    },
  });

  private formatFileName(fileName: string): string {
    const rawBytes = randomBytes(16);
    const randomFileName = rawBytes.toString('hex');

    const cleanFileName = fileName.toLowerCase().replace(/[^a-zA-Z0-9]/g, '-');
    return `${randomFileName}-${cleanFileName}`.slice(0, 50);
  }
  public async generateUploadUrl(): Promise<UploadImageResponse> {
    try {
      const generatedFileName = this.formatFileName(new Date().toISOString());

      const params = {
        Bucket: bucketName,
        Key: generatedFileName,
        Expires: 600,
      };

      const url = this.s3.getSignedUrl('putObject', params);
      return { url };
    } catch (err) {
      return {
        errors: [
          {
            field: 's3',
            message: err.message || 'Error while creating s3 url',
            code: 500,
          },
        ],
      };
    }
  }

  public async uploadFileToS3(file: Upload): Promise<UploadImageResponse> {
    try {
      const { createReadStream, filename } = await file;

      const generatedFileName = this.formatFileName(filename);

      const s3UploadParams: AWS.S3.PutObjectRequest = {
        Bucket: bucketName,
        Key: generatedFileName,
        Body: createReadStream(),
      };
      const response = await this.s3.upload(s3UploadParams).promise();
      return { url: response.Location, filename };
    } catch (err) {
      console.log(
        `🚀 ~ file: s3.ts ~ line 76 ~ AWSS3 ~ uploadFileToS3 ~ err`,
        err
      );
      return {
        errors: [
          {
            field: 's3',
            message: err.message || 'Error while uploading file to s3',
            code: 500,
          },
        ],
      };
    }
  }
}
