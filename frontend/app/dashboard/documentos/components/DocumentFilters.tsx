interface DocumentFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedMonth?: string;
  onMonthChange?: (value: string) => void;
  showMonthFilter?: boolean;
}

export default function DocumentFilters({
  searchTerm,
  onSearchChange,
  selectedMonth,
  onMonthChange,
  showMonthFilter = false
}: DocumentFiltersProps) {
  const clearFilters = () => {
    onSearchChange("");
    if (onMonthChange) onMonthChange("");
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

      <div className={`grid grid-cols-1 ${showMonthFilter ? 'md:grid-cols-2' : ''} gap-4`}>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-600">Buscar</label>
          <input
            type="text"
            placeholder="Buscar documentos..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {showMonthFilter && onMonthChange && (
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-600">Mes</label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => onMonthChange(e.target.value)}
              className="border rounded-md px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        )}
      </div>
    </div>
  );
}