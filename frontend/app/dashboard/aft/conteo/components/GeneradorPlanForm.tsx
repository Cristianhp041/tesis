"use client";

import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { toast } from "sonner";
import { GENERAR_PLAN_CONTEO } from "../graphql/generarPlanConteo";
import { GET_PLAN_ACTUAL } from "../graphql/getPlanActual";

interface Props {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function GeneradorPlanForm({ onSuccess, onCancel }: Props) {
  const [anno, setAnno] = useState(new Date().getFullYear() + 1);
  const [observaciones, setObservaciones] = useState("");

  const [generarPlan, { loading }] = useMutation(GENERAR_PLAN_CONTEO, {
    refetchQueries: [{ query: GET_PLAN_ACTUAL }],
  });

  const userId = 1; 

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (anno < 2020 || anno > 2100) {
      toast.error("✗ Año inválido");
      return;
    }

    if (!userId) {
      toast.error("✗ Debe iniciar sesión para generar un plan");
      return;
    }

    try {
      const result = await generarPlan({
        variables: {
          input: {
            anno,
            userId, 
            observaciones: observaciones.trim() || undefined,
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

        toast.error(errorMessage || "✗ No se pudo generar el plan");
        return;
      }

      toast.success("✓ Plan de conteo generado correctamente");
      onSuccess();
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

      toast.error(errorMessage || "✗ Error al generar plan");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Año del plan
        </label>
        <input
          type="number"
          value={anno}
          onChange={(e) => setAnno(Number(e.target.value))}
          min={2020}
          max={2100}
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
        <p className="text-xs text-gray-500 mt-1">
          El plan abarcará desde septiembre {anno - 1} hasta junio {anno}
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Observaciones (opcional)
        </label>
        <textarea
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
          placeholder="Notas adicionales sobre el plan"
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
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
          {loading ? "Generando..." : "Generar Plan"}
        </button>
      </div>
    </form>
  );
}