"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";

interface Props {
  onForgotPassword: () => void;
  showSuccessMessage: boolean;
}

export default function LoginForm({ onForgotPassword, showSuccessMessage }: Props) {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:3001/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Credenciales incorrectas");
      }

      const data = await res.json();

      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("isAuth", "true");

      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión");
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto w-full">
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Iniciar Sesión</h2>
          <p className="text-gray-600">Ingresa tus credenciales institucionales</p>
        </div>

        {showSuccessMessage && (
          <div className="mb-5 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle2 size={20} />
              <p className="text-sm font-medium">
                ✅ Contraseña actualizada exitosamente. Ya puedes iniciar sesión
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5" autoComplete="off">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Correo Electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="correo@vertex.cu"
              required
              autoComplete="off"
              name="email-login-unique"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Contraseña
            </label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="••••••••"
                required
                autoComplete="new-password"
                name="password-login-unique"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition"
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline transition"
            >
              ¿Olvidaste tu contraseña?
            </button>
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
                Accediendo...
              </>
            ) : (
              "Acceder al Sistema"
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-600 mb-3">
            ¿No tienes cuenta?{" "}
            <button
              onClick={() => router.push("/register")}
              className="text-blue-600 hover:text-blue-700 font-medium hover:underline transition"
            >
              Regístrate aquí
            </button>
          </p>
          <p className="text-xs text-gray-500">
            Sistema institucional · Acceso autorizado
          </p>
        </div>
      </div>
    </div>
  );
}