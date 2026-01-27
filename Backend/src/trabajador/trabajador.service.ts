import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';

import { Trabajador } from './entities/trabajador.entity';
import { CreateTrabajadorDto } from './dto/create-trabajador.dto';
import { UpdateTrabajadorDto } from './dto/update-trabajador.dto'; 
import { TrabajadorFilterInput } from './dto/trabajador-filter.input';

import { Provincia } from '../provincia/entities/provincia.entity';
import { Municipio } from '../municipio/entities/municipio.entity';
import { Cargo } from '../cargo/entities/cargo.entity';

@Injectable()
export class TrabajadorService {
  constructor(
    @InjectRepository(Trabajador)
    private readonly repo: Repository<Trabajador>,
  ) {}

  async create(data: CreateTrabajadorDto) {
    const existingExp = await this.repo.findOne({
      where: { expediente: data.expediente },
    });

    if (existingExp) {
      throw new BadRequestException('El expediente ya existe');
    }

    const cargo = await this.repo.manager.findOne(Cargo, {
      where: { id: data.cargoId },
    });
    if (!cargo) {
      throw new BadRequestException('Cargo no existe');
    }

    const provincia = await this.repo.manager.findOne(Provincia, {
      where: { id: data.provinciaId },
    });
    if (!provincia) {
      throw new BadRequestException('Provincia no existe');
    }

    const municipio = await this.repo.manager.findOne(Municipio, {
      where: { id: data.municipioId },
      relations: ['provincia'],
    });
    if (!municipio) {
      throw new BadRequestException('Municipio no existe');
    }

    if (municipio.provincia?.id !== data.provinciaId) {
      throw new BadRequestException(
        'El municipio no pertenece a la provincia indicada',
      );
    }

    const trabajador = this.repo.create({
      nombre: data.nombre,
      apellidos: data.apellidos,
      expediente: data.expediente,
      telefono: data.telefono && data.telefono.trim() !== '' ? data.telefono : null,
      activo: data.activo ?? true,
      cargo,
      cargoId: cargo.id,
      provincia,
      provinciaId: provincia.id,
      municipio,
      municipioId: municipio.id,
    });

    const saved = await this.repo.save(trabajador);
    return this.findOne(saved.id);
  }

  async findAll(active: 'true' | 'false' | 'all' = 'all') {
    let where: Record<string, unknown> = {};

    if (active === 'true') where = { activo: true };
    if (active === 'false') where = { activo: false };

    return this.repo.find({
      where,
      relations: ['cargo', 'municipio', 'provincia'],
      order: {id: 'DESC' },
    });
  }

  async findOne(id: number) {
    const trabajador = await this.repo.findOne({
      where: { id },
      relations: ['cargo', 'municipio', 'provincia'],
    });

    if (!trabajador) {
      throw new NotFoundException('Trabajador no encontrado');
    }

    return trabajador;
  }

  async update(id: number, data: UpdateTrabajadorDto) {
    const current = await this.findOne(id);

    if (data.expediente && data.expediente !== current.expediente) {
      const exists = await this.repo.findOne({
        where: { expediente: data.expediente },
      });
      if (exists) {
        throw new BadRequestException('El expediente ya existe');
      }
    }

    if (data.nombre !== undefined) current.nombre = data.nombre;
    if (data.apellidos !== undefined) current.apellidos = data.apellidos;
    if (data.expediente !== undefined) current.expediente = data.expediente;
    if (data.activo !== undefined) current.activo = data.activo;
    
    if (data.telefono !== undefined) {
      current.telefono = data.telefono && data.telefono.trim() !== '' ? data.telefono : null;
    }

    if (data.cargoId !== undefined && data.cargoId !== current.cargo?.id) {
      const cargo = await this.repo.manager.findOne(Cargo, {
        where: { id: data.cargoId },
      });
      if (!cargo) {
        throw new BadRequestException('Cargo no existe');
      }
      current.cargo = cargo;
      current.cargoId = cargo.id;
    }

    if (data.provinciaId !== undefined && data.provinciaId !== current.provincia?.id) {
      const provincia = await this.repo.manager.findOne(Provincia, {
        where: { id: data.provinciaId },
      });
      if (!provincia) {
        throw new BadRequestException('Provincia no existe');
      }
      current.provincia = provincia;
      current.provinciaId = provincia.id;
    }

    if (data.municipioId !== undefined && data.municipioId !== current.municipio?.id) {
      const municipio = await this.repo.manager.findOne(Municipio, {
        where: { id: data.municipioId },
        relations: ['provincia'],
      });
      if (!municipio) {
        throw new BadRequestException('Municipio no existe');
      }
      
      const provinciaId = data.provinciaId ?? current.provinciaId;
      if (municipio.provincia?.id !== provinciaId) {
        throw new BadRequestException(
          'El municipio no pertenece a la provincia seleccionada'
        );
      }
      
      current.municipio = municipio;
      current.municipioId = municipio.id;
    }

    const updated = await this.repo.save(current);
    return this.findOne(updated.id);
  }

