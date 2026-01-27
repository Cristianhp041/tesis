import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Area } from './entities/area.entity';
import { CreateAreaDto } from './dto/create-area.dto';
import { UpdateAreaDto } from './dto/update-area.dto';
import { Aft } from '../aft/entities/aft.entity';

@Injectable()
export class AreaService {
  constructor(
    @InjectRepository(Area)
    private readonly areaRepo: Repository<Area>,

    @InjectRepository(Aft)
    private readonly aftRepo: Repository<Aft>,
  ) {}

  async create(data: CreateAreaDto): Promise<Area> {
    const existente = await this.areaRepo.findOne({
      where: { nombre: data.nombre },
    });

    if (existente) {
      throw new BadRequestException({
        message: 'Ya existe un área con ese nombre',
        error: 'NOMBRE_DUPLICADO',
      });
    }

    const area = this.areaRepo.create({
      ...data,
      activo: data.activo ?? true,
    });

    return this.areaRepo.save(area);
  }

  async findAll(): Promise<Area[]> {
    return this.areaRepo.find();
  }

  async findActivas() {
    return this.areaRepo.find({
      where: { activo: true },
      order: { nombre: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Area> {
    const area = await this.areaRepo.findOne({
      where: { id },
    });

    if (!area) {
      throw new NotFoundException('Área no encontrada');
    }

    return area;
  }
    
  async update(id: number, data: UpdateAreaDto): Promise<Area> {
    const area = await this.findOne(id);

    if (data.activo === false && area.activo === true) {
      const aftsActivos = await this.aftRepo.count({
        where: {
          areaId: id,
          activo: true,
        },
      });

      if (aftsActivos > 0) {
        throw new BadRequestException({
          message: 'No se puede desactivar el área: tiene AFTs asociados',
          error: 'AREA_CON_AFTS_ACTIVOS',
        });
      }
    }

    if (data.nombre && data.nombre !== area.nombre) {
      const existente = await this.areaRepo.findOne({
        where: { nombre: data.nombre },
      });

      if (existente) {
        throw new BadRequestException({
          message: 'Ya existe un área con ese nombre',
          error: 'NOMBRE_DUPLICADO',
        });
      }
    }

    Object.assign(area, data);
    return this.areaRepo.save(area);
  }

  async remove(id: number): Promise<void> {
    const area = await this.findOne(id);

    const aftsActivos = await this.aftRepo.count({
      where: {
        areaId: id,
        activo: true,
      },
    });

    if (aftsActivos > 0) {
      throw new BadRequestException({
        message: 'No se puede desactivar el área: tiene AFTs asociados',
        error: 'AREA_CON_AFTS_ACTIVOS',
      });
    }

    area.activo = false;
    await this.areaRepo.save(area);
  }
}