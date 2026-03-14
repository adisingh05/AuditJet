"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { AuditLog } from "@/types";
import { formatDate } from "@/lib/utils";

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/audit")
      .then(({ data }) => setLogs(data.data || data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const actionColors: Record<string, string> = {
    LOGIN: "text-green-400 bg-green-400/10",
    CREATE: "text-blue-400 bg-blue-400/10",
    UPDATE: "text-yellow-400 bg-yellow-400/10",
    DELETE: "text-red-400 bg-red-400/10",
    UPLOAD: "text-purple-400 bg-purple-400/10",
    APPROVE: "text-emerald-400 bg-emerald-400/10",
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Audit Logs</h1>
        <p className="text-gray-400 mt-1">
          Track all system activity and changes
        </p>
      </div>

      {logs.length === 0 ? (
        <div className="bg-gray-900 rounded-2xl p-12 border border-gray-800 text-center">
          <p className="text-4xl mb-4">📋</p>
          <p className="text-white font-semibold">No audit logs yet</p>
          <p className="text-gray-400 text-sm mt-1">
            Activity will appear here as you use the platform
          </p>
        </div>
      ) : (
        <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">
                  Action
                </th>
                <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">
                  User
                </th>
                <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">
                  Resource
                </th>
                <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">
                  Description
                </th>
                <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">
                  Date
                </th>
                <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, i) => (
                <tr
                  key={log.id}
                  className={`border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors ${i % 2 === 0 ? "" : "bg-gray-800/10"}`}
                >
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${actionColors[log.action] || "text-gray-400 bg-gray-400/10"}`}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-300 text-sm">
                    {log.userEmail}
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-sm">
                    {log.resource}
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-sm max-w-xs truncate">
                    {log.description || "-"}
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-sm">
                    {formatDate(log.createdAt)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${log.success ? "text-green-400 bg-green-400/10" : "text-red-400 bg-red-400/10"}`}
                    >
                      {log.success ? "✓ Success" : "✗ Failed"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
