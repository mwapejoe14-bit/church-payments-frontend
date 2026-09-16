import { useState } from "react";
import { Link } from "react-router-dom";
import { authApi, forgotPasswordSchema } from "@church/shared";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    const parsed = forgotPasswordSchema.safeParse({ email });
    if (!parsed.success) {
      setError(parsed.error.errors[0].message);
      return;
    }

    setLoading(true);
    try {
      const result = await authApi.forgotPassword(parsed.data.email);
      setMessage(
        result.message ||
          "If an account exists, a reset link has been sent to your email."
      );
      setEmail("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-bg flex items-center justify-center p-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div
            className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center text-3xl"
            style={{
              background: "linear-gradient(135deg, #a855f7, #ec4899)",
              boxShadow: "0 16px 40px -12px rgba(168, 85, 247, 0.6)",
            }}
          >
            🔑
          </div>
          <h1 className="mt-5 text-3xl font-bold gradient-text">
            Forgot Password?
          </h1>
          <p className="text-sm mt-2" style={{ color: "#7c3aed" }}>
            We'll send you a link to reset it
          </p>
        </div>

        <div className="glass-card rounded-2xl p-8">
          {message ? (
            <div
              className="px-4 py-4 rounded-xl text-sm mb-4"
              style={{
                background: "rgba(220, 252, 231, 0.8)",
                border: "1px solid #86efac",
                color: "#166534",
              }}
            >
              ✅ {message}
            </div>
          ) : (
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
                  placeholder="you@example.com"
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
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
          )}

          <div
            className="mt-6 pt-6 text-center"
            style={{ borderTop: "1px solid rgba(168, 85, 247, 0.15)" }}
          >
            <Link
              to="/login"
              className="text-xs font-medium"
              style={{ color: "#a855f7" }}
            >
              ← Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}