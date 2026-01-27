import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { DocumentoEntity, DocumentStats } from './entities/documento.entity';
import { FilterDocumentsInput } from './dto/create.dto';
import * as fs from 'fs';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(DocumentoEntity)
    private readonly documentRepository: Repository<DocumentoEntity>,
  ) {}

  createFromUpload(data: any) {
    const document = this.documentRepository.create(data);
    return this.documentRepository.save(document);
  }

  findAll(filters: FilterDocumentsInput) {
    const query: any = {};

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

    if (fs.existsSync(document.url)) {
      fs.unlinkSync(document.url);
    }

    await this.documentRepository.remove(document);

    return { message: 'Documento eliminado correctamente' };
  }

  async getStats() {
    const mensuales = await this.documentRepository.count({ 
      where: { tipo: 'mensual' as any } 
    });
    
    const especificos = await this.documentRepository.count({ 
      where: { tipo: 'especifico' as any } 
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