"use client";

import { useMutation, useQuery } from "@apollo/client/react";
import { useState } from "react";
import { toast } from "sonner";

import { CREATE_TRABAJADOR } from "../graphql/createTrabajador";
import { GET_CARGOS_ACTIVOS } from "../graphql/getCargosActivos";
import { GET_PROVINCIAS } from "../graphql/getProvincias";
import { GET_MUNICIPIOS_BY_PROVINCIA } from "../graphql/getMunicipiosByProvincia";

import {
  Cargo,
  Provincia,
  Municipio,
  ProvinciasResponse,
} from "../types/trabajador";

interface Props {
  onSuccess: () => void;
  onCancel: () => void;
}

interface MunicipiosResponse {
  municipiosByProvincia: Municipio[];
}

interface CargosActivosResponse {
  cargosActivos: Cargo[];
}

export default function CrearTrabajadorForm({ onSuccess, onCancel }: Props) {
  const [nombre, setNombre] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [expediente, setExpediente] = useState("");
  const [telefono, setTelefono] = useState("");

  const [cargoId, setCargoId] = useState<number | undefined>();
  const [provinciaId, setProvinciaId] = useState<number | undefined>();
  const [municipioId, setMunicipioId] = useState<number | undefined>();

  const { data: cargosData } = useQuery<CargosActivosResponse>(GET_CARGOS_ACTIVOS);
  const { data: provinciasData } = useQuery<ProvinciasResponse>(GET_PROVINCIAS);

  const { data: municipiosData } = useQuery<MunicipiosResponse>(
    GET_MUNICIPIOS_BY_PROVINCIA,
    {
      variables: { provinciaId: provinciaId! },
      skip: !provinciaId,
    }
  );

  const [createTrabajador, { loading }] = useMutation(CREATE_TRABAJADOR, {
    refetchQueries: ["FilterTrabajadores"],
    onCompleted: () => {
      toast.success("✓ Trabajador creado correctamente");
      onSuccess();
    },
    onError: (error) => {
      console.error("Error al crear trabajador:", error);
      toast.error(error.message || "✗ Error al crear el trabajador");
    },
  });

  const handleTelefonoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setTelefono(value);
    }
  };

  const soloLetras = (valor: string): boolean => {
    return /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(valor);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createTrabajador({
        variables: {
          data: {
            nombre,
            apellidos,
            expediente,
            telefono: telefono.trim() === "" ? null : telefono,
            cargoId,
            provinciaId,
            municipioId,
          },
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
          placeholder="Ingrese el expediente"
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
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
            {cargosData?.cargosActivos.map((c: Cargo) => (
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
              setProvinciaId(Number(e.target.value));
              setMunicipioId(undefined);
            }}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            <option value="" disabled>
              Seleccione una provincia
            </option>
            {provinciasData?.provincias.map((p: Provincia) => (
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
            {municipiosData?.municipiosByProvincia.map((m: Municipio) => (
              <option key={m.id} value={m.id}>
                {m.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

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
          disabled={loading}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
            loading
              ? "bg-blue-300 cursor-not-allowed text-white"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          {loading ? "Creando..." : "Crear trabajador"}
        </button>
      </div>
    </form>
  );
}