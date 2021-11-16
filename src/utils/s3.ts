import { CREATE_INVALID_ERROR, INTERNAL_SERVER_ERROR } from './../errors';
import { compressImage, validateImage } from './compressImage';
import AWS from 'aws-sdk';
import { randomBytes } from 'crypto';
import { UploadImageResponse, ErrorResponse } from './../types/responseTypes';
import { Upload } from './../types/Upload';
import { file2Buffer } from './fileToBuffer';
import * as Sentry from '@sentry/node';
require('dotenv-safe').config();

const bucketName = process.env.AWS_BUCKET_NAME;

class ValidationResponse extends ErrorResponse {
  imageBuffer?: Buffer;
  filename?: string;
  type?: string;
}
export class AWSS3 {
  private s3: AWS.S3 = new AWS.S3({
    region: process.env.AWS_BUCKET_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SECRET_KEY,
    },
  });

  private async formatFileName(file: Upload): Promise<string> {
    const { filename } = await file;
    const rawBytes = randomBytes(16);
    const randomFileName = rawBytes.toString('hex');

    const cleanFileName = filename.toLowerCase().replace(/[^a-zA-Z0-9]/g, '-');
    return `${randomFileName}-${cleanFileName}`.slice(0, 50);
  }
  private async validateAndCreateMetaDate(
    file: Upload
  ): Promise<ValidationResponse> {
    const imageBuffer = await file2Buffer(file);

    //check if the buffer is valid
    if (!imageBuffer) {
      return { errors: [CREATE_INVALID_ERROR('file')] };
    }
    //check if the image's extension and size are valid
    const { valid, type, errors } = await validateImage(imageBuffer);

    if (!valid && errors?.length) {
      return { errors };
    }
    //compress the image
    const miniImageBuffer = await compressImage(imageBuffer);

    if (!miniImageBuffer) return { errors: [INTERNAL_SERVER_ERROR] };

    const generatedFileName = await this.formatFileName(file);

    return { imageBuffer: miniImageBuffer, filename: generatedFileName, type };
  }

  public async uploadFileToS3(file: Upload): Promise<UploadImageResponse> {
    try {
      const { errors, filename, imageBuffer, type } =
        await this.validateAndCreateMetaDate(file);

      if ((errors && errors.length) || !imageBuffer || !filename) {
        return { errors };
      }
      const s3UploadParams: AWS.S3.PutObjectRequest = {
        Bucket: bucketName,
        Key: `${filename}.${type}`,
        Body: imageBuffer,
        ContentType: type || 'jpg',
      };
      const response = await this.s3.upload(s3UploadParams).promise();
      return { url: response.Location, filename };
    } catch (err) {
      console.log(
        `🚀 ~ file: s3.ts ~ line 76 ~ AWSS3 ~ uploadFileToS3 ~ err`,
        err
      );
      Sentry.captureException(err);
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
  } //
}
