import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "@church/shared";

export default function PendingUsers() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["pending-users"],
    queryFn: authApi.getPendingUsers,
  });

  const approve = useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: "approved" | "rejected";
    }) => authApi.approveUser(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-users"] });
    },
  });

  if (isLoading) return <p style={{ color: "#7c3aed" }}>Loading...</p>;
  if (error)
    return (
      <p style={{ color: "#b91c1c" }}>
        Error: {error instanceof Error ? error.message : "Unknown"}
      </p>
    );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text">Pending Approvals</h1>
        <p className="text-sm mt-1" style={{ color: "#7c3aed" }}>
          {data?.length || 0} user(s) waiting for approval
        </p>
      </div>

      {data && data.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <div className="text-5xl mb-3">✅</div>
          <p className="text-sm" style={{ color: "#7c3aed" }}>
            No pending approvals. All caught up!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data?.map((user) => (
            <div key={user._id} className="glass-card rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0"
                  style={{
                    background: "linear-gradient(135deg, #a855f7, #ec4899)",
                  }}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="font-semibold truncate"
                    style={{ color: "#581c87" }}
                  >
                    {user.name}
                  </p>
                  <p
                    className="text-xs truncate mt-0.5"
                    style={{ color: "#7c3aed" }}
                  >
                    {user.email}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "#7c3aed" }}>
                    {user.phone}
                  </p>
                  <div className="flex gap-1 mt-2">
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{
                        background: "rgba(168, 85, 247, 0.15)",
                        color: "#7c3aed",
                      }}
                    >
                      {user.role}
                    </span>
                    {user.memberType && (
                      <span
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{
                          background: "rgba(236, 72, 153, 0.15)",
                          color: "#a21caf",
                        }}
                      >
                        {user.memberType}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() =>
                    approve.mutate({ id: user._id, status: "approved" })
                  }
                  disabled={approve.isPending}
                  className="flex-1 py-2 rounded-lg text-sm font-medium text-white"
                  style={{
                    background: "linear-gradient(135deg, #10b981, #059669)",
                  }}
                >
                  ✓ Approve
                </button>
                <button
                  onClick={() =>
                    approve.mutate({ id: user._id, status: "rejected" })
                  }
                  disabled={approve.isPending}
                  className="flex-1 py-2 rounded-lg text-sm font-medium"
                  style={{
                    background: "rgba(254, 226, 226, 0.8)",
                    color: "#b91c1c",
                    border: "1px solid #fecaca",
                  }}
                >
                  ✕ Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}