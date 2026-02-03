import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { PlanConteoAnual, EstadoPlanConteo } from '../entities/plan-conteo-anual.entity';
import { AsignacionMensual, EstadoAsignacionMensual } from '../entities/asignacion-mensual.entity';
import { AlgoritmoDistribucionService } from './algoritmo-distribucion.service';
import { GenerarPlanInput } from '../dto/generarplan.input';
import { ProgresoGeneralOutput } from '../dto/progresogeneral.output';
import { Aft } from '../../aft/entities/aft.entity';
import { RegistroConteo } from '../entities/registro-conteo.entity';
import { Workbook } from 'exceljs';

@Injectable()
export class PlanConteoService {
  
  constructor(
    @InjectRepository(PlanConteoAnual)
    private planConteoRepository: Repository<PlanConteoAnual>,
    
    @InjectRepository(AsignacionMensual)
    private asignacionMensualRepository: Repository<AsignacionMensual>,

    @InjectRepository(Aft)
    private aftRepository: Repository<Aft>,

    @InjectRepository(RegistroConteo)
    private registroConteoRepository: Repository<RegistroConteo>,
    
    private algoritmoDistribucionService: AlgoritmoDistribucionService,
  ) {}

  async generarPlan(input: GenerarPlanInput): Promise<PlanConteoAnual> {
    
    if (!input.userId) {
      throw new BadRequestException('El userId es requerido para crear el plan');
    }

    const planExistente = await this.planConteoRepository.findOne({
      where: { anno: input.anno }
    });

    if (planExistente) {
      throw new BadRequestException(`Ya existe un plan de conteo para el anno ${input.anno}`);
    }

    const resultado = await this.algoritmoDistribucionService.generarDistribucion(input.anno);
    
    const annoInicio = input.anno - 1;
    const annoFin = input.anno;
    
    const fechaInicio = new Date(Date.UTC(annoInicio, 8, 1, 0, 0, 0, 0));
    const fechaFin = new Date(Date.UTC(annoFin, 5, 30, 23, 59, 59, 999));
    
    if (isNaN(fechaInicio.getTime()) || isNaN(fechaFin.getTime())) {
      throw new BadRequestException('Fechas del plan inválidas');
    }

    const plan = this.planConteoRepository.create({
      anno: input.anno,
      fechaInicio,
      fechaFin,
      estado: EstadoPlanConteo.PLANIFICADO,
      totalActivos: resultado.totalActivos,
      activosPorMes: resultado.metaPorMes,
      toleranciaMin: resultado.toleranciaMin,
      toleranciaMax: resultado.toleranciaMax,
      activosContados: 0,
      activosEncontrados: 0,
      activosFaltantes: 0,
      activosConDiscrepancias: 0,
      configuracionAlgoritmo: {
        version: '1.0',
        parametros: {
          totalMeses: input.totalMeses || 10,
          toleranciaPorcentaje: 20,
        },
        timestamp: new Date(),
      },
      estadisticasDistribucion: resultado.estadisticas,
      observaciones: input.observaciones,
      createdById: input.userId,
    });

    const planGuardado = await this.planConteoRepository.save(plan);

    const asignaciones = resultado.bloquesMensuales.map((bloque, index) => {
      const mesCalendario = [9, 10, 11, 12, 1, 2, 3, 4, 5, 6][index];
      const annoMes = mesCalendario >= 9 ? input.anno - 1 : input.anno;
      
      const fechaInicioMes = new Date(Date.UTC(annoMes, mesCalendario - 1, 1, 0, 0, 0, 0));
      const fechaLimiteMes = new Date(Date.UTC(annoMes, mesCalendario, 0, 23, 59, 59, 999));
      
      if (isNaN(fechaInicioMes.getTime()) || isNaN(fechaLimiteMes.getTime())) {
        throw new Error(`Fecha inválida en mes ${bloque.mes}: ${mesCalendario}/${annoMes}`);
      }

      return this.asignacionMensualRepository.create({
        planConteoId: planGuardado.id,
        mes: bloque.mes,
        nombreMes: bloque.nombreMes,
        mesCalendario,
        anno: annoMes,
        estado: EstadoAsignacionMensual.PENDIENTE,
        porcentajeAsignado: bloque.porcentaje,
        cantidadAsignada: bloque.cantidadAsignada,
        criterioAsignacion: bloque.criterioAsignacion,
        activosAsignados: bloque.activosAsignados,
        detalleAsignacion: bloque.detalle as unknown as Record<string, unknown>,
        fechaInicio: fechaInicioMes,
        fechaLimite: fechaLimiteMes,
        activosContados: 0,
        activosEncontrados: 0,
        activosFaltantes: 0,
        activosConDiscrepancias: 0,
      });
    });

    await this.asignacionMensualRepository.save(asignaciones);

    const planFinal = await this.planConteoRepository.findOne({
      where: { id: planGuardado.id },
      relations: ['asignacionesMensuales', 'createdBy'],
    });

    if (!planFinal) {
      throw new NotFoundException('Error al recuperar el plan generado');
    }

    return planFinal;
  }

