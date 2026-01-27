"use client";

import { useQuery } from "@apollo/client/react";
import { Download, UserX } from "lucide-react";
import * as XLSX from 'xlsx';
import { toast } from "sonner";

import { FILTER_TRABAJADORES } from "../graphql/filterTrabajadores";
import { FilterTrabajadoresResponse } from "../types/trabajador";

type Props = {
  selectedIds: number[];
  onDesactivar: () => void;
  desactivando: boolean;
};

export default function TrabajadorBulkActions({
  selectedIds,
  onDesactivar,
  desactivando,
}: Props) {
  const { data } = useQuery<FilterTrabajadoresResponse>(FILTER_TRABAJADORES);

  if (selectedIds.length === 0) return null;

  const handleExport = () => {
    try {

      const selectedTrabajadores = data?.filterTrabajadores.data.filter(t => 
        selectedIds.includes(t.id)
      ) || [];

      if (selectedTrabajadores.length === 0) {
        toast.error('No hay trabajadores seleccionados para exportar');
        return;
      }

      const excelData = selectedTrabajadores.map(t => ({
        Nombre: t.nombre,
        Apellidos: t.apellidos,
        Expediente: t.expediente,
        Telefono: t.telefono || '-',
        Cargo: t.cargo?.nombre || '-',
        Provincia: t.provincia?.nombre || '-',
        Municipio: t.municipio?.nombre || '-',
        Estado: t.activo ? 'Activo' : 'Inactivo'
      }));

      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Trabajadores');

      const colWidths = [
        { wch: 15 }, 
        { wch: 20 },  
        { wch: 15 },  
        { wch: 12 },  
        { wch: 20 },  
        { wch: 20 },  
        { wch: 25 },  
        { wch: 12 }  
      ];
      ws['!cols'] = colWidths;

      const today = new Date().toISOString().split('T')[0];
      const filename = `Trabajadores_Export_${today}.xlsx`;
      XLSX.writeFile(wb, filename);

      toast.success(`✓ ${selectedTrabajadores.length} trabajador(es) exportado(s) correctamente`);
    } catch (error) {
      console.error('Error al exportar:', error);
      toast.error('✗ Error al exportar trabajadores');
    }
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex flex-wrap gap-4 items-center justify-between">

      <span className="text-sm font-semibold text-blue-800">
        {selectedIds.length} trabajador(es) seleccionado(s)
      </span>

      <div className="flex gap-3 items-center flex-wrap">
        <button
          onClick={handleExport}
          className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition flex items-center gap-2"
        >
          <Download size={18} />
          Exportar
        </button>

        <button
          onClick={onDesactivar}
          disabled={desactivando}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition text-sm font-medium ${
            desactivando
              ? "bg-red-300 cursor-not-allowed text-white"
              : "bg-red-600 text-white hover:bg-red-700"
          }`}
        >
          <UserX size={16} />
          {desactivando ? "Desactivando..." : "Desactivar seleccionados"}
        </button>
      </div>
    </div>
  );
}