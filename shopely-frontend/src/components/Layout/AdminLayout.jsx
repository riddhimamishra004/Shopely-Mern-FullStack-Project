import { NavLink, Outlet, useNavigate, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  LayoutDashboard, Package, FolderTree, ShoppingBag,
  Users, Star, Tag, BarChart3, Settings, LogOut, Menu, X,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

const NAV_ITEMS = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/categories", label: "Categories", icon: FolderTree },
  { to: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { to: "/admin/customers", label: "Customers", icon: Users },
  { to: "/admin/reviews", label: "Payment_Id", icon: Star },
  { to: "/admin/coupons", label: "Coupons", icon: Tag },
  { to: "/admin/reports", label: "Reports", icon: BarChart3 },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout() {
  const { user, isAdmin, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setSidebarOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (loading) return null;
  if (!user || !isAdmin) return <Navigate to="/admin/login" replace />;

  // Direct logout — no popup
  function handleLogout() {
    logout();
    navigate("/admin/login", { replace: true });
  }

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-stone-200 px-5">
        <span className="text-lg font-bold tracking-tight text-stone-900">
          Shop<span className="text-orange-600">ly</span>{" "}
          <span className="font-normal text-stone-400">Admin</span>
        </span>
        <button
          onClick={() => setSidebarOpen(false)}
          className="rounded-md p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-700 lg:hidden"
        >
          <X size={20} />
        </button>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/admin/dashboard"}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${isActive
                ? "bg-orange-50 text-orange-700"
                : "text-stone-600 hover:bg-stone-50 hover:text-stone-900"
              }`
            }
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="shrink-0 border-t border-stone-200 p-3">
        {user && (
          <div className="mb-2 flex items-center gap-2.5 rounded-md bg-stone-50 px-3 py-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-700">
              {user.name?.charAt(0)?.toUpperCase() || "A"}
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-stone-800">{user.name}</p>
              <p className="truncate text-[10px] text-stone-400">{user.email}</p>
            </div>
          </div>
        )}
        {/* Direct logout — no confirmation popup */}
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-red-500 transition-colors hover:bg-red-50 hover:text-red-700"
        >
          <LogOut size={17} />
          Log out
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-stone-100">
      {/* Desktop Sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-stone-200 bg-white lg:flex">
        <SidebarContent />
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-stone-200 bg-white shadow-xl transition-transform duration-300 ease-in-out lg:hidden ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile Top Bar */}
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-stone-200 bg-white px-4 lg:hidden">
          <span className="text-base font-bold tracking-tight text-stone-900">
            Shop<span className="text-orange-600">ly</span>{" "}
            <span className="font-normal text-stone-400">Admin</span>
          </span>
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-md p-1.5 text-stone-600 hover:bg-stone-100 hover:text-stone-900 transition-colors"
            aria-label="Open sidebar"
          >
            <Menu size={22} />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
