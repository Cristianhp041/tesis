"use client";

import { useMemo, useState } from "react";
import { useMutation } from "@apollo/client/react";
import { toast } from "sonner";

import { UPDATE_USER } from "../graphql/updateUser";
import { GET_USERS } from "../graphql/getUsers";
import { User, UserRole } from "../types/user";

interface Props {
  user: User;
  onSuccess: () => void;
  onCancel: () => void;
}

type UpdateUserInput = {
  email?: string;
  role?: UserRole;
  active?: boolean;
};

export default function EditarUserForm({ user, onSuccess, onCancel }: Props) {
  const [email, setEmail] = useState(user.email);
  const [role, setRole] = useState<UserRole>(user.role);
  const [active, setActive] = useState(user.active);

  const original = useMemo(
    () => ({
      email: user.email,
      role: user.role,
      active: user.active,
    }),
    [user]
  );

  const [updateUser, { loading }] = useMutation(UPDATE_USER, {
    refetchQueries: [
      { 
        query: GET_USERS,
        variables: { active: "all" }
      }
    ],
    awaitRefetchQueries: true, 
  });

  const hayCambios =
    email !== original.email ||
    role !== original.role ||
    active !== original.active;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!hayCambios) {
      toast.info("ℹ No hay cambios para guardar");
      return;
    }

    if (!email.trim()) {
      toast.error("✗ El email es obligatorio");
      return;
    }

    const data: UpdateUserInput = {};

    if (email !== original.email) data.email = email;
    if (role !== original.role) data.role = role;
    if (active !== original.active) data.active = active;

    try {
      const result = await updateUser({
        variables: {
          id: user.id,
          data,
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
          toast.error("✗ No se pudieron guardar los cambios");
        }
        return;
      }

      toast.success("✓ Usuario actualizado correctamente");
      onSuccess();
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
        toast.error("✗ No se pudieron guardar los cambios");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
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

      <div className="flex items-center justify-between">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Estado
          </label>
          <p className="text-xs text-gray-500">
            No podrá iniciar sesión si está inactivo
          </p>
        </div>

        <button
          type="button"
          onClick={() => setActive(!active)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            active ? "bg-green-500" : "bg-gray-300"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              active ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      {hayCambios && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <p className="text-xs text-amber-600">⚠️ Hay cambios sin guardar</p>
        </div>
      )}

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
          disabled={!hayCambios || loading}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
            !hayCambios || loading
              ? "bg-blue-300 cursor-not-allowed text-white"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          {loading ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>
    </form>
  );
}