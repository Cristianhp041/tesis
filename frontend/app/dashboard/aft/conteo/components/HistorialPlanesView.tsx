"use client";

import { useQuery } from "@apollo/client/react";
import { Calendar, CheckCircle, Clock, Plus, ArrowLeft } from "lucide-react";
import { LISTAR_PLANES_CONTEO } from "../graphql/listarPlanes";
import { PlanConteoAnual } from "../types/conteo.types";
import ExportarPlanAnualButton from "./ExportarPlanAnualButton";

interface Props {
  onCrearNuevo: () => void;
  onVolverAlPlan?: () => void;
}

export default function HistorialPlanesView({ onCrearNuevo, onVolverAlPlan }: Props) {
  const { data, loading } = useQuery<{ listarPlanesConteo: PlanConteoAnual[] }>(
    LISTAR_PLANES_CONTEO,
    {
      fetchPolicy: "no-cache",
    }
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // FIX: Case-insensitive comparison
  const planesCompletados = data?.listarPlanesConteo.filter(
    (p) => p.estado.toLowerCase() === "completado"
  ) || [];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Planes de Conteo
          </h1>
          <p className="text-slate-500 mt-1">
            Historial de planes completados y creación de nuevos planes
          </p>
        </div>

        <div className="flex gap-3">
          {onVolverAlPlan && (
            <button
              onClick={onVolverAlPlan}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2 shadow-lg transition"
            >
              <ArrowLeft size={20} />
              Volver al Plan Activo
            </button>
          )}

          <button
            onClick={onCrearNuevo}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 shadow-lg transition"
          >
            <Plus size={20} />
            Generar Nuevo Plan
          </button>
        </div>
      </div>

      {planesCompletados.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <Calendar size={64} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            No hay planes completados
          </h2>
          <p className="text-gray-600 mb-6">
            Los planes finalizados aparecerán aquí para consulta y descarga
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {planesCompletados.map((plan) => (
            <div
              key={plan.id}
              className="bg-white rounded-xl shadow-md border hover:shadow-lg transition p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div className="bg-green-100 p-3 rounded-xl">
                    <CheckCircle size={32} className="text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">
                      Plan {plan.anno}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {new Date(plan.fechaInicio).toLocaleDateString("es-ES", {
                        month: "long",
                        year: "numeric",
                      })}{" "}
                      -{" "}
                      {new Date(plan.fechaFin).toLocaleDateString("es-ES", {
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock size={14} className="text-gray-400" />
                      <p className="text-xs text-gray-500">
                        Completado el{" "}
                        {new Date(plan.createdAt).toLocaleDateString("es-ES")}
                      </p>
                    </div>
                  </div>
                </div>

                <ExportarPlanAnualButton
                  planId={plan.id}
                  planAnno={plan.anno}
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                  <p className="text-xs text-blue-600 font-medium mb-1">
                    Total AFT
                  </p>
                  <p className="text-xl font-bold text-blue-900">
                    {plan.totalActivos}
                  </p>
                </div>

                <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                  <p className="text-xs text-green-600 font-medium mb-1">
                    Contados
                  </p>
                  <p className="text-xl font-bold text-green-900">
                    {plan.activosContados}
                  </p>
                </div>

                <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-200">
                  <p className="text-xs text-emerald-600 font-medium mb-1">
                    Encontrados
                  </p>
                  <p className="text-xl font-bold text-emerald-900">
                    {plan.activosEncontrados}
                  </p>
                </div>

                <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                  <p className="text-xs text-red-600 font-medium mb-1">
                    Faltantes
                  </p>
                  <p className="text-xl font-bold text-red-900">
                    {plan.activosFaltantes}
                  </p>
                </div>

                <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                  <p className="text-xs text-purple-600 font-medium mb-1">
                    Discrepancias
                  </p>
                  <p className="text-xl font-bold text-purple-900">
                    {plan.activosConDiscrepancias}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    Progreso completado
                  </span>
                  <span className="text-sm font-bold text-green-600">
                    {plan.porcentajeProgreso}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className="h-2 rounded-full bg-green-600"
                    style={{ width: `${plan.porcentajeProgreso}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}