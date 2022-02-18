import { Service } from 'typedi';
import { EntityRepository, Repository } from 'typeorm';
import { Photo } from '../entity/MediaEntities/Photo';
import { Upload } from '../types/Upload';
import {
  ImageObjectResponse,
  UploadImageResponse,
} from '../types/response.types';
import { AWSS3 } from './../utils/s3';

@Service()
@EntityRepository(Photo)
export class PhotoRepo extends Repository<Photo> {
  //here we will define all the methods needed to be called from any resolver
  //for example:
  /**
   * Create a new photo in the database
   * save photo to the disk
   */

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
