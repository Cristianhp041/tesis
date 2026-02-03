import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Aft } from '../../aft/entities/aft.entity';
import { Area } from '../../area/entities/area.entity';
import { Subclasificacion } from '../../subclasificacion/entities/subclasificacion.entity';

interface ActivoOrdenado {
  id: number;
  rotulo: string;
  areaId: number;
  areaNombre: string;
  subclasificacionId: number;
  subclasificacionNombre: string;
}

interface BloqueMensual {
  mes: number;
  nombreMes: string;
  porcentaje: number;
  cantidadAsignada: number;
  criterioAsignacion: string;
  activosAsignados: number[];
  detalle: DetalleBloque[];
}

interface DetalleBloque {
  areaId: number;
  areaNombre: string;
  subclasificacionId: number;
  subclasificacionNombre: string;
  cantidad: number;
  activosIds: number[];
}

export interface ResultadoDistribucion {
  totalActivos: number;
  metaPorMes: number;
  toleranciaMin: number;
  toleranciaMax: number;
  bloquesMensuales: BloqueMensual[];
  estadisticas: {
    areasPorMes: Record<number, string[]>;
    distribucionReal: number[];
    promedioDesviacion: number;
  };
}

@Injectable()
export class AlgoritmoDistribucionService {
  
  private readonly MESES_TRABAJO = [
    { numero: 1, nombre: 'Septiembre', mesCalendario: 9 },
    { numero: 2, nombre: 'Octubre', mesCalendario: 10 },
    { numero: 3, nombre: 'Noviembre', mesCalendario: 11 },
    { numero: 4, nombre: 'Diciembre', mesCalendario: 12 },
    { numero: 5, nombre: 'Enero', mesCalendario: 1 },
    { numero: 6, nombre: 'Febrero', mesCalendario: 2 },
    { numero: 7, nombre: 'Marzo', mesCalendario: 3 },
    { numero: 8, nombre: 'Abril', mesCalendario: 4 },
    { numero: 9, nombre: 'Mayo', mesCalendario: 5 },
    { numero: 10, nombre: 'Junio', mesCalendario: 6 },
  ];

  constructor(
    @InjectRepository(Aft)
    private aftRepository: Repository<Aft>,
    
    @InjectRepository(Area)
    private areaRepository: Repository<Area>,
    
    @InjectRepository(Subclasificacion)
    private subclasificacionRepository: Repository<Subclasificacion>,
  ) {}

  async generarDistribucion(año: number): Promise<ResultadoDistribucion> {
    
    const activos = await this.aftRepository.find({
      where: { activo: true },
      relations: ['area', 'subclasificacion'],
      order: { rotulo: 'ASC' }
    });
    
    if (activos.length === 0) {
      throw new Error('No hay activos disponibles para distribuir');
    }
    
    const activosOrdenados: ActivoOrdenado[] = activos.map(a => ({
      id: a.id,
      rotulo: a.rotulo,
      areaId: a.area?.id || 0,
      areaNombre: a.area?.nombre || 'Sin área',
      subclasificacionId: a.subclasificacion?.id || 0,
      subclasificacionNombre: a.subclasificacion?.nombre || 'Sin subclas',
    }));
    
    activosOrdenados.sort((a, b) => {
      if (a.areaNombre > b.areaNombre) return -1;
      if (a.areaNombre < b.areaNombre) return 1;
      
      if (a.subclasificacionNombre < b.subclasificacionNombre) return -1;
      if (a.subclasificacionNombre > b.subclasificacionNombre) return 1;
      
      return 0;
    });
    
    const totalActivos = activosOrdenados.length;
    const metaPorMes = Math.floor(totalActivos / 10);
    const sobrantes = totalActivos % 10;
    
    const toleranciaMin = Math.floor(metaPorMes * 0.85);
    const toleranciaMax = Math.ceil(metaPorMes * 1.15);
    
    const bloquesMensuales: BloqueMensual[] = [];
    
    let indiceActual = 0;
    
    for (let mes = 1; mes <= 10; mes++) {
      const nombreMes = this.MESES_TRABAJO[mes - 1].nombre;
      
      const cantidadParaEsteMes = mes <= sobrantes ? metaPorMes + 1 : metaPorMes;
      
      const fin = indiceActual + cantidadParaEsteMes;
      const activosDelMes = activosOrdenados.slice(indiceActual, fin);
      
      const detalle = this.agruparPorAreaYSubclas(activosDelMes);
      
      const bloqueMensual: BloqueMensual = {
        mes,
        nombreMes,
        porcentaje: 10,
        cantidadAsignada: activosDelMes.length,
        criterioAsignacion: this.generarCriterio(detalle),
        activosAsignados: activosDelMes.map(a => a.id),
        detalle,
      };
      
      bloquesMensuales.push(bloqueMensual);
      
      indiceActual = fin;
    }
    
    this.validarDistribucion(bloquesMensuales, totalActivos);
    
    const estadisticas = this.generarEstadisticas(bloquesMensuales, metaPorMes);
    
    return {
      totalActivos,
      metaPorMes,
      toleranciaMin,
      toleranciaMax,
      bloquesMensuales,
      estadisticas,
    };
  }

