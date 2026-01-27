"use client";

import { useMemo, useState } from "react";
import { useMutation } from "@apollo/client/react";
import { toast } from "sonner";

import { UPDATE_MUNICIPIO } from "../graphql/updateMunicipio";
import { GET_MUNICIPIOS_BY_PROVINCIA } from "../graphql/getMunicipiosByProvincia";
import ProvinciaSelect from "./ProvinciaSelect";

interface Municipio {
  id: number;
  nombre: string;
  provinciaId: number;
}

interface Props {
  municipio: Municipio;
  onSuccess: () => void;
  onCancel: () => void;
}

type UpdateMunicipioInput = {
  nombre?: string;
  provinciaId?: number;
};

export default function EditarMunicipioForm({
  municipio,
  onSuccess,
  onCancel,
}: Props) {
  const [nombre, setNombre] = useState(municipio.nombre);
  const [provinciaId, setProvinciaId] = useState<number | null>(
    municipio.provinciaId
  );

  const original = useMemo(
    () => ({
      nombre: municipio.nombre,
      provinciaId: municipio.provinciaId,
    }),
    [municipio]
  );

  const [updateMunicipio, { loading }] = useMutation(UPDATE_MUNICIPIO, {
    refetchQueries: [{ query: GET_MUNICIPIOS_BY_PROVINCIA }],
  });

  const hayCambios =
    nombre !== original.nombre || provinciaId !== original.provinciaId;

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

    if (!provinciaId) {
      toast.error("✗ Debe seleccionar una provincia");
      return;
    }

    const data: UpdateMunicipioInput = {};

    if (nombre !== original.nombre) data.nombre = nombre;
    if (provinciaId !== original.provinciaId) data.provinciaId = provinciaId;

    try {
      const result = await updateMunicipio({
        variables: {
          id: municipio.id,
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

        if (errorMessage.includes("Ya existe un municipio con ese nombre")) {
          toast.error("✗ Ya existe un municipio con ese nombre en esta provincia");
        } else if (errorMessage.includes("Provincia no encontrada")) {
          toast.error("✗ Provincia no encontrada");
        } else {
          toast.error("✗ No se pudieron guardar los cambios");
        }
        return;
      }

      toast.success("✓ Municipio actualizado correctamente");
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

      if (errorMessage.includes("Ya existe un municipio con ese nombre")) {
        toast.error("✗ Ya existe un municipio con ese nombre en esta provincia");
      } else if (errorMessage.includes("Provincia no encontrada")) {
        toast.error("✗ Provincia no encontrada");
      } else {
        toast.error("✗ No se pudieron guardar los cambios");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Provincia
        </label>
        <ProvinciaSelect
          value={provinciaId ?? undefined}
          onChange={setProvinciaId}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nombre del municipio
        </label>
        <input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          placeholder="Nombre"
        />
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