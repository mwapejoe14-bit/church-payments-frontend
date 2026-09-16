import { useQuery } from "@tanstack/react-query";
import { usersApi } from "@church/shared";

export default function Members() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["all-users"],
    queryFn: usersApi.getAllUsers,
  });

  if (isLoading) return <p className="text-gray-500">Loading members...</p>;
  if (error)
    return (
      <p className="text-red-600">
        Error: {error instanceof Error ? error.message : "Unknown"}
      </p>
    );

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Members ({data?.length ?? 0})
      </h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Phone</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Role</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data?.map((u) => (
              <tr key={u._id} className="hover:bg-gray-50">
                <td className="px-6 py-3 text-sm font-medium text-gray-900">{u.name}</td>
                <td className="px-6 py-3 text-sm text-gray-600">{u.email}</td>
                <td className="px-6 py-3 text-sm text-gray-600">{u.phone}</td>
                <td className="px-6 py-3">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      u.role === "admin"
                        ? "bg-purple-100 text-purple-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {u.role}
                  </span>
                </td>
                <td className="px-6 py-3 text-sm text-gray-600">
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}