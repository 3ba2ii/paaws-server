import { createWriteStream } from 'fs';
import { ImageMetaData } from 'src/types/responseTypes';
import { Stream } from 'stream';
import { Service } from 'typedi';
import { EntityRepository, Repository } from 'typeorm';
import { Photo } from '../entity/MediaEntities/Photo';
import { Upload } from '../types/Upload';
import { createImageMetaData } from '../utils/createImage';
import {
  ImageObjectResponse,
  UploadImageResponse,
} from './../types/responseTypes';
import { AWSS3 } from './../utils/s3';

interface IGetMultipleImagesStream {
  stream: Stream;
  filename: string;
  uniqueFileName: string;
  pathName: string;
}
@Service()
@EntityRepository(Photo)
export class PhotoRepo extends Repository<Photo> {
  //here we will define all the methods needed to be called from any resolver
  //for example:
  /**
   * Create a new photo in the database
   * save photo to the disk
   */
  async getMultipleImagesStreams(
    images: Upload[]
  ): Promise<IGetMultipleImagesStream[]> {
    const streams = images.map(async (image) => {
      const { createReadStream, filename } = await image; //IMPROVE: Duplication that needs to be improved later
      const { pathName, uniqueFileName } = createImageMetaData(filename);

      return {
        stream: createReadStream(),
        filename,
        uniqueFileName,
        pathName,
      };
    });

    return Promise.all(streams);
  }

  async saveImageToDisk(
    metadata: ImageMetaData,
    uploadProps: Upload
  ): Promise<Boolean> {
    //we need to split the operations as it will be used separately inside a transaction
    //save image to disk
    const { createReadStream } = uploadProps;
    if (!createReadStream) {
      return false;
    }
    const { pathName } = metadata;
    const stream = createReadStream();
    await stream.pipe(createWriteStream(pathName));

    return true;
  }
  async getAllImages(): Promise<Photo[]> {
    return Photo.find({});
  }
  async uploadToS3(file: Upload): Promise<UploadImageResponse> {
    return new AWSS3().uploadFileToS3(file);
  }
  async createPhoto(
    file: Upload,
    userId: number
  ): Promise<ImageObjectResponse> {
    //2. upload image to s3
    const { url, filename, errors } = await new AWSS3().uploadFileToS3(file);
    console.log(
      `🚀 ~ file: PhotoRepo.repo.ts ~ line 76 ~ PhotoRepo ~ errors`,
      errors
    );
    if (errors && errors.length) {
      return { errors };
    }
    //3. create image object with the given data
    const photo = Photo.create({ creatorId: userId, url, filename });

    return { photo };
  }
}
