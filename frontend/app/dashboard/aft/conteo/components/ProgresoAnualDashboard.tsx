"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@apollo/client/react";
import { Calendar, CheckCircle, History } from "lucide-react";
import { toast } from "sonner";
import { PlanConteoAnual } from "../types/conteo.types";
import { FINALIZAR_PLAN } from "../graphql/finalizarPlan";
import ExportarPlanAnualButton from "./ExportarPlanAnualButton";
import MesCard from "./MesCard";

interface Props {
  plan: PlanConteoAnual;
  onVerHistorial: () => void;
  onRefetch: () => void;
}

export default function ProgresoAnualDashboard({ plan, onVerHistorial, onRefetch }: Props) {
  const router = useRouter();
  const [openFinalizarModal, setOpenFinalizarModal] = useState(false);
  const [motivoFinalizacion, setMotivoFinalizacion] = useState("");

  const meses = [...plan.asignacionesMensuales].sort((a, b) => a.mes - b.mes);

  const [finalizarPlan, { loading: loadingFinalizar }] = useMutation(FINALIZAR_PLAN, {
    onCompleted: () => {
      toast.success("✓ Plan finalizado correctamente");
      setOpenFinalizarModal(false);
      onRefetch();
    },
    onError: (err) => {
      toast.error(err.message || "Error al finalizar plan");
    },
  });

  const handleFinalizarPlan = async () => {
    await finalizarPlan({
      variables: {
        planId: plan.id,
        motivo: motivoFinalizacion.trim() || undefined,
      },
    });
  };

  const handleMesClick = (mesId: number) => {
    router.push(`/dashboard/aft/conteo/mes/${mesId}`);
  };

  // FIX: Case-insensitive comparison
  const planCompletado = plan.estado.toLowerCase() === 'completado';

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
          <button
            onClick={onVerHistorial}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2 shadow-lg transition"
          >
            <History size={20} />
            Ver Planes Anteriores
          </button>

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

      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Resumen General
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <p className="text-xs text-blue-600 font-medium mb-1">Total AFT</p>
              <p className="text-2xl font-bold text-blue-900">{plan.totalActivos}</p>
            </div>

            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <p className="text-xs text-green-600 font-medium mb-1">Contados</p>
              <p className="text-2xl font-bold text-green-900">{plan.activosContados}</p>
            </div>

            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
              <p className="text-xs text-yellow-600 font-medium mb-1">Faltantes</p>
              <p className="text-2xl font-bold text-yellow-900">{plan.activosFaltantes}</p>
            </div>

            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <p className="text-xs text-purple-600 font-medium mb-1">Discrepancias</p>
              <p className="text-2xl font-bold text-purple-900">{plan.activosConDiscrepancias}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-2">
              <Calendar size={20} />
              Calendario de Conteo
            </h2>
            <p className="text-sm text-gray-600">
              Seleccione un mes para empezar
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {meses.map((mes) => (
              <MesCard 
                key={mes.id}
                mes={mes}
                onClick={() => handleMesClick(mes.id)}
              />
            ))}
          </div>
        </div>
      </div>

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