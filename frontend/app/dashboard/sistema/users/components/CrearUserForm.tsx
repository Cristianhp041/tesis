// src/app/(app)/configuracion/usuarios/components/CrearUserForm.tsx - CORREGIDO
"use client";

import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { toast } from "sonner";
import { Eye, EyeOff, CheckCircle2 } from "lucide-react";

import { CREATE_USER } from "../graphql/createUser";
import { GET_USERS } from "../graphql/getUsers";
import { UserRole } from "../types/user";

interface Props {
  onSuccess: (email: string, name: string) => void;
  onCancel: () => void;
}

export default function CrearUserForm({ onSuccess, onCancel }: Props) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<UserRole>(UserRole.USER);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [createUser, { loading }] = useMutation(CREATE_USER, {
    refetchQueries: [
      { 
        query: GET_USERS,
        variables: { active: "all" } 
      }
    ],
    awaitRefetchQueries: true, // ✅ Esperar a que termine el refetch
  });

  const passwordsMatch = password && confirmPassword && password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("✗ El email es obligatorio");
      return;
    }

    if (!name.trim()) {
      toast.error("✗ El nombre es obligatorio");
      return;
    }

    if (!password.trim()) {
      toast.error("✗ La contraseña es obligatoria");
      return;
    }

    if (password.length < 6) {
      toast.error("✗ La contraseña debe tener al menos 6 caracteres");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("✗ Las contraseñas no coinciden");
      return;
    }

    try {
      const result = await createUser({
        variables: {
          data: { email, name, password, role },
        },
      });

      if (result.error) {
        let errorMessage = "";
        
        const err = result.error as unknown as Record<string, unknown>;
        
        if (typeof err.message === 'string') {
          errorMessage = err.message;
        }
        
        if (!errorMessage && 'graphQLErrors' in err && Array.isArray(err.graphQLErrors)) {
          const graphQLErrors = err.graphQLErrors as unknown as Array<Record<string, unknown>>;
          if (graphQLErrors.length > 0 && typeof graphQLErrors[0].message === 'string') {
            errorMessage = graphQLErrors[0].message;
          }
        }

        if (errorMessage.includes("Ya existe un usuario con ese email")) {
          toast.error("✗ Ya existe un usuario con ese email");
        } else {
          toast.error("✗ Error al crear el usuario");
        }
        return;
      }

      // ✅ El refetch ya terminó aquí gracias a awaitRefetchQueries
      toast.success("✓ Usuario creado. Código de verificación enviado por email");
      onSuccess(email, name);
    } catch (error) {
      let errorMessage = "";

      if (error instanceof Error) {
        errorMessage = error.message;
      }

      if (!errorMessage && typeof error === 'object' && error !== null && 'graphQLErrors' in error) {
        const err = error as unknown as { graphQLErrors?: Array<{ message?: string }> };
        if (err.graphQLErrors && err.graphQLErrors.length > 0) {
          errorMessage = err.graphQLErrors[0].message || '';
        }
      }

      if (errorMessage.includes("Ya existe un usuario con ese email")) {
        toast.error("✗ Ya existe un usuario con ese email");
      } else {
        toast.error("✗ Error al crear el usuario");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} autoComplete="off" className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nombre completo
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Juan Pérez"
          required
          autoComplete="off"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="correo@gmail.com"
          required
          autoComplete="off"
          name="email-create-user-unique"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Contraseña
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mínimo 6 caracteres"
            required
            autoComplete="new-password"
            name="password-create-user-unique"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Repetir contraseña
        </label>
        <div className="relative">
          <input
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repite la contraseña"
            required
            autoComplete="new-password"
            name="confirm-password-create-user-unique"
            className={`w-full border rounded-lg px-3 py-2 pr-10 text-sm focus:ring-2 outline-none ${
              confirmPassword && !passwordsMatch
                ? "border-red-500 focus:ring-red-500"
                : passwordsMatch
                ? "border-green-500 focus:ring-green-500"
                : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            }`}
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

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Rol
        </label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as UserRole)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        >
          <option value={UserRole.USER}>USER</option>
          <option value={UserRole.ADMIN}>ADMIN</option>
        </select>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition"
        >
          Cancelar
        </button>

        <button
          type="submit"
          disabled={loading}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
            loading
              ? "bg-blue-300 cursor-not-allowed text-white"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          {loading ? "Creando..." : "Crear usuario"}
        </button>
      </div>
    </form>
  );
}