  async obtenerPlanActual(): Promise<PlanConteoAnual | null> {
    const plan = await this.planConteoRepository.findOne({
      where: [
        { estado: EstadoPlanConteo.EN_CURSO },
        { estado: EstadoPlanConteo.PLANIFICADO },
      ],
      relations: ['asignacionesMensuales', 'createdBy'],
      order: { createdAt: 'DESC' },
    });

    if (!plan) {
      return null;
    }

    return await this.actualizarEstadisticas(plan.id);
  }

  async obtenerPlanPorId(planId: number): Promise<PlanConteoAnual> {
    const plan = await this.planConteoRepository.findOne({
      where: { id: planId },
      relations: ['asignacionesMensuales', 'createdBy'],
    });

    if (!plan) {
      throw new NotFoundException(`Plan de conteo con ID ${planId} no encontrado`);
    }

    return plan;
  }

  async obtenerPlanPorAnno(anno: number): Promise<PlanConteoAnual> {
    const plan = await this.planConteoRepository.findOne({
      where: { anno },
      relations: ['asignacionesMensuales', 'createdBy'],
    });

    if (!plan) {
      throw new NotFoundException(`No existe plan de conteo para el anno ${anno}`);
    }

    return plan;
  }

  async listarPlanes(): Promise<PlanConteoAnual[]> {
    return await this.planConteoRepository.find({
      relations: ['createdBy'],
      order: { anno: 'DESC' },
    });
  }

  async iniciarPlan(planId: number): Promise<PlanConteoAnual> {
    const plan = await this.obtenerPlanPorId(planId);

    if (plan.estado !== EstadoPlanConteo.PLANIFICADO) {
      throw new BadRequestException('El plan debe estar en estado PLANIFICADO para iniciarlo');
    }

    plan.estado = EstadoPlanConteo.EN_CURSO;
    
    const primeraAsignacion = await this.asignacionMensualRepository.findOne({
      where: { planConteoId: planId, mes: 1 },
    });

    if (primeraAsignacion) {
      primeraAsignacion.estado = EstadoAsignacionMensual.EN_PROCESO;
      await this.asignacionMensualRepository.save(primeraAsignacion);
    }

    return await this.planConteoRepository.save(plan);
  }

  async completarPlan(planId: number): Promise<PlanConteoAnual> {
    const plan = await this.obtenerPlanPorId(planId);

    if (plan.estado !== EstadoPlanConteo.EN_CURSO) {
      throw new BadRequestException('El plan debe estar EN_CURSO para completarlo');
    }

    const todasCompletadas = plan.asignacionesMensuales.every(
      asig => asig.estado === EstadoAsignacionMensual.COMPLETADO || 
              asig.estado === EstadoAsignacionMensual.CERRADO
    );

    if (!todasCompletadas) {
      throw new BadRequestException('Todas las asignaciones mensuales deben estar completadas');
    }

    plan.estado = EstadoPlanConteo.COMPLETADO;
    return await this.planConteoRepository.save(plan);
  }

  async cancelarPlan(planId: number, motivo?: string): Promise<PlanConteoAnual> {
    const plan = await this.obtenerPlanPorId(planId);

    if (plan.estado === EstadoPlanConteo.COMPLETADO) {
      throw new BadRequestException('No se puede cancelar un plan completado');
    }

    plan.estado = EstadoPlanConteo.CANCELADO;
    if (motivo) {
      plan.observaciones = `${plan.observaciones || ''}\nCANCELADO: ${motivo}`;
    }

    return await this.planConteoRepository.save(plan);
  }

