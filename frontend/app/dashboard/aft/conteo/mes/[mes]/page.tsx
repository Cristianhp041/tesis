"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "@apollo/client/react";
import { ArrowLeft, Check, Ban } from "lucide-react";
import { toast } from "sonner";
import { GET_ASIGNACION_MENSUAL } from "../../graphql/getAsignacionMensual";
import { GET_ACTIVOS_DEL_MES } from "../../graphql/getActivosDelMes";
import { GET_REGISTROS_DEL_MES } from "../../graphql/getRegistrosDelMes";
import { CONFIRMAR_CONTEO_MENSUAL } from "../../graphql/ConfirmarConteoMensual";
import { GET_ME, GetMeResponse } from "../../graphql/getMe";
import { AsignacionMensual, ActivoDelMes, RegistroConteo } from "../../types/conteo.types";
import ConteoMensualTable from "../../components/ConteoMensualTable";
import ConfirmarConteoModal from "../../components/ConfirmarConteoModal";

export default function ConteoMensualPage() {
  const params = useParams();
  const router = useRouter();
  const asignacionId = Number(params.mes);

  const [search, setSearch] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const { data: userData, loading: loadingUser } = useQuery<GetMeResponse>(GET_ME);

  const { data: asignacionData, loading: loadingAsignacion, error: errorAsignacion } = useQuery<{
    asignacionMensual: AsignacionMensual;
  }>(GET_ASIGNACION_MENSUAL, {
    variables: { id: asignacionId },
    skip: !asignacionId || isNaN(asignacionId),
  });

  const { data: activosData, loading: loadingActivos, error: errorActivos } = useQuery<{
    activosDelMes: ActivoDelMes[];
  }>(GET_ACTIVOS_DEL_MES, {
    variables: { asignacionId },
    skip: !asignacionId || isNaN(asignacionId),
  });

  const { data: registrosData } = useQuery<{
    registrosConteoPorMes: RegistroConteo[];
  }>(GET_REGISTROS_DEL_MES, {
    variables: { asignacionMensualId: asignacionId },
    skip: !asignacionId || isNaN(asignacionId),
  });

  const [confirmarConteo, { loading: loadingConfirmar }] = useMutation(CONFIRMAR_CONTEO_MENSUAL, {
    refetchQueries: [
      { query: GET_ASIGNACION_MENSUAL, variables: { id: asignacionId } },
    ],
    awaitRefetchQueries: true,
    onCompleted: () => {
      toast.success("✓ Conteo confirmado exitosamente");
      setShowConfirmModal(false);
    },
    onError: (error) => {
      toast.error(error.message || "Error al confirmar el conteo");
    },
  });


  const aftsDesactivados = useMemo(() => {
    if (!activosData?.activosDelMes) return [];
    return activosData.activosDelMes.filter(a => a.activo === false);
  }, [activosData]);

  const cantidadAftsDesactivados = aftsDesactivados.length;

  const progresoAjustado = useMemo(() => {
    if (!asignacionData?.asignacionMensual) return 0;
    const mes = asignacionData.asignacionMensual;
    const totalEfectivo = mes.activosContados + cantidadAftsDesactivados;
    if (mes.cantidadAsignada === 0) return 0;
    return Math.round((totalEfectivo / mes.cantidadAsignada) * 100);
  }, [asignacionData, cantidadAftsDesactivados]);

  const estaTodoContadoAjustado = useMemo(() => {
    if (!asignacionData?.asignacionMensual) return false;
    const mes = asignacionData.asignacionMensual;
    const totalEfectivo = mes.activosContados + cantidadAftsDesactivados;
    return totalEfectivo >= mes.cantidadAsignada && mes.cantidadAsignada > 0;
  }, [asignacionData, cantidadAftsDesactivados]);

  const activosFiltrados = useMemo(() => {
    let filtered = activosData?.activosDelMes || [];

    if (search) {
      filtered = filtered.filter(
        (a) =>
          a.codigo.toLowerCase().includes(search.toLowerCase()) ||
          a.descripcion.toLowerCase().includes(search.toLowerCase())
      );
    }

    return filtered;
  }, [activosData, search]);

  const handleOpenConfirmModal = () => {
    if (!estaTodoContadoAjustado) {
      toast.error("Primero debe contar todos los activos activos");
      return;
    }
    
    if (!userData?.me?.email) {
      toast.error("No se pudo obtener la información del usuario");
      return;
    }
    
    setShowConfirmModal(true);
  };

  const handleConfirmarConteo = async () => {
    if (!userData?.me?.email) {
      toast.error("No se pudo obtener el usuario actual. Por favor, recargue la página.");
      return;
    }

    try {
      await confirmarConteo({
        variables: { 
          asignacionId,
          confirmadoPor: userData.me.email
        },
      });
    } catch (error) {
      console.error("Error al confirmar:", error);
    }
  };

  if (loadingAsignacion || loadingActivos || loadingUser) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!asignacionId || isNaN(asignacionId)) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-800 font-semibold">ID de mes inválido</p>
          <button
            onClick={() => router.push("/dashboard/aft/conteo")}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Volver al dashboard
          </button>
        </div>
      </div>
    );
  }

  if (errorAsignacion || errorActivos) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-800 font-semibold">Error al cargar los datos</p>
          <p className="text-sm text-red-600 mt-2">
            {errorAsignacion?.message || errorActivos?.message || "Error desconocido"}
          </p>
          <button
            onClick={() => router.push("/dashboard/aft/conteo")}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Volver al dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!asignacionData?.asignacionMensual) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <p className="text-yellow-800 font-semibold">Mes no encontrado</p>
          <p className="text-sm text-yellow-600 mt-2">
            No se encontró la asignación mensual con ID {asignacionId}
          </p>
          <button
            onClick={() => router.push("/dashboard/aft/conteo")}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Volver al dashboard
          </button>
        </div>
      </div>
    );
  }

  const mes = asignacionData.asignacionMensual;
  const registros = registrosData?.registrosConteoPorMes || [];
  const puedeEditar = !mes.confirmadoConteo;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <button
        onClick={() => router.push("/dashboard/aft/conteo")}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 transition"
      >
        <ArrowLeft size={20} />
        <span>Volver al dashboard</span>
      </button>

      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            Conteo Mensual - {mes.nombreMes} {mes.anno}
          </h1>
        </div>

        {!mes.confirmadoConteo && estaTodoContadoAjustado && (
          <button
            onClick={handleOpenConfirmModal}
            disabled={loadingConfirmar || !userData?.me?.email}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 shadow-lg transition disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <Check size={20} />
            Confirmar Conteo
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 border shadow-sm">
          <p className="text-xs text-gray-600 font-medium mb-1">Asignados</p>
          <p className="text-2xl font-bold text-gray-900">{mes.cantidadAsignada}</p>
        </div>

        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <p className="text-xs text-blue-600 font-medium mb-1">Contados</p>
          <p className="text-2xl font-bold text-blue-900">{mes.activosContados}</p>
        </div>

        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <p className="text-xs text-green-600 font-medium mb-1">Confirmados</p>
          <p className="text-2xl font-bold text-green-900">{mes.activosEncontrados}</p>
        </div>

        <div className="bg-red-50 rounded-lg p-4 border border-red-200">
          <p className="text-xs text-red-600 font-medium mb-1">Faltantes</p>
          <p className="text-2xl font-bold text-red-900">{mes.activosFaltantes}</p>
        </div>
      </div>

      {cantidadAftsDesactivados > 0 && (
        <div className="bg-gray-50 border-2 border-gray-300 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="bg-gray-200 p-2 rounded-lg">
              <Ban size={20} className="text-gray-700" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900 text-sm mb-1">
                AFTs Desactivados desde Inventario
              </p>
              <p className="text-xs text-gray-600 mb-2">
                Estos activos fueron desactivados en el inventario y no requieren conteo
              </p>
              <div className="flex items-center gap-4">
                <div className="bg-white rounded-lg px-3 py-2 border border-gray-300">
                  <p className="text-xs text-gray-500">Total Desactivados</p>
                  <p className="text-xl font-bold text-gray-900">{cantidadAftsDesactivados}</p>
                </div>
                <div className="text-xs text-gray-500">
                  {aftsDesactivados.map((a, idx) => (
                    <span key={a.id}>
                      {a.codigo}
                      {idx < aftsDesactivados.length - 1 ? ", " : ""}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg p-4 border shadow-sm mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Progreso del mes</span>
          <span className="text-sm font-bold text-blue-600">
            {progresoAjustado.toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
          <div
            className={`h-3 rounded-full transition-all ${
              estaTodoContadoAjustado ? "bg-green-600" : "bg-blue-600"
            }`}
            style={{ width: `${Math.min(progresoAjustado, 100)}%` }}
          />
        </div>

        {cantidadAftsDesactivados > 0 && (
          <div className="flex items-center gap-4 text-xs text-gray-600 mb-4">
            <span>
              {mes.activosContados} contados + {cantidadAftsDesactivados} desactivados = {mes.activosContados + cantidadAftsDesactivados} / {mes.cantidadAsignada}
            </span>
          </div>
        )}

        {mes.confirmadoConteo && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <span className="text-green-600 text-lg">🔒</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-green-800 mb-2">
                  Este conteo ha sido confirmado. No se pueden realizar más cambios.
                </p>
                <div className="flex items-center gap-4 text-xs text-green-700">
                  <span>
                    <strong>Confirmado por:</strong>{" "}
                    {mes.confirmadoPor?.email || userData?.me?.email || "Usuario desconocido"}
                  </span>
                  {mes.fechaConfirmacion && (
                    <span>
                      <strong>Fecha:</strong>{" "}
                      {new Date(mes.fechaConfirmacion).toLocaleString("es-ES", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border mb-4">
        <input
          type="text"
          placeholder="Buscar por código o descripción..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      <ConteoMensualTable
        activos={activosFiltrados}
        registros={registros}
        asignacionId={asignacionId}
        puedeEditar={puedeEditar}
      />

      <ConfirmarConteoModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmarConteo}
        isLoading={loadingConfirmar}
        userEmail={userData?.me?.email}
      />
    </div>
  );
}