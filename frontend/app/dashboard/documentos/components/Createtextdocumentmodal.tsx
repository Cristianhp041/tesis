"use client";

import { X, FileText } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@apollo/client/react";
import { GET_ME, GetMeResponse } from "../graphql/getMe";

interface CreateTextDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: TextDocumentData) => Promise<void>;
  documentType: "MENSUAL" | "ESPECIFICO";
}

export interface TextDocumentData {
  nombre: string;
  contenido: string;
  mes?: string;
  evento?: string;
  subidoPor: string;
}

export default function CreateTextDocumentModal({ 
  isOpen, 
  onClose, 
  onSave,
  documentType 
}: CreateTextDocumentModalProps) {
  const { data: userData } = useQuery<GetMeResponse>(GET_ME);
  
  const [formData, setFormData] = useState<TextDocumentData>({
    nombre: "",
    contenido: "",
    mes: documentType === "MENSUAL" ? new Date().toISOString().slice(0, 7) : undefined,
    evento: documentType === "ESPECIFICO" ? "" : undefined,
    subidoPor: "",
  });
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nombre.trim() || !formData.contenido.trim()) {
      alert('El nombre y contenido son requeridos');
      return;
    }

    setSaving(true);
    try {
      const saveData = {
        ...formData,
        subidoPor: userData?.me?.email || "Usuario desconocido"
      };
      
      await onSave(saveData);
      setFormData({
        nombre: "",
        contenido: "",
        mes: documentType === "MENSUAL" ? new Date().toISOString().slice(0, 7) : undefined,
        evento: documentType === "ESPECIFICO" ? "" : undefined,
        subidoPor: "",
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Crear Documento de Texto
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={saving}
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
              placeholder="Plan de Trabajo Enero 2025"
              disabled={saving}
            />
          </div>

          {documentType === "MENSUAL" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mes correspondiente
              </label>
              <input
                type="month"
                required
                value={formData.mes}
                onChange={(e) => setFormData({ ...formData, mes: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                disabled={saving}
              />
            </div>
          )}

          {documentType === "ESPECIFICO" && (
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
                disabled={saving}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contenido del documento
            </label>
            <textarea
              required
              value={formData.contenido}
              onChange={(e) => setFormData({ ...formData, contenido: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono"
              placeholder="Escribe el contenido del documento aquí..."
              rows={15}
              disabled={saving}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition"
              disabled={saving}
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={saving}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                saving
                  ? "bg-blue-300 cursor-not-allowed text-white"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {saving ? 'Guardando...' : 'Crear Documento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}