import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi, loginSchema } from "@church/shared";
import { useAuthStore } from "../stores/auth.store";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setAuth, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) navigate("/");
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      setError(parsed.error.errors[0].message);
      return;
    }

    setLoading(true);
    try {
      const result = await authApi.login(parsed.data);

      if (result.role !== "admin") {
        setError("Access denied. Admin accounts only.");
        setLoading(false);
        return;
      }

      setAuth(
        {
          id: result.id,
          name: result.name,
          email: result.email,
          phone: result.phone,
          role: result.role,
          memberType: result.memberType,
          approvalStatus: result.approvalStatus,
        },
        result.token
      );
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div
            className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center text-3xl"
            style={{
              background: "linear-gradient(135deg, #a855f7, #ec4899)",
              boxShadow: "0 16px 40px -12px rgba(168, 85, 247, 0.6)",
            }}
          >
            ⛪
          </div>
          <h1 className="mt-5 text-3xl font-bold gradient-text">
            Welcome Back
          </h1>
          <p className="text-sm mt-2" style={{ color: "#7c3aed" }}>
            Sign in to your admin dashboard
          </p>
        </div>

        <div className="glass-card rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "#581c87" }}
              >
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="purple-input w-full px-4 py-3 rounded-xl text-sm"
                placeholder="admin@church.com"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  className="block text-sm font-medium"
                  style={{ color: "#581c87" }}
                >
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium"
                  style={{ color: "#a855f7" }}
                >
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="purple-input w-full px-4 py-3 rounded-xl text-sm"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div
                className="px-4 py-3 rounded-xl text-sm"
                style={{
                  background: "rgba(254, 226, 226, 0.8)",
                  border: "1px solid #fecaca",
                  color: "#b91c1c",
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 rounded-xl font-medium text-sm"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div
            className="mt-6 pt-6 text-center"
            style={{ borderTop: "1px solid rgba(168, 85, 247, 0.15)" }}
          >
            <p className="text-xs" style={{ color: "#7c3aed" }}>
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="font-semibold"
                style={{ color: "#a855f7" }}
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: "#a78bfa" }}>
          Church Payments System © 2026
        </p>
      </div>
    </div>
  );
}