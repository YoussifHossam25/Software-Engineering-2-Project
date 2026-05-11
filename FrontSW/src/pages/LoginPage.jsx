import { useState } from "react";
import {
  useNavigate,
  Link,
} from "react-router-dom";

import {
  Mail,
  Lock,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

import { loginUser } from "../services/authService";

import { useAuth } from "../context/AuthContext";

function LoginPage() {
  const navigate = useNavigate();

  const { login } = useAuth();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const handleSubmit = async (e) => {
  e.preventDefault();

  setError("");

  try {
    setLoading(true);

    const response = await loginUser(
      email,
      password
    );

    const data = response.data;

    login(data.token, {
      id: data.userId,
      email: data.email,
      name: data.name,
      role: data.role,
    });

    if (data.role === "DELIVERY") {
      navigate("/deliveries");
    } else {
      navigate("/products");
    }
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center px-4 py-10 relative overflow-hidden">
      <div className="absolute top-[-120px] left-[-120px] w-[300px] h-[300px] bg-blue-500/30 rounded-full blur-3xl" />

      <div className="absolute bottom-[-120px] right-[-120px] w-[300px] h-[300px] bg-purple-500/30 rounded-full blur-3xl" />

      <div className="relative w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-xl border border-white/10 shadow-2xl rounded-3xl p-8 md:p-10">
          <div className="mb-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
              <ShieldCheck className="text-white w-8 h-8" />
            </div>

            <h1 className="text-3xl font-bold text-white">
              Welcome Back
            </h1>

            <p className="text-gray-400 mt-2 text-sm">
              Login to continue shopping
            </p>
          </div>

          {error && (
            <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div>
              <label className="text-sm text-gray-300 mb-2 block">
                Email Address
              </label>

              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />

                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) =>
                    setEmail(
                      e.target.value
                    )
                  }
                  className="w-full bg-white/5 border border-white/10 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all outline-none rounded-xl py-3.5 pl-12 pr-4 text-white placeholder:text-gray-500"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-300 mb-2 block">
                Password
              </label>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />

                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) =>
                    setPassword(
                      e.target.value
                    )
                  }
                  className="w-full bg-white/5 border border-white/10 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all outline-none rounded-xl py-3.5 pl-12 pr-4 text-white placeholder:text-gray-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 text-white font-semibold py-3.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 disabled:opacity-70"
            >
              {loading
                ? "Logging In..."
                : "Login"}

              {!loading && (
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              )}
            </button>
          </form>

          <p className="text-center text-gray-400 text-sm mt-8">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
            >
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
