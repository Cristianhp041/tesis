"use client";

import { useQuery } from "@apollo/client/react";
import { GET_CARGOS_ACTIVOS } from "../graphql/getCargosActivos"; 
import { GET_PROVINCIAS } from "../graphql/getProvincias";
import { Cargo, Provincia } from "../types/trabajador";

export interface TrabajadorFilterState {
  search: string;
  activo: boolean | undefined;
  cargoId: number | undefined;
  provinciaId: number | undefined;
}

interface Props {
  value: TrabajadorFilterState;
  onChange: (value: Partial<TrabajadorFilterState>) => void;
}

export default function TrabajadorFilters({ value, onChange }: Props) {
  const { data: cargosData, loading: loadingCargos } = useQuery<{
    cargosActivos: Cargo[]; 
  }>(GET_CARGOS_ACTIVOS); 

  const { data: provinciasData, loading: loadingProvincias } = useQuery<{
    provincias: Provincia[];
  }>(GET_PROVINCIAS);

  const clearFilters = () => {
    onChange({
      search: "",
      activo: undefined,
      cargoId: undefined,
      provinciaId: undefined,
    });
  };

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-700">
          Filtros de búsqueda
        </h2>

        <button
          onClick={clearFilters}
          className="text-xs text-gray-500 hover:text-gray-700 underline"
        >
          Limpiar filtros
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-600">Buscar</label>
          <input
            type="text"
            placeholder="Nombre, apellido o expediente"
            value={value.search ?? ""}
            onChange={(e) => onChange({ search: e.target.value })}
            className="border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-600">Cargo</label>
          <select
            className="border rounded-md px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500"
            value={value.cargoId ?? ""}
            onChange={(e) =>
              onChange({
                cargoId: e.target.value ? Number(e.target.value) : undefined,
              })
            }
            disabled={loadingCargos}
          >
            <option value="">
              {loadingCargos ? "Cargando cargos..." : "Todos los cargos"}
            </option>
            {cargosData?.cargosActivos.map((c) => ( 
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-600">Provincia</label>
          <select
            className="border rounded-md px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500"
            value={value.provinciaId ?? ""}
            onChange={(e) =>
              onChange({
                provinciaId: e.target.value
                  ? Number(e.target.value)
                  : undefined,
              })
            }
            disabled={loadingProvincias}
          >
            <option value="">
              {loadingProvincias
                ? "Cargando provincias..."
                : "Todas las provincias"}
            </option>
            {provinciasData?.provincias.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-600">Estado</label>
          <select
            className="border rounded-md px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500"
            value={
              value.activo === undefined
                ? ""
                : value.activo
                ? "activo"
                : "inactivo"
            }
            onChange={(e) => {
              if (e.target.value === "") {
                onChange({ activo: undefined });
              } else {
                onChange({
                  activo: e.target.value === "activo",
                });
              }
            }}
          >
            <option value="">Todos</option>
            <option value="activo">Activos</option>
            <option value="inactivo">Inactivos</option>
          </select>
        </div>
      </div>
    </div>
  );
}