  async actualizarEstadisticas(planId: number): Promise<PlanConteoAnual> {
    const plan = await this.obtenerPlanPorId(planId);

    const totales = plan.asignacionesMensuales.reduce(
      (acc, asig) => ({
        contados: acc.contados + asig.activosContados,
        encontrados: acc.encontrados + asig.activosEncontrados,
        faltantes: acc.faltantes + asig.activosFaltantes,
        discrepancias: acc.discrepancias + asig.activosConDiscrepancias,
      }),
      { contados: 0, encontrados: 0, faltantes: 0, discrepancias: 0 }
    );

    plan.activosContados = totales.contados;
    plan.activosEncontrados = totales.encontrados;
    plan.activosFaltantes = totales.faltantes;
    plan.activosConDiscrepancias = totales.discrepancias;

    return await this.planConteoRepository.save(plan);
  }

  async obtenerProgresoGeneral(planId: number): Promise<ProgresoGeneralOutput> {
    const plan = await this.obtenerPlanPorId(planId);

    const mesesCompletados = plan.asignacionesMensuales.filter(
      a => a.estado === EstadoAsignacionMensual.COMPLETADO || 
           a.estado === EstadoAsignacionMensual.CERRADO
    ).length;

    const mesesPendientes = plan.asignacionesMensuales.filter(
      a => a.estado === EstadoAsignacionMensual.PENDIENTE
    ).length;

    const mesActual = plan.getMesActual();

    const progreso: ProgresoGeneralOutput = {
      planId: plan.id,
      anno: plan.anno,
      estado: plan.estado,
      porcentajeProgreso: plan.porcentajeProgreso,
      totalActivos: plan.totalActivos,
      activosContados: plan.activosContados,
      activosEncontrados: plan.activosEncontrados,
      activosFaltantes: plan.activosFaltantes,
      activosConDiscrepancias: plan.activosConDiscrepancias,
      mesesCompletados,
      mesesPendientes,
      mesActual: mesActual ?? null,
    };

    return progreso;
  }

  async finalizarPlan(planId: number, motivo?: string): Promise<PlanConteoAnual> {
    const plan = await this.obtenerPlanPorId(planId);

    if (plan.estado === EstadoPlanConteo.COMPLETADO) {
      throw new BadRequestException('El plan ya está finalizado');
    }

    const mesesSinConfirmar = plan.asignacionesMensuales.filter(
      a => !a.confirmadoConteo
    );

    if (mesesSinConfirmar.length > 0) {
      throw new BadRequestException(
        `No se puede finalizar. Hay ${mesesSinConfirmar.length} meses sin confirmar: ${
          mesesSinConfirmar.map(m => m.nombreMes).join(', ')
        }`
      );
    }

    plan.estado = EstadoPlanConteo.COMPLETADO;
    
    if (motivo) {
      const fecha = new Date().toLocaleString('es-MX');
      plan.observaciones = `${plan.observaciones || ''}\n[${fecha}] FINALIZADO: ${motivo}`;
    }

    return await this.planConteoRepository.save(plan);
  }

  async contarActivosNuevosSinAsignar(planId: number): Promise<number> {
    const plan = await this.obtenerPlanPorId(planId);
    
    const activosActuales = await this.aftRepository.find({
      where: { activo: true },
      select: ['id'],
    });

    const idsActuales = new Set(activosActuales.map(a => a.id));
    
    const idsAsignados = new Set<number>();
    plan.asignacionesMensuales.forEach(mes => {
      mes.activosAsignados.forEach(id => idsAsignados.add(id));
    });

    let nuevos = 0;
    idsActuales.forEach(id => {
      if (!idsAsignados.has(id)) {
        nuevos++;
      }
    });

    return nuevos;
  }

