import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/auth.store";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const links = [
    { to: "/", label: "Dashboard", icon: "📊" },
    { to: "/transactions", label: "Transactions", icon: "💳" },
    { to: "/members", label: "Members", icon: "👥" },
    { to: "/reports", label: "Reports", icon: "📈" },
    { to: "/pending-users", label: "Approvals", icon: "✅" },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex app-bg">
      <aside className="w-64 flex flex-col sidebar-bg">
        <div
          className="px-6 py-6"
          style={{ borderBottom: "1px solid rgba(168, 85, 247, 0.15)" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-lg"
              style={{
                background: "linear-gradient(135deg, #a855f7, #ec4899)",
                boxShadow: "0 8px 24px -8px rgba(168, 85, 247, 0.6)",
              }}
            >
              ⛪
            </div>
            <div>
              <h1 className="text-white font-bold text-base leading-tight">
                Church Pay
              </h1>
              <p className="text-xs" style={{ color: "#c4b5fd" }}>
                Admin Dashboard
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {links.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium"
                style={{
                  background: isActive
                    ? "linear-gradient(135deg, rgba(168, 85, 247, 0.3), rgba(236, 72, 153, 0.2))"
                    : "transparent",
                  color: isActive ? "#ffffff" : "#c4b5fd",
                  border: isActive
                    ? "1px solid rgba(168, 85, 247, 0.4)"
                    : "1px solid transparent",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background =
                      "rgba(168, 85, 247, 0.15)";
                    e.currentTarget.style.color = "#ffffff";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "#c4b5fd";
                  }
                }}
              >
                <span className="text-base">{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div
          className="p-3"
          style={{ borderTop: "1px solid rgba(168, 85, 247, 0.15)" }}
        >
          <div
            className="flex items-center gap-3 px-3 py-2 rounded-lg"
            style={{
              background: "rgba(168, 85, 247, 0.15)",
              border: "1px solid rgba(168, 85, 247, 0.2)",
            }}
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-semibold shrink-0"
              style={{
                background: "linear-gradient(135deg, #a855f7, #ec4899)",
              }}
            >
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.name}
              </p>
              <p className="text-xs truncate" style={{ color: "#c4b5fd" }}>
                {user?.email}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full mt-2 text-sm py-2 rounded-lg text-left px-3"
            style={{ color: "#f9a8d4" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(236, 72, 153, 0.15)";
              e.currentTarget.style.color = "#fbcfe8";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "#f9a8d4";
            }}
          >
            ← Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="p-8 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}