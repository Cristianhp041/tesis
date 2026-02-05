"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, CheckCircle2, User, Mail, Lock } from "lucide-react";
import VerificarEmailModal from "../dashboard/sistema/users/components/VerificarEmailModal";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [showVerification, setShowVerification] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [registeredName, setRegisteredName] = useState("");

  const passwordsMatch = password && confirmPassword && password === confirmPassword;

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("El nombre es obligatorio");
      return;
    }

    if (!email.trim()) {
      setError("El email es obligatorio");
      return;
    }

    if (!password.trim()) {
      setError("La contraseña es obligatoria");
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:3001/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Error al registrarse");
      }

      setRegisteredEmail(email);
      setRegisteredName(name);
      setShowVerification(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al registrarse");
      setIsLoading(false);
    }
  };

  const handleVerificationClose = () => {
    setShowVerification(false);
    router.push("/login");
  };

  if (showVerification) {
    return (
      <VerificarEmailModal
        open={showVerification}
        email={registeredEmail}
        userName={registeredName}
        onClose={handleVerificationClose}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="grid md:grid-cols-2 gap-0 min-h-[600px]">
          <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 p-12 flex flex-col justify-center overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-white opacity-5 rounded-full -ml-48 -mb-48"></div>

            <div className="relative z-10">
              <div className="mb-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/30 flex-shrink-0">
                    <span className="text-white font-bold text-3xl">SG</span>
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white leading-tight">
                      Sistema de Gestión
                    </h1>
                    <h2 className="text-2xl font-bold text-white/90">Administrativa</h2>
                  </div>
                </div>
                <div className="w-20 h-1 bg-white/50 rounded"></div>
              </div>

              <div className="space-y-4 mb-8">
                <p className="text-blue-100">
                  Regístrate para solicitar acceso a nuestra plataforma de gestión institucional.
                </p>
              </div>
            </div>
          </div>

          <div className="p-12 flex flex-col justify-center bg-slate-50">
            <div className="max-w-md mx-auto w-full">
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-800">Crear Cuenta</h2>
                  <p className="text-gray-600">Completa los datos para registrarte</p>
                </div>

                <form onSubmit={handleRegister} className="space-y-5" autoComplete="off">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nombre Completo
                    </label>
                    <div className="relative">
                      <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Juan Pérez"
                        required
                        autoComplete="off"
                        name="name-register-unique"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Correo Electrónico
                    </label>
                    <div className="relative">
                      <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="correo@ejemplo.com"
                        required
                        autoComplete="off"
                        name="email-register-unique"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Contraseña
                    </label>
                    <div className="relative">
                      <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Mínimo 6 caracteres"
                        required
                        autoComplete="new-password"
                        name="password-register-unique"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Confirmar Contraseña
                    </label>
                    <div className="relative">
                      <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={`w-full pl-10 px-4 py-3 pr-12 border rounded-xl focus:ring-2 outline-none ${
                          confirmPassword && !passwordsMatch
                            ? "border-red-500 focus:ring-red-500"
                            : passwordsMatch
                            ? "border-green-500 focus:ring-green-500"
                            : "border-gray-300 focus:ring-blue-500"
                        }`}
                        placeholder="Repite la contraseña"
                        required
                        autoComplete="new-password"
                        name="confirm-password-register-unique"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition"
                      >
                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                      {passwordsMatch && (
                        <CheckCircle2
                          size={18}
                          className="absolute right-12 top-1/2 -translate-y-1/2 text-green-500"
                        />
                      )}
                    </div>
                    {confirmPassword && !passwordsMatch && (
                      <p className="text-xs text-red-600 mt-1">
                        Las contraseñas no coinciden
                      </p>
                    )}
                    {passwordsMatch && (
                      <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                        <CheckCircle2 size={12} /> Las contraseñas coinciden
                      </p>
                    )}
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-sm text-red-600 text-center">{error}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full font-semibold py-3.5 rounded-xl transition shadow-lg flex items-center justify-center gap-2 ${
                      isLoading
                        ? "bg-blue-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                    } text-white`}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        Registrando...
                      </>
                    ) : (
                      "Crear Cuenta"
                    )}
                  </button>
                </form>

                <div className="mt-6 pt-6 border-t border-gray-200 text-center">
                  <p className="text-sm text-gray-600">
                    ¿Ya tienes cuenta?{" "}
                    <button
                      onClick={() => router.push("/login")}
                      className="text-blue-600 hover:text-blue-700 font-medium hover:underline transition"
                    >
                      Inicia Sesión
                    </button>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}