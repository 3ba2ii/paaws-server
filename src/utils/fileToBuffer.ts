import { Upload } from '../types/Upload';

export const file2Buffer = async (picture: Upload) => {
  try {
    const buffers: Uint8Array[] = [];
    const readableStream = await picture;
    const buffer = await new Promise<Buffer | null>(async (res) =>
      readableStream
        .createReadStream()
        .on('data', (chunk: any) => {
          buffers.push(chunk);
        })
        .on('end', () => {
          res(Buffer.concat(buffers));
        })
        .on('error', (err) => {
          //Sentry.captureException(err);
          console.log(`🚀 ~ file: fileToBuffer.ts ~ line 19 ~ .on ~ err`, err);
          res(null);
        })
    );

    return buffer;
  } catch (err) {
    console.log(err);
    return null;
  }
};
