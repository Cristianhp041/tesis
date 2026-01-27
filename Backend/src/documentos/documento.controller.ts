import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { DocumentsService } from './documento.service';
import * as fs from 'fs';

@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadDir = './uploads/documents';
          if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
          }
          cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `document-${uniqueSuffix}${ext}`);
        },
      }),
      limits: {
        fileSize: 10 * 1024 * 1024, 
      },
      fileFilter: (req, file, cb) => {
        const allowedTypes = [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'image/jpeg',
          'image/png',
        ];
        
        if (!allowedTypes.includes(file.mimetype)) {
          return cb(
            new BadRequestException('Tipo de archivo no permitido'),
            false
          );
        }
        cb(null, true);
      },
    })
  )
  async uploadDocument(
    @UploadedFile() file: Express.Multer.File, 
    @Body() body: any,
  ) {
    if (!file) {
      throw new BadRequestException('No se ha subido ningún archivo');
    }

    const input = JSON.parse(body.input);

    return this.documentsService.createFromUpload({
      ...input,
      nombreOriginal: file.originalname,
      url: file.path,
      tamano: file.size,
      extension: extname(file.originalname),
    });
  }
}