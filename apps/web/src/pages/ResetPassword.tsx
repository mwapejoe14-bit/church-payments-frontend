import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { authApi, resetPasswordSchema } from "@church/shared";

export default function ResetPassword() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [validToken, setValidToken] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setVerifying(false);
      return;
    }
    authApi.verifyResetToken(token).then((valid) => {
      setValidToken(valid);
      setVerifying(false);
    });
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const parsed = resetPasswordSchema.safeParse({
      password,
      confirmPassword,
    });
    if (!parsed.success) {
      setError(parsed.error.errors[0].message);
      return;
    }

    if (!token) {
      setError("Invalid reset link");
      return;
    }

    setLoading(true);
    try {
      await authApi.resetPassword(token, parsed.data.password);
      setSuccess(true);
      setTimeout(() => navigate("/login"), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reset failed");
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
            🔐
          </div>
          <h1 className="mt-5 text-3xl font-bold gradient-text">
            Set New Password
          </h1>
          <p className="text-sm mt-2" style={{ color: "#7c3aed" }}>
            Choose a strong password for your account
          </p>
        </div>

        <div className="glass-card rounded-2xl p-8">
          {verifying ? (
            <p className="text-center text-sm" style={{ color: "#7c3aed" }}>
              Verifying reset link...
            </p>
          ) : !validToken ? (
            <div className="text-center">
              <div
                className="px-4 py-4 rounded-xl text-sm mb-4"
                style={{
                  background: "rgba(254, 226, 226, 0.8)",
                  border: "1px solid #fecaca",
                  color: "#b91c1c",
                }}
              >
                ❌ This reset link is invalid or has expired.
              </div>
              <Link
                to="/forgot-password"
                className="text-sm font-semibold"
                style={{ color: "#a855f7" }}
              >
                Request a new link
              </Link>
            </div>
          ) : success ? (
            <div
              className="px-4 py-4 rounded-xl text-sm"
              style={{
                background: "rgba(220, 252, 231, 0.8)",
                border: "1px solid #86efac",
                color: "#166534",
              }}
            >
              ✅ Password updated! Redirecting to login...
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: "#581c87" }}
                >
                  New Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="purple-input w-full px-4 py-3 rounded-xl text-sm"
                  placeholder="At least 6 characters"
                  required
                />
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: "#581c87" }}
                >
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="purple-input w-full px-4 py-3 rounded-xl text-sm"
                  placeholder="Re-enter password"
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
                {loading ? "Updating..." : "Update Password"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}