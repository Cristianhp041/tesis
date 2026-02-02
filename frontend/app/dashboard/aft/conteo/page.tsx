"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { Plus, Calendar, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { GET_PLAN_ACTUAL } from "./graphql/getPlanActual";
import { FINALIZAR_PLAN } from "./graphql/finalizarPlan";
import { PlanConteoAnual } from "./types/conteo.types";
import ProgresoAnualDashboard from "./components/ProgresoAnualDashboard";
import GeneradorPlanForm from "./components/GeneradorPlanForm";
import ExportarPlanAnualButton from "./components/ExportarPlanAnualButton"; 

export default function ConteoPage() {
  const [openCrearPlan, setOpenCrearPlan] = useState(false);
  const [openFinalizarModal, setOpenFinalizarModal] = useState(false);
  const [motivoFinalizacion, setMotivoFinalizacion] = useState("");

  const { data, loading, error, refetch } = useQuery<{ planConteoActual: PlanConteoAnual }>(
    GET_PLAN_ACTUAL,
    {
      fetchPolicy: "cache-and-network",
      notifyOnNetworkStatusChange: false,
    }
  );

  const [finalizarPlan, { loading: loadingFinalizar }] = useMutation(FINALIZAR_PLAN, {
    onCompleted: () => {
      toast.success("✅ Plan finalizado correctamente");
      setOpenFinalizarModal(false);
      refetch();
    },
    onError: (err) => {
      toast.error(err.message || "Error al finalizar plan");
    },
  });

  const handleFinalizarPlan = async () => {
    if (!data?.planConteoActual) return;

    await finalizarPlan({
      variables: {
        planId: data.planConteoActual.id,
        motivo: motivoFinalizacion.trim() || undefined,
      },
    });
  };

  if (loading && !data) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !data?.planConteoActual) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <div className="max-w-md mx-auto">
            <Calendar size={64} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              No hay plan de conteo activo
            </h2>
            <p className="text-gray-600 mb-6">
              Genera un nuevo plan anual para comenzar el conteo cíclico
            </p>
            <button
              onClick={() => setOpenCrearPlan(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 mx-auto shadow-lg transition"
            >
              <Plus size={20} />
              Generar Plan Anual
            </button>
          </div>
        </div>

        {openCrearPlan && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Generar Plan de Conteo
              </h3>
              <GeneradorPlanForm
                onSuccess={() => {
                  setOpenCrearPlan(false);
                  refetch();
                }}
                onCancel={() => setOpenCrearPlan(false)}
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  const plan = data.planConteoActual;
  const planCompletado = plan.estado === 'completado';

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Plan de conteo anual
          </h1>
          <p className="text-slate-500 mt-1">
            Septiembre {plan.anno - 1} - Junio {plan.anno}
          </p>
        </div>

        <div className="flex gap-3">
          <ExportarPlanAnualButton planId={plan.id} planAnno={plan.anno} />

          {!planCompletado && (
            <button
              onClick={() => setOpenFinalizarModal(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 shadow-lg transition"
            >
              <CheckCircle size={20} />
              Finalizar Plan
            </button>
          )}
        </div>
      </div>

      {planCompletado && (
        <div className="bg-green-50 border-2 border-green-300 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-3">
            <CheckCircle size={24} className="text-green-600" />
            <div>
              <p className="font-semibold text-green-900">Plan Finalizado</p>
              <p className="text-sm text-green-700">
                Este plan ha sido completado. No se pueden realizar más cambios.
              </p>
            </div>
          </div>
        </div>
      )}

      <ProgresoAnualDashboard plan={plan} />

      {openFinalizarModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Finalizar Plan de Conteo
            </h3>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-yellow-800">
                ⚠️ Esta acción cerrará permanentemente el plan. Solo se puede finalizar si todos los meses están confirmados.
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Motivo de finalización (opcional)
              </label>
              <textarea
                value={motivoFinalizacion}
                onChange={(e) => setMotivoFinalizacion(e.target.value)}
                placeholder="Ej: Conteo anual completado satisfactoriamente"
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setOpenFinalizarModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition"
              >
                Cancelar
              </button>

              <button
                onClick={handleFinalizarPlan}
                disabled={loadingFinalizar}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                  loadingFinalizar
                    ? "bg-blue-300 cursor-not-allowed text-white"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                {loadingFinalizar ? "Finalizando..." : "Finalizar Plan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}