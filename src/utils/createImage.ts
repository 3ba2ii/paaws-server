import path from 'path';
import { generateRandomString } from './generateRandomString';

export function createImageMetaData(filename: string): {
  pathName: string;
  uniqueFileName: string;
} {
  const randomName = generateRandomString(12);
  //unique file name will be used to be stored in the db as we don't need the whole path
  const uniqueFileName = `${randomName}-${new Date().toISOString()}-${filename}`;
  //path name is used to store the image in the folder
  const pathName = path.join(
    __dirname,
    '../',
    `public/images/${uniqueFileName}`
  ); //

  return { pathName, uniqueFileName };
}
