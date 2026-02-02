"use client";

import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { REGISTRAR_CONTEO } from "../graphql/registrarConteo";
import { GET_ACTIVOS_DEL_MES } from "../graphql/getActivosDelMes";
import { GET_REGISTROS_DEL_MES } from "../graphql/getRegistrosDelMes";
import { ActivoDelMes } from "../types/conteo.types";

interface Props {
  open: boolean;
  activo: ActivoDelMes;
  asignacionId: number;
  onClose: () => void;
}

export default function RegistrarConteoModal({
  open,
  activo,
  asignacionId,
  onClose,
}: Props) {
  const [encontrado, setEncontrado] = useState(true);
  const [ubicacion, setUbicacion] = useState("");
  const [estado, setEstado] = useState("");
  const [area, setArea] = useState("");
  const [comentarios, setComentarios] = useState("");

  const [registrarConteo, { loading }] = useMutation(REGISTRAR_CONTEO, {
    refetchQueries: [
      { query: GET_ACTIVOS_DEL_MES, variables: { asignacionId } },
      { query: GET_REGISTROS_DEL_MES, variables: { asignacionMensualId: asignacionId } },
    ],
  });

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const result = await registrarConteo({
        variables: {
          input: {
            asignacionMensualId: asignacionId,
            aftId: activo.id,
            encontrado,
            ubicacionEncontrada: encontrado ? ubicacion.trim() || undefined : undefined,
            estadoEncontrado: encontrado ? estado.trim() || undefined : undefined,
            areaEncontrada: encontrado ? area.trim() || undefined : undefined,
            comentarios: comentarios.trim() || undefined,
          },
        },
      });

      if (result.error) {
        let errorMessage = "";
        const err = result.error as unknown as Record<string, unknown>;

        if (typeof err.message === "string") {
          errorMessage = err.message;
        }

        if (!errorMessage && "graphQLErrors" in err && Array.isArray(err.graphQLErrors)) {
          const graphQLErrors = err.graphQLErrors as unknown as Array<Record<string, unknown>>;
          if (graphQLErrors.length > 0 && typeof graphQLErrors[0].message === "string") {
            errorMessage = graphQLErrors[0].message;
          }
        }

        toast.error(errorMessage || "✗ No se pudo registrar el conteo");
        return;
      }

      toast.success("✓ Conteo registrado correctamente");
      onClose();
    } catch (error) {
      let errorMessage = "";

      if (error instanceof Error) {
        errorMessage = error.message;
      }

      if (!errorMessage && typeof error === "object" && error !== null && "graphQLErrors" in error) {
        const err = error as unknown as { graphQLErrors?: Array<{ message?: string }> };
        if (err.graphQLErrors && err.graphQLErrors.length > 0) {
          errorMessage = err.graphQLErrors[0].message || "";
        }
      }

      toast.error(errorMessage || "✗ Error al registrar conteo");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-800">Registrar Conteo</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <p className="text-sm font-medium text-blue-900">
            {activo.codigo} - {activo.descripcion}
          </p>
          <p className="text-xs text-blue-700">
            Área: {activo.areaNombre} | Subclasificación: {activo.subclasificacionNombre}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ¿Se encontró el activo?
            </label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setEncontrado(true)}
                className={`flex-1 py-2 px-4 rounded-lg border-2 font-medium transition ${
                  encontrado
                    ? "border-green-500 bg-green-50 text-green-700"
                    : "border-gray-300 bg-white text-gray-600"
                }`}
              >
                Sí, encontrado
              </button>
              <button
                type="button"
                onClick={() => setEncontrado(false)}
                className={`flex-1 py-2 px-4 rounded-lg border-2 font-medium transition ${
                  !encontrado
                    ? "border-red-500 bg-red-50 text-red-700"
                    : "border-gray-300 bg-white text-gray-600"
                }`}
              >
                No, faltante
              </button>
            </div>
          </div>

          {encontrado && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ubicación encontrada
                </label>
                <input
                  type="text"
                  value={ubicacion}
                  onChange={(e) => setUbicacion(e.target.value)}
                  placeholder="Ej: Oficina 201"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado encontrado
                </label>
                <input
                  type="text"
                  value={estado}
                  onChange={(e) => setEstado(e.target.value)}
                  placeholder="Ej: Buen estado"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Área encontrada
                </label>
                <input
                  type="text"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="Nombre del área"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Comentarios adicionales (opcional)
            </label>
            <textarea
              value={comentarios}
              onChange={(e) => setComentarios(e.target.value)}
              placeholder="Observaciones..."
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
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
              {loading ? "Registrando..." : "Registrar Conteo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}