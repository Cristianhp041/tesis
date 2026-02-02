import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RegistroConteo, TipoDiscrepancia, EstadoRegistroConteo } from '../entities/registro-conteo.entity';
import { AsignacionMensual, EstadoAsignacionMensual } from '../entities/asignacion-mensual.entity';
import { Aft } from '../../aft/entities/aft.entity';
import { 
  RegistrarConteoInput, 
  ActualizarRegistroConteoInput, 
  RevisarRegistroInput,
  AplicarCorreccionInput 
} from '../dto/registrarconteo.input';
import { AsignacionMensualService } from './asignacion-mensual.service';
import { PlanConteoService } from './plan-conteo.service';

@Injectable()
export class RegistroConteoService {
  
  constructor(
    @InjectRepository(RegistroConteo)
    private registroConteoRepository: Repository<RegistroConteo>,
    
    @InjectRepository(AsignacionMensual)
    private asignacionMensualRepository: Repository<AsignacionMensual>,
    
    @InjectRepository(Aft)
    private aftRepository: Repository<Aft>,
    
    private asignacionMensualService: AsignacionMensualService,
    private planConteoService: PlanConteoService, 
  ) {}

  async registrarConteo(input: RegistrarConteoInput, userId: number): Promise<RegistroConteo> {
    
    const asignacion = await this.asignacionMensualRepository.findOne({
      where: { id: input.asignacionMensualId },
    });

    if (!asignacion) {
      throw new NotFoundException('Asignación mensual no encontrada');
    }

    if (asignacion.estado === EstadoAsignacionMensual.CERRADO) {
      throw new BadRequestException('No se pueden registrar conteos en un mes cerrado');
    }

    if (!asignacion.activosAsignados.includes(input.aftId)) {
      throw new BadRequestException('Este activo no está asignado a este mes');
    }

    const registroExistente = await this.registroConteoRepository.findOne({
      where: {
        asignacionMensualId: input.asignacionMensualId,
        aftId: input.aftId,
      },
    });

    if (registroExistente) {
      throw new BadRequestException('Este activo ya fue contado en este mes');
    }

    const aft = await this.aftRepository.findOne({
      where: { id: input.aftId },
      relations: ['area', 'subclasificacion'],
    });

    if (!aft) {
      throw new NotFoundException('Activo AFT no encontrado');
    }

    const { tieneDiscrepancia, tipoDiscrepancia, descripcion } = this.detectarDiscrepancias(
      aft,
      input.encontrado,
      input.ubicacionEncontrada,
      input.estadoEncontrado,
      input.areaEncontrada
    );

    const registro = this.registroConteoRepository.create({
      asignacionMensualId: input.asignacionMensualId,
      aftId: input.aftId,
      encontrado: input.encontrado,
      ubicacionEncontrada: input.ubicacionEncontrada ?? null,
      estadoEncontrado: input.estadoEncontrado ?? null,
      areaEncontrada: input.areaEncontrada ?? null,
      tieneDiscrepancia,
      tipoDiscrepancia,
      descripcionDiscrepancia: descripcion ?? null,
      comentarios: input.comentarios ?? null,
      fechaConteo: new Date(),
      contadoPorId: userId,
      estado: EstadoRegistroConteo.CONTADO,
    });

    const registroGuardado = await this.registroConteoRepository.save(registro);

    await this.asignacionMensualService.actualizarProgreso(input.asignacionMensualId);
    
    await this.planConteoService.actualizarEstadisticas(asignacion.planConteoId);

    const registroFinal = await this.registroConteoRepository.findOne({
      where: { id: registroGuardado.id },
      relations: ['aft', 'aft.area', 'aft.subclasificacion', 'contadoPor', 'asignacionMensual'],
    });

    if (!registroFinal) {
      throw new NotFoundException('Error al recuperar el registro creado');
    }

    return registroFinal;
  }

