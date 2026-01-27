"use client";

import { useMemo, useState, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { toast } from "sonner";
import { GET_CARGOS_ACTIVOS } from "../graphql/getCargosActivos";
import { UPDATE_TRABAJADOR } from "../graphql/updateTrabajador";
import { GET_PROVINCIAS } from "../graphql/getProvincias";
import { GET_MUNICIPIOS_BY_PROVINCIA } from "../graphql/getMunicipiosByProvincia";

import {
  Trabajador,
  Cargo,
  Provincia,
  Municipio,
} from "../types/trabajador";

interface Props {
  trabajador: Trabajador;
  onSuccess: () => void;
  onCancel: () => void;
}

type MunicipiosByProvinciaResponse = {
  municipiosByProvincia: Municipio[];
};

export default function EditarTrabajadorForm({
  trabajador,
  onSuccess,
  onCancel,
}: Props) {
  const [nombre, setNombre] = useState(trabajador.nombre);
  const [apellidos, setApellidos] = useState(trabajador.apellidos);
  const [expediente, setExpediente] = useState(trabajador.expediente);
  const [telefono, setTelefono] = useState(trabajador.telefono || ""); 

  const [cargoId, setCargoId] = useState<number | undefined>(
    trabajador.cargo?.id
  );

  const [provinciaId, setProvinciaId] = useState<number | undefined>(
    trabajador.provincia?.id
  );

  const [municipioId, setMunicipioId] = useState<number | undefined>(
    trabajador.municipio?.id
  );

  const [activo, setActivo] = useState<boolean>(trabajador.activo);

  const handleTelefonoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setTelefono(value);
    }
  };

  const soloLetras = (valor: string): boolean => {
    return /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(valor);
  };

  const original = useMemo(
    () => ({
      nombre: trabajador.nombre,
      apellidos: trabajador.apellidos,
      expediente: trabajador.expediente,
      cargoId: trabajador.cargo?.id,
      provinciaId: trabajador.provincia?.id,
      municipioId: trabajador.municipio?.id,
      activo: trabajador.activo,
      telefono: trabajador.telefono || "", 
    }),
    [trabajador]
  );

  const { data: cargosData } = useQuery<{ cargosActivos: Cargo[] }>(
    GET_CARGOS_ACTIVOS
  );

  const { data: provinciasData } = useQuery<{ provincias: Provincia[] }>(
    GET_PROVINCIAS
  );

  const {
    data: municipiosData,
    refetch: refetchMunicipios,
  } = useQuery<MunicipiosByProvinciaResponse>(
    GET_MUNICIPIOS_BY_PROVINCIA,
    {
      variables: { provinciaId: provinciaId! },
      skip: !provinciaId,
    }
  );

  useEffect(() => {
    if (provinciaId) {
      refetchMunicipios();
    }
  }, [provinciaId, refetchMunicipios]);

  const municipios: Municipio[] =
    municipiosData?.municipiosByProvincia ?? [];

  const [updateTrabajador, { loading }] = useMutation(UPDATE_TRABAJADOR, {
    refetchQueries: ["FilterTrabajadores"],
    onCompleted: () => {
      toast.success("✓ Trabajador actualizado correctamente");
      onSuccess();
    },
    onError: (error) => {
      console.error("Error al actualizar trabajador:", error);
      toast.error(error.message || "✗ No se pudieron guardar los cambios");
    },
  });

  const hayCambios =
    nombre !== original.nombre ||
    apellidos !== original.apellidos ||
    expediente !== original.expediente ||
    cargoId !== original.cargoId ||
    provinciaId !== original.provinciaId ||
    municipioId !== original.municipioId ||
    activo !== original.activo ||
    telefono !== original.telefono;

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!hayCambios) {
    toast.info("ℹ No hay cambios para guardar");
    return;
  }

  const data: Record<string, unknown> = {}; 

  if (nombre !== original.nombre) data.nombre = nombre;
  if (apellidos !== original.apellidos) data.apellidos = apellidos;
  if (expediente !== original.expediente) data.expediente = expediente;
  if (cargoId !== original.cargoId && cargoId) data.cargoId = cargoId;
  if (provinciaId !== original.provinciaId && provinciaId)
    data.provinciaId = provinciaId;
  if (municipioId !== original.municipioId && municipioId)
    data.municipioId = municipioId;
  
  if (telefono !== original.telefono) {
    data.telefono = telefono.trim() || null;
  }
  
  if (activo !== original.activo) data.activo = activo;

  try {
    await updateTrabajador({
      variables: {
        id: trabajador.id, 
        data,              
      },
    });
  } catch (error) {
    console.error("Error capturado:", error);
  }
};

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nombre
        </label>
        <input
          value={nombre}
          onChange={(e) => {
            const value = e.target.value;
            if (value === "" || soloLetras(value)) {
              setNombre(value);
            }
          }}
          placeholder="Ingrese el nombre"
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Apellidos
        </label>
        <input
          value={apellidos}
          onChange={(e) => {
            const value = e.target.value;
            if (value === "" || soloLetras(value)) {
              setApellidos(value);
            }
          }}
          placeholder="Ingrese los apellidos"
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Expediente
        </label>
        <input
          value={expediente}
          onChange={(e) => setExpediente(e.target.value)}
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          placeholder="Expediente"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cargo
          </label>
          <select
            value={cargoId ?? ""}
            onChange={(e) => setCargoId(Number(e.target.value))}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            <option value="" disabled>
              Seleccione un cargo
            </option>
            {cargosData?.cargosActivos.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Teléfono <span className="text-gray-400 text-xs">(opcional)</span>
          </label>
          <input
            value={telefono}
            onChange={handleTelefonoChange}
            placeholder="Ingrese el teléfono"
            inputMode="numeric"
            pattern="[0-9]*"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Provincia
          </label>
          <select
            value={provinciaId ?? ""}
            onChange={(e) => {
              const value = Number(e.target.value);
              setProvinciaId(value);
              setMunicipioId(undefined);
            }}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            <option value="" disabled>
              Seleccione una provincia
            </option>
            {provinciasData?.provincias.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Municipio
          </label>
          <select
            value={municipioId ?? ""}
            disabled={!provinciaId}
            onChange={(e) => setMunicipioId(Number(e.target.value))}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="" disabled>
              {provinciaId
                ? "Seleccione un municipio"
                : "Primero seleccione provincia"}
            </option>
            {municipios.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Estado
          </label>
          <p className="text-xs text-gray-500">
           Desmarca para trabajadores que ya no laboran en el centro
          </p>
        </div>

        <button
          type="button"
          onClick={() => setActivo(!activo)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            activo ? "bg-green-500" : "bg-gray-300"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              activo ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      {hayCambios && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <p className="text-xs text-amber-600">⚠️ Hay cambios sin guardar</p>
        </div>
      )}

      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition"
        >
          Cancelar
        </button>

        <button
          type="submit"
          disabled={!hayCambios || loading}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
            !hayCambios || loading
              ? "bg-blue-300 cursor-not-allowed text-white"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          {loading ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>
    </form>
  );
}