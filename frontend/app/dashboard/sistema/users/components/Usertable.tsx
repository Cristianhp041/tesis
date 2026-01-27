"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@apollo/client/react";
import { Edit } from "lucide-react";

import { GET_USERS } from "../graphql/getUsers";
import { User } from "../types/user";
import UserFilters from "./UserFilters";
import EditarUserModal from "./EditarUserModal";
import Pagination from "../../../trabajadores/components/Paginacion";

export default function UserTable() {
  const { data, loading, error } = useQuery<{ users: User[] }>(GET_USERS, {
    variables: { active: "all" },
  });

  const [editUser, setEditUser] = useState<User | null>(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [filters, setFilters] = useState({
    search: "",
    activo: undefined as boolean | undefined,
  });

  const allFilteredUsers = useMemo(() => {
    const users = data?.users ?? [];

    return users.filter((user) => {
      if (
        filters.search &&
        !user.email.toLowerCase().includes(filters.search.toLowerCase())
      ) {
        return false;
      }

      if (filters.activo !== undefined && user.active !== filters.activo) {
        return false;
      }

      return true;
    });
  }, [data?.users, filters]);

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return allFilteredUsers.slice(startIndex, endIndex);
  }, [allFilteredUsers, currentPage, itemsPerPage]);

  const handleFilterChange = (partial: Partial<typeof filters>) => {
    setFilters((prev) => ({ ...prev, ...partial }));
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 text-sm text-red-500 text-center">
        Error al cargar usuarios: {error.message}
      </div>
    );
  }

  return (
    <>
      <div className="mb-4">
        <UserFilters
          value={filters}
          onChange={handleFilterChange}
        />
      </div>


      {allFilteredUsers.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-6 text-sm text-gray-500 text-center">
          No se encontraron usuarios con los filtros aplicados
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {paginatedUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {user.email}
                    </td>

                    <td className="px-4 py-3 text-gray-700">
                      {user.role}
                    </td>

                    <td className="px-4 py-3 text-center">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          user.active
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {user.active ? "Activo" : "Inactivo"}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => setEditUser(user)}
                        className="flex items-center justify-center space-x-1 text-blue-600 hover:text-blue-800 font-medium transition mx-auto"
                      >
                        <Edit className="w-4 h-4" />
                        <span>Editar</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalItems={allFilteredUsers.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
          />
        </div>
      )}

      {editUser && (
        <EditarUserModal
          open
          user={editUser}
          onClose={() => setEditUser(null)}
        />
      )}
    </>
  );
}