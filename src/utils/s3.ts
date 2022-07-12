import * as Sentry from '@sentry/node';
import AWS from 'aws-sdk';
import { DeleteObjectRequest } from 'aws-sdk/clients/s3';
import { randomBytes } from 'crypto';
import { ErrorResponse, UploadImageResponse } from '../types/response.types';
import { CREATE_INVALID_ERROR, INTERNAL_SERVER_ERROR } from './../errors';
import { Upload } from './../types/Upload';
import { compressImage, validateImage } from './compressImage';
import { file2Buffer } from './fileToBuffer';
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
      return { url: response.Location, filename: `${filename}.${type}` };
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

  public async deleteFie(fileName: string): Promise<boolean> {
    const params: DeleteObjectRequest = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: fileName,
    };

    try {
      await this.s3.headObject(params).promise();
      console.log('File Found in S3');
      try {
        await this.s3.deleteObject(params).promise();
        console.log('file deleted Successfully');
      } catch (err) {
        console.log('ERROR in file Deleting : ' + JSON.stringify(err));
        return false;
      }
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }
}
