"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@apollo/client/react";
import { Edit } from "lucide-react";

import { GET_AREAS } from "../graphql/getAreas";
import { Area } from "../types/area";
import EditarAreaModal from "./EditarAreaModal";
import AreaFilters from "./AreaFilters";

type GetAreasResponse = {
  areas: Area[];
};

export default function AreaTable() {
  const { data, loading } = useQuery<GetAreasResponse>(GET_AREAS);

  const [areaEdit, setAreaEdit] = useState<Area | null>(null);
  const [filters, setFilters] = useState({
    search: "",
    activo: undefined as boolean | undefined,
  });

  const areasFiltradas = useMemo(() => {
    const areas = data?.areas ?? [];

    return areas.filter((area) => {
      if (
        filters.search &&
        !area.nombre.toLowerCase().includes(filters.search.toLowerCase())
      ) {
        return false;
      }

      if (filters.activo !== undefined && area.activo !== filters.activo) {
        return false;
      }

      return true;
    });
  }, [data?.areas, filters]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-4">
        <AreaFilters
          value={filters}
          onChange={(partial) =>
            setFilters((prev) => ({ ...prev, ...partial }))
          }
        />
      </div>

      {areasFiltradas.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-6 text-sm text-gray-500 text-center">
          No se encontraron áreas con los filtros aplicados
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {areasFiltradas.map((area) => (
                  <tr key={area.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {area.nombre}
                    </td>

                    <td className="px-4 py-3 text-center">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          area.activo
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {area.activo ? "Activo" : "Inactivo"}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => setAreaEdit(area)}
                        className="flex items-center justify-center space-x-1 text-blue-600 hover:text-blue-800 font-medium transition mx-auto"
                      >
                        <Edit className="w-4 h-4" />
                        <span>Editar</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {areaEdit && (
        <EditarAreaModal
          open
          area={areaEdit}
          onClose={() => setAreaEdit(null)}
        />
      )}
    </>
  );
}