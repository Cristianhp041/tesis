"use client";

import { X, Upload, FileSpreadsheet, Download, AlertCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ImportResult {
  exitosos: number;
  duplicados: number;
  errores: number;
  mensajes: string[];
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ImportarAftModal({ open, onClose, onSuccess }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [resultado, setResultado] = useState<ImportResult | null>(null);

  if (!open) return null;

  const descargarPlantilla = () => {
  const datos = [
    {
      Rotulo: "MB001",
      Nombre: "Laptop Dell Inspiron 15",
      Area: "Informatica",
      Subclasificacion: "Equipos de Computo",
      Estado: "Activo"
    },
    {
      Rotulo: "MB002",
      Nombre: "Mouse Logitech M185",
      Area: "Informatica",
      Subclasificacion: "Perifericos",
      Estado: "Activo"
    }
  ];

  const headers = Object.keys(datos[0]);
  
  let xml = '<?xml version="1.0"?>\n';
  xml += '<?mso-application progid="Excel.Sheet"?>\n';
  xml += '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"\n';
  xml += ' xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">\n';
  xml += ' <Worksheet ss:Name="AFT">\n';
  xml += '  <Table>\n';
  
  xml += '   <Row>\n';
  headers.forEach(h => {
    xml += `    <Cell><Data ss:Type="String">${h}</Data></Cell>\n`;
  });
  xml += '   </Row>\n';
  
  datos.forEach(row => {
    xml += '   <Row>\n';
    headers.forEach(h => {
      xml += `    <Cell><Data ss:Type="String">${row[h as keyof typeof row]}</Data></Cell>\n`;
    });
    xml += '   </Row>\n';
  });
  
  xml += '  </Table>\n';
  xml += ' </Worksheet>\n';
  xml += '</Workbook>';

  const blob = new Blob([xml], { type: 'application/vnd.ms-excel' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'plantilla_aft.xls';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);

  toast.success('✓ Plantilla descargada');
};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      toast.error('Por favor selecciona un archivo');
      return;
    }

    setUploading(true);
    setResultado(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://localhost:3001/aft/importar', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al importar');
      }

      const result: ImportResult = await response.json();
      setResultado(result);

      if (result.exitosos > 0) {
        toast.success(`✓ ${result.exitosos} AFT importados correctamente`);
        onSuccess();
      }

      if (result.duplicados > 0) {
        toast.warning(`⚠ ${result.duplicados} rótulos duplicados omitidos`);
      }

      if (result.errores > 0) {
        toast.error(`✗ ${result.errores} filas con errores`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      toast.error(`✗ Error: ${errorMessage}`);
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setResultado(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Importar AFT desde archivo Excel
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={uploading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex gap-3">
            <AlertCircle className="text-blue-600 flex-shrink-0" size={20} />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-2">Instrucciones:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>El archivo debe ser Excel (.xlsx o .xls)</li>
                <li>Debe contener las columnas: Rotulo, Nombre, Area, Subclasificacion, Estado</li>
                <li>Los nombres de Área y Subclasificación deben existir en el sistema</li>
                <li>Si un rótulo ya existe, se omitirá</li>
                <li>Estado puede ser: &quot;Activo&quot; o &quot;Inactivo&quot;</li>
              </ul>
            </div>
          </div>
        </div>

        <button
          onClick={descargarPlantilla}
          className="w-full mb-4 px-4 py-3 border-2 border-dashed border-green-300 rounded-lg text-green-700 hover:bg-green-50 transition flex items-center justify-center gap-2"
        >
          <Download size={20} />
          Descargar plantilla de ejemplo (Excel)
        </button>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Archivo Excel
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition">
              <input
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                accept=".xlsx,.xls"
                className="hidden"
                id="file-upload-aft"
                disabled={uploading}
              />
              <label htmlFor="file-upload-aft" className="cursor-pointer">
                {file ? (
                  <div className="text-sm text-gray-600">
                    <FileSpreadsheet className="mx-auto mb-2 text-green-600" size={32} />
                    <p className="font-medium">{file.name}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                ) : (
                  <div>
                    <Upload className="mx-auto mb-2 text-gray-400" size={32} />
                    <p className="text-sm text-gray-600">
                      Click para seleccionar archivo Excel
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Solo archivos .xlsx o .xls (máx. 5MB)
                    </p>
                  </div>
                )}
              </label>
            </div>
          </div>

          {resultado && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-3">Resultado de la importación:</h3>
              <div className="space-y-2">
                {resultado.exitosos > 0 && (
                  <div className="flex items-center gap-2 text-green-700">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    <span className="text-sm">{resultado.exitosos} AFT importados</span>
                  </div>
                )}
                {resultado.duplicados > 0 && (
                  <div className="flex items-center gap-2 text-yellow-700">
                    <div className="w-2 h-2 bg-yellow-600 rounded-full"></div>
                    <span className="text-sm">{resultado.duplicados} rótulos duplicados (omitidos)</span>
                  </div>
                )}
                {resultado.errores > 0 && (
                  <div className="flex items-center gap-2 text-red-700">
                    <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                    <span className="text-sm">{resultado.errores} filas con errores</span>
                  </div>
                )}
              </div>

              {resultado.mensajes.length > 0 && (
                <div className="mt-4 max-h-40 overflow-y-auto">
                  <p className="text-xs font-medium text-gray-600 mb-2">Detalles:</p>
                  <ul className="space-y-1">
                    {resultado.mensajes.map((msg, i) => (
                      <li key={i} className="text-xs text-gray-600">• {msg}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition"
              disabled={uploading}
            >
              {resultado ? 'Cerrar' : 'Cancelar'}
            </button>

            {!resultado && (
              <button
                type="submit"
                disabled={!file || uploading}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                  !file || uploading
                    ? "bg-green-300 cursor-not-allowed text-white"
                    : "bg-green-600 hover:bg-green-700 text-white"
                }`}
              >
                {uploading ? 'Importando...' : 'Importar AFT'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}