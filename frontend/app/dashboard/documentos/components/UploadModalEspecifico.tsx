"use client";

import { X, Upload, FileText } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@apollo/client/react";
import { DocumentFormData } from "../types/document.types";
import { formatFileSize } from "../utils/formatters";
import { GET_ME, GetMeResponse } from "../graphql/getMe";

interface UploadModalEspecificoProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File, formData: DocumentFormData) => Promise<void>;
}

export default function UploadModalEspecifico({ 
  isOpen, 
  onClose, 
  onUpload 
}: UploadModalEspecificoProps) {
  const { data: userData } = useQuery<GetMeResponse>(GET_ME);
  
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<DocumentFormData>({
    nombre: "",
    evento: "",
    descripcion: "",
    subidoPor: "",
  });
  const [uploading, setUploading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      alert('Por favor selecciona un archivo');
      return;
    }

    setUploading(true);
    try {
      const uploadData = {
        ...formData,
        subidoPor: userData?.me?.email || "Usuario desconocido"
      };
      
      await onUpload(file, uploadData);
      setFile(null);
      setFormData({
        nombre: "",
        evento: "",
        descripcion: "",
        subidoPor: "",
      });
      onClose();
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Subir Documento Específico
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={uploading}
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del documento
            </label>
            <input
              type="text"
              required
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="Acta de Entrega de Equipos"
              disabled={uploading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Evento o situación
            </label>
            <input
              type="text"
              required
              value={formData.evento}
              onChange={(e) => setFormData({ ...formData, evento: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="Ej: Entrega de laptops - Marzo 2025"
              disabled={uploading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Archivo
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition">
              <input
                type="file"
                required
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                className="hidden"
                id="file-upload-especifico"
                disabled={uploading}
              />
              <label htmlFor="file-upload-especifico" className="cursor-pointer">
                {file ? (
                  <div className="text-sm text-gray-600">
                    <FileText className="mx-auto mb-2 text-blue-600" size={32} />
                    <p className="font-medium">{file.name}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                ) : (
                  <div>
                    <Upload className="mx-auto mb-2 text-gray-400" size={32} />
                    <p className="text-sm text-gray-600">
                      Click para seleccionar archivo
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      PDF, Word, Excel o imágenes (máx. 10MB)
                    </p>
                  </div>
                )}
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition"
              disabled={uploading}
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={uploading}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                uploading
                  ? "bg-blue-300 cursor-not-allowed text-white"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {uploading ? 'Subiendo...' : 'Subir Documento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}