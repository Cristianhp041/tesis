"use client";

export interface UserFilterState {
  search: string;
  activo: boolean | undefined;
}

interface Props {
  value: UserFilterState;
  onChange: (value: Partial<UserFilterState>) => void;
}

export default function UserFilters({ value, onChange }: Props) {
  const clearFilters = () => {
    onChange({
      search: "",
      activo: undefined,
    });
  };

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-700">
          Filtros de búsqueda
        </h2>

        <button
          onClick={clearFilters}
          className="text-xs text-gray-500 hover:text-gray-700 underline"
        >
          Limpiar filtros
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-600">Buscar</label>
          <input
            type="text"
            placeholder="Email del usuario"
            value={value.search ?? ""}
            onChange={(e) => onChange({ search: e.target.value })}
            className="border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-600">Estado</label>
          <select
            className="border rounded-md px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500"
            value={
              value.activo === undefined
                ? ""
                : value.activo
                ? "activo"
                : "inactivo"
            }
            onChange={(e) => {
              if (e.target.value === "") {
                onChange({ activo: undefined });
              } else {
                onChange({
                  activo: e.target.value === "activo",
                });
              }
            }}
          >
            <option value="">Todos</option>
            <option value="activo">Activos</option>
            <option value="inactivo">Inactivos</option>
          </select>
        </div>
      </div>
    </div>
  );
}