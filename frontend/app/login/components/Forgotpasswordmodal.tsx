"use client";

import { useState } from "react";
import { X, Mail, Loader2, CheckCircle2 } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: (email: string) => void;
}

export default function ForgotPasswordModal({ open, onClose, onSuccess }: Props) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:3001/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Error al enviar código");
      }

      onSuccess(email);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al enviar el código";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Mail size={20} className="text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800">
              Recuperar Contraseña
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-sm text-gray-600">
            Ingresa tu correo electrónico y te enviaremos un código de
            verificación para restablecer tu contraseña.
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="correo@ejemplo.com"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  Enviando...
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  Enviar Código
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}