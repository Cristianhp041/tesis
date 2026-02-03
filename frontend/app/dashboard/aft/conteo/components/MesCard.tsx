"use client";

import { useQuery } from "@apollo/client/react";
import { CheckCircle, AlertCircle, Clock } from "lucide-react";
import { AsignacionMensual } from "../types/conteo.types";
import { GET_CANTIDAD_AFTS_DESACTIVADOS } from "../graphql/getCantidadAftsDesactivados";

interface Props {
  mes: AsignacionMensual;
  onClick: () => void;
}

export default function MesCard({ mes, onClick }: Props) {
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

  const getEstadoColor = () => {
    if (confirmado) {
      return "bg-green-100 text-green-800 border-green-300";
    }
    
    if (porcentajeAjustado > 0) {
      return "bg-blue-100 text-blue-800 border-blue-200";
    }
    
    return "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getEstadoIcon = () => {
    if (confirmado) {
      return <CheckCircle size={16} className="text-green-600" />;
    }
    
    if (porcentajeAjustado > 0) {
      return <Clock size={16} className="text-blue-600" />;
    }
    
    return <AlertCircle size={16} className="text-gray-600" />;
  };

  return (
    <button
      onClick={onClick}
      className={`border-2 rounded-lg p-3 transition hover:shadow-lg cursor-pointer ${getEstadoColor()} hover:scale-105`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold">{mes.nombreMes}</span>
        {getEstadoIcon()}
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