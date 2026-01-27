import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Subclasificacion } from './entities/subclasificacion.entity';
import { CreateSubclasificacionDto } from './dto/create-subclasificacion.dto';
import { UpdateSubclasificacionDto } from './dto/update-subclasificacion.dto';
import { AftService } from '../aft/aft.service';

@Injectable()
export class SubclasificacionService {
  constructor(
    @InjectRepository(Subclasificacion)
    private readonly repo: Repository<Subclasificacion>,

    @Inject(forwardRef(() => AftService))
    private readonly aftService: AftService,
  ) {}

  async create(dto: CreateSubclasificacionDto): Promise<Subclasificacion> {
    const existe = await this.repo.findOne({
      where: { nombre: dto.nombre },
    });

    if (existe) {
      throw new BadRequestException({
        message: 'Ya existe una subclasificación con ese nombre',
        error: 'NOMBRE_DUPLICADO',
      });
    }

    const subclasificacion = this.repo.create({
      nombre: dto.nombre,
      activo: dto.activo ?? true,
    });

    return this.repo.save(subclasificacion);
  }

  findAll() {
    return this.repo.find({
      order: { nombre: 'ASC' },
    });
  }

  findActivas() {
    return this.repo.find({
      where: { activo: true },
      order: { nombre: 'ASC' },
    });
  }

  async findOne(id: number) {
    const subclasificacion = await this.repo.findOne({
      where: { id },
      relations: ['afts'],
    });

    if (!subclasificacion) {
      throw new NotFoundException('Subclasificación no encontrada');
    }

    return subclasificacion;
  }

  async update(id: number, data: UpdateSubclasificacionDto) {
    const sub = await this.repo.findOne({
      where: { id },
      relations: ['afts'],
    });

    if (!sub) {
      throw new NotFoundException('Subclasificación no encontrada');
    }

    if (data.activo === false && sub.activo === true) {
      const afts = await this.aftService.findBySubclasificacion(id);
      
      if (afts.length > 0) {
        throw new BadRequestException({
          message: 'No se puede desactivar la subclasificación: tiene AFTs asociados',
          error: 'SUBCLASIFICACION_CON_AFTS_ACTIVOS',
        });
      }
    }

    if (data.nombre && data.nombre !== sub.nombre) {
      const existente = await this.repo.findOne({
        where: { nombre: data.nombre },
      });

      if (existente) {
        throw new BadRequestException({
          message: 'Ya existe una subclasificación con ese nombre',
          error: 'NOMBRE_DUPLICADO',
        });
      }
    }

    Object.assign(sub, data);
    await this.repo.save(sub);
    
    return this.findOne(id);
  }

  async remove(id: number) {
    const sub = await this.repo.findOne({
      where: { id },
      relations: ['afts'],
    });

    if (!sub) {
      throw new NotFoundException('Subclasificación no encontrada');
    }

    const afts = await this.aftService.findBySubclasificacion(id);

    if (afts.length > 0) {
      throw new BadRequestException({
        message: 'No se puede desactivar la subclasificación: tiene AFTs asociados',
        error: 'SUBCLASIFICACION_CON_AFTS_ACTIVOS',
      });
    }

    sub.activo = false;
    return this.repo.save(sub);
  }

  async getAfts(subclasificacionId: number) {
    return this.aftService.findBySubclasificacion(subclasificacionId);
  }
}