export interface ActivoDelMes {
  id: string;
  codigo: string;          
  descripcion: string;    
  ubicacion?: string;
  estado?: string;
  areaNombre: string;       
  subclasificacionNombre?: string; 
  yaContado: boolean;
  activo?: boolean;
    confirmadoConteo: boolean;
}

export enum EstadoPlanConteo {
  PLANIFICADO = 'planificado',
  EN_CURSO = 'en_curso',
  COMPLETADO = 'completado',
  CANCELADO = 'cancelado',
}

export enum EstadoAsignacionMensual {
  PENDIENTE = 'pendiente',
  EN_PROCESO = 'en_proceso',
  COMPLETADO = 'completado',
  CERRADO = 'cerrado',
}

export enum EstadoRegistroConteo {
  PENDIENTE = 'pendiente',
  CONTADO = 'contado',
  REVISADO = 'revisado',
  APROBADO = 'aprobado',
}

export enum TipoDiscrepancia {
  NINGUNA = 'ninguna',
  AREA = 'area',
  FALTANTE = 'faltante',
  OTRO = 'otro',
}

export interface PlanConteoAnual {
  id: number;
  anno: number;
  fechaInicio: string;
  fechaFin: string;
  estado: EstadoPlanConteo;
  totalActivos: number;
  activosPorMes: number;
  toleranciaMin: number;
  toleranciaMax: number;
  activosContados: number;
  activosEncontrados: number;
  activosFaltantes: number;
  activosConDiscrepancias: number;
  porcentajeProgreso: number;
  asignacionesMensuales: AsignacionMensual[];
}

export interface AsignacionMensual {
  id: number;
  mes: number;
  nombreMes: string;
  anno: number;
  estado: EstadoAsignacionMensual;
  porcentajeAsignado: number;
  cantidadAsignada: number;
  criterioAsignacion: string;
  activosAsignados: number[];
  fechaInicio: string;
  fechaLimite: string;
  activosContados: number;
  activosEncontrados: number;
  activosFaltantes: number;
  activosConDiscrepancias: number;
  porcentajeProgreso: number;

  confirmadoConteo: boolean;
  confirmadoPorId?: number;
  fechaConfirmacion?: string;
  confirmadoPor?: {
    id: number;
    email: string;
  };
  estaTodoContado: boolean;
}

export interface RegistroConteo {
  id: number;
  encontrado: boolean;
  ubicacionEncontrada?: string;
  estadoEncontrado?: string;
  areaEncontrada?: string;
  tieneDiscrepancia: boolean;
  tipoDiscrepancia: TipoDiscrepancia;
  descripcionDiscrepancia?: string;
  comentarios?: string;
  fotografia?: string;
  fechaConteo: string;
  estado: EstadoRegistroConteo;
  aft: {
    id: number;
    rotulo: string;
    nombre: string;
    area?: { nombre: string };
    subclasificacion?: { nombre: string };
  };
  contadoPor: {
    email: string;
  };
}