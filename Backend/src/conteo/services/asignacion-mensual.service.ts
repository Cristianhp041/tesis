import { Injectable, NotFoundException, BadRequestException, forwardRef, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { AsignacionMensual, EstadoAsignacionMensual } from '../entities/asignacion-mensual.entity';
import { Aft } from '../../aft/entities/aft.entity';
import { RegistroConteo } from '../entities/registro-conteo.entity';
import { User } from '../../user/entities/user.entity';
import { AftService } from '../../aft/aft.service';

@Injectable()
export class AsignacionMensualService {
  
  constructor(
    @InjectRepository(AsignacionMensual)
    private asignacionMensualRepository: Repository<AsignacionMensual>,
    
    @InjectRepository(Aft)
    private aftRepository: Repository<Aft>,
    
    @InjectRepository(RegistroConteo)
    private registroConteoRepository: Repository<RegistroConteo>,

    @InjectRepository(User)
    private userRepository: Repository<User>,

    @Inject(forwardRef(() => AftService)) 
    private aftService: AftService,
  ) {}

  async obtenerPorId(asignacionId: number): Promise<AsignacionMensual> {
    const asignacion = await this.asignacionMensualRepository.findOne({
      where: { id: asignacionId },
      relations: ['planConteo', 'confirmadoPor'],
    });

    if (!asignacion) {
      throw new NotFoundException(`Asignación mensual con ID ${asignacionId} no encontrada`);
    }

    return asignacion;
  }

  async obtenerPorMes(planConteoId: number, mes: number): Promise<AsignacionMensual> {
    const asignacion = await this.asignacionMensualRepository.findOne({
      where: { planConteoId, mes },
      relations: ['planConteo', 'confirmadoPor'],
    });

    if (!asignacion) {
      throw new NotFoundException(`Asignación del mes ${mes} no encontrada`);
    }

    return asignacion;
  }

  async obtenerActivosDelMes(asignacionId: number): Promise<Record<string, unknown>[]> {
    const asignacion = await this.obtenerPorId(asignacionId);

    const activos = await this.aftRepository.find({
      where: { id: In(asignacion.activosAsignados) },
      relations: ['area', 'subclasificacion'],
      order: { rotulo: 'ASC' },
    });

    const registros = await this.registroConteoRepository.find({
      where: { asignacionMensualId: asignacionId },
    });

    const registrosMap = new Map(registros.map(r => [r.aftId, r]));

    return activos.map(activo => ({
      id: activo.id.toString(),
      codigo: activo.rotulo,
      descripcion: activo.nombre,
      areaNombre: activo.area?.nombre || 'Sin área',
      subclasificacionNombre: activo.subclasificacion?.nombre || 'Sin subclasificación',
      yaContado: registrosMap.has(activo.id),
      activo: activo.activo,
    }));
  }

  async iniciarMes(asignacionId: number, responsableId?: number): Promise<AsignacionMensual> {
    const asignacion = await this.obtenerPorId(asignacionId);

    if (asignacion.estado !== EstadoAsignacionMensual.PENDIENTE) {
      throw new BadRequestException('La asignación debe estar PENDIENTE para iniciarla');
    }

    asignacion.estado = EstadoAsignacionMensual.EN_PROCESO;
    
    return await this.asignacionMensualRepository.save(asignacion);
  }

  async completarMes(asignacionId: number): Promise<AsignacionMensual> {
    const asignacion = await this.obtenerPorId(asignacionId);

    if (asignacion.estado !== EstadoAsignacionMensual.EN_PROCESO) {
      throw new BadRequestException('La asignación debe estar EN_PROCESO para completarla');
    }

    asignacion.estado = EstadoAsignacionMensual.COMPLETADO;

    return await this.asignacionMensualRepository.save(asignacion);
  }

  async obtenerResumenMensual(asignacionId: number): Promise<Record<string, unknown>> {
    const asignacion = await this.obtenerPorId(asignacionId);
    const activos = await this.obtenerActivosDelMes(asignacionId);

    const resumenPorArea = this.calcularResumenPorArea(activos);
    const resumenPorSubclasificacion = this.calcularResumenPorSubclasificacion(activos);

    return {
      asignacionId: asignacion.id,
      mes: asignacion.mes,
      nombreMes: asignacion.nombreMes,
      estado: asignacion.estado,
      cantidadAsignada: asignacion.cantidadAsignada,
      activosContados: asignacion.activosContados,
      activosEncontrados: asignacion.activosEncontrados,
      activosFaltantes: asignacion.activosFaltantes,
      activosConDiscrepancias: asignacion.activosConDiscrepancias,
      porcentajeProgreso: asignacion.porcentajeProgreso,
      tasaEncontrados: asignacion.tasaEncontrados,
      resumenPorArea,
      resumenPorSubclasificacion,
    };
  }
  async obtenerCantidadAftsDesactivados(asignacionId: number): Promise<number> {
  const asignacion = await this.obtenerPorId(asignacionId);
  
  const aftsDesactivados = await this.aftRepository.count({
    where: { 
      id: In(asignacion.activosAsignados),
      activo: false 
    }
  });
  
  return aftsDesactivados;
}

  private calcularResumenPorArea(activos: Record<string, unknown>[]): Record<string, unknown>[] {
    const areaMap = new Map<string, Record<string, unknown>>();

    activos.forEach(activo => {
      const areaNombre = (activo.areaNombre as string) || 'Sin área';
      
      if (!areaMap.has(areaNombre)) {
        areaMap.set(areaNombre, {
          areaNombre,
          totalAsignados: 0,
          totalContados: 0,
          totalEncontrados: 0,
          totalFaltantes: 0,
          totalConDiscrepancias: 0,
        });
      }

      const area = areaMap.get(areaNombre)!;
      area.totalAsignados = (area.totalAsignados as number) + 1;
      
      if (activo.yaContado) {
        area.totalContados = (area.totalContados as number) + 1;
      }
    });

    return Array.from(areaMap.values()).map(area => ({
      ...area,
      porcentajeProgreso: (area.totalAsignados as number) > 0 
        ? Math.round(((area.totalContados as number) / (area.totalAsignados as number)) * 100) 
        : 0,
      tasaEncontrados: (area.totalContados as number) > 0
        ? Math.round(((area.totalEncontrados as number) / (area.totalContados as number)) * 100)
        : 0,
    }));
  }

  private calcularResumenPorSubclasificacion(activos: Record<string, unknown>[]): Record<string, unknown>[] {
    const subclasifMap = new Map<string, Record<string, unknown>>();

    activos.forEach(activo => {
      const key = `${activo.subclasificacionNombre || 'Sin subclasificación'}-${activo.areaNombre}`;
      
      if (!subclasifMap.has(key)) {
        subclasifMap.set(key, {
          subclasificacionNombre: activo.subclasificacionNombre || 'Sin subclasificación',
          areaNombre: activo.areaNombre,
          totalAsignados: 0,
          totalContados: 0,
          totalEncontrados: 0,
          totalFaltantes: 0,
        });
      }

      const subclasif = subclasifMap.get(key)!;
      subclasif.totalAsignados = (subclasif.totalAsignados as number) + 1;
      
      if (activo.yaContado) {
        subclasif.totalContados = (subclasif.totalContados as number) + 1;
      }
    });

    return Array.from(subclasifMap.values()).map(sub => ({
      ...sub,
      porcentajeProgreso: (sub.totalAsignados as number) > 0
        ? Math.round(((sub.totalContados as number) / (sub.totalAsignados as number)) * 100)
        : 0,
    }));
  }

  async agregarObservacion(asignacionId: number, observacion: string): Promise<AsignacionMensual> {
    const asignacion = await this.obtenerPorId(asignacionId);

    const fechaHora = new Date().toLocaleString('es-MX');
    const nuevaObservacion = `[${fechaHora}] ${observacion}`;
    
    return await this.asignacionMensualRepository.save(asignacion);
  }

  async confirmarConteo(asignacionId: number, confirmadoPorEmail: string): Promise<AsignacionMensual> {
    const asignacion = await this.obtenerPorId(asignacionId);

    const aftsActivos = await this.aftRepository.find({
      where: { 
        id: In(asignacion.activosAsignados),
        activo: true
      }
    });

    const cantidadActivosActivos = aftsActivos.length;
    
    if (asignacion.activosContados < cantidadActivosActivos) {
      throw new BadRequestException(
        `No se puede confirmar. Faltan ${cantidadActivosActivos - asignacion.activosContados} activos por contar`
      );
    }

    if (asignacion.confirmadoConteo) {
      throw new BadRequestException('El conteo ya ha sido confirmado');
    }

    const usuario = await this.userRepository.findOne({
      where: { email: confirmadoPorEmail },
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con email ${confirmadoPorEmail} no encontrado`);
    }

    asignacion.confirmadoConteo = true;
    asignacion.confirmadoPorId = usuario.id;
    asignacion.fechaConfirmacion = new Date();

    await this.asignacionMensualRepository.save(asignacion);

    await this.desactivarAFTsInactivos(asignacionId, asignacion.nombreMes, asignacion.anno);

    const asignacionActualizada = await this.asignacionMensualRepository.findOne({
      where: { id: asignacionId },
      relations: ['confirmadoPor'],
    });

    if (!asignacionActualizada) {
      throw new NotFoundException(`Asignación mensual con ID ${asignacionId} no encontrada`);
    }

    return asignacionActualizada;
  }

  private async desactivarAFTsInactivos(asignacionId: number, nombreMes: string, anno: number): Promise<void> {
    const registros = await this.registroConteoRepository.find({
      where: { asignacionMensualId: asignacionId },
      relations: ['aft'],
    });

    const registrosInactivos = registros.filter(
      r => r.estadoEncontrado?.toLowerCase().includes('inactivo')
    );

    for (const registro of registrosInactivos) {
      const aft = await this.aftRepository.findOne({
        where: { id: registro.aftId },
      });

      if (!aft) continue;

      if (aft.activo) {
        aft.activo = false;
        await this.aftRepository.save(aft);

        await this.aftService.registrarHistorial(
          aft.id,
          `AFT desactivado en conteo de ${nombreMes} ${anno}`
        );
      }
    }
  }

  async puedeEditar(asignacionId: number): Promise<boolean> {
    const asignacion = await this.obtenerPorId(asignacionId);
    return !asignacion.confirmadoConteo;
  }
  async actualizarProgreso(asignacionId: number): Promise<AsignacionMensual> {
  const asignacion = await this.obtenerPorId(asignacionId);

  const registros = await this.registroConteoRepository.find({
    where: { asignacionMensualId: asignacionId },
  });

  const totales = registros.reduce(
    (acc, reg) => ({
      contados: acc.contados + 1,
      encontrados: acc.encontrados + (reg.encontrado ? 1 : 0),
      faltantes: acc.faltantes + (!reg.encontrado ? 1 : 0),
      discrepancias: acc.discrepancias + (reg.tieneDiscrepancia ? 1 : 0),
    }),
    { contados: 0, encontrados: 0, faltantes: 0, discrepancias: 0 }
  );

  asignacion.activosContados = totales.contados;
  asignacion.activosEncontrados = totales.encontrados;
  asignacion.activosFaltantes = totales.faltantes;
  asignacion.activosConDiscrepancias = totales.discrepancias;

  return await this.asignacionMensualRepository.save(asignacion);
}

 async removerAftDeAsignaciones(aftId: number): Promise<void> {
  const asignaciones = await this.asignacionMensualRepository
    .createQueryBuilder('asig')
    .where('asig.confirmadoConteo = :confirmado', { confirmado: false })
    .andWhere(':aftId = ANY(asig.activosAsignados)', { aftId })
    .getMany();

  for (const asignacion of asignaciones) {
    const registroExistente = await this.registroConteoRepository.findOne({
      where: {
        asignacionMensualId: asignacion.id,
        aftId: aftId,
      },
    });

    if (registroExistente) {
      await this.registroConteoRepository.remove(registroExistente);
    }

    asignacion.activosAsignados = asignacion.activosAsignados.filter(
      aid => aid !== aftId
    );
    asignacion.cantidadAsignada = Math.max(0, asignacion.cantidadAsignada - 1);
    
    await this.asignacionMensualRepository.save(asignacion);
    
    await this.actualizarProgreso(asignacion.id);
    
    await this.aftService.registrarHistorial(
      aftId,
      `Removido de asignación ${asignacion.nombreMes} ${asignacion.anno} (desactivado desde inventario)`
    );
  }
}
}