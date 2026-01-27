"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import { toast } from "sonner";

import { CREATE_AFT } from "../graphql/createAft";
import { GET_AFTS } from "../graphql/getAfts";
import { GET_AREAS_ACTIVAS } from "../graphql/getAreasActivas";
import { GET_SUBCLASIFICACIONES_ACTIVAS } from "../graphql/getSubclasificacionesActivas";

interface Props {
  onSuccess: () => void;
  onCancel: () => void;
}

type Area = {
  id: number;
  nombre: string;
};

type Subclasificacion = {
  id: number;
  nombre: string;
};

export default function CrearAftForm({ onSuccess, onCancel }: Props) {
  const [rotulo, setRotulo] = useState("");
  const [nombre, setNombre] = useState("");
  const [areaId, setAreaId] = useState<number | undefined>();
  const [subclasificacionId, setSubclasificacionId] = useState<number | undefined>();

  const { data: areasData, loading: loadingAreas } = useQuery<{
    areasActivas: Area[];
  }>(GET_AREAS_ACTIVAS);

  const { data: subData, loading: loadingSub } = useQuery<{
    subclasificacionesActivas: Subclasificacion[];
  }>(GET_SUBCLASIFICACIONES_ACTIVAS);

  const [createAft, { loading }] = useMutation(CREATE_AFT, {
    refetchQueries: [{ query: GET_AFTS }],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!rotulo.trim() || !nombre.trim()) {
      toast.error("✗ Rótulo y nombre son obligatorios");
      return;
    }

    if (!areaId || !subclasificacionId) {
      toast.error("✗ Debe seleccionar área y subclasificación");
      return;
    }

    try {
      const result = await createAft({
        variables: {
          data: {
            rotulo: rotulo.trim(),
            nombre: nombre.trim(),
            areaId,
            subclasificacionId,
          },
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

        if (errorMessage.includes("rótulo ya existe") || errorMessage.includes("rotulo ya existe")) {
          toast.error("✗ Ya existe un AFT con ese rótulo");
        } else {
          toast.error(errorMessage || "✗ No se pudo crear el AFT");
        }
        return;
      }

      toast.success("✓ AFT creado correctamente");
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
      
      if (errorMessage.includes("rótulo ya existe") || errorMessage.includes("rotulo ya existe")) {
        toast.error("✗ Ya existe un AFT con ese rótulo");
      } else {
        toast.error(errorMessage || "✗ Error al crear el AFT");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Rótulo
        </label>
        <input
          value={rotulo}
          onChange={(e) => setRotulo(e.target.value)}
          placeholder="Ej: MB001"
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nombre
        </label>
        <input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Nombre del AFT"
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Área
        </label>
        <select
          value={areaId ?? ""}
          onChange={(e) =>
            setAreaId(e.target.value ? Number(e.target.value) : undefined)
          }
          required
          disabled={loadingAreas}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        >
          <option value="">
            {loadingAreas ? "Cargando áreas..." : "Seleccionar área"}
          </option>
          {areasData?.areasActivas?.map((area) => (
            <option key={area.id} value={area.id}>
              {area.nombre}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Subclasificación
        </label>
        <select
          value={subclasificacionId ?? ""}
          onChange={(e) =>
            setSubclasificacionId(
              e.target.value ? Number(e.target.value) : undefined
            )
          }
          required
          disabled={loadingSub}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        >
          <option value="">
            {loadingSub
              ? "Cargando subclasificaciones..."
              : "Seleccionar subclasificación"}
          </option>
          {subData?.subclasificacionesActivas?.map((s) => (
            <option key={s.id} value={s.id}>
              {s.nombre}
            </option>
          ))}
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
          {loading ? "Creando..." : "Crear AFT"}
        </button>
      </div>
    </form>
  );
}