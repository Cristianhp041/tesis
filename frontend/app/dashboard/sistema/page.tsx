"use client";

import Link from "next/link";
import {
  Users,
  Building2,
  Briefcase,
  MapPin,
  Layers,
  ChevronRight,
} from "lucide-react";

type Modulo = {
  href: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: "blue" | "green" | "purple" | "orange" | "indigo";
};

const modulos: Modulo[] = [
  {
    href: "/dashboard/sistema/users",
    title: "Usuarios",
    description: "Gestión de usuarios, roles y estados del sistema",
    icon: Users,
    color: "blue",
  },
  {
    href: "/dashboard/sistema/areas",
    title: "Áreas",
    description: "Administración de áreas organizacionales",
    icon: Building2,
    color: "green",
  },
  {
    href: "/dashboard/sistema/cargos",
    title: "Cargos",
    description: "Gestión de cargos y posiciones institucionales",
    icon: Briefcase,
    color: "purple",
  },
  {
    href: "/dashboard/sistema/provincias",
    title: "Provincias y Municipios",
    description: "Gestión geográfica del sistema",
    icon: MapPin,
    color: "orange",
  },
  {
    href: "/dashboard/sistema/subclasificaciones",
    title: "Subclasificaciones",
    description: "Clasificación y tipologías del sistema",
    icon: Layers,
    color: "indigo",
  },
];

const colorStyles = {
  blue: {
    border: "border-blue-200",
    icon: "bg-blue-100 text-blue-700",
    hover: "group-hover:bg-blue-600",
  },
  green: {
    border: "border-green-200",
    icon: "bg-green-100 text-green-700",
    hover: "group-hover:bg-green-600",
  },
  purple: {
    border: "border-purple-200",
    icon: "bg-purple-100 text-purple-700",
    hover: "group-hover:bg-purple-600",
  },
  orange: {
    border: "border-orange-200",
    icon: "bg-orange-100 text-orange-700",
    hover: "group-hover:bg-orange-600",
  },
  indigo: {
    border: "border-indigo-200",
    icon: "bg-indigo-100 text-indigo-700",
    hover: "group-hover:bg-indigo-600",
  },
};

export default function AdminPage() {
  return (
    <div className="max-w-7xl mx-auto">

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">
          Administración del Sistema
        </h1>
        <p className="text-slate-500">
          Configuración y gestión de parámetros generales
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {modulos.map((modulo) => {
          const styles = colorStyles[modulo.color];

          return (
            <Link
              key={modulo.href}
              href={modulo.href}
              className={`group bg-white rounded-xl border ${styles.border} shadow-sm hover:shadow-lg transition-all`}
            >
              <div className="p-6 flex flex-col h-full">

                <div
                  className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${styles.icon} ${styles.hover} group-hover:text-white transition`}
                >
                  <modulo.icon className="w-7 h-7" />
                </div>

                <h3 className="text-lg font-semibold text-slate-800 group-hover:text-slate-900">
                  {modulo.title}
                </h3>
                <p className="text-sm text-slate-600 mt-1 flex-1">
                  {modulo.description}
                </p>

                <div className="flex items-center justify-end mt-4 text-sm text-slate-500 group-hover:text-slate-700">
                  <span>Gestionar</span>
                  <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}