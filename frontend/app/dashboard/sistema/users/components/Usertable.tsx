"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { Edit, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

import { GET_USERS } from "../graphql/getUsers";
import { APPROVE_USER } from "../graphql/aproveruser";
import { REJECT_USER } from "../graphql/rejectuser";
import { User } from "../types/user";
import UserFilters from "./UserFilters";
import EditarUserModal from "./EditarUserModal";
import ApprovalModal from "./Approvalmodal";
import Pagination from "../../../trabajadores/components/Paginacion";

// ✅ Tipos para las respuestas de las mutaciones
type ApproveUserResponse = {
  approveUser: User;
};

type RejectUserResponse = {
  rejectUser: User;
};

export default function UserTable() {
  const { data, loading, error } = useQuery<{ users: User[] }>(GET_USERS, {
    variables: { active: "all" },
    fetchPolicy: "network-only",
  });

  // ✅ Tipar explícitamente las mutaciones
  const [approveUser] = useMutation<ApproveUserResponse>(APPROVE_USER, {
    refetchQueries: [
      { 
        query: GET_USERS,
        variables: { active: "all" }
      }
    ],
    awaitRefetchQueries: true,
  });

  const [rejectUser] = useMutation<RejectUserResponse>(REJECT_USER, {
    refetchQueries: [
      { 
        query: GET_USERS,
        variables: { active: "all" }
      }
    ],
    awaitRefetchQueries: true,
  });

  const [editUser, setEditUser] = useState<User | null>(null);
  const [approvalUser, setApprovalUser] = useState<User | null>(null);
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject'>('approve');
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [filters, setFilters] = useState({
    search: "",
    activo: undefined as boolean | undefined,
    approvalStatus: "all" as 'all' | 'pending' | 'approved' | 'rejected',
  });

  const allFilteredUsers = useMemo(() => {
    const users = data?.users ?? [];

    return users.filter((user) => {
      if (
        filters.search &&
        !user.email.toLowerCase().includes(filters.search.toLowerCase()) &&
        !user.name.toLowerCase().includes(filters.search.toLowerCase())
      ) {
        return false;
      }

      if (filters.activo !== undefined && user.active !== filters.activo) {
        return false;
      }

      if (filters.approvalStatus !== 'all') {
        const userStatus = user.approvalStatus?.toLowerCase() || 'pending';
        if (userStatus !== filters.approvalStatus) {
          return false;
        }
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

  const handleApprove = (user: User) => {
    setApprovalUser(user);
    setApprovalAction('approve');
  };

  const handleReject = (user: User) => {
    setApprovalUser(user);
    setApprovalAction('reject');
  };

  const confirmApproval = async (reason?: string) => {
    if (!approvalUser) return;

    try {
      if (approvalAction === 'approve') {
        const result = await approveUser({
          variables: { userId: approvalUser.id },
        });
        
        if (result.data?.approveUser) {
          toast.success("✓ Usuario aprobado exitosamente");
          setApprovalUser(null);
        } else {
          toast.error("✗ Error al aprobar usuario");
        }
      } else {
        const result = await rejectUser({
          variables: { userId: approvalUser.id, reason },
        });
        
        if (result.data?.rejectUser) {
          toast.success("✓ Usuario rechazado");
          setApprovalUser(null);
        } else {
          toast.error("✗ Error al rechazar usuario");
        }
      }
    } catch (error) {
      console.error('Error al procesar la solicitud:', error);
      toast.error("✗ Error al procesar la solicitud");
    }
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

  const pendingCount = data?.users.filter(u => {
    const status = u.approvalStatus?.toLowerCase() || 'pending';
    return status === 'pending';
  }).length || 0;

  return (
    <>
      {pendingCount > 0 && (
        <div className="mb-4 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center gap-2">
            <CheckCircle size={20} className="text-amber-600" />
            <p className="text-sm font-medium text-amber-800">
              Hay {pendingCount} usuario(s) pendiente(s) de aprobación
            </p>
          </div>
        </div>
      )}

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
                    Nombre
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Estado Aprobación
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
                {paginatedUsers.map((user) => {
                  const userApprovalStatus = user.approvalStatus || 'PENDING';
                  const isPending = userApprovalStatus === 'PENDING';
                  
                  return (
                    <tr key={user.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {user.name}
                      </td>

                      <td className="px-4 py-3 text-gray-700">
                        {user.email}
                      </td>

                      <td className="px-4 py-3 text-gray-700">
                        {user.role}
                      </td>

                      <td className="px-4 py-3 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                            userApprovalStatus === 'APPROVED'
                              ? "bg-green-100 text-green-800"
                              : userApprovalStatus === 'PENDING'
                              ? "bg-amber-100 text-amber-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {userApprovalStatus === 'APPROVED' ? 'Aprobado' :
                           userApprovalStatus === 'PENDING' ? 'Pendiente' : 'Rechazado'}
                        </span>
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

                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          {isPending ? (
                            <>
                              <button
                                onClick={() => handleApprove(user)}
                                className="flex items-center gap-1 text-green-600 hover:text-green-800 font-medium transition"
                                title="Aprobar usuario"
                              >
                                <CheckCircle className="w-4 h-4" />
                                <span>Aprobar</span>
                              </button>
                              <button
                                onClick={() => handleReject(user)}
                                className="flex items-center gap-1 text-red-600 hover:text-red-800 font-medium transition"
                                title="Rechazar usuario"
                              >
                                <XCircle className="w-4 h-4" />
                                <span>Rechazar</span>
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => setEditUser(user)}
                              className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium transition"
                            >
                              <Edit className="w-4 h-4" />
                              <span>Editar</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
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

      {approvalUser && (
        <ApprovalModal
          open
          user={approvalUser}
          action={approvalAction}
          onClose={() => setApprovalUser(null)}
          onConfirm={confirmApproval}
        />
      )}
    </>
  );
}