"use client";

import { Users, Package, FileText } from "lucide-react";

export default function InfoPanel() {
  return (
    <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 p-12 flex flex-col justify-center overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-white opacity-5 rounded-full -ml-48 -mb-48"></div>

      <div className="relative z-10">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/30 flex-shrink-0">
              <span className="text-white font-bold text-3xl">SG</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white leading-tight">
                Sistema de Gestión
              </h1>
              <h2 className="text-2xl font-bold text-white/90">Administrativa</h2>
            </div>
          </div>
          <div className="w-20 h-1 bg-white/50 rounded"></div>
        </div>

        <div className="space-y-4 mb-8">
          <p className="text-blue-100">
            Plataforma integral para la gestión de recursos humanos, activos fijos
            tangibles y archivo documental institucional.
          </p>
        </div>

        <div className="space-y-5">
          <div className="flex gap-4">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Users className="text-white" size={20} />
            </div>
            <div>
              <h3 className="text-white font-semibold">Gestión de Personal</h3>
              <p className="text-blue-200 text-sm">
                Control y administración de trabajadores
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Package className="text-white" size={20} />
            </div>
            <div>
              <h3 className="text-white font-semibold">Activos Fijos Tangibles</h3>
              <p className="text-blue-200 text-sm">
                Inventario y control de bienes institucionales
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <FileText className="text-white" size={20} />
            </div>
            <div>
              <h3 className="text-white font-semibold">Archivo Digital</h3>
              <p className="text-blue-200 text-sm">
                Gestión y resguardo de documentación
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}