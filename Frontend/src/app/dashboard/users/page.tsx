"use client";

import { useEffect, useState } from "react";
import api from "../../../lib/api";
import { formatDate } from "../../../lib/utils";
import { useAuthStore } from "../../../store/auth.store";
import { UserPlus, Shield, Trash2, Search } from "lucide-react";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "employee",
    department: "",
    jobTitle: "",
  });
  const { user: currentUser } = useAuthStore();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data } = await api.get("/users");
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createUser = async () => {
    try {
      await api.post("/users", form);
      setShowForm(false);
      setForm({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        role: "employee",
        department: "",
        jobTitle: "",
      });
      await fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const updateRole = async (id: string, role: string) => {
    try {
      await api.patch(`/users/${id}`, { role });
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)));
    } catch (err) {
      console.error(err);
    }
  };

  const deleteUser = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      await api.delete(`/users/${id}`);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const roleColors: Record<string, string> = {
    super_admin: "text-purple-400 bg-purple-400/10",
    admin: "text-blue-400 bg-blue-400/10",
    compliance_officer: "text-green-400 bg-green-400/10",
    auditor: "text-yellow-400 bg-yellow-400/10",
    employee: "text-gray-400 bg-gray-400/10",
  };

  const statusColors: Record<string, string> = {
    active: "text-green-400 bg-green-400/10",
    inactive: "text-red-400 bg-red-400/10",
    suspended: "text-yellow-400 bg-yellow-400/10",
  };

  const filtered = users.filter((u) =>
    `${u.firstName} ${u.lastName} ${u.email}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">User Management</h1>
          <p className="text-gray-400 mt-1">{users.length} total users</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <UserPlus size={16} />
          Add User
        </button>
      </div>

      {/* Add User Form */}
      {showForm && (
        <div className="bg-gray-900 rounded-2xl p-6 border border-blue-500/30">
          <h3 className="text-white font-semibold mb-4">New User</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                First Name
              </label>
              <input
                value={form.firstName}
                onChange={(e) =>
                  setForm({ ...form, firstName: e.target.value })
                }
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="John"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Last Name
              </label>
              <input
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Doe"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Email</label>
              <input
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="john@company.com"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Password
              </label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Role</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="employee">Employee</option>
                <option value="auditor">Auditor</option>
                <option value="compliance_officer">Compliance Officer</option>
                <option value="admin">Admin</option>
                <option value="super_admin">Super Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Department
              </label>
              <input
                value={form.department}
                onChange={(e) =>
                  setForm({ ...form, department: e.target.value })
                }
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Engineering"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Job Title
              </label>
              <input
                value={form.jobTitle}
                onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Software Engineer"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={createUser}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium"
            >
              Create User
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
          size={16}
        />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search users..."
          className="w-full bg-gray-900 border border-gray-800 text-white rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Users Table */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">
                User
              </th>
              <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">
                Role
              </th>
              <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">
                Department
              </th>
              <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">
                Status
              </th>
              <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">
                Joined
              </th>
              <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u, i) => (
              <tr
                key={u.id}
                className={`border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors ${i % 2 === 0 ? "" : "bg-gray-800/10"}`}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0">
                      <span className="text-white text-xs font-bold">
                        {u.firstName?.[0]}
                        {u.lastName?.[0]}
                      </span>
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">
                        {u.firstName} {u.lastName}
                      </p>
                      <p className="text-gray-500 text-xs">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {currentUser?.role === "super_admin" &&
                    u.id !== currentUser?.id ? (
                    <select
                      value={u.role}
                      onChange={(e) => updateRole(u.id, e.target.value)}
                      className="bg-gray-800 text-white text-xs rounded-lg px-2 py-1 border border-gray-700 focus:outline-none"
                    >
                      <option value="employee">Employee</option>
                      <option value="auditor">Auditor</option>
                      <option value="compliance_officer">
                        Compliance Officer
                      </option>
                      <option value="admin">Admin</option>
                      <option value="super_admin">Super Admin</option>
                    </select>
                  ) : (
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${roleColors[u.role] || "text-gray-400 bg-gray-400/10"}`}
                    >
                      {u.role?.replace("_", " ")}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-gray-400 text-sm">
                  {u.department || "-"}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[u.status] || "text-gray-400 bg-gray-400/10"}`}
                  >
                    {u.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-400 text-sm">
                  {formatDate(u.createdAt)}
                </td>
                <td className="px-6 py-4">
                  {u.id !== currentUser?.id && (
                    <button
                      onClick={() => deleteUser(u.id)}
                      className="text-gray-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
