import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { DocumentoEntity, DocumentStats, DocumentType } from './entities/documento.entity';
import { FilterDocumentsInput } from './dto/create.dto';
import { CreateTextDocumentInput } from './dto/createtexdocumento.dto';
import { UpdateTextDocumentInput } from './dto/updatetexdocumento.dto';
import * as fs from 'fs';

interface UploadDocumentData {
  nombre: string;
  nombreOriginal: string;
  tipo: DocumentType;
  url: string;
  tamano: number;
  extension: string;
  mes?: string;
  evento?: string;
  subidoPor: string;
}

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(DocumentoEntity)
    private readonly documentRepository: Repository<DocumentoEntity>,
  ) {}

  createFromUpload(data: UploadDocumentData) {
    const document = this.documentRepository.create({
      nombre: data.nombre,
      nombreOriginal: data.nombreOriginal,
      tipo: data.tipo,
      url: data.url,
      tamano: data.tamano,
      extension: data.extension,
      mes: data.mes,
      evento: data.evento,
      subidoPor: data.subidoPor,
      esTextoWeb: false,
    });
    return this.documentRepository.save(document);
  }

  async createTextDocument(input: CreateTextDocumentInput) {
    const document = this.documentRepository.create({
      nombre: input.nombre,
      nombreOriginal: `${input.nombre}.txt`,
      tipo: input.tipo,
      url: '',
      tamano: Buffer.byteLength(input.contenido, 'utf8'),
      extension: '.txt',
      mes: input.mes,
      evento: input.evento,
      subidoPor: input.subidoPor,
      esTextoWeb: true,
      contenido: input.contenido,
    });

    return this.documentRepository.save(document);
  }

  async updateTextDocument(id: string, input: UpdateTextDocumentInput) {
    const document = await this.findOne(id);

    if (!document.esTextoWeb) {
      throw new NotFoundException('Solo se pueden editar documentos de texto creados en la web');
    }

    document.nombre = input.nombre;
    document.contenido = input.contenido;
    document.tamano = Buffer.byteLength(input.contenido, 'utf8');
    
    if (input.mes !== undefined) {
      document.mes = input.mes;
    }
    
    if (input.evento !== undefined) {
      document.evento = input.evento;
    }

    return this.documentRepository.save(document);
  }

  findAll(filters: FilterDocumentsInput) {
    const query: Record<string, unknown> = {};

    if (filters.tipo) {
      query.tipo = filters.tipo;
    }

    if (filters.mes) {
      query.mes = filters.mes;
    }

    if (filters.busqueda) {
      return this.documentRepository.find({
        where: [
          { ...query, nombre: Like(`%${filters.busqueda}%`) },
          { ...query, descripcion: Like(`%${filters.busqueda}%`) },
          { ...query, evento: Like(`%${filters.busqueda}%`) },
        ],
        order: { fechaSubida: 'DESC' },
      });
    }

    return this.documentRepository.find({
      where: query,
      order: { fechaSubida: 'DESC' },
    });
  }

  async findOne(id: string) {
    const document = await this.documentRepository.findOne({ where: { id } });
    
    if (!document) {
      throw new NotFoundException('Documento no encontrado');
    }

    return document;
  }

  async remove(id: string) {
    const document = await this.findOne(id);

    if (!document.esTextoWeb && fs.existsSync(document.url)) {
      fs.unlinkSync(document.url);
    }

    await this.documentRepository.remove(document);

    return { message: 'Documento eliminado correctamente' };
  }

  async getStats() {
    const mensuales = await this.documentRepository.count({ 
      where: { tipo: DocumentType.MENSUAL } 
    });
    
    const especificos = await this.documentRepository.count({ 
      where: { tipo: DocumentType.ESPECIFICO } 
    });

    const totalSizeResult = await this.documentRepository
      .createQueryBuilder('document')
      .select('SUM(document.tamano)', 'total')
      .getRawOne();

    return {
      mensuales,
      especificos,
      total: mensuales + especificos,
      totalSize: parseInt(totalSizeResult?.total || '0') || 0,
    };
  }
}