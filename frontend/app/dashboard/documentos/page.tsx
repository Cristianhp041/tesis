"use client";

import { useRouter } from "next/navigation";
import { FileText, Calendar, ChevronRight } from "lucide-react";

interface DocumentoItem {
  title: string;
  description: string;
  icon: React.ElementType;
  path: string;
  color: "blue" | "purple";
}

const colorStyles = {
  blue: {
    border: "border-blue-200",
    icon: "bg-blue-100 text-blue-700",
    hover: "group-hover:bg-blue-600",
  },
  purple: {
    border: "border-purple-200",
    icon: "bg-purple-100 text-purple-700",
    hover: "group-hover:bg-purple-600",
  },
};

export default function DocumentosPage() {
  const router = useRouter();

  const documentos: DocumentoItem[] = [
    {
      title: "Documentos Mensuales",
      description: "Planes de trabajo con periodicidad mensual",
      icon: Calendar,
      path: "/dashboard/documentos/DocumentosMensuales",
      color: "blue",
    },
    {
      title: "Documentos Específicos",
      description: "Actas de responsabilidad en momentos específicos",
      icon: FileText,
      path: "/dashboard/documentos/DocumentosEspecificos",
      color: "purple",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">
          Gestión Documental
        </h1>
        <p className="text-slate-500">
          Selecciona un tipo de documento para gestionar
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {documentos.map((documento) => {
          const Icon = documento.icon;
          const styles = colorStyles[documento.color];

          return (
            <button
              key={documento.title}
              onClick={() => router.push(documento.path)}
              className={`group bg-white rounded-xl border ${styles.border} shadow-sm hover:shadow-lg transition-all text-left`}
            >
              <div className="p-6 flex flex-col h-full">
                <div
                  className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${styles.icon} ${styles.hover} group-hover:text-white transition`}
                >
                  <Icon className="w-7 h-7" />
                </div>

                <h3 className="text-lg font-semibold text-slate-800 group-hover:text-slate-900">
                  {documento.title}
                </h3>
                <p className="text-sm text-slate-600 mt-1 flex-1">
                  {documento.description}
                </p>

                <div className="flex items-center justify-end mt-4 text-sm text-slate-500 group-hover:text-slate-700">
                  <span>Gestionar</span>
                  <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}