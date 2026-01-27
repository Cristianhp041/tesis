export type Area = {
  id: number;
  nombre: string;
};

export type Subclasificacion = {
  id: number;
  nombre: string;
};

export type Aft = {
  id: number;
  rotulo: string;
  nombre: string;
  activo: boolean;
  area?: Area | null;
  subclasificacion?: Subclasificacion | null;
};
