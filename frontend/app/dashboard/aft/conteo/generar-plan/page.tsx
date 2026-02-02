"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Calendar, CheckCircle, Info } from "lucide-react";
import GeneradorPlanForm from "../components/GeneradorPlanForm";

export default function GenerarPlanPage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push("/dashboard/aft/conteo");
  };

  const handleCancel = () => {
    router.push("/dashboard/aft/conteo");
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => router.push("/dashboard/aft/conteo")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 transition"
        >
          <ArrowLeft size={20} />
          <span>Volver al dashboard</span>
        </button>

        <div className="flex items-center gap-3 mb-2">
          <div className="bg-blue-100 p-3 rounded-xl">
            <Calendar size={32} className="text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              Generar Plan de Conteo Anual
            </h1>
            <p className="text-slate-500">
              Sistema de distribución automática en 10 meses
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 p-6 mb-6">
        <div className="flex items-start gap-3 mb-4">
          <Info size={24} className="text-blue-600 mt-1 flex-shrink-0" />
          <div>
            <h2 className="text-lg font-bold text-blue-900 mb-2">
              ¿Cómo funciona el algoritmo de distribución?
            </h2>
            <p className="text-sm text-blue-800 mb-3">
              El sistema distribuye automáticamente todos los activos AFT en 10 meses
              balanceados, respetando la estructura organizacional:
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <div className="flex items-start gap-2">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                1
              </span>
              <div>
                <h3 className="font-semibold text-gray-800 text-sm mb-1">
                  Calcula el 10%
                </h3>
                <p className="text-xs text-gray-600">
                  Divide el total de activos en 10 partes iguales con tolerancia ±20%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <div className="flex items-start gap-2">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                2
              </span>
              <div>
                <h3 className="font-semibold text-gray-800 text-sm mb-1">
                  Agrupa por Área
                </h3>
                <p className="text-xs text-gray-600">
                  Organiza los activos según su área de origen
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <div className="flex items-start gap-2">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                3
              </span>
              <div>
                <h3 className="font-semibold text-gray-800 text-sm mb-1">
                  Subdivide por Subclasificación
                </h3>
                <p className="text-xs text-gray-600">
                  Mantiene juntos activos del mismo tipo
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <div className="flex items-start gap-2">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                4
              </span>
              <div>
                <h3 className="font-semibold text-gray-800 text-sm mb-1">
                  Distribuye y Valida
                </h3>
                <p className="text-xs text-gray-600">
                  Asigna bloques balanceados y verifica 100% sin duplicados
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg border p-8">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Configuración del Plan
          </h2>
          <p className="text-sm text-gray-600">
            Completa la información para generar el plan de conteo
          </p>
        </div>

        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex items-start gap-2">
            <Info size={18} className="text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-yellow-800">
                <strong>Período del plan:</strong> El plan generado abarcará desde{" "}
                <strong>septiembre del año anterior</strong> hasta{" "}
                <strong>junio del año seleccionado</strong>.
              </p>
              <p className="text-xs text-yellow-700 mt-1">
                Ejemplo: Si seleccionas 2025, el plan será de Sept 2024 a Jun 2025
              </p>
            </div>
          </div>
        </div>

        <GeneradorPlanForm onSuccess={handleSuccess} onCancel={handleCancel} />
      </div>

      <div className="mt-6 bg-white rounded-xl shadow-md border p-6">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <CheckCircle size={20} className="text-green-600" />
          Ejemplo de distribución
        </h3>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-gray-600 mb-1">Total de activos</p>
            <p className="text-2xl font-bold text-gray-800">500</p>
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-xs text-blue-600 mb-1">Meta por mes</p>
            <p className="text-2xl font-bold text-blue-900">50 activos</p>
            <p className="text-xs text-blue-600 mt-1">(10% del total)</p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <p className="text-xs text-gray-600 mb-2">Rango aceptable por mes:</p>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold">
              Min: 40
            </span>
            <div className="flex-1 h-2 bg-gradient-to-r from-orange-300 via-green-300 to-orange-300 rounded-full"></div>
            <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold">
              Max: 60
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Tolerancia: ±20% de la meta
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold text-gray-700 mb-3">
            Calendario de conteo (10 meses):
          </p>
          <div className="grid grid-cols-5 gap-2">
            {[
              { mes: "Sep", cantidad: 52, color: "bg-green-50 border-green-300" },
              { mes: "Oct", cantidad: 48, color: "bg-green-50 border-green-300" },
              { mes: "Nov", cantidad: 51, color: "bg-green-50 border-green-300" },
              { mes: "Dic", cantidad: 49, color: "bg-green-50 border-green-300" },
              { mes: "Ene", cantidad: 50, color: "bg-green-50 border-green-300" },
              { mes: "Feb", cantidad: 50, color: "bg-green-50 border-green-300" },
              { mes: "Mar", cantidad: 50, color: "bg-green-50 border-green-300" },
              { mes: "Abr", cantidad: 50, color: "bg-green-50 border-green-300" },
              { mes: "May", cantidad: 50, color: "bg-green-50 border-green-300" },
              { mes: "Jun", cantidad: 50, color: "bg-green-50 border-green-300" },
            ].map((item, idx) => (
              <div
                key={idx}
                className={`${item.color} border-2 rounded-lg p-3 text-center transition hover:shadow-md`}
              >
                <p className="text-xs font-bold text-gray-700 mb-1">{item.mes}</p>
                <p className="text-lg font-bold text-green-700">{item.cantidad}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-3 text-center">
            Total: 500 activos distribuidos (100%)
          </p>
        </div>
      </div>

      <div className="mt-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 p-6">
        <h3 className="font-bold text-green-900 mb-3">
          ✨ Ventajas del conteo cíclico
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex items-start gap-2">
            <CheckCircle size={18} className="text-green-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-green-800">
              Menos disruptivo que un conteo anual completo
            </p>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle size={18} className="text-green-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-green-800">
              Detecta discrepancias de manera temprana
            </p>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle size={18} className="text-green-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-green-800">
              Mantiene inventario actualizado constantemente
            </p>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle size={18} className="text-green-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-green-800">
              Distribución automática e inteligente
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}