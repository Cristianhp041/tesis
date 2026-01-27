"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Users, Package, FileText, Eye, EyeOff, Loader2 } from "lucide-react";

export default function LoginPage() {
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
        throw new Error("Credenciales incorrectas");
      }

      const data = await res.json();

      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("isAuth", "true");

      router.push("/dashboard");
    } catch {
      setError("Correo o contraseña incorrectos");
      setIsLoading(false); 
    }
  };

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
                    <h2 className="text-2xl font-bold text-white/90">
                      Administrativa
                    </h2>
                  </div>
                </div>
                <div className="w-20 h-1 bg-white/50 rounded"></div>
              </div>

              <div className="space-y-4 mb-8">
                <p className="text-blue-100">
                  Plataforma integral para la gestión de recursos humanos, activos fijos tangibles y archivo documental institucional.
                </p>
              </div>

              <div className="space-y-5">
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <Users className="text-white" size={20} />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">Gestión de Personal</h3>
                    <p className="text-blue-200 text-sm">
                      Control y administración de trabajadores
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <Package className="text-white" size={20} />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">Activos Fijos Tangibles</h3>
                    <p className="text-blue-200 text-sm">
                      Inventario y control de bienes institucionales
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <FileText className="text-white" size={20} />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">Archivo Digital</h3>
                    <p className="text-blue-200 text-sm">
                      Gestión y resguardo de documentación
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-12 flex flex-col justify-center bg-slate-50">
            <div className="max-w-md mx-auto w-full">
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-800">
                    Iniciar Sesión
                  </h2>
                  <p className="text-gray-600">
                    Ingresa tus credenciales institucionales
                  </p>
                </div>

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
                        {showPassword ? (
                          <EyeOff size={20} />
                        ) : (
                          <Eye size={20} />
                        )}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-sm text-red-600 text-center">
                        {error}
                      </p>
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
                  <p className="text-xs text-gray-500">
                    Sistema institucional · Acceso autorizado
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