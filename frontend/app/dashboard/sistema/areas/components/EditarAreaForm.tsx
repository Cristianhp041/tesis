"use client";

import { useMemo, useState } from "react";
import { useMutation } from "@apollo/client/react";
import { toast } from "sonner";

import { UPDATE_AREA } from "../graphql/updateArea";
import { GET_AREAS } from "../graphql/getAreas";
import { Area } from "../types/area";

interface Props {
  area: Area;
  onSuccess: () => void;
  onCancel: () => void;
}

type UpdateAreaInput = {
  nombre?: string;
  activo?: boolean;
};

export default function EditarAreaForm({ area, onSuccess, onCancel }: Props) {
  const [nombre, setNombre] = useState(area.nombre);
  const [activo, setActivo] = useState(area.activo);

  const original = useMemo(
    () => ({
      nombre: area.nombre,
      activo: area.activo,
    }),
    [area]
  );

  const [updateArea, { loading }] = useMutation(UPDATE_AREA, {
    refetchQueries: [{ query: GET_AREAS }],
  });

  const hayCambios = nombre !== original.nombre || activo !== original.activo;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!hayCambios) {
      toast.info("ℹ No hay cambios para guardar");
      return;
    }

    if (!nombre.trim()) {
      toast.error("✗ El nombre es obligatorio");
      return;
    }

    const data: UpdateAreaInput = {};

    if (nombre !== original.nombre) data.nombre = nombre;
    if (activo !== original.activo) data.activo = activo;

    try {
      const result = await updateArea({
        variables: {
          id: area.id,
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

        if (errorMessage.includes("tiene AFTs asociados")) {
          toast.error("✗ No se puede desactivar: tiene AFTs asociados");
        } else if (errorMessage.includes("Ya existe un área con ese nombre")) {
          toast.error("✗ Ya existe un área con ese nombre");
        } else {
          toast.error("✗ No se pudieron guardar los cambios");
        }

        setActivo(original.activo);
        return;
      }

      toast.success("✓ Área actualizada correctamente");
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

      if (errorMessage.includes("tiene AFTs asociados")) {
        toast.error("✗ No se puede desactivar: tiene AFTs asociados");
      } else if (errorMessage.includes("Ya existe un área con ese nombre")) {
        toast.error("✗ Ya existe un área con ese nombre");
      } else {
        toast.error("✗ No se pudieron guardar los cambios");
      }

      setActivo(original.activo);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nombre del área
        </label>
        <input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          placeholder="Nombre"
        />
      </div>

      <div className="flex items-center justify-between">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Estado
          </label>
          <p className="text-xs text-gray-500">
            No estará disponible para nuevas asignaciones si está inactiva
          </p>
        </div>

        <button
          type="button"
          onClick={() => setActivo(!activo)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            activo ? "bg-green-500" : "bg-gray-300"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              activo ? "translate-x-6" : "translate-x-1"
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