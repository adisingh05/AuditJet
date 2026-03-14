"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { ComplianceFramework } from "@/types";
import { getScoreColor, getScoreBg } from "@/lib/utils";

const FRAMEWORK_TYPES = [
  "SOC2",
  "ISO27001",
  "GDPR",
  "HIPAA",
  "PCI_DSS",
  "NIST",
];

export default function CompliancePage() {
  const [frameworks, setFrameworks] = useState<ComplianceFramework[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [selected, setSelected] = useState<ComplianceFramework | null>(null);
  const [controls, setControls] = useState<any[]>([]);

  useEffect(() => {
    fetchFrameworks();
  }, []);

  const fetchFrameworks = async () => {
    try {
      const { data } = await api.get("/compliance/frameworks");
      setFrameworks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createFramework = async (type: string) => {
    setCreating(true);
    try {
      await api.post("/compliance/frameworks", { type });
      await fetchFrameworks();
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const viewFramework = async (framework: ComplianceFramework) => {
    setSelected(framework);
    try {
      const { data } = await api.get(`/compliance/frameworks/${framework.id}`);
      setSelected(data);
      setControls(data.controls || []);
    } catch (err) {
      console.error(err);
    }
  };

  const updateControl = async (id: string, status: string) => {
    try {
      await api.patch(`/compliance/controls/${id}`, { status });
      setControls((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status } : c)),
      );
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
    <div className="space-y-8 pl-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Compliance Frameworks
          </h1>
          <p className="text-gray-400 mt-1">
            Manage your compliance frameworks and controls
          </p>
        </div>
      </div>

      {/* Add Framework */}
      <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
        <h3 className="text-white font-semibold mb-4">Add Framework</h3>
        <div className="flex flex-wrap gap-3">
          {FRAMEWORK_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => createFramework(type)}
              disabled={creating || frameworks.some((f) => f.type === type)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
            >
              {frameworks.some((f) => f.type === type)
                ? `✓ ${type}`
                : `+ ${type}`}
            </button>
          ))}
        </div>
      </div>

      {/* Frameworks List */}
      {frameworks.length === 0 ? (
        <div className="bg-gray-900 rounded-2xl p-12 border border-gray-800 text-center">
          <p className="text-4xl mb-4">📋</p>
          <p className="text-white font-semibold">No frameworks yet</p>
          <p className="text-gray-400 text-sm mt-1">
            Add a framework above to get started
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {frameworks.map((framework) => (
            <div
              key={framework.id}
              onClick={() => viewFramework(framework)}
              className="bg-gray-900 rounded-2xl p-6 border border-gray-800 cursor-pointer hover:border-blue-500 transition-colors"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full text-sm font-medium">
                  {framework.type}
                </span>
                <span className="text-gray-500 text-xs">
                  {framework.status}
                </span>
              </div>
              <h3 className="text-white font-semibold mb-1">
                {framework.name}
              </h3>
              <p className="text-gray-400 text-sm line-clamp-2">
                {framework.description}
              </p>
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Progress</span>
                  <span className={getScoreColor(0)}>0%</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full">
                  <div
                    className="h-2 rounded-full bg-gray-600"
                    style={{ width: "0%" }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Controls Panel */}
      {selected && (
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-white font-semibold text-lg">
              {selected.name} — Controls
            </h3>
            <button
              onClick={() => setSelected(null)}
              className="text-gray-400 hover:text-white text-sm"
            >
              ✕ Close
            </button>
          </div>
          <div className="space-y-3">
            {controls.map((control) => (
              <div
                key={control.id}
                className="bg-gray-800 rounded-xl p-4 flex items-start justify-between gap-4"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-blue-400 text-xs font-mono">
                      {control.controlId}
                    </span>
                    <span className="text-gray-500 text-xs">
                      {control.category}
                    </span>
                  </div>
                  <p className="text-white text-sm font-medium">
                    {control.name}
                  </p>
                  <p className="text-gray-400 text-xs mt-1">
                    {control.description}
                  </p>
                </div>
                <select
                  value={control.status}
                  onChange={(e) => updateControl(control.id, e.target.value)}
                  className="bg-gray-700 text-white text-xs rounded-lg px-2 py-1 border border-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="not_started">Not Started</option>
                  <option value="in_progress">In Progress</option>
                  <option value="implemented">Implemented</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