  async actualizarRegistro(input: ActualizarRegistroConteoInput, userId: number): Promise<RegistroConteo> {
    
    const registro = await this.registroConteoRepository.findOne({
      where: { id: input.registroId },
      relations: ['aft', 'aft.area', 'asignacionMensual'],
    });

    if (!registro) {
      throw new NotFoundException('Registro de conteo no encontrado');
    }

    if (registro.asignacionMensual.estado === EstadoAsignacionMensual.CERRADO) {
      throw new BadRequestException('No se pueden modificar registros de un mes cerrado');
    }

    if (registro.contadoPorId !== userId) {
      throw new BadRequestException('Solo puedes editar tus propios registros');
    }

    if (input.encontrado !== undefined) {
      registro.encontrado = input.encontrado;
    }

    if (input.ubicacionEncontrada !== undefined) {
      registro.ubicacionEncontrada = input.ubicacionEncontrada ?? null;
    }

    if (input.estadoEncontrado !== undefined) {
      registro.estadoEncontrado = input.estadoEncontrado ?? null;
    }

    if (input.areaEncontrada !== undefined) {
      registro.areaEncontrada = input.areaEncontrada ?? null;
    }

    if (input.comentarios !== undefined) {
      registro.comentarios = input.comentarios ?? null;
    }

    const { tieneDiscrepancia, tipoDiscrepancia, descripcion } = this.detectarDiscrepancias(
      registro.aft,
      registro.encontrado,
      registro.ubicacionEncontrada,
      registro.estadoEncontrado,
      registro.areaEncontrada
    );

    registro.tieneDiscrepancia = tieneDiscrepancia;
    registro.tipoDiscrepancia = tipoDiscrepancia;
    registro.descripcionDiscrepancia = descripcion ?? null;

    const registroActualizado = await this.registroConteoRepository.save(registro);

    await this.asignacionMensualService.actualizarProgreso(registro.asignacionMensualId);
    
    await this.planConteoService.actualizarEstadisticas(registro.asignacionMensual.planConteoId);

    const registroFinal = await this.registroConteoRepository.findOne({
      where: { id: registroActualizado.id },
      relations: ['aft', 'aft.area', 'aft.subclasificacion', 'contadoPor', 'revisadoPor'],
    });

    if (!registroFinal) {
      throw new NotFoundException('Error al recuperar el registro actualizado');
    }

    return registroFinal;
  }

  async revisarRegistro(input: RevisarRegistroInput, userId: number): Promise<RegistroConteo> {
    
    const registro = await this.registroConteoRepository.findOne({
      where: { id: input.registroId },
      relations: ['aft'],
    });

    if (!registro) {
      throw new NotFoundException('Registro de conteo no encontrado');
    }

    registro.estado = input.aprobado 
      ? EstadoRegistroConteo.APROBADO 
      : EstadoRegistroConteo.REVISADO;
    registro.fechaRevision = new Date();
    registro.comentariosRevision = input.comentariosRevision ?? null;
    registro.revisionAprobada = input.aprobado;
    registro.revisadoPorId = userId;

    return await this.registroConteoRepository.save(registro);
  }

  async aplicarCorreccion(input: AplicarCorreccionInput, userId: number): Promise<RegistroConteo> {
    
    const registro = await this.registroConteoRepository.findOne({
      where: { id: input.registroId },
      relations: ['aft', 'aft.area'],
    });

    if (!registro) {
      throw new NotFoundException('Registro de conteo no encontrado');
    }

    if (!registro.tieneDiscrepancia) {
      throw new BadRequestException('Este registro no tiene discrepancias para corregir');
    }

    const valoresAnteriores: Record<string, any> = {};
    const valoresNuevos: Record<string, any> = {};

    for (const campo of input.camposCorregidos) {
      if (campo === 'area' && registro.areaEncontrada) {
        valoresAnteriores.area = registro.aft.area?.nombre;
        valoresNuevos.area = registro.areaEncontrada;
      }
    }

    registro.correccionAplicada = true;
    registro.fechaCorreccion = new Date();
    registro.corregidoPorId = userId;
    registro.detallesCorreccion = {
      camposCorregidos: input.camposCorregidos,
      valoresAnteriores,
      valoresNuevos,
    };

    return await this.registroConteoRepository.save(registro);
  }

  async obtenerPorId(registroId: number): Promise<RegistroConteo> {
    const registro = await this.registroConteoRepository.findOne({
      where: { id: registroId },
      relations: ['aft', 'aft.area', 'aft.subclasificacion', 'contadoPor', 'revisadoPor', 'corregidoPor'],
    });

    if (!registro) {
      throw new NotFoundException('Registro de conteo no encontrado');
    }

    return registro;
  }

  async listarRegistrosPorMes(asignacionMensualId: number): Promise<RegistroConteo[]> {
    return await this.registroConteoRepository.find({
      where: { asignacionMensualId },
      relations: ['aft', 'aft.area', 'aft.subclasificacion', 'contadoPor'],
      order: { fechaConteo: 'DESC' },
    });
  }

