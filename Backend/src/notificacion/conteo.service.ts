import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AsignacionMensual } from '../conteo/entities/asignacion-mensual.entity';
import { PlanConteoAnual, EstadoPlanConteo } from '../conteo/entities/plan-conteo-anual.entity';

@Injectable()
export class ConteoService {
  constructor(
    @InjectRepository(AsignacionMensual)
    private asignacionMensualRepository: Repository<AsignacionMensual>,
    @InjectRepository(PlanConteoAnual)
    private planConteoRepository: Repository<PlanConteoAnual>,
  ) {}

  async obtenerMesesSinConfirmar(): Promise<AsignacionMensual[]> {
    const planActual = await this.planConteoRepository.findOne({
      where: [
        { estado: EstadoPlanConteo.EN_CURSO },
        { estado: EstadoPlanConteo.PLANIFICADO },
      ],
      relations: ['asignacionesMensuales'],
      order: { createdAt: 'DESC' },
    });

    if (!planActual) {
      return [];
    }

    const mesesSinConfirmar = await this.asignacionMensualRepository.find({
      where: {
        planConteoId: planActual.id,
        confirmadoConteo: false,
      },
      order: { mes: 'ASC' },
    });

    return mesesSinConfirmar;
  }

  calcularDiasRestantes(fechaLimite: Date): number {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    const limite = new Date(fechaLimite);
    limite.setHours(0, 0, 0, 0);
    
    const diff = limite.getTime() - hoy.getTime();
    const dias = Math.ceil(diff / (1000 * 60 * 60 * 24));
    
    return dias;
  }
}