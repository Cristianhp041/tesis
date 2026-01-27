import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Provincia } from './entities/provincia.entity';
import { CreateProvinciaDto } from './dto/create-provincia.dto';
import { UpdateProvinciaDto } from './dto/update-provincia.dto';

@Injectable()
export class ProvinciaService {
  constructor(
    @InjectRepository(Provincia)
    private provinciaRepo: Repository<Provincia>,
  ) {}

  async create(dto: CreateProvinciaDto) {
    const existente = await this.provinciaRepo.findOne({
      where: { nombre: dto.nombre },
    });

    if (existente) {
      throw new BadRequestException({
        message: 'Ya existe una provincia con ese nombre',
        error: 'NOMBRE_DUPLICADO',
      });
    }

    const provincia = this.provinciaRepo.create(dto);
    return this.provinciaRepo.save(provincia);
  }

  findAll() {
    return this.provinciaRepo.find({
      relations: ['municipios'],
    });
  }

  async findOne(id: number) {
    const prov = await this.provinciaRepo.findOne({
      where: { id },
      relations: ['municipios'],
    });

    if (!prov) throw new NotFoundException('Provincia no encontrada');
    return prov;
  }

  async update(id: number, dto: UpdateProvinciaDto) {
    const provincia = await this.findOne(id);

    if (dto.nombre && dto.nombre !== provincia.nombre) {
      const existente = await this.provinciaRepo.findOne({
        where: { nombre: dto.nombre },
      });

      if (existente) {
        throw new BadRequestException({
          message: 'Ya existe una provincia con ese nombre',
          error: 'NOMBRE_DUPLICADO',
        });
      }
    }

    await this.provinciaRepo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const prov = await this.findOne(id);

    if (prov.municipios?.length) {
      throw new BadRequestException({
        message: 'No se puede eliminar la provincia: tiene municipios asociados',
        error: 'PROVINCIA_CON_MUNICIPIOS',
      });
    }

    await this.provinciaRepo.delete(id);
    return true;
  }

  async getMunicipios(provinciaId: number) {
    const prov = await this.provinciaRepo.findOne({
      where: { id: provinciaId },
      relations: ['municipios'],
    });
    return prov?.municipios || [];
  }
}