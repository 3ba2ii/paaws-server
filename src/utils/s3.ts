import AWS from 'aws-sdk';
import { randomBytes } from 'crypto';
import { S3URLResponse } from './../types/responseTypes';
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

  public async generateUploadUrl(): Promise<S3URLResponse> {
    try {
      const rawBytes = randomBytes(16);
      const randomFileName = rawBytes.toString('hex');

      const params = {
        Bucket: bucketName,
        Key: randomFileName,
        Expires: 60,
      };

      const s3URL = this.s3.getSignedUrl('putObject', params);
      return { s3URL };
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
}
