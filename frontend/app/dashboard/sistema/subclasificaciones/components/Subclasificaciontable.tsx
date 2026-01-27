"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@apollo/client/react";
import { Edit } from "lucide-react";

import { GET_SUBCLASIFICACIONES } from "../graphql/getSubclasificaciones";
import { Subclasificacion } from "../types/subclasificacion";
import SubclasificacionFilters from "./SubclasificacionFilters";
import EditarSubclasificacionModal from "./EditarSubclasificacionModal";

export default function SubclasificacionTable() {
  const { data, loading } = useQuery<{
    subclasificaciones: Subclasificacion[];
  }>(GET_SUBCLASIFICACIONES);

  const [editSub, setEditSub] = useState<Subclasificacion | null>(null);
  const [filters, setFilters] = useState({
    search: "",
    activo: undefined as boolean | undefined,
  });

  const subclasificacionesFiltradas = useMemo(() => {
    const subs = data?.subclasificaciones ?? [];

    return subs.filter((sub) => {
      if (
        filters.search &&
        !sub.nombre.toLowerCase().includes(filters.search.toLowerCase())
      ) {
        return false;
      }

      if (filters.activo !== undefined && sub.activo !== filters.activo) {
        return false;
      }

      return true;
    });
  }, [data?.subclasificaciones, filters]);

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
        <SubclasificacionFilters
          value={filters}
          onChange={(partial) =>
            setFilters((prev) => ({ ...prev, ...partial }))
          }
        />
      </div>

      {subclasificacionesFiltradas.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-6 text-sm text-gray-500 text-center">
          No se encontraron subclasificaciones con los filtros aplicados
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
                {subclasificacionesFiltradas.map((sub) => (
                  <tr key={sub.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {sub.nombre}
                    </td>

                    <td className="px-4 py-3 text-center">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          sub.activo
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {sub.activo ? "Activo" : "Inactivo"}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => setEditSub(sub)}
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

      {editSub && (
        <EditarSubclasificacionModal
          open
          sub={editSub}
          onClose={() => setEditSub(null)}
        />
      )}
    </>
  );
}