import { useState } from "react";

import {
  Menu,
  X,
  ShoppingBag,
  LayoutDashboard,
  Package,
  Truck,
  Boxes,
  Users,
  ClipboardList,
  LogOut,
} from "lucide-react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { auth, logout } = useAuth();

  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] =
    useState(false);

  const role = auth?.user?.role;

  const handleLogout = () => {
    logout();

    navigate("/login");
  };

  let navLinks = [];

  if (role === "ADMIN") {
    navLinks = [
      {
        label: "Orders",
        path: "/orders",
        icon: ClipboardList,
      },
      {
        label: "Products",
        path: "/products",
        icon: Package,
      },
      {
        label: "Deliveries",
        path: "/deliveries",
        icon: Truck,
      },
      {
        label: "Users",
        path: "/users",
        icon: Users,
      },
    ];
  }

  if (role === "MANAGER") {
    navLinks = [
      {
        label: "Orders",
        path: "/orders",
        icon: ClipboardList,
      },
      {
        label: "Products",
        path: "/products",
        icon: Package,
      },
      {
        label: "Deliveries",
        path: "/deliveries",
        icon: Truck,
      },
    ];
  }

  if (role === "CUSTOMER") {
    navLinks = [
      {
        label: "Products",
        path: "/products",
        icon: Package,
      },
      {
        label: "My Orders",
        path: "/orders",
        icon: ClipboardList,
      },
    ];
  }

  if (role === "DELIVERY") {
    navLinks = [
      {
        label: "Deliveries",
        path: "/deliveries",
        icon: Truck,
      },
    ];
  }

  return (
    <>
      <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-md">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

          <div className="flex items-center gap-10">

            <Link
              to="/"
              className="flex items-center gap-3 shrink-0"
            >

              <div className="h-10 w-10 rounded-xl bg-slate-900 flex items-center justify-center shadow-sm">
                <ShoppingBag className="h-5 w-5 text-white" />
              </div>

              <div className="leading-tight">
                <h1 className="text-lg font-bold text-slate-900">
                  NexCart
                </h1>

                <p className="text-[11px] text-slate-500">
                  Commerce Platform
                </p>
              </div>

            </Link>

            <div className="hidden lg:flex items-center gap-2">

              {navLinks.map((link) => {
                const Icon = link.icon;

                return (
                  <Link
                    key={link.label}
                    to={link.path}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
                  >
                    <Icon size={17} />

                    {link.label}
                  </Link>
                );
              })}

            </div>

          </div>

          <div className="flex items-center gap-3">

            <div className="hidden md:flex items-center px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 text-sm font-medium">
              {role}
            </div>

            <button
              onClick={handleLogout}
              className="hidden md:flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl transition"
            >
              <LogOut size={16} />
              Logout
            </button>

            <button
              onClick={() =>
                setMobileOpen(true)
              }
              className="lg:hidden h-10 w-10 rounded-xl hover:bg-slate-100 flex items-center justify-center transition"
            >
              <Menu className="h-6 w-6 text-slate-700" />
            </button>

          </div>

        </div>

      </nav>

      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-50 lg:hidden"
          onClick={() =>
            setMobileOpen(false)
          }
        />
      )}

      <div
        className={`fixed top-0 right-0 h-full w-[320px] bg-white z-50 shadow-2xl transform transition-transform duration-300 lg:hidden ${
          mobileOpen
            ? "translate-x-0"
            : "translate-x-full"
        }`}
      >

        <div className="flex items-center justify-between p-5 border-b border-slate-200">

          <Link
            to="/"
            onClick={() =>
              setMobileOpen(false)
            }
            className="flex items-center gap-3"
          >

            <div className="h-10 w-10 rounded-xl bg-slate-900 flex items-center justify-center">
              <ShoppingBag className="h-5 w-5 text-white" />
            </div>

            <div>
              <h1 className="font-bold text-slate-900">
                NexCart
              </h1>

              <p className="text-xs text-slate-500">
                Commerce Platform
              </p>
            </div>

          </Link>

          <button
            onClick={() =>
              setMobileOpen(false)
            }
            className="h-10 w-10 rounded-xl hover:bg-slate-100 flex items-center justify-center transition"
          >
            <X className="h-5 w-5 text-slate-700" />
          </button>

        </div>

        <div className="p-4 space-y-2">

          {navLinks.map((link) => {
            const Icon = link.icon;

            return (
              <Link
                key={link.label}
                to={link.path}
                onClick={() =>
                  setMobileOpen(false)
                }
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-700 hover:bg-slate-100 transition"
              >
                <Icon size={20} />

                <span className="font-medium">
                  {link.label}
                </span>
              </Link>
            );
          })}

        </div>

        <div className="absolute bottom-0 left-0 right-0 border-t border-slate-200 p-4">

          <div className="flex items-center justify-between mb-4 px-1">

            <span className="text-sm text-slate-500">
              Signed in as
            </span>

            <span className="text-sm font-semibold text-slate-800">
              {role}
            </span>

          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl transition"
          >
            <LogOut size={18} />
            Logout
          </button>

        </div>

      </div>
    </>
  );
}
