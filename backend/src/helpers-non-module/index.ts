import {
  BadRequestException,
  ForbiddenException,
  SetMetadata,
} from '@nestjs/common';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';

type validFileType =
  | 'md'
  | 'mdx'
  | 'markdown'
  | 'MARKDOWN'
  | 'mkd'
  | 'mdwn'
  | 'mdown'
  | 'mdtxt';
type validMimeType =
  | 'text/md'
  | 'text/mdx'
  | 'text/markdown'
  | 'text/x-markdown';

const validFiles: validFileType[] = [
  'md',
  'mdx',
  'markdown',
  'MARKDOWN',
  'mkd',
  'mdwn',
  'mdown',
  'mdtxt',
];
const validMimes: validMimeType[] = [
  'text/md',
  'text/mdx',
  'text/markdown',
  'text/x-markdown',
];

export class Helpers {
  //For making any route public
  IS_PUBLIC_KEY = 'isPublic';
  Public = () => SetMetadata(this.IS_PUBLIC_KEY, true);

  saveBlogToStorage = {
    storage: diskStorage({
      destination: './blogs',
      filename: (req, file, cb) => {
        const fileExtention: string = extname(file.originalname);
        const fileName: string = `${uuidv4()}_${Date.now()}${fileExtention}`; //random_string[from uuidv4()].md

        cb(null, fileName);
      },
    }),
    fileFilter: (req, file, cb) => {
      const allowedMimeType: validMimeType[] = validMimes;
      allowedMimeType.includes(file.mimetype)
        ? cb(null, true)
        : cb(new BadRequestException('Invalid file format'), false);
    },
  };
}
