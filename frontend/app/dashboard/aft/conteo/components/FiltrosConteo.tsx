"use client";

interface Props {
  search: string;
  soloFaltantes: boolean;
  soloDiscrepancias: boolean;
  onChange: (filters: {
    search?: string;
    soloFaltantes?: boolean;
    soloDiscrepancias?: boolean;
  }) => void;
}

export default function FiltrosConteo({
  search,
  soloFaltantes,
  soloDiscrepancias,
  onChange,
}: Props) {
  const clearFilters = () => {
    onChange({
      search: "",
      soloFaltantes: false,
      soloDiscrepancias: false,
    });
  };

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-700">Filtros</h2>
        <button
          onClick={clearFilters}
          className="text-xs text-gray-500 hover:text-gray-700 underline"
        >
          Limpiar filtros
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-600">Buscar</label>
          <input
            type="text"
            placeholder="Rótulo o nombre"
            value={search}
            onChange={(e) => onChange({ search: e.target.value })}
            className="border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="solo-faltantes"
            checked={soloFaltantes}
            onChange={(e) => onChange({ soloFaltantes: e.target.checked })}
            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="solo-faltantes" className="text-sm text-gray-700 cursor-pointer">
            Solo mostrar faltantes
          </label>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="solo-discrepancias"
            checked={soloDiscrepancias}
            onChange={(e) => onChange({ soloDiscrepancias: e.target.checked })}
            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="solo-discrepancias" className="text-sm text-gray-700 cursor-pointer">
            Solo mostrar con discrepancias
          </label>
        </div>
      </div>
    </div>
  );
}