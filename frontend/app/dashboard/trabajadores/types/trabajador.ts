

export interface Cargo {
  id: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
}

export interface Provincia {
  id: number;
  nombre: string;
}

export interface Municipio {
  id: number;
  nombre: string;
  provincia?: Provincia;
}

export interface Trabajador {
  id: number;
  nombre: string;
  apellidos: string;
  expediente: string;
  telefono: string | null; 
  activo: boolean;
  cargo?: Cargo;
  provincia?: Provincia;
  municipio?: Municipio;
}

export interface FilterTrabajadoresResponse {
  filterTrabajadores: {
    total: number;
    data: Trabajador[];
  };
}

export interface ProvinciasResponse {
  provincias: Provincia[];
}

export interface CargosResponse {
  cargos: Cargo[];
}

export interface CargosActivosResponse {
  cargosActivos: Cargo[];
}