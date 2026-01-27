"use client";

import { X } from "lucide-react";
import { useQuery } from "@apollo/client/react";
import { GET_AFT_HISTORIAL } from "../graphql/getAftHistorial";
import { AftHistorial } from "../types/aftHistorial";

type Props = {
  open: boolean;
  aftId: number;
  onClose: () => void;
};

type HistorialQuery = {
  aft: {
    historial: AftHistorial[];
  };
};

export default function AftHistorialModal({
  open,
  aftId,
  onClose,
}: Props) {
  const { data, loading } = useQuery<HistorialQuery>(GET_AFT_HISTORIAL, {
    variables: { id: aftId },
    skip: !open,
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-800">
            Historial del AFT
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {loading && (
            <p className="text-sm text-gray-500">
              Cargando historial…
            </p>
          )}

          {!loading && data?.aft.historial.length === 0 && (
            <p className="text-sm text-gray-500">
              No hay movimientos registrados.
            </p>
          )}

          {data?.aft.historial.map((h) => (
            <div
              key={h.id}
              className="border border-gray-200 rounded-xl p-3 bg-gray-50"
            >
              <p className="text-sm text-gray-800">
                {h.descripcion}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(h.fecha).toLocaleString()}
              </p>
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm font-medium"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
