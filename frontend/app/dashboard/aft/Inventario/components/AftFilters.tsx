"use client";

import { useQuery } from "@apollo/client/react";
import { GET_AREAS_ACTIVAS } from "../graphql/getAreasActivas";
import { GET_SUBCLASIFICACIONES_ACTIVAS } from "../graphql/getSubclasificacionesActivas";
import { AftFilterState } from "../types/aftFilters";

type Area = {
  id: number;
  nombre: string;
};

type Subclasificacion = {
  id: number;
  nombre: string;
};

type Props = {
  search?: string;
  areaId?: number;
  subclasificacionId?: number;
  activo?: boolean;
  onChange: (filters: AftFilterState) => void;
};

export default function AftFilters({
  search,
  areaId,
  subclasificacionId,
  activo,
  onChange,
}: Props) {
  const { data: areasData, loading: loadingAreas } =
    useQuery<{ areasActivas: Area[] }>(GET_AREAS_ACTIVAS);

  const { data: subData, loading: loadingSub } =
    useQuery<{ subclasificacionesActivas: Subclasificacion[] }>(
      GET_SUBCLASIFICACIONES_ACTIVAS
    );

  const clearFilters = () => {
    onChange({
      search: "",
      areaId: undefined,
      subclasificacionId: undefined,
      activo: undefined,
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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-600">Buscar</label>
          <input
            type="text"
            placeholder="Rótulo o nombre"
            value={search ?? ""}
            onChange={(e) =>
              onChange({ search: e.target.value })
            }
            className="border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-600">Área</label>
          <select
            className="border rounded-md px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500"
            value={areaId ?? ""}
            onChange={(e) =>
              onChange({
                areaId: e.target.value
                  ? Number(e.target.value)
                  : undefined,
              })
            }
            disabled={loadingAreas}
          >
            <option value="">
              {loadingAreas
                ? "Cargando áreas..."
                : "Todas las áreas"}
            </option>
            {areasData?.areasActivas?.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-600">
            Subclasificación
          </label>
          <select
            className="border rounded-md px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500"
            value={subclasificacionId ?? ""}
            onChange={(e) =>
              onChange({
                subclasificacionId: e.target.value
                  ? Number(e.target.value)
                  : undefined,
              })
            }
            disabled={loadingSub}
          >
            <option value="">
              {loadingSub
                ? "Cargando subclasificaciones..."
                : "Todas las subclasificaciones"}
            </option>
            {subData?.subclasificacionesActivas?.map(
              (s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre}
                </option>
              )
            )}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-600">Estado</label>
          <select
            className="border rounded-md px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500"
            value={
              activo === undefined
                ? ""
                : activo
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
