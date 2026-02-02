"use client";

import { Download } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

interface Props {
  planId: number;
  planAnno: number;
}

export default function ExportarPlanAnualButton({ planId, planAnno }: Props) {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await fetch(
        `http://localhost:3001/plan-conteo/exportar-plan-anual/${planId}`,
        {
          method: 'GET',
        }
      );

      if (!response.ok) {
        throw new Error('Error al exportar plan anual');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const filename = `Plan_Conteo_Anual_${planAnno}.xlsx`;
      
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('✓ Plan anual exportado correctamente');
    } catch (error) {
      console.error('Error al exportar:', error);
      toast.error('✗ Error al exportar el plan anual');
    } finally {
      setExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={exporting}
      className={`px-6 py-3 rounded-lg flex items-center gap-2 shadow-lg transition ${
        exporting
          ? "bg-green-300 cursor-not-allowed text-white"
          : "bg-green-600 text-white hover:bg-green-700"
      }`}
    >
      <Download size={20} />
      {exporting ? 'Exportando...' : 'Exportar Plan Anual'}
    </button>
  );
}