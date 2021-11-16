import * as Sentry from '@sentry/node';
import FileType from 'file-type';
import imagemin from 'imagemin';
import mozjpeg from 'imagemin-mozjpeg';
import sharp from 'sharp';
import { CREATE_INVALID_ERROR } from './../errors';
import { ValidateImageResponse } from './../types/responseTypes';

export const validateImage = async (
  file: Buffer
): Promise<ValidateImageResponse> => {
  const fileType = await FileType.fromBuffer(file);
  if (
    !fileType ||
    !['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(fileType.ext)
  ) {
    return {
      errors: [CREATE_INVALID_ERROR('file'), CREATE_INVALID_ERROR('type')],
      valid: false,
    };
  }
  //check if the image size is more than 3mb (= 3 * 1024 * 1024 bytes) -> return null
  if (Buffer.byteLength(file) > 1024 * 1024 * 3) {
    return {
      errors: [
        { code: 403, message: 'Image size is more than 3mb', field: 'file' },
      ],
      valid: false,
    };
  }
  return { valid: true, type: fileType.ext };
};

export const convertToJpg = async (input: Buffer) => {
  const fileType = await FileType.fromBuffer(input);

  if (fileType?.ext === 'jpg') {
    return input;
  }

  return sharp(input).jpeg().toBuffer();
};

export const compressImage = async (buffer: Buffer) => {
  const isLargerThan2mb = Buffer.byteLength(buffer) >= 1024 * 1024 * 2;

  try {
    return imagemin.buffer(buffer, {
      plugins: [convertToJpg, mozjpeg({ quality: isLargerThan2mb ? 50 : 85 })],
    });
  } catch (err) {
    console.log(
      `🚀 ~ file: compressImage.ts ~ line 50 ~ compressImage ~ err`,
      err
    );
    Sentry.captureException(err);
    return null;
  }
};
//
