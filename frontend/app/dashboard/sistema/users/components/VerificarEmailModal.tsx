"use client";

import { useState } from "react";
import { X, Mail, RefreshCw, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface Props {
  open: boolean;
  email: string;
  userName: string;
  onClose: () => void;
}

export default function VerificarEmailModal({ open, email, userName, onClose }: Props) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  if (!open) return null;

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    if (code.length !== 6) {
      toast.error("El código debe tener 6 dígitos");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:3001/auth/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, code }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Error al verificar el código");
        setLoading(false);
        return;
      }

      toast.success("✓ Email verificado exitosamente");
      onClose();
    } catch {
      toast.error("Error al verificar el código");
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResending(true);

    try {
      const response = await fetch("http://localhost:3001/auth/resend-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Error al reenviar el código");
        setResending(false);
        return;
      }

      toast.success("✓ Código reenviado exitosamente");
      setResending(false);
    } catch {
      toast.error("Error al reenviar el código");
      setResending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Mail size={20} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Verificar Email</h2>
              <p className="text-xs text-gray-500">{email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleVerify} className="p-6 space-y-5">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Hola {userName},</strong> hemos enviado un código de 6 dígitos a <strong>{email}</strong>. 
              Revisa tu bandeja de entrada (y spam) e ingrésalo aquí.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Código de verificación
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                if (value.length <= 6) {
                  setCode(value);
                }
              }}
              placeholder="000000"
              maxLength={6}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-center text-2xl font-mono tracking-widest focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <p className="text-xs text-gray-500 mt-2">
              El código es válido por 24 horas
            </p>
          </div>

          <button
            type="button"
            onClick={handleResendCode}
            disabled={resending}
            className="w-full flex items-center justify-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium transition"
          >
            <RefreshCw size={16} className={resending ? "animate-spin" : ""} />
            {resending ? "Reenviando..." : "Reenviar código"}
          </button>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className={`px-6 py-2 text-sm font-medium rounded-lg transition flex items-center gap-2 ${
                loading || code.length !== 6
                  ? "bg-blue-300 cursor-not-allowed text-white"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {loading ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  Verificando...
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  Verificar
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}