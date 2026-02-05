"use client";

import { useState } from "react";
import { X, Lock, Eye, EyeOff, Loader2, CheckCircle2, Key } from "lucide-react";

interface Props {
  open: boolean;
  email: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ResetPasswordModal({ open, email, onClose, onSuccess }: Props) {
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const newErrors: Record<string, string> = {};

    if (!code.trim()) {
      newErrors.code = "El código es obligatorio";
    }
    if (!newPassword) {
      newErrors.newPassword = "La contraseña es obligatoria";
    }
    if (newPassword.length < 6) {
      newErrors.newPassword = "Mínimo 6 caracteres";
    }
    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:3001/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          code,
          newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Error al restablecer contraseña");
      }

      onSuccess();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al restablecer contraseña";
      setErrors({ general: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const passwordsMatch = newPassword && confirmPassword && newPassword === confirmPassword;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Lock size={20} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                Nueva Contraseña
              </h2>
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-600">
              📧 Revisa tu correo. Te enviamos un código de 6 dígitos.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Código de Verificación
            </label>
            <div className="relative">
              <Key
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className={`w-full border rounded-lg pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none tracking-wider text-center text-lg font-mono ${
                  errors.code ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="000000"
                maxLength={6}
                disabled={isLoading}
              />
            </div>
            {errors.code && (
              <p className="text-xs text-red-600 mt-1">{errors.code}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nueva Contraseña
            </label>
            <div className="relative">
              <Lock
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={`w-full border rounded-lg pl-10 pr-10 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none ${
                  errors.newPassword ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Mínimo 6 caracteres"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.newPassword && (
              <p className="text-xs text-red-600 mt-1">{errors.newPassword}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirmar Contraseña
            </label>
            <div className="relative">
              <Lock
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full border rounded-lg pl-10 pr-10 py-2.5 text-sm focus:ring-2 outline-none ${
                  errors.confirmPassword
                    ? "border-red-500 focus:ring-red-500"
                    : passwordsMatch
                    ? "border-green-500 focus:ring-green-500"
                    : "border-gray-300 focus:ring-blue-500"
                }`}
                placeholder="Repite la contraseña"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
              {passwordsMatch && (
                <CheckCircle2
                  size={18}
                  className="absolute right-10 top-1/2 -translate-y-1/2 text-green-500"
                />
              )}
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-red-600 mt-1">{errors.confirmPassword}</p>
            )}
            {passwordsMatch && (
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <CheckCircle2 size={12} /> Las contraseñas coinciden
              </p>
            )}
          </div>

          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{errors.general}</p>
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
                  Procesando...
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  Cambiar Contraseña
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}