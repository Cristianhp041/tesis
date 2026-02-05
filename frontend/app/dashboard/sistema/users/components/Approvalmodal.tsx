"use client";

import { useState } from "react";
import { X, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { User } from "../types/user";

interface Props {
  open: boolean;
  user: User;
  action: 'approve' | 'reject';
  onClose: () => void;
  onConfirm: (reason?: string) => Promise<void>;
}

export default function ApprovalModal({ open, user, action, onClose, onConfirm }: Props) {
  const [reason, setReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!open) return null;

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm(action === 'reject' ? reason : undefined);
      onClose();
    } catch {
      setIsLoading(false);
    }
  };

  const isApprove = action === 'approve';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              isApprove ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {isApprove ? (
                <CheckCircle size={20} className="text-green-600" />
              ) : (
                <XCircle size={20} className="text-red-600" />
              )}
            </div>
            <h2 className="text-lg font-semibold text-gray-800">
              {isApprove ? 'Aprobar Usuario' : 'Rechazar Usuario'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className={`border-l-4 rounded p-4 ${
            isApprove ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'
          }`}>
            <p className={`text-sm ${isApprove ? 'text-green-800' : 'text-red-800'}`}>
              {isApprove ? (
                <>
                  ¿Estás seguro de que deseas <strong>aprobar</strong> a <strong>{user.name}</strong>?
                  <br />
                  El usuario recibirá un email de confirmación y podrá acceder al sistema.
                </>
              ) : (
                <>
                  ¿Estás seguro de que deseas <strong>rechazar</strong> a <strong>{user.name}</strong>?
                  <br />
                  El usuario recibirá un email notificando el rechazo.
                </>
              )}
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-700">
              <strong>Email:</strong> {user.email}
            </p>
            <p className="text-sm text-gray-700 mt-1">
              <strong>Nombre:</strong> {user.name}
            </p>
          </div>

          {!isApprove && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motivo del rechazo (opcional)
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none"
                rows={3}
                placeholder="Explica por qué se rechaza este usuario..."
              />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={isLoading}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition flex items-center gap-2 disabled:opacity-50 ${
                isApprove
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  Procesando...
                </>
              ) : (
                <>
                  {isApprove ? <CheckCircle size={16} /> : <XCircle size={16} />}
                  {isApprove ? 'Aprobar' : 'Rechazar'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}