  async redistribuirNuevosActivos(planId: number): Promise<PlanConteoAnual> {
    const plan = await this.obtenerPlanPorId(planId);

    if (plan.estado === EstadoPlanConteo.COMPLETADO) {
      throw new BadRequestException('No se pueden redistribuir activos en un plan finalizado');
    }

    const activosActuales = await this.aftRepository.find({
      where: { activo: true },
      relations: ['area', 'subclasificacion'],
      order: { rotulo: 'ASC' },
    });

    const idsAsignados = new Set<number>();
    plan.asignacionesMensuales.forEach(mes => {
      mes.activosAsignados.forEach(id => idsAsignados.add(id));
    });

    const activosNuevos = activosActuales.filter(a => !idsAsignados.has(a.id));

    if (activosNuevos.length === 0) {
      throw new BadRequestException('No hay activos nuevos para redistribuir');
    }

    const mesesDisponibles = plan.asignacionesMensuales
      .filter(m => m.estado !== EstadoAsignacionMensual.CERRADO)
      .sort((a, b) => a.mes - b.mes);

    if (mesesDisponibles.length === 0) {
      throw new BadRequestException('No hay meses disponibles para asignar nuevos activos');
    }

    const porMes = Math.ceil(activosNuevos.length / mesesDisponibles.length);

    let index = 0;
    for (const mes of mesesDisponibles) {
      const cantidad = Math.min(porMes, activosNuevos.length - index);
      const nuevosParaEsteMes = activosNuevos.slice(index, index + cantidad);

      mes.activosAsignados.push(...nuevosParaEsteMes.map(a => a.id));
      mes.cantidadAsignada += nuevosParaEsteMes.length;
      mes.criterioAsignacion += ` + ${cantidad} nuevos`;

      await this.asignacionMensualRepository.save(mes);

      index += cantidad;
    }

    plan.totalActivos += activosNuevos.length;
    await this.planConteoRepository.save(plan);

    return await this.obtenerPlanPorId(planId);
  }

  async agregarNuevoAftAlPlan(aftId: number): Promise<void> {
    const plan = await this.planConteoRepository.findOne({
      where: [
        { estado: EstadoPlanConteo.EN_CURSO },
        { estado: EstadoPlanConteo.PLANIFICADO },
      ],
      relations: ['asignacionesMensuales'],
      order: { createdAt: 'DESC' },
    });

    if (!plan) {
      return;
    }

    const mesesDisponibles = plan.asignacionesMensuales
      .filter(m => !m.confirmadoConteo)
      .sort((a, b) => a.cantidadAsignada - b.cantidadAsignada);

    if (mesesDisponibles.length === 0) {
      return;
    }

    const mesConMenosActivos = mesesDisponibles[0];

    if (mesConMenosActivos.activosAsignados.includes(aftId)) {
      return;
    }

    mesConMenosActivos.activosAsignados.push(aftId);
    mesConMenosActivos.cantidadAsignada += 1;
    mesConMenosActivos.criterioAsignacion += ` + 1 nuevo AFT`;

    await this.asignacionMensualRepository.save(mesConMenosActivos);

    plan.totalActivos += 1;
    await this.planConteoRepository.save(plan);
  }

  async obtenerMesesProximosAVencer(diasAntes: number = 7): Promise<any[]> {
    const hoy = new Date();
    const fechaLimite = new Date(hoy.getTime() + diasAntes * 24 * 60 * 60 * 1000);

    const mesesProximos = await this.asignacionMensualRepository
      .createQueryBuilder('asig')
      .where('asig.estado IN (:...estados)', { estados: [EstadoAsignacionMensual.EN_PROCESO, EstadoAsignacionMensual.PENDIENTE] })
      .andWhere('asig.fechaLimite <= :fechaLimite', { fechaLimite })
      .andWhere('asig.fechaLimite >= :hoy', { hoy })
      .getMany();

    return mesesProximos.map(mes => ({
      id: mes.id,
      nombreMes: mes.nombreMes,
      anno: mes.anno,
      diasRestantes: mes.getDiasRestantes(),
      cantidadAsignada: mes.cantidadAsignada,
      activosContados: mes.activosContados,
      porcentajeProgreso: mes.porcentajeProgreso,
    }));
  }

