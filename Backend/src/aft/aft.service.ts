import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets, In } from 'typeorm';

import { Aft } from './entities/aft.entity';
import { AftHistorial } from './entities/aft-historial.entity';
import { CreateAftDto } from './dto/create-aft.dto';
import { UpdateAftDto } from './dto/update-aft.dto';
import { Area } from '../area/entities/area.entity';
import { Subclasificacion } from '../subclasificacion/entities/subclasificacion.entity';
import { SubclasificacionService } from '../subclasificacion/subclasificacion.service';
import { AftFilterInput } from './dto/aft-filter.input';
import { ImportAftRowDto, ImportResultDto } from './dto/import-aft.dto';
import * as xlsx from 'xlsx';

@Injectable()
export class AftService {
  constructor(
    @InjectRepository(Aft)
    private readonly repo: Repository<Aft>,

    @InjectRepository(AftHistorial)
    private readonly historialRepo: Repository<AftHistorial>,

    @InjectRepository(Area)
    private readonly areaRepo: Repository<Area>,

    @InjectRepository(Subclasificacion)
    private readonly subRepo: Repository<Subclasificacion>,

    @Inject(forwardRef(() => SubclasificacionService))
    private readonly subclasificacionService: SubclasificacionService,
  ) {}

  async create(data: CreateAftDto) {
    const area = await this.areaRepo.findOne({
      where: { id: data.areaId },
    });
    if (!area) {
      throw new BadRequestException({
        message: 'Área no existe',
        error: 'AREA_NO_EXISTE',
      });
    }

    const subclasificacion = await this.subRepo.findOne({
      where: { id: data.subclasificacionId },
    });
    if (!subclasificacion) {
      throw new BadRequestException({
        message: 'Subclasificación no existe',
        error: 'SUBCLASIFICACION_NO_EXISTE',
      });
    }

    const rotuloExiste = await this.repo.findOne({
      where: { rotulo: data.rotulo },
    });
    if (rotuloExiste) {
      throw new BadRequestException({
        message: 'Ya existe un AFT con ese rótulo',
        error: 'ROTULO_DUPLICADO',
      });
    }

    const aft = this.repo.create({
      rotulo: data.rotulo,
      nombre: data.nombre,
      area,
      subclasificacion,
      activo: true,
    });

    const saved = await this.repo.save(aft);

    await this.registrarHistorial(saved.id, 'AFT creado');

    return this.findOne(saved.id);
  }

