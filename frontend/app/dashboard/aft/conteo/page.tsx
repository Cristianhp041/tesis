"use client";

import { useState } from "react";
import { useQuery } from "@apollo/client/react";
import { GET_PLAN_ACTUAL } from "./graphql/getPlanActual";
import { PlanConteoAnual } from "./types/conteo.types";
import ProgresoAnualDashboard from "./components/ProgresoAnualDashboard";
import GeneradorPlanForm from "./components/GeneradorPlanForm";
import HistorialPlanesView from "./components/HistorialPlanesView";

export default function ConteoPage() {
  const [openCrearPlan, setOpenCrearPlan] = useState(false);
  const [verHistorial, setVerHistorial] = useState(false);

  const { data, loading, refetch } = useQuery<{ planConteoActual: PlanConteoAnual }>(
    GET_PLAN_ACTUAL,
    {
      fetchPolicy: "no-cache",
      notifyOnNetworkStatusChange: true,
    }
  );

  const handlePlanCreado = async () => {
    setOpenCrearPlan(false);
    setVerHistorial(false);
    
    await new Promise(resolve => setTimeout(resolve, 500));
    await refetch();
  };

  const handleVolverAlPlan = () => {
    setVerHistorial(false);
  };

  if (loading && !data) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // FIX: Case-insensitive comparison for plan state
  const hayPlanActivo = data?.planConteoActual && 
    (data.planConteoActual.estado.toLowerCase() === 'planificado' || 
     data.planConteoActual.estado.toLowerCase() === 'en_curso');

  if (!hayPlanActivo || verHistorial) {
    return (
      <>
        <HistorialPlanesView
          onCrearNuevo={() => {
            setVerHistorial(false);
            setOpenCrearPlan(true);
          }}
          onVolverAlPlan={hayPlanActivo ? handleVolverAlPlan : undefined}
        />

        {openCrearPlan && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Generar Plan de Conteo
              </h3>
              <GeneradorPlanForm
                onSuccess={handlePlanCreado}
                onCancel={() => setOpenCrearPlan(false)}
              />
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <ProgresoAnualDashboard 
      plan={data.planConteoActual} 
      onVerHistorial={() => setVerHistorial(true)}
      onRefetch={refetch}
    />
  );
}