  async exportarPlanAnual(planId: number): Promise<Buffer> {
    const workbook = new Workbook();

    workbook.creator = 'Sistema de Gestión AFT';
    workbook.created = new Date();

    const plan = await this.planConteoRepository.findOne({
      where: { id: planId },
      relations: ['asignacionesMensuales', 'createdBy'],
    });

    if (!plan) {
      throw new Error(`Plan con ID ${planId} no encontrado`);
    }

    const asignaciones = [...plan.asignacionesMensuales].sort((a, b) => a.mes - b.mes);

    const resumen = workbook.addWorksheet('Resumen General');
    
    resumen.columns = [
      { header: 'Concepto', key: 'concepto', width: 35 },
      { header: 'Valor', key: 'valor', width: 25 },
    ];

    resumen.addRows([
      { concepto: 'Plan de Conteo Anual', valor: plan.anno },
      { concepto: 'Estado', valor: plan.estado },
      { concepto: 'Fecha Inicio', valor: new Date(plan.fechaInicio).toLocaleDateString('es-ES') },
      { concepto: 'Fecha Fin', valor: new Date(plan.fechaFin).toLocaleDateString('es-ES') },
      { concepto: '', valor: '' },
      { concepto: 'Total AFT a Contar', valor: plan.totalActivos },
      { concepto: 'AFT por Mes (Meta)', valor: plan.activosPorMes },
      { concepto: '', valor: '' },
      { concepto: 'AFT Contados', valor: plan.activosContados },
      { concepto: 'AFT Encontrados', valor: plan.activosEncontrados },
      { concepto: 'AFT Faltantes', valor: plan.activosFaltantes },
      { concepto: 'Progreso General', valor: `${plan.porcentajeProgreso}%` },
      { concepto: '', valor: '' },
      { concepto: 'Creado por', valor: plan.createdBy.email },
      { concepto: 'Fecha Creación', valor: new Date(plan.createdAt).toLocaleDateString('es-ES') },
    ]);

    resumen.getRow(1).font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
    resumen.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' },
    };
    resumen.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

    for (const asignacion of asignaciones) {
      const worksheet = workbook.addWorksheet(asignacion.nombreMes);

      const activos = await this.aftRepository.find({
        where: { id: In(asignacion.activosAsignados) },
        relations: ['area', 'subclasificacion'],
        order: { rotulo: 'ASC' },
      });

      const registros = await this.registroConteoRepository.find({
        where: { asignacionMensualId: asignacion.id },
      });

      const registrosMap = new Map(registros.map(r => [r.aftId, r]));

      worksheet.columns = [
        { header: 'Rótulo', key: 'rotulo', width: 15 },
        { header: 'Nombre', key: 'nombre', width: 40 },
        { header: 'Área', key: 'area', width: 25 },
        { header: 'Subclasificación', key: 'subclasificacion', width: 30 },
        { header: 'Estado en Inventario', key: 'estadoInventario', width: 18 },
        { header: 'Estado Conteo', key: 'estadoConteo', width: 18 },
      ];

      activos.forEach((aft) => {
        const registro = registrosMap.get(aft.id);
        let estadoConteo = 'Pendiente';

        if (registro) {
          if (registro.estadoEncontrado?.includes('Inactivo')) {
            estadoConteo = 'Desactivado en Conteo';
          } else if (registro.encontrado) {
            estadoConteo = 'Confirmado';
          } else {
            estadoConteo = 'Faltante';
          }
        }

        worksheet.addRow({
          rotulo: aft.rotulo,
          nombre: aft.nombre,
          area: aft.area?.nombre || '-',
          subclasificacion: aft.subclasificacion?.nombre || '-',
          estadoInventario: aft.activo ? 'Activo' : 'Inactivo',
          estadoConteo,
        });
      });

      worksheet.insertRow(1, [
        `Plan de Conteo - ${asignacion.nombreMes} ${asignacion.anno}`,
      ]);
      worksheet.mergeCells(1, 1, 1, 6);

      const titleRow = worksheet.getRow(1);
      titleRow.font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } };
      titleRow.alignment = { horizontal: 'center', vertical: 'middle' };
      titleRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' },
      };
      titleRow.height = 30;

      worksheet.insertRow(2, [
        `Total AFT: ${asignacion.cantidadAsignada} | Contados: ${asignacion.activosContados} | Confirmados: ${asignacion.activosEncontrados} | Faltantes: ${asignacion.activosFaltantes}`,
      ]);
      worksheet.mergeCells(2, 1, 2, 6);
      worksheet.getRow(2).font = { bold: true, size: 11 };
      worksheet.getRow(2).alignment = { horizontal: 'center' };
      worksheet.getRow(2).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE7E6E6' },
      };

      worksheet.insertRow(3, []);

      worksheet.getRow(4).font = { bold: true, size: 11 };
      worksheet.getRow(4).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE7E6E6' },
      };
      worksheet.getRow(4).alignment = { vertical: 'middle', horizontal: 'center' };

      const lastRow = worksheet.rowCount;
      for (let row = 4; row <= lastRow; row++) {
        for (let col = 1; col <= 6; col++) {
          const cell = worksheet.getRow(row).getCell(col);
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          };
        }
      }
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}