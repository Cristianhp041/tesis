export interface PlanConteoAnual {
  id: number;
  anno: number;
  fechaInicio: string;
  fechaFin: string;
  estado: string;
  totalActivos: number;
  activosPorMes: number;
  toleranciaMin: number;
  toleranciaMax: number;
  activosContados: number;
  activosEncontrados: number;
  activosFaltantes: number;
  activosConDiscrepancias: number;
  porcentajeProgreso: number;
  observaciones?: string;
  createdAt: string;
  createdBy: {
    id: number;
    email: string;
  };
  asignacionesMensuales: AsignacionMensual[];
}

export interface AsignacionMensual {
  id: number;
  mes: number;
  nombreMes: string;
  mesCalendario: number;
  anno: number;
  estado: string;
  porcentajeAsignado: number;
  cantidadAsignada: number;
  criterioAsignacion: string;
  fechaInicio: string;
  fechaLimite: string;
  activosContados: number;
  activosEncontrados: number;
  activosFaltantes: number;
  activosConDiscrepancias: number;
  porcentajeProgreso: number;
  tasaEncontrados: number;
  confirmadoConteo: boolean;
  confirmadoPorId?: number;
  fechaConfirmacion?: string;
  estaTodoContado: boolean;
  confirmadoPor?: {
    id: number;
    email: string;
  };
}

export interface ActivoDelMes {
  id: string;
  codigo: string;
  descripcion: string;
  ubicacion?: string;
  estado?: string;
  areaNombre: string;
  subclasificacionNombre?: string;
  yaContado: boolean;
  activo: boolean;
}

export interface RegistroConteo {
  id: number;
  encontrado: boolean;
  ubicacionEncontrada?: string;
  estadoEncontrado?: string;
  areaEncontrada?: string;
  tieneDiscrepancia: boolean;
  tipoDiscrepancia: string;
  descripcionDiscrepancia?: string;
  comentarios?: string;
  fechaConteo: string;
  estado: string;
  aft: {
    id: string;
    rotulo: string;
    nombre: string;
    area?: {
      nombre: string;
    };
    subclasificacion?: {
      nombre: string;
    };
  };
  contadoPor: {
    email: string;
  };
}