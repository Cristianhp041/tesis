"use client";

import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { CheckCircle, XCircle, MessageSquare, PowerOff, Power, ChevronDown, ChevronUp, Ban } from "lucide-react";
import { toast } from "sonner";
import { ActivoDelMes, RegistroConteo } from "../types/conteo.types";
import { REGISTRAR_CONTEO } from "../graphql/registrarConteo";
import { ACTUALIZAR_REGISTRO_CONTEO } from "../graphql/actualizarRegistroConteo";
import { GET_ACTIVOS_DEL_MES } from "../graphql/getActivosDelMes";
import { GET_REGISTROS_DEL_MES } from "../graphql/getRegistrosDelMes";
import { GET_ASIGNACION_MENSUAL } from "../graphql/getAsignacionMensual";

interface Props {
  activos: ActivoDelMes[];
  registros: RegistroConteo[];
  asignacionId: number;
  puedeEditar: boolean;
}

interface ActualizarRegistroInput {
  registroId: number;
  encontrado?: boolean;
  ubicacionEncontrada?: string | null;
  estadoEncontrado?: string | null;
  areaEncontrada?: string | null;
  comentarios?: string;
}

export default function ConteoMensualTable({ 
  activos, 
  registros, 
  asignacionId,
  puedeEditar 
}: Props) {
  const [modalActivo, setModalActivo] = useState<string | null>(null);
  const [comentarioTexto, setComentarioTexto] = useState("");
  const [esDesactivacion, setEsDesactivacion] = useState(false);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const [registrarConteo, { loading: loadingRegistrar }] = useMutation(REGISTRAR_CONTEO, {
    refetchQueries: [
      { query: GET_ACTIVOS_DEL_MES, variables: { asignacionId } },
      { query: GET_REGISTROS_DEL_MES, variables: { asignacionMensualId: asignacionId } },
      { query: GET_ASIGNACION_MENSUAL, variables: { id: asignacionId } },
    ],
    awaitRefetchQueries: true,
  });

  const [actualizarRegistro, { loading: loadingActualizar }] = useMutation(ACTUALIZAR_REGISTRO_CONTEO, {
    refetchQueries: [
      { query: GET_ACTIVOS_DEL_MES, variables: { asignacionId } },
      { query: GET_REGISTROS_DEL_MES, variables: { asignacionMensualId: asignacionId } },
      { query: GET_ASIGNACION_MENSUAL, variables: { id: asignacionId } },
    ],
    awaitRefetchQueries: true,
  });

  const getRegistro = (aftId: string) => {
    return registros.find((r) => r.aft.id.toString() === aftId);
  };

  const handleMarcar = async (activo: ActivoDelMes, encontrado: boolean) => {
    try {
      const registro = getRegistro(activo.id);

      if (registro) {
        const result = await actualizarRegistro({
          variables: {
            input: {
              registroId: registro.id,
              encontrado,
              ubicacionEncontrada: encontrado ? activo.areaNombre : null,
              estadoEncontrado: encontrado ? "Buen estado" : null,
              areaEncontrada: encontrado ? activo.areaNombre : null,
            },
          },
        });

        if (result.error) {
          toast.error("Error al actualizar");
          return;
        }
      } else {
        const result = await registrarConteo({
          variables: {
            input: {
              asignacionMensualId: asignacionId,
              aftId: parseInt(activo.id),
              encontrado,
              ubicacionEncontrada: encontrado ? activo.areaNombre : null,
              estadoEncontrado: encontrado ? "Buen estado" : null,
              areaEncontrada: encontrado ? activo.areaNombre : null,
            },
          },
        });

        if (result.error) {
          toast.error("Error al registrar");
          return;
        }
      }

      toast.success(encontrado ? "✓ Marcado como confirmado" : "⚠️ Marcado como faltante");
    } catch (error) {
      console.error("Error completo:", error);
      toast.error("Error al registrar conteo");
    }
  };

  const handleAbrirModal = (activoId: string, tipo: 'nota' | 'desactivar') => {
    const registro = getRegistro(activoId);
    
    if (tipo === 'desactivar' && !registro) {
      toast.error("Primero debe contar este activo");
      return;
    }

    setModalActivo(activoId);
    setEsDesactivacion(tipo === 'desactivar');
    setComentarioTexto(registro?.comentarios || "");
  };

  const handleReactivar = async (activoId: string) => {
    const registro = getRegistro(activoId);
    if (!registro) return;

    try {
      const activo = activos.find(a => a.id === activoId);
      if (!activo) return;

      const result = await actualizarRegistro({
        variables: {
          input: {
            registroId: registro.id,
            encontrado: true,
            estadoEncontrado: "Buen estado",
            ubicacionEncontrada: activo.areaNombre,
            areaEncontrada: activo.areaNombre,
          },
        },
      });

      if (result.error) {
        toast.error("Error al reactivar");
        return;
      }

      toast.success("✓ AFT reactivado correctamente");
    } catch (error) {
      console.error(error);
      toast.error("Error al reactivar");
    }
  };

  const handleGuardarModal = async () => {
    if (!modalActivo) return;

    if (esDesactivacion && !comentarioTexto.trim()) {
      toast.error("Debe escribir el motivo de la desactivación");
      return;
    }

    const registro = getRegistro(modalActivo);
    if (!registro) {
      toast.error("Primero marque el activo");
      return;
    }

    try {
      const input: ActualizarRegistroInput = {
        registroId: registro.id,
      };

      if (esDesactivacion) {
        input.estadoEncontrado = "Inactivo - Fuera de servicio";
        input.comentarios = comentarioTexto.trim();
      } else {
        input.comentarios = comentarioTexto.trim();
      }

      const result = await actualizarRegistro({
        variables: { input },
      });

      if (result.error) {
        toast.error("Error al guardar");
        return;
      }

      toast.success(esDesactivacion ? "✓ AFT desactivado" : "✓ Nota guardada");
      setModalActivo(null);
      setComentarioTexto("");
      setEsDesactivacion(false);
    } catch (error) {
      console.error(error);
      toast.error("Error al guardar");
    }
  };

  const getEstadoBadge = (activo: ActivoDelMes, registro?: RegistroConteo) => {
    if (!activo.activo) {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
          AFT Inactivo
        </span>
      );
    }

    if (!registro) {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
          Sin contar
        </span>
      );
    }
    
    if (registro.estadoEncontrado?.includes("Inactivo")) {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
          Inactivo
        </span>
      );
    }
    
    if (registro.encontrado) {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
          Confirmado
        </span>
      );
    }
    
    return (
      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
        Faltante
      </span>
    );
  };

  if (activos.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 text-sm text-gray-500 text-center">
        No hay activos asignados a este mes
      </div>
    );
  }

  const loading = loadingRegistrar || loadingActualizar;

  return (
    <>
      <div className="md:hidden space-y-3">
        {activos.map((activo) => {
          const registro = getRegistro(activo.id);
          const yaContado = registro !== undefined;
          const estaInactivo = registro?.estadoEncontrado?.includes("Inactivo");
          const estaEncontrado = registro?.encontrado === true;
          const estaFaltante = registro?.encontrado === false;
          const isExpanded = expandedCard === activo.id;
          const aftInactivoEnBD = activo.activo !== undefined && activo.activo === false; 

          let borderColor = "border-gray-200";
          if (aftInactivoEnBD) borderColor = "border-l-4 border-red-500"; 
          else if (estaInactivo) borderColor = "border-l-4 border-gray-400";
          else if (estaEncontrado) borderColor = "border-l-4 border-green-500";
          else if (estaFaltante) borderColor = "border-l-4 border-red-500";

          return (
            <div 
              key={activo.id} 
              className={`bg-white rounded-lg shadow-md border ${borderColor} p-4`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <p className="font-bold text-gray-900 text-sm">{activo.codigo}</p>
                  <p className="text-xs text-gray-600 mt-1">{activo.descripcion}</p>
                </div>
                {getEstadoBadge(activo, registro)}
              </div>

              <button
                onClick={() => setExpandedCard(isExpanded ? null : activo.id)}
                className="flex items-center gap-1 text-xs text-blue-600 mb-3"
              >
                {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                <span>{isExpanded ? 'Ver menos' : 'Ver detalles'}</span>
              </button>

              {isExpanded && (
                <div className="text-xs text-gray-600 space-y-1 mb-3 pb-3 border-b">
                  <p><strong>Área:</strong> {activo.areaNombre}</p>
                  <p><strong>Subclasificación:</strong> {activo.subclasificacionNombre || '-'}</p>
                  {registro?.comentarios && (
                    <p className="text-blue-700 italic">💬 {registro.comentarios}</p>
                  )}
                </div>
              )}

              {puedeEditar ? (
                <div className="grid grid-cols-2 gap-2">
                  {aftInactivoEnBD ? (
                    <div className="col-span-2 bg-red-50 border border-red-200 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <Ban size={16} className="text-red-600" />
                        <p className="text-xs text-red-800 font-medium">
                          AFT marcado como inactivo en inventario - No disponible para conteo
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
                      {!estaInactivo && !estaEncontrado && (
                        <button
                          onClick={() => handleMarcar(activo, true)}
                          disabled={loading}
                          className="flex items-center justify-center gap-1 px-3 py-2 bg-green-50 text-green-700 border border-green-300 rounded-lg text-xs font-semibold hover:bg-green-100 transition disabled:opacity-50"
                        >
                          <CheckCircle size={16} />
                          <span>Confirmado</span>
                        </button>
                      )}

                      {!estaInactivo && !estaFaltante && (
                        <button
                          onClick={() => handleMarcar(activo, false)}
                          disabled={loading}
                          className="flex items-center justify-center gap-1 px-3 py-2 bg-red-50 text-red-700 border border-red-300 rounded-lg text-xs font-semibold hover:bg-red-100 transition disabled:opacity-50"
                        >
                          <XCircle size={16} />
                          <span>Faltante</span>
                        </button>
                      )}

                      {estaEncontrado && !estaInactivo && (
                        <button
                          onClick={() => handleAbrirModal(activo.id, 'desactivar')}
                          disabled={loading}
                          className="flex items-center justify-center gap-1 px-3 py-2 bg-gray-50 text-gray-700 border border-gray-300 rounded-lg text-xs font-semibold hover:bg-gray-100 transition disabled:opacity-50"
                        >
                          <PowerOff size={16} />
                          <span>Desactivar</span>
                        </button>
                      )}

                      {estaInactivo && (
                        <button
                          onClick={() => handleReactivar(activo.id)}
                          disabled={loading}
                          className="flex items-center justify-center gap-1 px-3 py-2 bg-green-50 text-green-700 border border-green-300 rounded-lg text-xs font-semibold hover:bg-green-100 transition disabled:opacity-50"
                        >
                          <Power size={16} />
                          <span>Reactivar</span>
                        </button>
                      )}

                      {yaContado && (
                        <button
                          onClick={() => handleAbrirModal(activo.id, 'nota')}
                          disabled={loading}
                          className="flex items-center justify-center gap-1 px-3 py-2 bg-blue-50 text-blue-700 border border-blue-300 rounded-lg text-xs font-semibold hover:bg-blue-100 transition disabled:opacity-50"
                        >
                          <MessageSquare size={16} />
                          <span>Nota</span>
                          {registro?.comentarios && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          )}
                        </button>
                      )}
                    </>
                  )}
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic text-center py-2">
                  Conteo confirmado
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div className="hidden md:block bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Código
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Descripción
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Área
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Subclasificación
                </th>
                <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {activos.map((activo) => {
                const registro = getRegistro(activo.id);
                const yaContado = registro !== undefined;
                const estaInactivo = registro?.estadoEncontrado?.includes("Inactivo");
                const estaEncontrado = registro?.encontrado === true;
                const estaFaltante = registro?.encontrado === false;
                const aftInactivoEnBD = activo.activo !== undefined && activo.activo === false;

                let borderColor = "";
                if (aftInactivoEnBD) borderColor = "border-l-4 border-red-500"; 
                else if (estaInactivo) borderColor = "border-l-4 border-gray-400";
                else if (estaEncontrado) borderColor = "border-l-4 border-green-500";
                else if (estaFaltante) borderColor = "border-l-4 border-red-500";

                return (
                  <tr 
                    key={activo.id} 
                    className={`hover:bg-gray-50 transition ${borderColor}`}
                  >
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {activo.codigo}
                    </td>

                    <td className="px-4 py-3 text-gray-700">
                      {activo.descripcion}
                    </td>

                    <td className="px-4 py-3 text-gray-700">
                      {activo.areaNombre}
                    </td>

                    <td className="px-4 py-3 text-gray-700">
                      {activo.subclasificacionNombre || '-'}
                    </td>

                    <td className="px-4 py-3 text-center">
                      {getEstadoBadge(activo, registro)}
                    </td>

                    <td className="px-4 py-3 text-center">
                      {puedeEditar ? (
                        <>
                          {aftInactivoEnBD ? (
                            <div className="flex items-center justify-center gap-2 text-red-600">
                              <Ban className="w-4 h-4" />
                              <span className="text-xs italic">AFT Inactivo en inventario</span>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center space-x-3">
                              {!estaInactivo && !estaEncontrado && (
                                <button
                                  onClick={() => handleMarcar(activo, true)}
                                  disabled={loading}
                                  className="flex items-center space-x-1 text-green-600 hover:text-green-800 font-medium transition disabled:opacity-50"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                  <span>Confirmado</span>
                                </button>
                              )}

                              {!estaInactivo && !estaFaltante && (
                                <button
                                  onClick={() => handleMarcar(activo, false)}
                                  disabled={loading}
                                  className="flex items-center space-x-1 text-red-600 hover:text-red-800 font-medium transition disabled:opacity-50"
                                >
                                  <XCircle className="w-4 h-4" />
                                  <span>Faltante</span>
                                </button>
                              )}

                              {estaEncontrado && !estaInactivo && (
                                <button
                                  onClick={() => handleAbrirModal(activo.id, 'desactivar')}
                                  disabled={loading}
                                  className="flex items-center space-x-1 text-gray-600 hover:text-gray-800 font-medium transition disabled:opacity-50"
                                >
                                  <PowerOff className="w-4 h-4" />
                                  <span>Desactivar</span>
                                </button>
                              )}

                              {estaInactivo && (
                                <button
                                  onClick={() => handleReactivar(activo.id)}
                                  disabled={loading}
                                  className="flex items-center space-x-1 text-green-600 hover:text-green-800 font-medium transition disabled:opacity-50"
                                >
                                  <Power className="w-4 h-4" />
                                  <span>Reactivar</span>
                                </button>
                              )}

                              {yaContado && (
                                <button
                                  onClick={() => handleAbrirModal(activo.id, 'nota')}
                                  disabled={loading}
                                  className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 font-medium transition disabled:opacity-50"
                                >
                                  <MessageSquare className="w-4 h-4" />
                                  <span>Nota</span>
                                  {registro?.comentarios && (
                                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                  )}
                                </button>
                              )}
                            </div>
                          )}
                        </>
                      ) : (
                        <span className="text-sm text-gray-400 italic">
                          Conteo confirmado
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Nota/Desactivación */}
      {modalActivo && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              {esDesactivacion ? "🔴 Desactivar AFT" : "📝 Agregar nota"}
            </h3>

            {esDesactivacion && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-yellow-800">
                  ⚠️ Debe especificar el motivo de la desactivación
                </p>
              </div>
            )}

            <textarea
              value={comentarioTexto}
              onChange={(e) => setComentarioTexto(e.target.value)}
              placeholder={
                esDesactivacion
                  ? "Motivo de desactivación (requerido)..."
                  : "Observaciones, detalles adicionales..."
              }
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              disabled={!esDesactivacion && getRegistro(modalActivo)?.estadoEncontrado?.includes("Inactivo")}
            />

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => {
                  setModalActivo(null);
                  setComentarioTexto("");
                  setEsDesactivacion(false);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition"
              >
                Cancelar
              </button>

              {!getRegistro(modalActivo)?.estadoEncontrado?.includes("Inactivo") && (
                <button
                  onClick={handleGuardarModal}
                  disabled={loading || (esDesactivacion && !comentarioTexto.trim())}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                    loading || (esDesactivacion && !comentarioTexto.trim())
                      ? "bg-blue-300 cursor-not-allowed text-white"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                >
                  {loading ? "Guardando..." : "Guardar"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}