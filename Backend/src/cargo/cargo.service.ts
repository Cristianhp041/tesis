import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cargo } from './entities/cargo.entity';
import { CreateCargoDto } from './dto/create-cargo.dto';
import { UpdateCargoDto } from './dto/update-cargo.dto';
import { Trabajador } from '../trabajador/entities/trabajador.entity';

@Injectable()
export class CargoService {
  constructor(
    @InjectRepository(Cargo)
    private repo: Repository<Cargo>,

    @InjectRepository(Trabajador)
    private trabajadorRepo: Repository<Trabajador>,
  ) {}

  async create(data: CreateCargoDto) {
    const existente = await this.repo.findOne({
      where: { nombre: data.nombre },
    });

    if (existente) {
      throw new BadRequestException({
        message: 'Ya existe un cargo con ese nombre',
        error: 'NOMBRE_DUPLICADO',
      });
    }

    return this.repo.save(
      this.repo.create({ ...data, activo: true })
    );
  }

  findAll() {
    return this.repo.find();
  }

  findActivos() {
    return this.repo.find({
      where: { activo: true },
    });
  }

  async findOne(id: number) {
    const cargo = await this.repo.findOne({
      where: { id },
      relations: ['trabajadores'],
    });

    if (!cargo) throw new NotFoundException('Cargo no encontrado');

    return cargo;
  }

  async update(id: number, data: UpdateCargoDto) {
    const cargo = await this.repo.findOne({
      where: { id },
      relations: ['trabajadores'],
    });

    if (!cargo) {
      throw new NotFoundException('Cargo no encontrado');
    }

    if (data.activo === false && cargo.activo === true) {
      const countWorkers = await this.trabajadorRepo.count({
        where: { cargoId: id },
      });

      if (countWorkers > 0) {
        throw new BadRequestException({
          message: 'No se puede desactivar el cargo: tiene trabajadores asociados',
          error: 'CARGO_CON_TRABAJADORES',
        });
      }
    }

    if (data.nombre && data.nombre !== cargo.nombre) {
      const existente = await this.repo.findOne({
        where: { nombre: data.nombre },
      });

      if (existente) {
        throw new BadRequestException({
          message: 'Ya existe un cargo con ese nombre',
          error: 'NOMBRE_DUPLICADO',
        });
      }
    }

    Object.assign(cargo, data);
    await this.repo.save(cargo);
    
    return this.findOne(id);
  }

  async remove(id: number) {
    const cargo = await this.repo.findOne({
      where: { id },
      relations: ['trabajadores'],
    });

    if (!cargo) {
      throw new NotFoundException('Cargo no encontrado');
    }

    const countWorkers = await this.trabajadorRepo.count({
      where: { cargoId: id },
    });

    if (countWorkers > 0) {
      throw new BadRequestException({
        message: 'No se puede desactivar el cargo: tiene trabajadores asociados',
        error: 'CARGO_CON_TRABAJADORES',
      });
    }

    cargo.activo = false;
    return this.repo.save(cargo);
  }

  getTrabajadores(cargoId: number) {
    return this.trabajadorRepo.find({
      where: { cargoId },
      relations: ['cargo'],
    });
  }
}