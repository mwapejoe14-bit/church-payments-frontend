import { useQuery } from "@tanstack/react-query";
import { reportsApi } from "@church/shared";

export default function Dashboard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: reportsApi.getDashboardSummary,
  });

  if (isLoading)
    return <p style={{ color: "#7c3aed" }}>Loading dashboard...</p>;
  if (error)
    return (
      <p style={{ color: "#b91c1c" }}>
        Failed to load: {error instanceof Error ? error.message : "Unknown error"}
      </p>
    );

  const cards = [
    {
      label: "Total Transactions",
      value: data?.totalTransactions ?? 0,
      gradient: "linear-gradient(135deg, #a855f7, #6366f1)",
      icon: "💳",
    },
    {
      label: "Total Amount",
      value: data?.totalAmount ?? 0,
      prefix: "K",
      gradient: "linear-gradient(135deg, #8b5cf6, #ec4899)",
      icon: "💰",
    },
    {
      label: "Tithes",
      value: data?.totalTithes ?? 0,
      prefix: "K",
      gradient: "linear-gradient(135deg, #a855f7, #d946ef)",
      icon: "🙏",
    },
    {
      label: "Offerings",
      value: data?.totalOfferings ?? 0,
      prefix: "K",
      gradient: "linear-gradient(135deg, #6366f1, #a855f7)",
      icon: "🎁",
    },
    {
      label: "PTA",
      value: data?.totalPTA ?? 0,
      prefix: "K",
      gradient: "linear-gradient(135deg, #ec4899, #a855f7)",
      icon: "🎓",
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text">Dashboard</h1>
        <p className="text-sm mt-1" style={{ color: "#7c3aed" }}>
          Overview of all church payment activity
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => (
          <div
            key={card.label}
            className="glass-card rounded-2xl p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div>
                <p
                  className="text-xs font-medium uppercase tracking-wide"
                  style={{ color: "#7c3aed" }}
                >
                  {card.label}
                </p>
                <p className="text-3xl font-bold mt-3" style={{ color: "#581c87" }}>
                  {card.prefix}
                  {typeof card.value === "number"
                    ? card.value.toLocaleString()
                    : card.value}
                </p>
              </div>
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                style={{ background: card.gradient }}
              >
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}