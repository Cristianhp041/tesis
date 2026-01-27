import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Municipio } from './entities/municipio.entity';
import { CreateMunicipioDto } from './dto/create-municipio.dto';
import { UpdateMunicipioDto } from './dto/update-municipio.dto';
import { Provincia } from '../provincia/entities/provincia.entity';
import { Trabajador } from '../trabajador/entities/trabajador.entity';

@Injectable()
export class MunicipioService {
  constructor(
    @InjectRepository(Municipio)
    private repo: Repository<Municipio>,

    @InjectRepository(Trabajador)
    private trabajadorRepo: Repository<Trabajador>,
  ) {}

  async create(data: CreateMunicipioDto) {
    const provincia = await this.repo.manager.findOne(Provincia, {
      where: { id: data.provinciaId },
    });

    if (!provincia) {
      throw new BadRequestException({
        message: 'Provincia no encontrada',
        error: 'PROVINCIA_NO_ENCONTRADA',
      });
    }

    const existente = await this.repo.findOne({
      where: {
        nombre: data.nombre,
        provinciaId: data.provinciaId,
      },
    });

    if (existente) {
      throw new BadRequestException({
        message: 'Ya existe un municipio con ese nombre en esta provincia',
        error: 'NOMBRE_DUPLICADO',
      });
    }

    const municipio = this.repo.create(data);
    const saved = await this.repo.save(municipio);
    return this.findOne(saved.id);
  }

  findAll() {
    return this.repo.find({ relations: ['provincia'] });
  }

  async findOne(id: number) {
    const municipio = await this.repo.findOne({
      where: { id },
      relations: ['provincia'],
    });

    if (!municipio) throw new NotFoundException('Municipio no encontrado');
    return municipio;
  }

  async update(id: number, data: UpdateMunicipioDto) {
    const municipio = await this.findOne(id);

    const nombreCambiado = data.nombre && data.nombre !== municipio.nombre;
    const provinciaCambiada = data.provinciaId && data.provinciaId !== municipio.provinciaId;

    if (nombreCambiado || provinciaCambiada) {
      const nombreFinal = data.nombre || municipio.nombre;
      const provinciaFinal = data.provinciaId || municipio.provinciaId;

      const existente = await this.repo.findOne({
        where: {
          nombre: nombreFinal,
          provinciaId: provinciaFinal,
        },
      });

      if (existente && existente.id !== id) {
        throw new BadRequestException({
          message: 'Ya existe un municipio con ese nombre en esta provincia',
          error: 'NOMBRE_DUPLICADO',
        });
      }
    }

    if (data.provinciaId && data.provinciaId !== municipio.provinciaId) {
      const provincia = await this.repo.manager.findOne(Provincia, {
        where: { id: data.provinciaId },
      });

      if (!provincia) {
        throw new BadRequestException({
          message: 'Provincia no encontrada',
          error: 'PROVINCIA_NO_ENCONTRADA',
        });
      }
    }

    await this.repo.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);

    const trabajadores = await this.trabajadorRepo.count({
      where: { municipioId: id },
    });

    if (trabajadores > 0) {
      throw new BadRequestException({
        message: 'No se puede eliminar el municipio: tiene trabajadores asociados',
        error: 'MUNICIPIO_CON_TRABAJADORES',
      });
    }

    return this.repo.delete(id);
  }

  findByProvincia(provinciaId: number) {
    return this.repo.find({
      where: { provinciaId },
      relations: ['provincia'],
    });
  }
}