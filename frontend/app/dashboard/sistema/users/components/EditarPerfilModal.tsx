"use client";

import { useState } from "react";
import { X, Eye, EyeOff, Lock, CheckCircle2, User } from "lucide-react";

interface Props {
  open: boolean;
  user: {
    email: string;
  };
  onClose: () => void;
  onSave: (data: { email?: string; password?: string; currentPassword?: string }) => void;
}

export default function EditarPerfilModal({ open, user, onClose, onSave }: Props) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const newErrors: Record<string, string> = {};

    if (!currentPassword) {
      newErrors.currentPassword = "Ingrese su contraseña actual";
    }
    if (!newPassword) {
      newErrors.newPassword = "Ingrese la nueva contraseña";
    }
    if (!confirmPassword) {
      newErrors.confirmPassword = "Confirme la nueva contraseña";
    }
    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden";
    }
    if (newPassword && newPassword.length < 6) {
      newErrors.newPassword = "Mínimo 6 caracteres";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const data: { password: string; currentPassword: string } = {
      password: newPassword,
      currentPassword: currentPassword,
    };

    onSave(data);

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    onClose();
  };

  const passwordsMatch = newPassword && confirmPassword && newPassword === confirmPassword;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <User size={20} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Cambiar contraseña</h2>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} autoComplete="off" className="p-6 space-y-5">

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña actual
            </label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className={`w-full border rounded-lg pl-10 pr-10 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none ${
                  errors.currentPassword ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Tu contraseña actual"
                autoComplete="new-password"
                name="current-password-edit-unique"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.currentPassword && (
              <p className="text-xs text-red-600 mt-1">{errors.currentPassword}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nueva contraseña
            </label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={`w-full border rounded-lg pl-10 pr-10 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none ${
                  errors.newPassword ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Mínimo 6 caracteres"
                autoComplete="new-password"
                name="new-password-edit-unique"
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirmar nueva contraseña
            </label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
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
                placeholder="Repite la nueva contraseña"
                autoComplete="new-password"
                name="confirm-password-edit-unique"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
              {passwordsMatch && (
                <CheckCircle2 size={18} className="absolute right-10 top-1/2 -translate-y-1/2 text-green-500" />
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
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
            >
              Cambiar contraseña
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}