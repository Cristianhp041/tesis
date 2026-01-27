"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { Download } from "lucide-react";
import * as XLSX from 'xlsx';

import { GET_AREAS } from "../graphql/getAreas";
import { GET_AFTS } from "../graphql/getAfts";
import { MOVER_AFTS_MASIVO } from "../graphql/moverAftsMasivo";
import { DESACTIVAR_AFTS_MASIVO } from "../graphql/desactivarAftsMasivo";
import { toast } from "sonner";

type Area = {
  id: number;
  nombre: string;
};

type GetAreasData = {
  areas: Area[];
};

type Aft = {
  id: number;
  rotulo: string;
  nombre: string;
  area?: { nombre: string } | null;
  subclasificacion?: { nombre: string } | null;
  activo: boolean;
};

type GetAftsData = {
  afts: Aft[];
};

type Props = {
  selectedIds: number[];
  clearSelection: () => void;
};

export default function AftBulkActions({
  selectedIds,
  clearSelection,
}: Props) {
  const { data } = useQuery<GetAreasData>(GET_AREAS);
  const { data: aftsData } = useQuery<GetAftsData>(GET_AFTS);

  const [areaId, setAreaId] = useState<number | undefined>();

  const [moverMasivo] = useMutation(MOVER_AFTS_MASIVO, {
    refetchQueries: [{ query: GET_AFTS }],
  });

  const [desactivarMasivo] = useMutation(DESACTIVAR_AFTS_MASIVO, {
    refetchQueries: [{ query: GET_AFTS }],
  });

  if (selectedIds.length === 0) return null;

  const handleExport = () => {
    try {
      const selectedAfts = aftsData?.afts.filter(aft => 
        selectedIds.includes(aft.id)
      ) || [];

      if (selectedAfts.length === 0) {
        toast.error('No hay AFT seleccionados para exportar');
        return;
      }

      const excelData = selectedAfts.map(aft => ({
        Rótulo: aft.rotulo,
        Nombre: aft.nombre,
        Área: aft.area?.nombre || '-',
        Subclasificación: aft.subclasificacion?.nombre || '-',
        Estado: aft.activo ? 'Activo' : 'Inactivo'
      }));

      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'AFT');

      const colWidths = [
        { wch: 15 },  
        { wch: 40 },  
        { wch: 25 },  
        { wch: 30 },  
        { wch: 12 }  
      ];
      ws['!cols'] = colWidths;

      const today = new Date().toISOString().split('T')[0];
      const filename = `AFT_Export_${today}.xlsx`;
      XLSX.writeFile(wb, filename);

      toast.success(`✓ ${selectedAfts.length} AFT exportados correctamente`);
    } catch (error) {
      console.error('Error al exportar:', error);
      toast.error('✗ Error al exportar AFT');
    }
  };

  const handleMover = async () => {
    if (!areaId) {
      toast.error("✗ Debe seleccionar un área");
      return;
    }

    try {
      const result = await moverMasivo({
        variables: {
          data: {
            aftIds: selectedIds,
            nuevaAreaId: areaId,
          },
        },
      });

      if (result.error) {
        let errorMessage = "";
        
        const err = result.error as unknown as Record<string, unknown>;
        
        if (typeof err.message === 'string') {
          errorMessage = err.message;
        }
        
        if (!errorMessage && 'graphQLErrors' in err && Array.isArray(err.graphQLErrors)) {
          const graphQLErrors = err.graphQLErrors as unknown as Array<Record<string, unknown>>;
          if (graphQLErrors.length > 0 && typeof graphQLErrors[0].message === 'string') {
            errorMessage = graphQLErrors[0].message;
          }
        }

        toast.error(errorMessage || "✗ No se pudieron mover los AFT");
        return;
      }

      toast.success(`✓ ${selectedIds.length} AFT movidos correctamente`);
      clearSelection();
      setAreaId(undefined);
    } catch (error) {
      let errorMessage = "";
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      if (!errorMessage && typeof error === 'object' && error !== null && 'graphQLErrors' in error) {
        const err = error as unknown as { graphQLErrors?: Array<{ message?: string }> };
        if (err.graphQLErrors && err.graphQLErrors.length > 0) {
          errorMessage = err.graphQLErrors[0].message || '';
        }
      }
      
      toast.error(errorMessage || "✗ Error al mover AFT");
    }
  };

  const handleDesactivar = async () => {
    try {
      const result = await desactivarMasivo({
        variables: {
          data: { aftIds: selectedIds },
        },
      });

      if (result.error) {
        let errorMessage = "";
        
        const err = result.error as unknown as Record<string, unknown>;
        
        if (typeof err.message === 'string') {
          errorMessage = err.message;
        }
        
        if (!errorMessage && 'graphQLErrors' in err && Array.isArray(err.graphQLErrors)) {
          const graphQLErrors = err.graphQLErrors as unknown as Array<Record<string, unknown>>;
          if (graphQLErrors.length > 0 && typeof graphQLErrors[0].message === 'string') {
            errorMessage = graphQLErrors[0].message;
          }
        }

        toast.error(errorMessage || "✗ No se pudieron desactivar los AFT");
        return;
      }

      toast.success(`✓ ${selectedIds.length} AFT desactivados correctamente`);
      clearSelection();
    } catch (error) {
      let errorMessage = "";
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      if (!errorMessage && typeof error === 'object' && error !== null && 'graphQLErrors' in error) {
        const err = error as unknown as { graphQLErrors?: Array<{ message?: string }> };
        if (err.graphQLErrors && err.graphQLErrors.length > 0) {
          errorMessage = err.graphQLErrors[0].message || '';
        }
      }
      
      toast.error(errorMessage || "✗ Error al desactivar AFT");
    }
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex flex-wrap gap-4 items-center justify-between">
      {/* Info */}
      <span className="text-sm font-semibold text-blue-800">
        {selectedIds.length} AFT seleccionados
      </span>

      {/* Acciones */}
      <div className="flex gap-3 items-center flex-wrap">
        <button
          onClick={handleExport}
          className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition flex items-center gap-2"
        >
          <Download size={18} />
          Exportar
        </button>

        <select
          className="border border-gray-300 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          value={areaId ?? ""}
          onChange={(e) =>
            setAreaId(e.target.value ? Number(e.target.value) : undefined)
          }
        >
          <option value="">Mover a área…</option>
          {data?.areas.map((area) => (
            <option key={area.id} value={area.id}>
              {area.nombre}
            </option>
          ))}
        </select>

        <button
          disabled={!areaId}
          onClick={handleMover}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50"
        >
          Mover
        </button>

        <button
          onClick={handleDesactivar}
          className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition"
        >
          Desactivar
        </button>
      </div>
    </div>
  );
}