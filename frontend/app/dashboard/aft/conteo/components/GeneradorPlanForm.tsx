"use client";

import { useState } from "react";
import { useMutation, useQuery, useApolloClient } from "@apollo/client/react";
import { toast } from "sonner";
import { GENERAR_PLAN_CONTEO } from "../graphql/generarPlanConteo";
import { GET_PLAN_ACTUAL } from "../graphql/getPlanActual";
import { GET_ME, GetMeResponse } from "../graphql/getMe";

interface Props {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function GeneradorPlanForm({ onSuccess, onCancel }: Props) {
  const [anno, setAnno] = useState(new Date().getFullYear() + 1);
  const [observaciones, setObservaciones] = useState("");

  const apolloClient = useApolloClient();
  const { data: userData, loading: loadingUser } = useQuery<GetMeResponse>(GET_ME);

  const [generarPlan, { loading }] = useMutation(GENERAR_PLAN_CONTEO, {
    refetchQueries: [{ query: GET_PLAN_ACTUAL }],
    awaitRefetchQueries: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (anno < 2020 || anno > 2100) {
      toast.error("Año inválido");
      return;
    }

    if (!userData?.me?.id) {
      toast.error("Debe iniciar sesión para generar un plan");
      return;
    }

    try {
      const result = await generarPlan({
        variables: {
          input: {
            anno,
            userId: userData.me.id,
            observaciones: observaciones.trim() || undefined,
          },
        },
      });

      if (result.error) {
        toast.error(result.error.message || "No se pudo generar el plan");
        return;
      }

      await apolloClient.refetchQueries({
        include: [GET_PLAN_ACTUAL],
      });

      toast.success("Plan de conteo generado correctamente");
      onSuccess();
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Error al generar plan";
      toast.error(errorMessage);
    }
  };

  if (loadingUser) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

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
          disabled={loading || loadingUser}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
            loading || loadingUser
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