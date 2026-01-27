"use client";

import { useState } from "react";
import { useQuery } from "@apollo/client/react";
import { Edit } from "lucide-react";

import { GET_PROVINCIAS } from "../graphql/getProvincias";
import EditarProvinciaModal from "./EditarProvinciaModal";

type Provincia = {
  id: number;
  nombre: string;
};

export default function ProvinciaTable() {
  const { data, loading } = useQuery<{ provincias: Provincia[] }>(
    GET_PROVINCIAS
  );

  const [editProvincia, setEditProvincia] = useState<Provincia | null>(null);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const provincias = data?.provincias ?? [];

  if (provincias.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 text-sm text-gray-500 text-center">
        No hay provincias registradas
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Provincia
                </th>
                <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {provincias.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {p.nombre}
                  </td>

                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => setEditProvincia(p)}
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

      {editProvincia && (
        <EditarProvinciaModal
          open
          provincia={editProvincia}
          onClose={() => setEditProvincia(null)}
        />
      )}
    </>
  );
}