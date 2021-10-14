import { createWriteStream } from 'fs';
import { CreateImageResponse, ImageMetaData } from 'src/types/responseTypes';
import { Service } from 'typedi';
import { EntityRepository, Repository } from 'typeorm';
import { createImageMetaData } from '../utils/createImage';
import { Photo } from './../entity/MediaEntities/Photo';
import { User } from './../entity/UserEntities/User';
import { Upload } from './../types/Upload';

interface CreatePhotoProps {
  creator: User;
  filename: string;
}

interface IGetMultipleImagesStream {
  stream: import('stream').Stream;
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

    const resolvedStreams = await Promise.all(streams);

    return resolvedStreams;
  }
  async createPhotoObject({
    creator,
    filename,
  }: CreatePhotoProps): Promise<CreateImageResponse> {
    const { pathName, uniqueFileName } = createImageMetaData(filename);

    const photo = Photo.create({
      creator,
      filename,
      path: uniqueFileName,
    });
    return {
      metadata: {
        photo,
        creator,
        pathName,
        uniqueFileName,
      },
    };
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
}

//1. create the image object in the database
//2. save the image to the disk
//3. save the image to the db