  private agruparPorAreaYSubclas(activos: ActivoOrdenado[]): DetalleBloque[] {
    const grupos = new Map<string, DetalleBloque>();
    
    activos.forEach(activo => {
      const key = `${activo.areaId}-${activo.subclasificacionId}`;
      
      if (!grupos.has(key)) {
        grupos.set(key, {
          areaId: activo.areaId,
          areaNombre: activo.areaNombre,
          subclasificacionId: activo.subclasificacionId,
          subclasificacionNombre: activo.subclasificacionNombre,
          cantidad: 0,
          activosIds: [],
        });
      }
      
      const grupo = grupos.get(key)!;
      grupo.cantidad++;
      grupo.activosIds.push(activo.id);
    });
    
    return Array.from(grupos.values());
  }

  private generarCriterio(detalle: DetalleBloque[]): string {
    const top3 = detalle
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 3)
      .map(d => `${d.subclasificacionNombre}/${d.areaNombre}(${d.cantidad})`)
      .join(', ');
    
    const masInfo = detalle.length > 3 ? ` +${detalle.length - 3} más` : '';
    
    return top3 + masInfo;
  }

  private validarDistribucion(meses: BloqueMensual[], totalActivos: number): void {
    if (meses.length !== 10) {
      throw new Error(`Deben ser 10 meses, hay ${meses.length}`);
    }
    
    const idsAsignados: number[] = [];
    meses.forEach(m => idsAsignados.push(...m.activosAsignados));
    
    if (idsAsignados.length !== totalActivos) {
      throw new Error(`Total: ${totalActivos}, Asignados: ${idsAsignados.length}`);
    }
    
    const unicos = new Set(idsAsignados);
    if (idsAsignados.length !== unicos.size) {
      const duplicados = idsAsignados.length - unicos.size;
      throw new Error(`Hay ${duplicados} activos duplicados`);
    }
    
    const vacios = meses.filter(m => m.cantidadAsignada === 0);
    if (vacios.length > 0) {
      throw new Error(`${vacios.length} meses vacíos: ${vacios.map(m => m.nombreMes).join(', ')}`);
    }
  }

  private generarEstadisticas(meses: BloqueMensual[], meta: number): any {
    const areasPorMes: Record<number, string[]> = {};
    const distribucionReal: number[] = [];
    
    meses.forEach(mes => {
      const areasUnicas = new Set(mes.detalle.map(d => d.areaNombre));
      areasPorMes[mes.mes] = Array.from(areasUnicas);
      
      distribucionReal.push(mes.cantidadAsignada);
    });
    
    const desviaciones = distribucionReal.map(d => Math.abs(d - meta));
    const promedioDesviacion = desviaciones.reduce((a, b) => a + b, 0) / desviaciones.length;
    
    return {
      areasPorMes,
      distribucionReal,
      promedioDesviacion: Math.round(promedioDesviacion * 100) / 100,
    };
  }
}