  async findAll(active: 'true' | 'false' | 'all' = 'true') {
    let where = {};

    if (active === 'true') {
      where = { activo: true };
    }

    if (active === 'false') {
      where = { activo: false };
    }

    return this.repo.find({
      where,
      relations: ['area', 'subclasificacion', 'historial'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number) {
    const aft = await this.repo.findOne({
      where: { id },
      relations: ['area', 'subclasificacion'],
    });

    if (!aft) throw new NotFoundException('AFT no encontrado');

    aft.historial = await this.historialRepo.find({
      where: { aftId: id },
      order: { id: 'DESC' },
    });

    return aft;
  }

  async update(id: number, data: UpdateAftDto) {
    const aft = await this.repo.findOne({
      where: { id },
      relations: ['area', 'subclasificacion'],
    });

    if (!aft) throw new NotFoundException('AFT no encontrado');

    const cambios: string[] = [];

    if (data.rotulo && data.rotulo !== aft.rotulo) {
      const existe = await this.repo.findOne({
        where: { rotulo: data.rotulo },
      });
      if (existe) {
        throw new BadRequestException({
          message: 'Ya existe un AFT con ese rótulo',
          error: 'ROTULO_DUPLICADO',
        });
      }

      cambios.push(`Rótulo cambiado de "${aft.rotulo}" a "${data.rotulo}"`);
      aft.rotulo = data.rotulo;
    }

    if (data.nombre && data.nombre !== aft.nombre) {
      cambios.push(`Nombre cambiado de "${aft.nombre}" a "${data.nombre}"`);
      aft.nombre = data.nombre;
    }

    if (data.areaId && data.areaId !== aft.area.id) {
      const area = await this.areaRepo.findOne({
        where: { id: data.areaId },
      });
      if (!area) throw new BadRequestException('Área no existe');

      cambios.push(`Movido de "${aft.area.nombre}" a "${area.nombre}"`);
      aft.area = area;
    }

    if (
      data.subclasificacionId &&
      data.subclasificacionId !== aft.subclasificacion.id
    ) {
      const sub = await this.subRepo.findOne({
        where: { id: data.subclasificacionId },
      });
      if (!sub) throw new BadRequestException('Subclasificación no existe');

      cambios.push(
        `Subclasificación cambiada de "${aft.subclasificacion.nombre}" a "${sub.nombre}"`
      );
      aft.subclasificacion = sub;
    }

    if (typeof data.activo === 'boolean' && data.activo !== aft.activo) {
      if (!aft.activo && data.activo) {

        throw new BadRequestException({
          message: 'No se puede reactivar un AFT inactivo',
          error: 'AFT_NO_REACTIVABLE',
        });
      }

      cambios.push(
        data.activo
          ? 'AFT marcado como ACTIVO'
          : 'AFT marcado como NO ACTIVO'
      );
      aft.activo = data.activo;
    }

    if (cambios.length === 0) {
      return this.findOne(id);
    }

    await this.repo.save(aft);

    for (const descripcion of cambios) {
      await this.registrarHistorial(id, descripcion);
    }

    return this.findOne(id);
  }

  async moverArea(id: number, nuevaAreaId: number) {
    const aft = await this.findOne(id);

    const nuevaArea = await this.areaRepo.findOne({
      where: { id: nuevaAreaId },
    });
    if (!nuevaArea) {
      throw new BadRequestException('Nueva área no existe');
    }

    const areaAnterior = aft.area?.nombre;
    aft.area = nuevaArea;

    await this.repo.save(aft);

    await this.registrarHistorial(
      id,
      `AFT movido de "${areaAnterior}" a "${nuevaArea.nombre}"`,
    );

    return this.findOne(id);
  }

  async desactivar(id: number) {
    const aft = await this.findOne(id);

    if (!aft.activo) {
      throw new BadRequestException({
        message: 'El AFT ya está inactivo',
        error: 'AFT_YA_INACTIVO',
      });
    }

    aft.activo = false;
    await this.repo.save(aft);

    await this.registrarHistorial(id, 'AFT marcado como NO ACTIVO');

    return this.findOne(id);
  }

  private async registrarHistorial(
    aftId: number,
    descripcion: string,
  ) {
    const h = this.historialRepo.create({
      aftId,
      descripcion,
    });
    return this.historialRepo.save(h);
  }

  async filter(filters: AftFilterInput) {
    const qb = this.repo
      .createQueryBuilder('aft')
      .leftJoinAndSelect('aft.area', 'area')
      .leftJoinAndSelect('aft.subclasificacion', 'sub');

    if (filters.search) {
      const s = `%${filters.search
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()}%`;

      qb.andWhere(
        new Brackets((q) => {
          q.where('LOWER(aft.nombre) LIKE :s', { s })
            .orWhere('LOWER(aft.rotulo) LIKE :s', { s })
            .orWhere('LOWER(sub.nombre) LIKE :s', { s });
        }),
      );
    }

    if (filters.area) {
      qb.andWhere('LOWER(area.nombre) LIKE :a', {
        a: `%${filters.area.toLowerCase()}%`,
      });
    }

    if (filters.subclasificacion) {
      qb.andWhere('sub.id = :sub', {
        sub: filters.subclasificacion,
      });
    }

    if (filters.activo !== undefined) {
      qb.andWhere('aft.activo = :ac', { ac: filters.activo });
    }

    if (filters.orderBy) {
      qb.orderBy(`aft.${filters.orderBy}`, filters.orderDir || 'ASC');
    }

    const [data, total] = await qb.getManyAndCount();
    return { data, total };
  }

  async desactivarMasivo(aftIds: number[]) {
    const afts = await this.repo.find({
      where: aftIds.map((id) => ({ id })),
      relations: ['area'],
    });

    if (afts.length === 0) {
      throw new NotFoundException('No se encontraron AFTs');
    }

    for (const aft of afts) {
      if (aft.activo) {
        aft.activo = false;
        await this.repo.save(aft);
        await this.registrarHistorial(aft.id, 'AFT marcado como NO ACTIVO (masivo)');
      }
    }

    return afts;
  }

  async moverMasivo(aftIds: number[], nuevaAreaId: number) {
    const nuevaArea = await this.areaRepo.findOne({
      where: { id: nuevaAreaId },
    });

    if (!nuevaArea) {
      throw new BadRequestException('Área no encontrada');
    }

    const afts = await this.repo.find({
      where: aftIds.map((id) => ({ id })),
      relations: ['area'],
    });

    if (afts.length === 0) {
      throw new NotFoundException('No se encontraron AFTs');
    }

    const aftsMovidos: Aft[] = [];

    for (const aft of afts) {
      if (aft.area?.id === nuevaAreaId) {
        continue;
      }

      const areaAnterior = aft.area?.nombre ?? 'Sin área';

      aft.area = nuevaArea;
      await this.repo.save(aft);

      await this.registrarHistorial(
        aft.id,
        `AFT movido de "${areaAnterior}" a "${nuevaArea.nombre}"`,
      );

      aftsMovidos.push(aft);
    }

    return aftsMovidos;
  }

async importarAfts(buffer: Buffer): Promise<ImportResultDto> {
  const resultado: ImportResultDto = {
    exitosos: 0,
    duplicados: 0,
    errores: 0,
    mensajes: [],
  };

  try {
    const workbook = xlsx.read(buffer, { 
      type: 'buffer',
      raw: true,
      codepage: 65001
    });
    
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
        'Error al leer el archivo CSV. Por favor, usa un archivo Excel (.xlsx) o asegúrate de que el CSV esté correctamente formateado.'
      );
    }

    const getFieldValue = (row: Record<string, unknown>, ...fieldNames: string[]): string => {
      for (const fieldName of fieldNames) {
        if (row[fieldName] != null) {
          return String(row[fieldName]).trim();
        }
        
        const key = Object.keys(row).find(k => k.toLowerCase() === fieldName.toLowerCase());
        if (key && row[key] != null) {
          return String(row[key]).trim();
        }
      }
      return '';
    };

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const fila = i + 2; 

      try {
        const rotulo = getFieldValue(row, 'Rotulo', 'Rótulo', 'ROTULO');
        const nombre = getFieldValue(row, 'Nombre', 'NOMBRE', 'nombre');
        const areaNombre = getFieldValue(row, 'Area', 'Área', 'AREA', 'area');
        const subNombre = getFieldValue(row, 'Subclasificacion', 'Subclasificación', 'SUBCLASIFICACION', 'subclasificacion');
        const estadoStr = getFieldValue(row, 'Estado', 'ESTADO', 'estado') || 'activo';

        const camposFaltantes: string[] = [];
        if (!rotulo) camposFaltantes.push('Rotulo');
        if (!nombre) camposFaltantes.push('Nombre');
        if (!areaNombre) camposFaltantes.push('Area');
        if (!subNombre) camposFaltantes.push('Subclasificacion');

        if (camposFaltantes.length > 0) {
          resultado.errores++;
          resultado.mensajes.push(
            `Fila ${fila}: Faltan campos obligatorios: ${camposFaltantes.join(', ')}`
          );
          continue;
        }

        const existe = await this.repo.findOne({
          where: { rotulo },
        });

        if (existe) {
          resultado.duplicados++;
          resultado.mensajes.push(
            `Fila ${fila}: Rótulo "${rotulo}" ya existe (omitido)`
          );
          continue;
        }

        const area = await this.areaRepo.findOne({
          where: { nombre: areaNombre },
        });

        if (!area) {
          resultado.errores++;
          resultado.mensajes.push(
            `Fila ${fila}: Área "${areaNombre}" no encontrada en el sistema`
          );
          continue;
        }

        const subclasificacion = await this.subRepo.findOne({
          where: { nombre: subNombre },
        });

        if (!subclasificacion) {
          resultado.errores++;
          resultado.mensajes.push(
            `Fila ${fila}: Subclasificación "${subNombre}" no encontrada en el sistema`
          );
          continue;
        }

        const activo = estadoStr.toLowerCase() === 'activo' || 
                       estadoStr.toLowerCase() === 'true' || 
                       estadoStr === '1';

        const aft = this.repo.create({
          rotulo,
          nombre,
          area,
          subclasificacion,
          activo,
        });

        await this.repo.save(aft);

        await this.registrarHistorial(
          aft.id,
          'AFT creado mediante importación'
        );

        resultado.exitosos++;
      } catch (error) {
        resultado.errores++;
        const mensaje = error instanceof Error ? error.message : String(error);
        resultado.mensajes.push(
          `Fila ${fila}: ${mensaje}`
        );
      }
    }

    if (resultado.exitosos > 0) {
      resultado.mensajes.unshift(
        `✓ ${resultado.exitosos} AFT(s) importados correctamente`
      );
    }
    if (resultado.duplicados > 0) {
      resultado.mensajes.unshift(
        `⚠ ${resultado.duplicados} rótulo(s) duplicado(s) omitido(s)`
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

  async findByIds(ids: number[]): Promise<Aft[]> {
    return this.repo.find({
      where: { id: In(ids) },
      relations: ['area', 'subclasificacion'],
      order: { rotulo: 'ASC' },
    });
  }

  async findBySubclasificacion(subclasificacionId: number): Promise<Aft[]> {
    return this.repo.find({
      where: { subclasificacionId },
      relations: ['area', 'subclasificacion'],
      order: { rotulo: 'ASC' },
    });
  }
}