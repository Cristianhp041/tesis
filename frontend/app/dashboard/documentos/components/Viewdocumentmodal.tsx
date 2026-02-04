"use client";

import { X } from "lucide-react";
import { useEffect, useMemo } from "react";
import { Document } from "../types/document.types";

interface ViewDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: Document | null;
}

export default function ViewDocumentModal({ 
  isOpen, 
  onClose, 
  document 
}: ViewDocumentModalProps) {
  const documentInfo = useMemo(() => {
    if (!document) return { isPDF: false, isImage: false, isText: false, url: '' };

    const isPDF = document.extension === '.pdf';
    const isImage = ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(document.extension);
    const isText = document.esTextoWeb;
    
    let url = '';
    if (document.url.startsWith('http')) {
      url = document.url;
    } else {
      const filename = document.url.split(/[/\\]/).pop() || '';
      url = `http://localhost:3001/uploads/documents/${filename}`;
    }

    return { isPDF, isImage, isText, url };
  }, [document]);

  useEffect(() => {
    if (isOpen && document && (documentInfo.isPDF || documentInfo.isImage)) {
      window.open(documentInfo.url, '_blank');
      setTimeout(() => {
        onClose();
      }, 100);
    }
  }, [isOpen, document, documentInfo.isPDF, documentInfo.isImage, documentInfo.url, onClose]);

  if (!isOpen || !document) return null;
  if (documentInfo.isPDF || documentInfo.isImage) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">
            {document.nombre}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-4">
          {documentInfo.isText && (
            <div className="prose max-w-none">
              <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700 bg-gray-50 p-6 rounded-lg">
                {document.contenido}
              </pre>
            </div>
          )}

          {!documentInfo.isText && (
            <div className="text-center py-12">
              <p className="text-gray-600">
                No se puede previsualizar este tipo de archivo.
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Descarga el archivo para verlo.
              </p>
            </div>
          )}
        </div>

        <div className="p-4 border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}