  async listarDiscrepancias(asignacionMensualId: number): Promise<RegistroConteo[]> {
    return await this.registroConteoRepository.find({
      where: { 
        asignacionMensualId,
        tieneDiscrepancia: true,
      },
      relations: ['aft', 'aft.area', 'aft.subclasificacion', 'contadoPor'],
      order: { fechaConteo: 'DESC' },
    });
  }

  async listarFaltantes(asignacionMensualId: number): Promise<RegistroConteo[]> {
    return await this.registroConteoRepository.find({
      where: { 
        asignacionMensualId,
        encontrado: false,
      },
      relations: ['aft', 'aft.area', 'aft.subclasificacion', 'contadoPor'],
      order: { fechaConteo: 'DESC' },
    });
  }

  async eliminarRegistro(registroId: number, userId: number): Promise<void> {
    const registro = await this.registroConteoRepository.findOne({
      where: { id: registroId },
      relations: ['asignacionMensual'],
    });

    if (!registro) {
      throw new NotFoundException('Registro de conteo no encontrado');
    }

    if (registro.asignacionMensual.estado === EstadoAsignacionMensual.CERRADO) {
      throw new BadRequestException('No se pueden eliminar registros de un mes cerrado');
    }

    if (registro.contadoPorId !== userId) {
      throw new BadRequestException('Solo puedes eliminar tus propios registros');
    }

    const asignacionId = registro.asignacionMensualId;
    const planId = registro.asignacionMensual.planConteoId;

    await this.registroConteoRepository.remove(registro);

    await this.asignacionMensualService.actualizarProgreso(asignacionId);
    await this.planConteoService.actualizarEstadisticas(planId);
  }

  private detectarDiscrepancias(
    aft: Aft,
    encontrado: boolean,
    ubicacionEncontrada?: string | null,
    estadoEncontrado?: string | null,
    areaEncontrada?: string | null
  ): { tieneDiscrepancia: boolean; tipoDiscrepancia: TipoDiscrepancia; descripcion?: string } {
    
    if (!encontrado) {
      return {
        tieneDiscrepancia: true,
        tipoDiscrepancia: TipoDiscrepancia.FALTANTE,
        descripcion: 'Activo no encontrado durante el conteo',
      };
    }

    const discrepancias: string[] = [];

    if (areaEncontrada && aft.area && areaEncontrada.trim() !== aft.area.nombre.trim()) {
      discrepancias.push(`Área esperada: "${aft.area.nombre}", encontrada: "${areaEncontrada}"`);
    }

    if (discrepancias.length === 0) {
      return {
        tieneDiscrepancia: false,
        tipoDiscrepancia: TipoDiscrepancia.NINGUNA,
      };
    }

    return {
      tieneDiscrepancia: true,
      tipoDiscrepancia: TipoDiscrepancia.AREA,
      descripcion: discrepancias.join('; '),
    };
  }

  async obtenerEstadisticasPorUsuario(asignacionMensualId: number): Promise<any[]> {
    const registros = await this.registroConteoRepository.find({
      where: { asignacionMensualId },
      relations: ['contadoPor'],
    });

    const usuariosMap = new Map<number, any>();

    registros.forEach(registro => {
      const userId = registro.contadoPorId;
      
      if (!usuariosMap.has(userId)) {
        usuariosMap.set(userId, {
          usuarioId: userId,
          usuarioEmail: registro.contadoPor.email,
          totalContados: 0,
          totalEncontrados: 0,
          totalFaltantes: 0,
          totalConDiscrepancias: 0,
          ultimoConteo: registro.fechaConteo,
        });
      }

      const stats = usuariosMap.get(userId);
      stats.totalContados++;
      if (registro.encontrado) stats.totalEncontrados++;
      if (!registro.encontrado) stats.totalFaltantes++;
      if (registro.tieneDiscrepancia) stats.totalConDiscrepancias++;
      
      if (registro.fechaConteo > stats.ultimoConteo) {
        stats.ultimoConteo = registro.fechaConteo;
      }
    });

    return Array.from(usuariosMap.values()).map(stats => ({
      ...stats,
      tasaEncontrados: stats.totalContados > 0
        ? Math.round((stats.totalEncontrados / stats.totalContados) * 100)
        : 0,
    }));
  }
}