  async remove(id: number) {
    const trabajador = await this.findOne(id);
    trabajador.activo = false;
    return this.repo.save(trabajador);
  }

  getCargo(cargoId: number) {
    return this.repo.manager.findOne(Cargo, {
      where: { id: cargoId },
    });
  }

  getMunicipio(municipioId: number) {
    return this.repo.manager.findOne(Municipio, {
      where: { id: municipioId },
    });
  }

  getProvincia(provinciaId: number) {
    return this.repo.manager.findOne(Provincia, {
      where: { id: provinciaId },
    });
  }

  async filter(filters: TrabajadorFilterInput) {
    const query = this.repo
      .createQueryBuilder('t')
      .leftJoinAndSelect('t.cargo', 'cargo')
      .leftJoinAndSelect('t.municipio', 'municipio')
      .leftJoinAndSelect('t.provincia', 'provincia');

    if (filters.search) {
      const search = `%${filters.search
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()}%`;

      query.andWhere(
        new Brackets((qb) => {
          qb.where(
            `LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(t.nombre,'á','a'),'é','e'),'í','i'),'ó','o'),'ú','u')) LIKE :search`,
            { search },
          )
            .orWhere(
              `LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(t.apellidos,'á','a'),'é','e'),'í','i'),'ó','o'),'ú','u')) LIKE :search`,
              { search },
            )
            .orWhere('LOWER(t.expediente) LIKE :search', { search });
        }),
      );
    }

    if (filters.cargoId)
      query.andWhere('cargo.id = :cargoId', { cargoId: filters.cargoId });

    if (filters.municipioId)
      query.andWhere('municipio.id = :municipioId', {
        municipioId: filters.municipioId,
      });

    if (filters.provinciaId)
      query.andWhere('provincia.id = :provinciaId', {
        provinciaId: filters.provinciaId,
      });

    if (filters.activo !== undefined) {
      query.andWhere('t.activo = :activo', { activo: filters.activo });
    }

    if (filters.orderBy) {
      const dir = filters.orderDir === 'DESC' ? 'DESC' : 'ASC';
      query.orderBy(`t.${filters.orderBy}`, dir);
    }
    else {
    query.orderBy('t.id', 'DESC');
    }

    if (filters.limit) query.limit(filters.limit);
    if (filters.offset) query.offset(filters.offset);

    const [data, total] = await query.getManyAndCount();
    return { data, total };
  }

  async desactivarMasivo(trabajadorIds: number[]) {
    const trabajadores = await this.repo.find({
      where: trabajadorIds.map((id) => ({ id })),
      relations: ['cargo', 'provincia', 'municipio'],
    });

    if (trabajadores.length === 0) {
      throw new NotFoundException('No se encontraron trabajadores');
    }

    const desactivados: Trabajador[] = [];

    for (const trabajador of trabajadores) {
      if (trabajador.activo) {
        trabajador.activo = false;
        await this.repo.save(trabajador);
        desactivados.push(trabajador);
      }
    }

    return desactivados;
  }

