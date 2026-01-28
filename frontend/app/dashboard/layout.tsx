"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  Package,
  FileText,
  LogOut,
  Shield,
  Menu,
  User,
  Settings,
  Building2,
  Briefcase,
  MapPin,
  Layers,
  UserCog,
  ChevronDown,
  ChevronRight,
  Calendar,
} from "lucide-react";

import EditarPerfilModal from "./sistema/users/components/EditarPerfilModal";

interface MeUser {
  email: string;
  role: "ADMIN" | "USER";
  active: boolean;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [user, setUser] = useState<MeUser | null>(null);
  const [expandedSections, setExpandedSections] = useState<string[]>(["sistema"]);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    router.replace("/");
  }, [router]);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    );
  };


  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      logout();
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
      .then((data: MeUser) => {
        setUser(data);
      })
      .catch(() => logout());
  }, [logout]);

  if (!user) return null;

  const handleUpdateProfile = async (data: {
    email?: string;
    password?: string;
    currentPassword?: string;
  }) => {
    const token = localStorage.getItem("token");
    if (!token) {
      logout();
      return;
    }

    const res = await fetch("http://localhost:3001/users/me", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      alert("Error al actualizar perfil");
      return;
    }

    const updatedUser: MeUser = await res.json();
    setUser(updatedUser);
  };

  const navigation = [
    {
      id: "dashboard",
      label: "Inicio / Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
    },
    {
      id: "trabajadores",
      label: "Trabajadores",
      icon: Users,
      href: "/dashboard/trabajadores",
    },
    {
      id: "aft",
      label: "Activos Fijos Tangibles",
      icon: Package,
      href: "/dashboard/aft",
    },
    {
    id: "documentos",
    label: "Documentos",
    icon: FileText,
    href: "/dashboard/documentos",
    expandable: true,
    subsections: [
      {
        label: "Mensuales",
        icon: Calendar,
        href: "/dashboard/documentos/DocumentosMensuales",
      },
      {
        label: "Específicos",
        icon: FileText,
        href: "/dashboard/documentos/DocumentosEspecificos",
      },
    ],
    },
    {
      id: "sistema",
      label: "Sistema",
      icon: Shield,
      href: "/dashboard/sistema",
      expandable: true,
      adminOnly: true,
      subsections: [
        {
          label: "Usuarios",
          icon: UserCog,
          href: "/dashboard/sistema/users",
        },
        {
          label: "Áreas",
          icon: Building2,
          href: "/dashboard/sistema/areas",
        },
        {
          label: "Cargos",
          icon: Briefcase,
          href: "/dashboard/sistema/cargos",
        },
        {
          label: "Provincias",
          icon: MapPin,
          href: "/dashboard/sistema/provincias",
        },
        {
          label: "Subclasificaciones",
          icon: Layers,
          href: "/dashboard/sistema/subclasificaciones",
        },
      ],
    },
  ];

  const visibleNavigation = navigation.filter(
    (item) => !item.adminOnly || user.role === "ADMIN"
  );

  const isActive = (path: string) => pathname === path;
  const isExpanded = (id: string) => expandedSections.includes(id);

  return (
    <div className="min-h-screen bg-slate-100">

      <header className="fixed top-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-blue-700 shadow-md px-6 py-3.5 z-40">
        <div className="flex items-center gap-4">

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg text-white hover:bg-blue-700 transition"
            title="Alternar menú"
          >
            <Menu size={22} />
          </button>

          <Link 
            href="/dashboard" 
            className="flex items-center gap-3 hover:opacity-90 transition-opacity cursor-pointer"
          >
            <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <div className="text-white">
              <h1 className="font-bold text-lg">Vertex</h1>
            </div>
          </Link>
        </div>
      </header>

      {sidebarOpen && (
        <aside className="fixed left-0 top-[60px] bottom-0 w-72 bg-blue-900 text-white flex flex-col z-30 shadow-xl">

          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {visibleNavigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              const expanded = isExpanded(item.id);

              return (
                <div key={item.id}>
                
                  {item.expandable ? (
                    <button
                      onClick={() => toggleSection(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                        active
                          ? "bg-blue-600 text-white"
                          : "text-slate-200 hover:bg-blue-800"
                      }`}
                    >
                      <Icon size={18} className="flex-shrink-0" />
                      <span className="flex-1 text-left text-sm font-medium">
                        {item.label}
                      </span>
                      {expanded ? (
                        <ChevronDown size={16} />
                      ) : (
                        <ChevronRight size={16} />
                      )}
                    </button>
                  ) : (
                    <Link
                      href={item.href}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                        active
                          ? "bg-blue-600 text-white"
                          : "text-slate-200 hover:bg-blue-800"
                      }`}
                    >
                      <Icon size={18} className="flex-shrink-0" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </Link>
                  )}

                  {item.expandable &&
                    expanded &&
                    item.subsections && (
                      <div className="ml-4 mt-1 space-y-1">
                        {item.subsections.map((sub) => {
                          const SubIcon = sub.icon;
                          const subActive = isActive(sub.href);

                          return (
                            <Link
                              key={sub.href}
                              href={sub.href}
                              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition text-sm ${
                                subActive
                                  ? "bg-blue-700 text-white"
                                  : "text-slate-300 hover:bg-blue-800 hover:text-white"
                              }`}
                            >
                              <SubIcon size={16} />
                              <span>{sub.label}</span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                </div>
              );
            })}
          </nav>

          <div className="border-t border-white/10">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="w-full p-3 hover:bg-blue-800/50 transition flex items-center gap-3"
            >
              <div className="w-9 h-9 bg-white text-blue-600 rounded-full flex items-center justify-center">
                <User size={18} />
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user.email}
                </p>
                <p className="text-xs text-blue-300">
                  {user.role === "ADMIN" ? "Administrador" : "Usuario"}
                </p>
              </div>
              <ChevronDown
                size={16}
                className={`text-blue-400 transition-transform ${
                  userMenuOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {userMenuOpen && (
              <div className="bg-blue-800/50 border-t border-white/10">
                <button
                  onClick={() => {
                    setEditModalOpen(true);
                    setUserMenuOpen(false);
                  }}
                  className="w-full px-4 py-2.5 text-left hover:bg-blue-700/50 transition flex items-center gap-3 text-sm text-blue-100 hover:text-white"
                >
                  <Settings size={16} />
                  <span>Editar perfil</span>
                </button>
                <button
                  onClick={logout}
                  className="w-full px-4 py-2.5 text-left hover:bg-red-600/80 transition flex items-center gap-3 text-sm text-blue-200 hover:text-white"
                >
                  <LogOut size={16} />
                  <span>Cerrar sesión</span>
                </button>
              </div>
            )}
          </div>
        </aside>
      )}

      <main
        className={`transition-all duration-300 ${
          sidebarOpen ? "ml-72" : "ml-0"
        } mt-[60px] p-8`}
      >
        {children}
      </main>

      <EditarPerfilModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        user={{ email: user.email }}
        onSave={handleUpdateProfile}
      />
    </div>
  );
}