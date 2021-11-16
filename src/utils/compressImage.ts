import FileType from 'file-type';
import imagemin from 'imagemin';
import mozjpeg from 'imagemin-mozjpeg';
import sharp from 'sharp';

export const convertToJpg = async (input: Buffer) => {
  const isJpg = await FileType.fromBuffer(input);

  if (isJpg?.ext === 'jpg') {
    return input;
  }

  return sharp(input).jpeg().toBuffer();
};

export const compressImage = async (buffer: Buffer) => {
  return imagemin.buffer(buffer, {
    plugins: [convertToJpg, mozjpeg({ quality: 50 })],
  });
};
//
