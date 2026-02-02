"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Package, ClipboardList, ArrowLeft } from "lucide-react";

type UserRole = "ADMIN" | "USER";

interface MeUser {
  role: UserRole;
}

type ModuleColor = "blue" | "green" | "purple" | "red";

interface ModuleItem {
  title: string;
  description: string;
  icon: React.ElementType;
  path: string;
  color: ModuleColor;
  adminOnly?: boolean;
}

interface ColorStyle {
  border: string;
  icon: string;
  hover: string;
}

const colorStyles: Record<ModuleColor, ColorStyle> = {
  blue: {
    border: "border-blue-200",
    icon: "bg-blue-100 text-blue-600",
    hover: "group-hover:bg-blue-600",
  },
  green: {
    border: "border-green-200",
    icon: "bg-green-100 text-green-600",
    hover: "group-hover:bg-green-600",
  },
  purple: {
    border: "border-purple-200",
    icon: "bg-purple-100 text-purple-600",
    hover: "group-hover:bg-purple-600",
  },
  red: {
    border: "border-red-200",
    icon: "bg-red-100 text-red-600",
    hover: "group-hover:bg-red-600",
  },
};

export default function AFTPage() {
  const router = useRouter();
  const [user, setUser] = useState<MeUser | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/");
      return;
    }

    fetch("http://localhost:3001/users/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data: MeUser) => setUser(data))
      .catch(() => router.replace("/"));
  }, [router]);

  if (!user) return null;

  const modules: ModuleItem[] = [
    {
      title: "Inventario AFT",
      description: "Gestión y registro de activos fijos tangibles",
      icon: Package,
      path: "/dashboard/aft/Inventario",
      color: "green",
    },
    {
      title: "Plan de Conteo Anual",
      description: "Planificación y seguimiento de inventarios",
      icon: ClipboardList,
      path: "/dashboard/aft/conteo",
      color: "blue",
    },
  ];

  const visibleModules = modules.filter(
    (module) => !module.adminOnly || user.role === "ADMIN"
  );

  return (
    <div className="max-w-7xl mx-auto">
      <button
        onClick={() => router.push("/dashboard")}
        className="flex items-center gap-2 text-slate-600 hover:text-slate-800 mb-6 transition-colors"
      >
        <ArrowLeft size={20} />
        <span>Volver al panel principal</span>
      </button>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">
          Activos Fijos Tangibles
        </h1>
        <p className="text-slate-500">
          Selecciona el módulo con el que deseas trabajar
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleModules.map((module) => {
          const Icon = module.icon;
          const style = colorStyles[module.color];

          return (
            <button
              key={module.title}
              onClick={() => router.push(module.path)}
              className={`group bg-white rounded-xl border-2 ${style.border} p-6 shadow hover:shadow-xl transition-all duration-300 text-left hover:-translate-y-1`}
            >
              <div
                className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${style.icon} ${style.hover} group-hover:text-white transition`}
              >
                <Icon size={28} />
              </div>

              <h3 className="text-xl font-semibold text-slate-800 mb-2">
                {module.title}
              </h3>

              <p className="text-sm text-slate-500">
                {module.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}