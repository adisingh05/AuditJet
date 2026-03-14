"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { DashboardStats } from "@/types";
import { getScoreColor, getScoreBg } from "@/lib/utils";
import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/compliance/dashboard")
      .then(({ data }) => setStats(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  const riskData = stats
    ? [
        {
          name: "Critical",
          value: stats.riskMatrix.critical,
          color: "#dc2626",
        },
        { name: "High", value: stats.riskMatrix.high, color: "#ea580c" },
        { name: "Medium", value: stats.riskMatrix.medium, color: "#d97706" },
        { name: "Low", value: stats.riskMatrix.low, color: "#16a34a" },
      ]
    : [];

  const frameworkData =
    stats?.frameworkScores?.map((f: any) => ({
      name: f.type,
      score: f.stats?.score || 0,
    })) || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 mt-1">
          Your compliance overview at a glance
        </p>
      </div>

      {/* Score Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
          <p className="text-gray-400 text-sm">Overall Score</p>
          <p
            className={`text-4xl font-bold mt-2 ${getScoreColor(stats?.overallComplianceScore || 0)}`}
          >
            {stats?.overallComplianceScore || 0}%
          </p>
          <div className="mt-3 h-2 bg-gray-800 rounded-full">
            <div
              className={`h-2 rounded-full ${getScoreBg(stats?.overallComplianceScore || 0)}`}
              style={{ width: `${stats?.overallComplianceScore || 0}%` }}
            />
          </div>
        </div>

        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
          <p className="text-gray-400 text-sm">Frameworks</p>
          <p className="text-4xl font-bold text-white mt-2">
            {stats?.totalFrameworks || 0}
          </p>
          <p className="text-gray-500 text-sm mt-3">Active frameworks</p>
        </div>

        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
          <p className="text-gray-400 text-sm">Total Controls</p>
          <p className="text-4xl font-bold text-white mt-2">
            {stats?.totalControls || 0}
          </p>
          <p className="text-gray-500 text-sm mt-3">Across all frameworks</p>
        </div>

        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
          <p className="text-gray-400 text-sm">Open Risks</p>
          <p className="text-4xl font-bold text-red-400 mt-2">
            {stats?.openRisks || 0}
          </p>
          <p className="text-gray-500 text-sm mt-3">
            {stats?.criticalRisks || 0} critical
          </p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Matrix */}
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
          <h3 className="text-white font-semibold mb-4">Risk Matrix</h3>
          {riskData.every((r) => r.value === 0) ? (
            <div className="flex items-center justify-center h-48 text-gray-500">
              No risks recorded yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={riskData}>
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    background: "#111827",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "#fff" }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {riskData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Framework Scores */}
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
          <h3 className="text-white font-semibold mb-4">Framework Scores</h3>
          {frameworkData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-gray-500">
              No frameworks added yet
            </div>
          ) : (
            <div className="space-y-4">
              {frameworkData.map((f: any, i: number) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-300">{f.name}</span>
                    <span className={getScoreColor(f.score)}>{f.score}%</span>
                  </div>
                  <div className="h-2 bg-gray-800 rounded-full">
                    <div
                      className={`h-2 rounded-full ${getScoreBg(f.score)}`}
                      style={{ width: `${f.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Controls by Status */}
      <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
        <h3 className="text-white font-semibold mb-4">Controls by Status</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              key: "implemented",
              label: "Implemented",
              color: "bg-green-500",
              text: "text-green-400",
            },
            {
              key: "in_progress",
              label: "In Progress",
              color: "bg-blue-500",
              text: "text-blue-400",
            },
            {
              key: "not_started",
              label: "Not Started",
              color: "bg-gray-500",
              text: "text-gray-400",
            },
            {
              key: "failed",
              label: "Failed",
              color: "bg-red-500",
              text: "text-red-400",
            },
          ].map((item) => (
            <div key={item.key} className="bg-gray-800 rounded-xl p-4">
              <div className={`w-3 h-3 rounded-full ${item.color} mb-2`} />
              <p className={`text-2xl font-bold ${item.text}`}>
                {stats?.controlsByStatus?.[item.key] || 0}
              </p>
              <p className="text-gray-400 text-sm">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
