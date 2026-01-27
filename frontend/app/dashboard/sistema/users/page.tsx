"use client";

import { useState } from "react";
import UserTable from "./components/Usertable";
import CrearUserModal from "./components/CrearUserModal";
import { Plus } from "lucide-react";

export default function UsersPage() {
  const [open, setOpen] = useState(false);

  return (
    <div className="max-w-7xl mx-auto">
 
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            Usuarios
          </h1>
          <p className="text-slate-500">
            Administración de usuarios del sistema
          </p>
        </div>
        
        <button
          onClick={() => setOpen(true)}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 shadow-lg transition"
        >
          <Plus size={20} />
          Crear Usuario
        </button>
      </div>

      <UserTable />

      <CrearUserModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
}