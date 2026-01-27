import { FileText, Download, Trash2 } from "lucide-react";
import { Document } from "../types/document.types";
import { formatFileSize, formatDate } from "../utils/formatters";

interface DocumentCardProps {
  document: Document;
  onDownload: (doc: Document) => void;
  onDelete: (id: string) => void;
}

export default function DocumentCard({ 
  document, 
  onDownload, 
  onDelete,
}: DocumentCardProps) {
  return (
    <div className="p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4 flex-1">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <FileText className="text-blue-600" size={24} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-2 mb-1">
              <h3 className="font-semibold text-gray-900">
                {document.nombre}
              </h3>
              {document.evento && (
                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full whitespace-nowrap">
                  {document.evento}
                </span>
              )}
            </div>
            
            <div className="flex flex-wrap gap-4 text-xs text-gray-500">
              <span>{document.nombreOriginal}</span>
              <span>•</span>
              <span>{formatFileSize(document.tamano)}</span>
              <span>•</span>
              <span>Subido: {formatDate(document.fechaSubida)}</span>
              <span>•</span>
              <span>Por: {document.subidoPor}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2 ml-4">
          <button
            onClick={() => onDownload(document)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
            title="Descargar"
          >
            <Download size={18} />
          </button>
          <button
            onClick={() => onDelete(document.id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
            title="Eliminar"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}