"use client";

import React, { JSX } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@apollo/client/react";
import { PlanConteoAnual, AsignacionMensual } from "../types/conteo.types";
import { Calendar, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { GET_CANTIDAD_AFTS_DESACTIVADOS } from "../graphql/getCantidadAftsDesactivados";

interface Props {
  plan: PlanConteoAnual;
}

export default function ProgresoAnualDashboard({ plan }: Props) {
  const router = useRouter();
  const meses = [...plan.asignacionesMensuales].sort((a, b) => a.mes - b.mes);

  const getEstadoColor = (confirmado: boolean, porcentaje: number) => {
    if (confirmado) {
      return "bg-green-100 text-green-800 border-green-300";
    }
    
    if (porcentaje > 0) {
      return "bg-blue-100 text-blue-800 border-blue-200";
    }
    
    return "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getEstadoIcon = (confirmado: boolean, porcentaje: number): JSX.Element => {
    if (confirmado) {
      return <CheckCircle size={16} className="text-green-600" />;
    }
    
    if (porcentaje > 0) {
      return <Clock size={16} className="text-blue-600" />;
    }
    
    return <AlertCircle size={16} className="text-gray-600" />;
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              getEstadoColor={getEstadoColor}
              getEstadoIcon={getEstadoIcon}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface MesCardProps {
  mes: AsignacionMensual;
  onClick: () => void;
  getEstadoColor: (confirmado: boolean, porcentaje: number) => string;
  getEstadoIcon: (confirmado: boolean, porcentaje: number) => JSX.Element;
}

function MesCard({ 
  mes, 
  onClick, 
  getEstadoColor, 
  getEstadoIcon 
}: MesCardProps) {
  const { data } = useQuery<{ cantidadAftsDesactivados: number }>(
    GET_CANTIDAD_AFTS_DESACTIVADOS,
    {
      variables: { asignacionId: mes.id },
      fetchPolicy: "cache-first",
    }
  );

  const aftsDesactivados = data?.cantidadAftsDesactivados || 0;
  const totalEfectivo = mes.activosContados + aftsDesactivados;
  const porcentajeAjustado = mes.cantidadAsignada > 0 
    ? Math.round((totalEfectivo / mes.cantidadAsignada) * 100)
    : 0;

  const confirmado = mes.confirmadoConteo || false;

  return (
    <button
      onClick={onClick}
      className={`border-2 rounded-lg p-3 transition hover:shadow-lg cursor-pointer ${getEstadoColor(confirmado, porcentajeAjustado)} hover:scale-105`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold">{mes.nombreMes}</span>
        {getEstadoIcon(confirmado, porcentajeAjustado)}
      </div>

      <p className="text-xs text-gray-600 mb-1">
        {mes.activosContados} / {mes.cantidadAsignada}
      </p>

      <div className="w-full bg-white/50 rounded-full h-1.5">
        <div
          className={`h-1.5 rounded-full ${
            confirmado ? 'bg-green-600' : 'bg-current'
          }`}
          style={{ width: `${Math.min(porcentajeAjustado, 100)}%` }}
        />
      </div>
    </button>
  );
}