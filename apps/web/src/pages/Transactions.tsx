import { useQuery } from "@tanstack/react-query";
import { paymentsApi } from "@church/shared";

export default function Transactions() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["all-payments"],
    queryFn: paymentsApi.getAllPayments,
  });

  if (isLoading) return <p className="text-gray-500">Loading transactions...</p>;
  if (error)
    return (
      <p className="text-red-600">
        Error: {error instanceof Error ? error.message : "Unknown"}
      </p>
    );

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        All Transactions ({data?.length ?? 0})
      </h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Member</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Provider</th>
              <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data?.map((tx) => {
              const member = typeof tx.userId === "object" ? tx.userId.name : "—";
              return (
                <tr key={tx._id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 text-sm text-gray-600">
                    {new Date(tx.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-3 text-sm font-medium text-gray-900">{member}</td>
                  <td className="px-6 py-3 text-sm text-gray-600 capitalize">{tx.type}</td>
                  <td className="px-6 py-3 text-sm text-gray-600">{tx.provider}</td>
                  <td className="px-6 py-3 text-sm font-medium text-gray-900 text-right">
                    K{tx.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-3">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        tx.status === "success"
                          ? "bg-green-100 text-green-700"
                          : tx.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {tx.status}
                    </span>
                  </td>
                </tr>
              );
            })}
            {data?.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500 text-sm">
                  No transactions yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}