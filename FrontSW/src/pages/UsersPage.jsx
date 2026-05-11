import { useEffect, useState } from "react";

import {
  Pencil,
  Trash2,
  Plus,
  Check,
  Users,
  Shield,
  Phone,
  Mail,
  X,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
} from "../services/userService";

function UsersPage() {
  const { auth } = useAuth();

  const [users, setUsers] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [showModal, setShowModal] =
    useState(false);

  const [editingUser, setEditingUser] =
    useState(null);

  const [formData, setFormData] =
    useState({
      name: "",
      email: "",
      phone: "",
      role: "USER",
      password: "",
    });

  const isAdmin =
    auth.user.role === "ADMIN";

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);

      const response =
        await getUsers(auth.token);

      const data = response.data;

      setUsers(
        data.content || data || []
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingUser(null);

    setFormData({
      name: "",
      email: "",
      phone: "",
      role: "USER",
      password: "",
    });

    setShowModal(true);
  };

  const openEditModal = (user) => {
    setEditingUser(user);

    setFormData({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      role: user.role || "USER",
      password: "",
    });

    setShowModal(true);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]:
        e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const body = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
      };

      if (
        formData.password &&
        formData.password.trim() !== ""
      ) {
        body.password =
          formData.password;
      }

      if (editingUser) {
        await updateUser(
          editingUser.id,
          body,
          auth.token
        );
      } else {
        await createUser(
          body,
          auth.token
        );
      }

      setShowModal(false);

      loadUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Delete this user?"
    );

    if (!confirmDelete) return;

    try {
      await deleteUser(
        id,
        auth.token
      );

      loadUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050816] flex items-center justify-center overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(120,119,198,0.25),transparent_40%)]" />

        <div className="flex flex-col items-center gap-5 z-10">
          <div className="relative">
            <div className="h-20 w-20 rounded-full border-4 border-white/10" />

            <div className="absolute inset-0 h-20 w-20 rounded-full border-4 border-violet-500 border-t-transparent animate-spin" />
          </div>

          <div className="text-center">
            <h2 className="text-2xl font-bold text-white">
              Loading Users
            </h2>

            <p className="text-gray-400 mt-2">
              Preparing dashboard...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#050816] flex items-center justify-center p-6">
        <div className="bg-red-500/10 border border-red-500/20 text-red-300 px-6 py-5 rounded-3xl backdrop-blur-xl">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 py-10">

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-10">

          <div>
            <p className="text-slate-500 font-medium mb-2">
              User Management
            </p>

            <h1 className="text-4xl font-bold text-slate-900">
              Users
            </h1>

            <p className="text-slate-600 mt-3 max-w-2xl">
              Manage users, permissions,
              and account information.
            </p>
          </div>

          {isAdmin && (
            <button
              onClick={openCreateModal}
              className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-3 rounded-xl transition-all shadow-sm"
            >
              <Plus size={18} />
              Create User
            </button>
          )}

        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-slate-500 text-sm">
                  Total Users
                </p>

                <h2 className="text-3xl font-bold mt-2 text-slate-900">
                  {users.length}
                </h2>
              </div>

              <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center">
                <Users
                  size={22}
                  className="text-slate-700"
                />
              </div>

            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-slate-500 text-sm">
                  Active Users
                </p>

                <h2 className="text-3xl font-bold mt-2 text-slate-900">
                  {
                    users.filter(
                      (u) => u.active
                    ).length
                  }
                </h2>
              </div>

              <div className="h-12 w-12 rounded-xl bg-green-100 flex items-center justify-center">
                <Check
                  size={22}
                  className="text-green-700"
                />
              </div>

            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-slate-500 text-sm">
                  Admins
                </p>

                <h2 className="text-3xl font-bold mt-2 text-slate-900">
                  {
                    users.filter(
                      (u) =>
                        u.role === "ADMIN"
                    ).length
                  }
                </h2>
              </div>

              <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <Shield
                  size={22}
                  className="text-blue-700"
                />
              </div>

            </div>
          </div>

        </div>

        <div className="space-y-5">

          {users.map((user) => (
            <div
              key={user.id}
              className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all"
            >

              <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-8">

                <div className="flex gap-5">

                  <div className="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center shrink-0">
                    <Users
                      size={30}
                      className="text-slate-700"
                    />
                  </div>

                  <div>

                    <div className="flex flex-wrap items-center gap-3 mb-3">

                      <h2 className="text-2xl font-bold text-slate-900">
                        {user.name}
                      </h2>

                      {user.active ? (
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                          Active
                        </span>
                      ) : (
                        <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium">
                          Inactive
                        </span>
                      )}

                    </div>

                    <div className="flex flex-wrap gap-4 mt-5">

                      <div className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 min-w-[220px]">
                        <p className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                          <Mail size={12} />
                          Email
                        </p>

                        <p className="font-medium text-slate-800">
                          {user.email}
                        </p>
                      </div>

                      <div className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 min-w-[180px]">
                        <p className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                          <Phone size={12} />
                          Phone
                        </p>

                        <p className="font-medium text-slate-800">
                          {user.phone || "N/A"}
                        </p>
                      </div>

                      <div className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 min-w-[140px]">
                        <p className="text-xs text-slate-500 mb-1">
                          Role
                        </p>

                        <p className="font-medium text-slate-800">
                          {user.role}
                        </p>
                      </div>

                    </div>

                  </div>

                </div>

                {isAdmin && (
                  <div className="flex flex-col sm:flex-row xl:flex-col gap-3">

                    <button
                      onClick={() =>
                        openEditModal(user)
                      }
                      className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl transition"
                    >
                      <Pencil size={18} />
                      Edit
                    </button>

                    <button
                      onClick={() =>
                        handleDelete(user.id)
                      }
                      className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-xl transition"
                    >
                      <Trash2 size={18} />
                      Delete
                    </button>

                  </div>
                )}

              </div>

            </div>
          ))}

        </div>

      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-5 z-50">

          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-slate-200">

            <div className="flex items-center justify-between p-8 border-b border-slate-100">

              <div>
                <h2 className="text-3xl font-bold text-slate-900">
                  {editingUser
                    ? "Edit User"
                    : "Create User"}
                </h2>

                <p className="text-slate-500 mt-2">
                  Fill in the user details below.
                </p>
              </div>

              <button
                onClick={() =>
                  setShowModal(false)
                }
                className="h-11 w-11 rounded-xl hover:bg-slate-100 flex items-center justify-center transition"
              >
                <X
                  size={20}
                  className="text-slate-600"
                />
              </button>

            </div>

            <form
              onSubmit={handleSubmit}
              className="p-8 space-y-5"
            >

              <div className="grid md:grid-cols-2 gap-5">

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Name
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter full name"
                    className="w-full border border-slate-200 focus:border-slate-400 outline-none px-4 py-3 rounded-xl transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Email
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter email"
                    className="w-full border border-slate-200 focus:border-slate-400 outline-none px-4 py-3 rounded-xl transition"
                    required
                  />
                </div>

              </div>

              <div className="grid md:grid-cols-2 gap-5">

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Phone
                  </label>

                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter phone"
                    className="w-full border border-slate-200 focus:border-slate-400 outline-none px-4 py-3 rounded-xl transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Role
                  </label>

                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full border border-slate-200 focus:border-slate-400 outline-none px-4 py-3 rounded-xl transition"
                  >
                    <option value="USER">
                      USER
                    </option>

                    <option value="MANAGER">
                      MANAGER
                    </option>

                    <option value="ADMIN">
                      ADMIN
                    </option>
                  </select>
                </div>

              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Password
                </label>

                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder={
                    editingUser
                      ? "Leave blank to keep current password"
                      : "Enter password"
                  }
                  className="w-full border border-slate-200 focus:border-slate-400 outline-none px-4 py-3 rounded-xl transition"
                  required={!editingUser}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">

                <button
                  type="button"
                  onClick={() =>
                    setShowModal(false)
                  }
                  className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white transition"
                >
                  {editingUser
                    ? "Save Changes"
                    : "Create User"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}
    </div>
  );
}

export default UsersPage;