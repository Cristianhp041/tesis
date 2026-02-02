"use client";

import { X, User } from "lucide-react";

interface ConfirmarConteoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
  userEmail?: string; 
}

export default function ConfirmarConteoModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  userEmail, 
}: ConfirmarConteoModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Confirmar Conteo Mensual
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={isLoading}
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6 space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              ⚠️ <strong>Atención:</strong> Una vez confirmado el conteo, no podrás realizar más cambios.
            </p>
          </div>

          {userEmail && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User size={20} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-blue-600 font-medium">Confirmará como:</p>
                  <p className="text-sm font-semibold text-blue-900">{userEmail}</p>
                </div>
              </div>
            </div>
          )}

          <p className="text-sm text-gray-700">
            ¿Estás seguro de que deseas confirmar el conteo de este mes?
          </p>

          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-0.5">✓</span>
              <span>Todos los activos han sido contados</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-0.5">✓</span>
              <span>Se bloqueará la edición de registros</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-0.5">✓</span>
              <span>Se registrará tu usuario y la fecha de confirmación</span>
            </li>
          </ul>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition disabled:opacity-50"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
              isLoading
                ? "bg-green-300 cursor-not-allowed text-white"
                : "bg-green-600 hover:bg-green-700 text-white"
            }`}
          >
            {isLoading ? "Confirmando..." : "Confirmar Conteo"}
          </button>
        </div>
      </div>
    </div>
  );
}