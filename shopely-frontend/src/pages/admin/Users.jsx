import { useState, useEffect, useMemo } from "react";
import {
  Users, Search, Trash2, Shield, ShieldOff,
  Loader2, AlertCircle, X, Check, UserCircle2, Mail, Calendar,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

function authHeaders() {
  const token = localStorage.getItem("token");
  return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
}

function RoleBadge({ role }) {
  return role === "admin"
    ? <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-semibold text-orange-700"><Shield size={11} />Admin</span>
    : <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-medium text-stone-600"><ShieldOff size={11} />User</span>;
}

function DeleteConfirm({ user, onConfirm, onClose }) {
  const [deleting, setDeleting] = useState(false);
  async function go() {
    setDeleting(true);
    await onConfirm();
    setDeleting(false);
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4" onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl border border-stone-200 bg-white p-6 shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-red-50">
          <Trash2 size={20} className="text-red-600" />
        </div>
        <h2 className="text-base font-semibold text-stone-900">Delete User?</h2>
        <p className="mt-1 text-sm text-stone-500">
          <span className="font-medium text-stone-700">"{user.name}"</span> ka account permanently delete ho jayega.
        </p>
        <div className="mt-5 flex gap-2">
          <button onClick={onClose} className="flex-1 rounded-lg border border-stone-200 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50">Cancel</button>
          <button onClick={go} disabled={deleting}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-70">
            {deleting && <Loader2 size={14} className="animate-spin" />}
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => { fetchUsers(); }, []);

  async function fetchUsers() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/users`, { headers: authHeaders() });
      if (!res.ok) throw new Error("Failed to load users");
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  async function handleRoleToggle(user) {
    const newRole = user.role === "admin" ? "user" : "admin";
    setUpdatingId(user._id);
    try {
      const res = await fetch(`${API_BASE}/users/${user._id}/role`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({ role: newRole }),
      });
      if (!res.ok) throw new Error("Role update failed");
      const updated = await res.json();
      setUsers(prev => prev.map(u => u._id === user._id ? { ...u, role: updated.role } : u));
      showToast(`${user.name} is now ${newRole}`);
    } catch (err) {
      showToast("Error: " + err.message);
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleDelete() {
    try {
      const res = await fetch(`${API_BASE}/users/${deleteTarget._id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error("Delete failed");
      setUsers(prev => prev.filter(u => u._id !== deleteTarget._id));
      showToast("User delete ho gaya!");
      setDeleteTarget(null);
    } catch (err) {
      showToast("Error: " + err.message);
    }
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter(u => {
      const matchQ = !q || u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
      const matchRole = roleFilter === "all" || u.role === roleFilter;
      return matchQ && matchRole;
    });
  }, [users, search, roleFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-stone-900">Users</h1>
          <p className="text-sm text-stone-500">{users.length} registered users</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full rounded-lg border border-stone-300 bg-white py-2.5 pl-9 pr-4 text-sm outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500" />
        </div>
        <div className="flex gap-1.5">
          {["all", "user", "admin"].map(r => (
            <button key={r} onClick={() => setRoleFilter(r)}
              className={`rounded-lg border px-3 py-2.5 text-sm font-medium capitalize transition-colors ${roleFilter === r ? "bg-orange-600 text-white border-orange-600" : "border-stone-200 text-stone-600 hover:bg-stone-50"}`}>
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle size={16} /> {error}
          <button onClick={fetchUsers} className="ml-auto text-xs underline">Retry</button>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={24} className="animate-spin text-stone-400" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-stone-300 bg-white py-16">
          <Users size={36} className="mb-3 text-stone-300" />
          <p className="text-sm text-stone-400">No users found</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-stone-200 bg-white">
          {/* Desktop table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-stone-100 bg-stone-50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-stone-500">User</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-stone-500">Email</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-stone-500">Role</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-stone-500">Joined</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-stone-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {filtered.map(u => (
                  <tr key={u._id} className="hover:bg-stone-50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-100">
                          <UserCircle2 size={18} className="text-stone-400" />
                        </div>
                        <span className="font-medium text-stone-800">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-stone-500">{u.email}</td>
                    <td className="px-5 py-3"><RoleBadge role={u.role} /></td>
                    <td className="px-5 py-3 text-stone-400 text-xs">
                      {new Date(u.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleRoleToggle(u)} disabled={updatingId === u._id}
                          title={u.role === "admin" ? "Remove Admin" : "Make Admin"}
                          className={`rounded-md p-1.5 transition-colors disabled:opacity-50 ${u.role === "admin" ? "text-orange-600 hover:bg-orange-50" : "text-stone-400 hover:bg-stone-100"}`}>
                          {updatingId === u._id ? <Loader2 size={15} className="animate-spin" /> : <Shield size={15} />}
                        </button>
                        <button onClick={() => setDeleteTarget(u)} title="Delete"
                          className="rounded-md p-1.5 text-stone-400 transition-colors hover:bg-red-50 hover:text-red-600">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="sm:hidden divide-y divide-stone-100">
            {filtered.map(u => (
              <div key={u._id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-stone-100">
                      <UserCircle2 size={18} className="text-stone-400" />
                    </div>
                    <div>
                      <p className="font-medium text-stone-800">{u.name}</p>
                      <p className="text-xs text-stone-400">{u.email}</p>
                    </div>
                  </div>
                  <RoleBadge role={u.role} />
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-stone-400">
                    Joined {new Date(u.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                  <div className="flex gap-2">
                    <button onClick={() => handleRoleToggle(u)} disabled={updatingId === u._id}
                      className={`rounded-md border px-2.5 py-1 text-xs font-medium disabled:opacity-50 ${u.role === "admin" ? "border-orange-200 text-orange-600 hover:bg-orange-50" : "border-stone-200 text-stone-600 hover:bg-stone-50"}`}>
                      {updatingId === u._id ? "..." : u.role === "admin" ? "Remove Admin" : "Make Admin"}
                    </button>
                    <button onClick={() => setDeleteTarget(u)}
                      className="rounded-md border border-red-200 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {deleteTarget && (
        <DeleteConfirm user={deleteTarget} onConfirm={handleDelete} onClose={() => setDeleteTarget(null)} />
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700 shadow-lg">
          <Check size={16} className="text-green-600" /> {toast}
        </div>
      )}
    </div>
  );
}
