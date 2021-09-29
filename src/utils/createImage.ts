import path from 'path';
import { generateRandomString } from './generateRandomString';

export function createImageMetaData(filename: string): {
  pathName: string;
  uniqueFileName: string;
} {
  const randomName = generateRandomString(12);
  const uniqueFileName = `${randomName}-${new Date().toISOString()}-${filename}`;
  const pathName = path.join(
    __dirname,
    '../',
    `public/images/${uniqueFileName}`
  ); //

  return { pathName, uniqueFileName };
}
