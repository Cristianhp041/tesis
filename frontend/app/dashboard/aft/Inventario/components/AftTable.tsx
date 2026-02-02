"use client";

import { Edit, History } from "lucide-react";
import { Aft } from "../types/aft";
import Pagination from "../../../trabajadores/components/Paginacion";

type Props = {
  afts: Aft[];
  selectedIds: number[];
  onToggle: (id: number) => void;
  onToggleAll: () => void;
  onEdit: (aft: Aft) => void;
  onViewHistory: (aft: Aft) => void;
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (items: number) => void;
};

export default function AftTable({
  afts,
  selectedIds,
  onToggle,
  onToggleAll,
  onEdit,
  onViewHistory,
  currentPage,
  itemsPerPage,
  totalItems,
  onPageChange,
  onItemsPerPageChange,
}: Props) {
  if (totalItems === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 text-sm text-gray-500 text-center">
        No se encontraron AFT con los filtros aplicados
      </div>
    );
  }

  const allSelected =
    afts.length > 0 && afts.every((a) => selectedIds.includes(a.id));

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
                Rótulo
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Área
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Subclasificación
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
            {afts.map((aft) => {
              const selected = selectedIds.includes(aft.id);

              return (
                <tr
                  key={aft.id}
                  className={`hover:bg-gray-50 transition ${
                    selected ? "bg-blue-50" : ""
                  }`}
                >
                  <td className="px-4 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => onToggle(aft.id)}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                  </td>

                  <td className="px-4 py-3 font-medium text-gray-900">
                    {aft.rotulo}
                  </td>

                  <td className="px-4 py-3 text-gray-700">
                    {aft.nombre}
                  </td>

                  <td className="px-4 py-3 text-gray-700">
                    {aft.area?.nombre ?? "-"}
                  </td>

                  <td className="px-4 py-3 text-gray-700">
                    {aft.subclasificacion?.nombre ?? "-"}
                  </td>

                  <td className="px-4 py-3 text-center">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        aft.activo
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {aft.activo ? "Activo" : "Inactivo"}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center space-x-4">
                      <button
                        onClick={() => onViewHistory(aft)}
                        className="flex items-center space-x-1 text-purple-600 hover:text-purple-800 font-medium transition"
                      >
                        <History className="w-4 h-4" />
                        <span>Historial</span>
                      </button>

                      <button
                        onClick={() => onEdit(aft)}
                        className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 font-medium transition"
                      >
                        <Edit className="w-4 h-4" />
                        <span>Editar</span>
                      </button>
                    </div>
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