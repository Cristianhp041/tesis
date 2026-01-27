"use client";

import { useQuery } from "@apollo/client/react";
import { GET_PROVINCIAS } from "../graphql/getProvincias";
import { Provincia } from "../types/provincia";

export default function ProvinciaSelect({
  value,
  onChange,
}: {
  value?: number;
  onChange: (id: number | null) => void;
}) {
  const { data, loading } = useQuery<{ provincias: Provincia[] }>(
    GET_PROVINCIAS
  );

  if (loading) return <p className="text-sm text-gray-500">Cargando provincias...</p>;

  return (
    <select
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
    >
      <option value="">Seleccione una provincia</option>
      {data?.provincias.map((p) => (
        <option key={p.id} value={p.id}>
          {p.nombre}
        </option>
      ))}
    </select>
  );
}