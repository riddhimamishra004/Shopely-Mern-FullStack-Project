// import { useState } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import {
//   Menu,
//   LayoutDashboard,
//   ShoppingCart,
//   Package,
//   Users,
//   DollarSign,
//   BarChart2,
//   Tag,
//   Settings,
//   LogOut,
//   ChevronRight,
// } from "lucide-react";
// import { useAuth } from "../../hooks/useAuth";

// const navItems = [
//   { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" },
//   { id: "orders", label: "Orders", icon: ShoppingCart, path: "/admin/orders" },
//   { id: "products", label: "Products", icon: Package, path: "/admin/products" },
//   { id: "customers", label: "Customers", icon: Users, path: "/admin/customers" },
//   { id: "revenue", label: "Revenue", icon: DollarSign, path: "/admin/revenue" },
//   { id: "reports", label: "Reports", icon: BarChart2, path: "/admin/reports" },
//   { id: "coupons", label: "Coupons", icon: Tag, path: "/admin/coupons" },
// ];

// export default function Sidebar() {
//   const [collapsed, setCollapsed] = useState(false);
//   const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
//   const navigate = useNavigate();
//   const location = useLocation();
//   const { user, logout } = useAuth();

//   function handleLogout() {
//     logout();
//     navigate("/login", { replace: true });
//   }

//   function getActive() {
//     return navItems.find((item) => location.pathname.startsWith(item.path))?.id;
//   }

//   const activePage = getActive();

//   return (
//     <>
//       <div
//         className={`relative flex h-screen flex-col border-r border-stone-200 bg-white transition-all duration-300 ${collapsed ? "w-16" : "w-56"
//           }`}
//       >
//         {/* ── Logo / Brand ── */}
//         <div className="flex h-16 items-center gap-3 border-b border-stone-200 px-3">
//           <button
//             onClick={() => setCollapsed((c) => !c)}
//             aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
//             className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-stone-500 transition-colors hover:bg-stone-100"
//           >
//             <Menu size={18} />
//           </button>
//           {!collapsed && (
//             <div className="min-w-0">
//               <span className="block truncate text-sm font-bold text-stone-900">
//                 Shop<span className="text-orange-600">ly</span>
//               </span>
//               <span className="block text-[10px] text-stone-400">Admin Panel</span>
//             </div>
//           )}
//         </div>

//         {/* ── Nav items ── */}
//         <nav className="flex-1 overflow-y-auto px-2 py-3">
//           <div className="space-y-0.5">
//             {!collapsed && (
//               <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-stone-400">
//                 Main Menu
//               </p>
//             )}
//             {navItems.map((item) => {
//               const Icon = item.icon;
//               const isActive = activePage === item.id;
//               return (
//                 <button
//                   key={item.id}
//                   onClick={() => navigate(item.path)}
//                   title={collapsed ? item.label : undefined}
//                   className={`group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-150 ${isActive
//                       ? "bg-orange-50 text-orange-700 font-medium"
//                       : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
//                     } ${collapsed ? "justify-center" : ""}`}
//                 >
//                   {/* Active indicator bar */}
//                   {isActive && !collapsed && (
//                     <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-orange-600" />
//                   )}

//                   <Icon
//                     size={18}
//                     className={`shrink-0 transition-transform group-hover:scale-110 ${isActive ? "text-orange-600" : ""
//                       }`}
//                   />

//                   {!collapsed && (
//                     <>
//                       <span className="flex-1 truncate text-left">{item.label}</span>
//                       {isActive && (
//                         <ChevronRight size={14} className="text-orange-400" />
//                       )}
//                     </>
//                   )}

//                   {/* Tooltip for collapsed state */}
//                   {collapsed && (
//                     <div className="pointer-events-none absolute left-full z-50 ml-3 hidden whitespace-nowrap rounded-md border border-stone-200 bg-white px-2.5 py-1.5 text-xs font-medium text-stone-700 shadow-lg group-hover:block">
//                       {item.label}
//                     </div>
//                   )}
//                 </button>
//               );
//             })}
//           </div>
//         </nav>

//         {/* ── Bottom section ── */}
//         <div className="border-t border-stone-100 px-2 py-3">
//           {/* User info (expanded only) */}
//           {!collapsed && user && (
//             <div className="mb-2 flex items-center gap-2.5 rounded-lg bg-stone-50 px-3 py-2.5">
//               <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-700">
//                 {user.name?.charAt(0)?.toUpperCase() || "A"}
//               </div>
//               <div className="min-w-0">
//                 <p className="truncate text-xs font-semibold text-stone-800">{user.name}</p>
//                 <p className="truncate text-[10px] text-stone-400">{user.email}</p>
//               </div>
//             </div>
//           )}

//           {/* Settings */}
//           <button
//             onClick={() => navigate("/admin/settings")}
//             title={collapsed ? "Settings" : undefined}
//             className={`group relative mb-0.5 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-stone-600 transition-colors hover:bg-stone-100 hover:text-stone-900 ${collapsed ? "justify-center" : ""
//               }`}
//           >
//             <Settings size={18} className="shrink-0" />
//             {!collapsed && <span>Settings</span>}
//             {collapsed && (
//               <div className="pointer-events-none absolute left-full z-50 ml-3 hidden whitespace-nowrap rounded-md border border-stone-200 bg-white px-2.5 py-1.5 text-xs font-medium text-stone-700 shadow-lg group-hover:block">
//                 Settings
//               </div>
//             )}
//           </button>

//           {/* Logout */}
//           <button
//             onClick={() => setShowLogoutConfirm(true)}
//             title={collapsed ? "Log out" : undefined}
//             className={`group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-500 transition-colors hover:bg-red-50 hover:text-red-700 ${collapsed ? "justify-center" : ""
//               }`}
//           >
//             <LogOut size={18} className="shrink-0" />
//             {!collapsed && <span>Log out</span>}
//             {collapsed && (
//               <div className="pointer-events-none absolute left-full z-50 ml-3 hidden whitespace-nowrap rounded-md border border-stone-200 bg-white px-2.5 py-1.5 text-xs font-medium text-red-600 shadow-lg group-hover:block">
//                 Log out
//               </div>
//             )}
//           </button>
//         </div>
//       </div>

//       {/* ── Logout Confirm Modal ── */}
//       {showLogoutConfirm && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
//           <div className="w-full max-w-sm rounded-xl border border-stone-200 bg-white p-6 shadow-xl">
//             <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
//               <LogOut size={22} className="text-red-600" />
//             </div>
//             <h2 className="text-base font-semibold text-stone-900">Log out?</h2>
//             <p className="mt-1 text-sm text-stone-500">
//               You'll be redirected to the login page. Any unsaved changes will be lost.
//             </p>
//             <div className="mt-5 flex gap-2">
//               <button
//                 onClick={() => setShowLogoutConfirm(false)}
//                 className="flex-1 rounded-lg border border-stone-200 bg-white py-2 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-50"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleLogout}
//                 className="flex-1 rounded-lg bg-red-600 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
//               >
//                 Log out
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// }