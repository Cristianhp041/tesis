"use client";

import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { toast } from "sonner";

import { CREATE_SUBCLASIFICACION } from "../graphql/createSubclasificacion";
import { GET_SUBCLASIFICACIONES } from "../graphql/getSubclasificaciones";

interface Props {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function CrearSubclasificacionForm({
  onSuccess,
  onCancel,
}: Props) {
  const [nombre, setNombre] = useState("");

  const [createSubclasificacion, { loading }] = useMutation(
    CREATE_SUBCLASIFICACION,
    {
      refetchQueries: [{ query: GET_SUBCLASIFICACIONES }],
    }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombre.trim()) {
      toast.error("✗ El nombre es obligatorio");
      return;
    }

    try {
      const result = await createSubclasificacion({
        variables: {
          input: {
            nombre: nombre.trim(),
          },
        },
      });

      if (result.error) {
        let message = "";
        
        const err = result.error as unknown as Record<string, unknown>;
        
        if (typeof err.message === 'string') {
          message = err.message;
        }
        
        if (!message && 'graphQLErrors' in err && Array.isArray(err.graphQLErrors)) {
          const graphQLErrors = err.graphQLErrors as unknown as Array<Record<string, unknown>>;
          if (graphQLErrors.length > 0 && typeof graphQLErrors[0].message === 'string') {
            message = graphQLErrors[0].message;
          }
        }

        if (message.includes("Ya existe una subclasificación con ese nombre")) {
          toast.error("✗ Ya existe una subclasificación con ese nombre");
        } else {
          toast.error("✗ Error al crear la subclasificación");
        }
        return;
      }

      toast.success("✓ Subclasificación creada correctamente");
      onSuccess();
    } catch (error) {
      let message = "";

      if (error instanceof Error) {
        message = error.message;
      }

      if (!message && typeof error === 'object' && error !== null && 'graphQLErrors' in error) {
        const err = error as unknown as { graphQLErrors?: Array<{ message?: string }> };
        if (err.graphQLErrors && err.graphQLErrors.length > 0) {
          message = err.graphQLErrors[0].message || '';
        }
      }

      if (message.includes("Ya existe una subclasificación con ese nombre")) {
        toast.error("✗ Ya existe una subclasificación con ese nombre");
      } else {
        toast.error("✗ Error al crear la subclasificación");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nombre de la subclasificación
        </label>
        <input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Ingrese el nombre"
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
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
          {loading ? "Creando..." : "Crear subclasificación"}
        </button>
      </div>
    </form>
  );
}