"use client";

import { useEffect, useState } from "react";
import api from "../../../lib/api";
import { ComplianceRisk } from "../../../types";
import { getSeverityColor } from "../../../lib/utils";

export default function RisksPage() {
  const [risks, setRisks] = useState<ComplianceRisk[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    severity: "medium",
    likelihood: 3,
    impact: 3,
  });

  useEffect(() => {
    fetchRisks();
  }, []);

  const fetchRisks = async () => {
    try {
      const { data } = await api.get("/compliance/risks");
      setRisks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createRisk = async () => {
    try {
      await api.post("/compliance/risks", form);
      setShowForm(false);
      setForm({
        title: "",
        description: "",
        category: "",
        severity: "medium",
        likelihood: 3,
        impact: 3,
      });
      await fetchRisks();
    } catch (err) {
      console.error(err);
    }
  };

  const updateRisk = async (id: string, status: string) => {
    try {
      await api.patch(`/compliance/risks/${id}`, { status });
      setRisks((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Risk Management</h1>
          <p className="text-gray-400 mt-1">
            Track and manage compliance risks
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          + Add Risk
        </button>
      </div>

      {/* Add Risk Form */}
      {showForm && (
        <div className="bg-gray-900 rounded-2xl p-6 border border-blue-500/50">
          <h3 className="text-white font-semibold mb-4">New Risk</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Title</label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Risk title"
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Category
              </label>
              <input
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="e.g. Access Control, Data Privacy"
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-400 mb-1">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="Describe the risk..."
                rows={3}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Severity
              </label>
              <select
                value={form.severity}
                onChange={(e) => setForm({ ...form, severity: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Likelihood (1-5)
                </label>
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={form.likelihood}
                  onChange={(e) =>
                    setForm({ ...form, likelihood: +e.target.value })
                  }
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Impact (1-5)
                </label>
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={form.impact}
                  onChange={(e) =>
                    setForm({ ...form, impact: +e.target.value })
                  }
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={createRisk}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium"
            >
              Save Risk
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Risks List */}
      {risks.length === 0 ? (
        <div className="bg-gray-900 rounded-2xl p-12 border border-gray-800 text-center">
          <p className="text-4xl mb-4">⚠️</p>
          <p className="text-white font-semibold">No risks recorded</p>
          <p className="text-gray-400 text-sm mt-1">
            Click Add Risk to get started
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {risks.map((risk) => (
            <div
              key={risk.id}
              className="bg-gray-900 rounded-2xl p-6 border border-gray-800"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(risk.severity)}`}
                    >
                      {risk.severity.toUpperCase()}
                    </span>
                    <span className="text-gray-500 text-xs">
                      {risk.category}
                    </span>
                  </div>
                  <h3 className="text-white font-semibold">{risk.title}</h3>
                  <p className="text-gray-400 text-sm mt-1">
                    {risk.description}
                  </p>
                  <div className="flex gap-4 mt-3 text-xs text-gray-500">
                    <span>Likelihood: {risk.likelihood}/5</span>
                    <span>Impact: {risk.impact}/5</span>
                    <span>Score: {risk.likelihood * risk.impact}/25</span>
                  </div>
                </div>
                <select
                  value={risk.status}
                  onChange={(e) => updateRisk(risk.id, e.target.value)}
                  className="bg-gray-800 text-white text-xs rounded-lg px-3 py-1.5 border border-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="open">Open</option>
                  <option value="mitigated">Mitigated</option>
                  <option value="accepted">Accepted</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
