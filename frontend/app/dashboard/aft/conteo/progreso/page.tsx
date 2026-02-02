"use client";

import { useRouter } from "next/navigation";
import { PlanConteoAnual } from "../types/conteo.types";
import { Calendar, CheckCircle, AlertCircle, Clock } from "lucide-react";

interface Props {
  plan: PlanConteoAnual;
}

export default function ProgresoAnualDashboard({ plan }: Props) {
  const router = useRouter();
  const meses = [...plan.asignacionesMensuales].sort((a, b) => a.mes - b.mes);

  const getEstadoColor = (estado: string, porcentaje: number) => {
    if (porcentaje >= 100) {
      return "bg-green-100 text-green-800 border-green-300";
    }
    
    switch (estado) {
      case "completado":
      case "cerrado":
        return "bg-green-100 text-green-800 border-green-300";
      case "en_proceso":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "pendiente":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getEstadoIcon = (estado: string, porcentaje: number) => {
    if (porcentaje >= 100) {
      return <CheckCircle size={16} className="text-green-600" />;
    }
    
    switch (estado) {
      case "completado":
      case "cerrado":
        return <CheckCircle size={16} className="text-green-600" />;
      case "en_proceso":
        return <Clock size={16} className="text-blue-600" />;
      case "pendiente":
        return <AlertCircle size={16} className="text-gray-600" />;
      default:
        return null;
    }
  };

  const handleMesClick = (mesId: number) => {
    router.push(`/dashboard/aft/conteo/mes/${mesId}`);
  };

  return (
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
            <button
              key={mes.id}
              onClick={() => handleMesClick(mes.id)}
              className={`border-2 rounded-lg p-3 transition hover:shadow-lg cursor-pointer ${getEstadoColor(mes.estado, mes.porcentajeProgreso)} hover:scale-105`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold">{mes.nombreMes}</span>
                {getEstadoIcon(mes.estado, mes.porcentajeProgreso)}
              </div>

              <p className="text-xs text-gray-600 mb-1">
                {mes.activosContados} / {mes.cantidadAsignada}
              </p>

              <div className="w-full bg-white/50 rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full ${
                    mes.porcentajeProgreso >= 100 ? 'bg-green-600' : 'bg-current'
                  }`}
                  style={{ width: `${mes.porcentajeProgreso}%` }}
                />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}