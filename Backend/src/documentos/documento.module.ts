import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentsResolver } from './documento.resolver';
import { DocumentsController } from './documento.controller';
import { DocumentsService } from './documento.service';
import { DocumentoEntity } from './entities/documento.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DocumentoEntity])],
  controllers: [DocumentsController],
  providers: [DocumentsResolver, DocumentsService],
  exports: [DocumentsService],
})
export class DocumentsModule {}