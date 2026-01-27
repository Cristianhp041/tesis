"use client";

import { Edit } from "lucide-react";
import { Trabajador } from "../types/trabajador";
import Pagination from "./Paginacion";

type Props = {
  trabajadores: Trabajador[];
  selectedIds: number[];
  onToggle: (id: number) => void;
  onToggleAll: () => void;
  onEdit: (t: Trabajador) => void;
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (items: number) => void;
};

export default function TrabajadorTable({
  trabajadores,
  selectedIds,
  onToggle,
  onToggleAll,
  onEdit,
  currentPage,
  itemsPerPage,
  totalItems,
  onPageChange,
  onItemsPerPageChange,
}: Props) {
  if (totalItems === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 text-sm text-gray-500 text-center">
        No se encontraron trabajadores con los filtros aplicados
      </div>
    );
  }

  const allSelected =
    trabajadores.length > 0 && trabajadores.every((t) => selectedIds.includes(t.id));

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-center">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={onToggleAll}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Expediente
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Teléfono
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Cargo
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Provincia
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Municipio
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
            {trabajadores.map((t) => {
              const selected = selectedIds.includes(t.id);

              return (
                <tr
                  key={t.id}
                  className={`hover:bg-gray-50 transition ${
                    selected ? "bg-blue-50" : ""
                  }`}
                >
                  <td className="px-4 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => onToggle(t.id)}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                  </td>

                  <td className="px-4 py-3 font-medium text-gray-900">
                    {t.nombre} {t.apellidos}
                  </td>

                  <td className="px-4 py-3 text-gray-700">
                    {t.expediente ?? "-"}
                  </td>

                  <td className="px-4 py-3 text-gray-700">
                    {t.telefono ?? "-"}
                  </td>

                  <td className="px-4 py-3 text-gray-700">
                    {t.cargo?.nombre ?? "-"}
                  </td>

                  <td className="px-4 py-3 text-gray-700">
                    {t.provincia?.nombre ?? "-"}
                  </td>

                  <td className="px-4 py-3 text-gray-700">
                    {t.municipio?.nombre ?? "-"}
                  </td>

                  <td className="px-4 py-3 text-center">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        t.activo
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {t.activo ? "Activo" : "Inactivo"}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => onEdit(t)}
                      className="flex items-center justify-center space-x-1 text-blue-600 hover:text-blue-800 font-medium transition mx-auto"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Editar</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={onPageChange}
        onItemsPerPageChange={onItemsPerPageChange}
      />
    </div>
  );
}