  async importarTrabajadores(buffer: Buffer): Promise<{ exitosos: number; duplicados: number; errores: number; mensajes: string[] }> {
    const resultado = {
      exitosos: 0,
      duplicados: 0,
      errores: 0,
      mensajes: [] as string[],
    };

    try {
      const xlsx = await import('xlsx');
      const workbook = xlsx.read(buffer, { type: 'buffer', raw: true, codepage: 65001 });
      
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      const data: Record<string, unknown>[] = xlsx.utils.sheet_to_json(worksheet, {
        raw: false,
        defval: '',
        blankrows: false
      });

      if (data.length === 0) {
        throw new BadRequestException('El archivo está vacío');
      }

      const primeraClave = Object.keys(data[0])[0];
      if (primeraClave && primeraClave.includes(',')) {
        throw new BadRequestException(
          'Error al leer el archivo. Por favor, usa un archivo Excel (.xlsx)'
        );
      }

      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        const fila = i + 2;

        try {
          const nombre = row.Nombre != null ? String(row.Nombre).trim() : '';
          const apellidos = row.Apellidos != null ? String(row.Apellidos).trim() : '';
          const expediente = row.Expediente != null ? String(row.Expediente).trim() : '';
          const telefono = row.Telefono != null ? String(row.Telefono).trim() : '';
          const cargoNombre = row.Cargo != null ? String(row.Cargo).trim() : '';
          const provinciaNombre = row.Provincia != null ? String(row.Provincia).trim() : '';
          const municipioNombre = row.Municipio != null ? String(row.Municipio).trim() : '';
          const estadoStr = row.Estado != null ? String(row.Estado).trim().toLowerCase() : 'activo';

          const camposFaltantes: string[] = [];
          if (!nombre) camposFaltantes.push('Nombre');
          if (!apellidos) camposFaltantes.push('Apellidos');
          if (!expediente) camposFaltantes.push('Expediente');
          if (!cargoNombre) camposFaltantes.push('Cargo');
          if (!provinciaNombre) camposFaltantes.push('Provincia');
          if (!municipioNombre) camposFaltantes.push('Municipio');

          if (camposFaltantes.length > 0) {
            resultado.errores++;
            resultado.mensajes.push(
              `Fila ${fila}: Faltan campos obligatorios: ${camposFaltantes.join(', ')}`
            );
            continue;
          }

          const existe = await this.repo.findOne({
            where: { expediente },
          });

          if (existe) {
            resultado.duplicados++;
            resultado.mensajes.push(
              `Fila ${fila}: Expediente "${expediente}" ya existe (omitido)`
            );
            continue;
          }

          const cargo = await this.repo.manager.findOne(Cargo, {
            where: { nombre: cargoNombre },
          });

          if (!cargo) {
            resultado.errores++;
            resultado.mensajes.push(
              `Fila ${fila}: Cargo "${cargoNombre}" no encontrado en el sistema`
            );
            continue;
          }

          const provincia = await this.repo.manager.findOne(Provincia, {
            where: { nombre: provinciaNombre },
          });

          if (!provincia) {
            resultado.errores++;
            resultado.mensajes.push(
              `Fila ${fila}: Provincia "${provinciaNombre}" no encontrada en el sistema`
            );
            continue;
          }

          const municipio = await this.repo.manager.findOne(Municipio, {
            where: { nombre: municipioNombre },
            relations: ['provincia'],
          });

          if (!municipio) {
            resultado.errores++;
            resultado.mensajes.push(
              `Fila ${fila}: Municipio "${municipioNombre}" no encontrado en el sistema`
            );
            continue;
          }

          if (municipio.provincia?.id !== provincia.id) {
            resultado.errores++;
            resultado.mensajes.push(
              `Fila ${fila}: Municipio "${municipioNombre}" no pertenece a la provincia "${provinciaNombre}"`
            );
            continue;
          }

          const activo = estadoStr === 'activo' || estadoStr === 'true' || estadoStr === '1';

          const trabajador = this.repo.create({
            nombre,
            apellidos,
            expediente,
            telefono: telefono || null,
            cargoId: cargo.id,
            provinciaId: provincia.id,
            municipioId: municipio.id,
            activo,
          });

          await this.repo.save(trabajador);
          resultado.exitosos++;
        } catch (error) {
          resultado.errores++;
          const mensaje = error instanceof Error ? error.message : String(error);
          resultado.mensajes.push(`Fila ${fila}: ${mensaje}`);
        }
      }

      if (resultado.exitosos > 0) {
        resultado.mensajes.unshift(
          `✓ ${resultado.exitosos} trabajador(es) importado(s) correctamente`
        );
      }
      if (resultado.duplicados > 0) {
        resultado.mensajes.unshift(
          `⚠ ${resultado.duplicados} expediente(s) duplicado(s) omitido(s)`
        );
      }
      if (resultado.errores > 0) {
        resultado.mensajes.unshift(
          `✗ ${resultado.errores} fila(s) con errores`
        );
      }

      return resultado;
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error desconocido';
      throw new BadRequestException(`Error al procesar archivo: ${mensaje}`);
    }
  }
}