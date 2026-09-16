import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi, signupSchema } from "@church/shared";
import { useAuthStore } from "../stores/auth.store";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [memberType, setMemberType] = useState<"church" | "pta" | "both">(
    "both"
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const parsed = signupSchema.safeParse({
      name,
      email,
      phone,
      password,
      memberType,
    });
    if (!parsed.success) {
      setError(parsed.error.errors[0].message);
      return;
    }

    setLoading(true);
    try {
      const result = await authApi.signup({
        ...parsed.data,
        role: "admin",
      });
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
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const memberTypeOptions = [
    { value: "church" as const, label: "Church", icon: "⛪" },
    { value: "pta" as const, label: "PTA", icon: "🎓" },
    { value: "both" as const, label: "Both", icon: "✨" },
  ];

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
            ⛪
          </div>
          <h1 className="mt-5 text-3xl font-bold gradient-text">
            Create Account
          </h1>
          <p className="text-sm mt-2" style={{ color: "#7c3aed" }}>
            Join the church payments system
          </p>
        </div>

        <div className="glass-card rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "#581c87" }}
              >
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="purple-input w-full px-4 py-3 rounded-xl text-sm"
                placeholder="John Doe"
                required
              />
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "#581c87" }}
              >
                Email
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

            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "#581c87" }}
              >
                Phone
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="purple-input w-full px-4 py-3 rounded-xl text-sm"
                placeholder="0971234567"
                required
              />
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "#581c87" }}
              >
                Password
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
                I'm joining as
              </label>
              <div className="grid grid-cols-3 gap-2">
                {memberTypeOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setMemberType(opt.value)}
                    className="py-3 rounded-xl text-sm font-medium flex flex-col items-center gap-1"
                    style={{
                      background:
                        memberType === opt.value
                          ? "linear-gradient(135deg, #a855f7, #ec4899)"
                          : "rgba(255, 255, 255, 0.6)",
                      color: memberType === opt.value ? "#ffffff" : "#581c87",
                      border:
                        memberType === opt.value
                          ? "none"
                          : "1px solid rgba(168, 85, 247, 0.2)",
                    }}
                  >
                    <span className="text-lg">{opt.icon}</span>
                    <span className="text-xs">{opt.label}</span>
                  </button>
                ))}
              </div>
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
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <div
            className="mt-6 pt-6 text-center"
            style={{ borderTop: "1px solid rgba(168, 85, 247, 0.15)" }}
          >
            <p className="text-xs" style={{ color: "#7c3aed" }}>
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold"
                style={{ color: "#a855f7" }}
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}