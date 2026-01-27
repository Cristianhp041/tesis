"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (items: number) => void;
}

export default function Pagination({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
}: PaginationProps) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  return (
    <div className="bg-white border-t border-gray-200 px-4 py-3 flex items-center justify-between">

      <div className="flex items-center gap-4">
        <div className="text-sm text-gray-700">
          Mostrando <span className="font-medium">{startItem}</span> a{" "}
          <span className="font-medium">{endItem}</span> de{" "}
          <span className="font-medium">{totalItems}</span> resultados
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="itemsPerPage" className="text-sm text-gray-700">
            Por página:
          </label>
          <select
            id="itemsPerPage"
            value={itemsPerPage}
            onChange={(e) => {
              onItemsPerPageChange(Number(e.target.value));
              onPageChange(1);
            }}
            className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!canGoPrevious}
          className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1 transition ${
            canGoPrevious
              ? "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
              : "bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          <ChevronLeft size={16} />
          Anterior
        </button>

        <div className="flex items-center gap-1">
          <span className="text-sm text-gray-700">
            Página <span className="font-medium">{currentPage}</span> de{" "}
            <span className="font-medium">{totalPages}</span>
          </span>
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!canGoNext}
          className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1 transition ${
            canGoNext
              ? "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
              : "bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          Siguiente
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}