"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import { toast } from "sonner";

import { UPDATE_AFT } from "../graphql/updateAft";
import { DESACTIVAR_AFT } from "../graphql/desactivarAft";
import { GET_AFTS } from "../graphql/getAfts";
import { GET_AREAS_ACTIVAS } from "../graphql/getAreasActivas";
import { GET_SUBCLASIFICACIONES_ACTIVAS } from "../graphql/getSubclasificacionesActivas";
import { Aft } from "../types/aft";

interface Props {
  aft: Aft;
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

type UpdateAftInput = {
  nombre?: string;
  rotulo?: string;
  areaId?: number;
  subclasificacionId?: number;
};

export default function EditarAftForm({ aft, onSuccess, onCancel }: Props) {
  const [rotulo, setRotulo] = useState(aft.rotulo);
  const [nombre, setNombre] = useState(aft.nombre);
  const [areaId, setAreaId] = useState<number | undefined>(aft.area?.id);
  const [subclasificacionId, setSubclasificacionId] = useState<number | undefined>(
    aft.subclasificacion?.id
  );
  const [activo, setActivo] = useState(aft.activo);

  const { data: areasData, loading: loadingAreas } = useQuery<{
    areasActivas: Area[];
  }>(GET_AREAS_ACTIVAS);

  const { data: subData, loading: loadingSub } = useQuery<{
    subclasificacionesActivas: Subclasificacion[];
  }>(GET_SUBCLASIFICACIONES_ACTIVAS);

  const original = useMemo(
    () => ({
      rotulo: aft.rotulo,
      nombre: aft.nombre,
      areaId: aft.area?.id,
      subclasificacionId: aft.subclasificacion?.id,
      activo: aft.activo,
    }),
    [aft]
  );

  const [updateAft, { loading: updating }] = useMutation(UPDATE_AFT, {
    refetchQueries: [{ query: GET_AFTS }],
  });

  const [desactivarAft, { loading: toggling }] = useMutation(DESACTIVAR_AFT, {
    refetchQueries: [{ query: GET_AFTS }],
  });

  const hayCambios =
    rotulo !== original.rotulo ||
    nombre !== original.nombre ||
    areaId !== original.areaId ||
    subclasificacionId !== original.subclasificacionId ||
    activo !== original.activo;

  const loading = updating || toggling;

  const handleToggleActivo = () => {
    if (!original.activo && !activo) {
      toast.error("✗ No se puede reactivar un AFT inactivo");
      return;
    }
    setActivo(!activo);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!hayCambios) {
      toast.info("ℹ No hay cambios para guardar");
      return;
    }

    if (!original.activo && activo) {
      toast.error("✗ No se puede reactivar un AFT inactivo");
      setActivo(original.activo);
      return;
    }

    if (!rotulo.trim() || !nombre.trim()) {
      toast.error("✗ Rótulo y nombre son obligatorios");
      return;
    }

    const data: UpdateAftInput = {};

    if (rotulo !== original.rotulo) data.rotulo = rotulo;
    if (nombre !== original.nombre) data.nombre = nombre;
    if (areaId !== original.areaId) data.areaId = areaId;
    if (subclasificacionId !== original.subclasificacionId)
      data.subclasificacionId = subclasificacionId;

    try {
      if (Object.keys(data).length > 0) {
        const result = await updateAft({
          variables: { id: aft.id, data },
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
            toast.error(errorMessage || "✗ No se pudieron guardar los cambios");
          }

          setRotulo(original.rotulo);
          setNombre(original.nombre);
          setAreaId(original.areaId);
          setSubclasificacionId(original.subclasificacionId);
          setActivo(original.activo);
          return;
        }
      }

      if (activo !== original.activo) {
        const result = await desactivarAft({
          variables: { id: aft.id },
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

          toast.error(errorMessage || "✗ No se pudo cambiar el estado");
          setActivo(original.activo);
          return;
        }
      }

      toast.success("✓ AFT actualizado correctamente");
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
        toast.error(errorMessage || "✗ No se pudieron guardar los cambios");
      }

      setRotulo(original.rotulo);
      setNombre(original.nombre);
      setAreaId(original.areaId);
      setSubclasificacionId(original.subclasificacionId);
      setActivo(original.activo);
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
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          placeholder="Ej: MB001"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nombre
        </label>
        <input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          placeholder="Nombre del AFT"
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

      <div className="flex items-center justify-between">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Estado
          </label>
          <p className="text-xs text-gray-500">
            {original.activo 
              ? "No estará disponible para nuevas asignaciones si está inactivo"
              : "⚠️ Un AFT inactivo no puede ser reactivado"}
          </p>
        </div>

        <button
          type="button"
          onClick={handleToggleActivo}
          disabled={!original.activo}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            activo ? "bg-green-500" : "bg-gray-300"
          } ${!original.activo ? "opacity-50 cursor-not-allowed" : ""}`}
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