import { BadRequestException } from '@nestjs/common';
import { createWriteStream } from 'fs';
import { mkdir } from 'fs/promises';
import { pipeline } from 'stream/promises';
import type { FileUpload } from 'graphql-upload';
import { v4 as uuidv4 } from 'uuid';

const imageExtensions: Record<string, string> = {
  'image/png': '.png', 'image/jpeg': '.jpg', 'image/jpg': '.jpg',
};
export async function saveImage(file: FileUpload, target: string): Promise<string> {
  if (!['member', 'hotel', 'article', 'property'].includes(target)) {
    throw new BadRequestException('Invalid image target');
  }
  const extension = imageExtensions[file.mimetype];
  if (!extension) throw new BadRequestException('Please provide jpg, jpeg or png images!');
  const directory = `uploads/${target}`;
  await mkdir(directory, { recursive: true });
  const url = `${directory}/${uuidv4()}${extension}`;
  await pipeline(file.createReadStream(), createWriteStream(url, { flags: 'wx' }));
  return url;
}
