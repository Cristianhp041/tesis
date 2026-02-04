"use client";

import { X, FileText } from "lucide-react";
import { useState, useEffect } from "react";
import { Document } from "../types/document.types";

interface EditTextDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, data: EditTextDocumentData) => Promise<void>;
  document: Document | null;
}

export interface EditTextDocumentData {
  nombre: string;
  contenido: string;
  mes?: string;
  evento?: string;
}

export default function EditTextDocumentModal({ 
  isOpen, 
  onClose, 
  onSave,
  document 
}: EditTextDocumentModalProps) {
  const [formData, setFormData] = useState<EditTextDocumentData>({
    nombre: "",
    contenido: "",
    mes: "",
    evento: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (document) {
      setFormData({
        nombre: document.nombre || "",
        contenido: document.contenido || "",
        mes: document.mes || "",
        evento: document.evento || "",
      });
    }
  }, [document]);

  if (!isOpen || !document) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nombre.trim() || !formData.contenido.trim()) {
      alert('El nombre y contenido son requeridos');
      return;
    }

    setSaving(true);
    try {
      await onSave(document.id, formData);
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
            Editar Documento
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
              disabled={saving}
            />
          </div>

          {document.tipo === "MENSUAL" && (
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

          {document.tipo === "ESPECIFICO" && (
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
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}