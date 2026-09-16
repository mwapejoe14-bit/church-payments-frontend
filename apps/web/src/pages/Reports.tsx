import { useQuery } from "@tanstack/react-query";
import { reportsApi } from "@church/shared";

export default function Reports() {
  const reports = useQuery({
    queryKey: ["reports"],
    queryFn: reportsApi.getReports,
  });

  const monthly = useQuery({
    queryKey: ["reports-monthly"],
    queryFn: () => reportsApi.getMonthlyReport(),
  });

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Reports</h1>

      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Monthly Summary</h2>
        {monthly.isLoading && <p className="text-gray-500">Loading...</p>}
        {monthly.error && (
          <p className="text-red-600 text-sm">
            {monthly.error instanceof Error ? monthly.error.message : "Error"}
          </p>
        )}
        {monthly.data && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Month</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Tithes</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Offerings</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">PTA</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {monthly.data.map((m, i) => (
                  <tr key={i}>
                    <td className="px-6 py-3 text-sm font-medium">{m.month} {m.year}</td>
                    <td className="px-6 py-3 text-sm text-right">K{m.breakdown.tithe.toLocaleString()}</td>
                    <td className="px-6 py-3 text-sm text-right">K{m.breakdown.offering.toLocaleString()}</td>
                    <td className="px-6 py-3 text-sm text-right">K{m.breakdown.pta.toLocaleString()}</td>
                    <td className="px-6 py-3 text-sm text-right font-medium">K{m.totalAmount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Breakdown</h2>
        {reports.isLoading && <p className="text-gray-500">Loading...</p>}
        {reports.data && (
          <pre className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 text-xs overflow-auto">
            {JSON.stringify(reports.data, null, 2)}
          </pre>
        )}
      </section>
    </div>
  );
}