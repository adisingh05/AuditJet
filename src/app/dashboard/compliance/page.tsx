"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { ComplianceFramework } from "@/types";
import { getScoreColor } from "@/lib/utils";

const availableFrameworks = [
  { type: "SOC2", label: "SOC2", flag: "🔐" },
  { type: "ISO27001", label: "ISO27001", flag: "🌐" },
  { type: "GDPR", label: "GDPR", flag: "🇪🇺" },
  { type: "HIPAA", label: "HIPAA", flag: "🏥" },
  { type: "PCI_DSS", label: "PCI DSS", flag: "💳" },
  { type: "NIST", label: "NIST", flag: "🛡️" },
  { type: "DPDP", label: "DPDP 2023", flag: "🇮🇳" },
  { type: "RBI", label: "RBI Framework", flag: "🏦" },
  { type: "SEBI", label: "SEBI CSCRF", flag: "📈" },
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "implemented":
        return "text-green-400 bg-green-400/10";
      case "in_progress":
        return "text-yellow-400 bg-yellow-400/10";
      case "failed":
        return "text-red-400 bg-red-400/10";
      default:
        return "text-gray-400 bg-gray-400/10";
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
      <div>
        <h1 className="text-2xl font-bold text-white">Compliance Frameworks</h1>
        <p className="text-gray-400 mt-1">
          Manage your compliance frameworks and controls
        </p>
      </div>

      {/* Add Framework */}
      <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
        <h3 className="text-white font-semibold mb-4">Add Framework</h3>

        {/* Global Frameworks */}
        <div className="mb-4">
          <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">
            🌍 Global
          </p>
          <div className="flex flex-wrap gap-2">
            {availableFrameworks
              .filter((f) => !["DPDP", "RBI", "SEBI"].includes(f.type))
              .map((fw) => (
                <button
                  key={fw.type}
                  onClick={() => createFramework(fw.type)}
                  disabled={
                    creating || frameworks.some((f) => f.type === fw.type)
                  }
                  className="px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150
                  disabled:bg-green-500/10 disabled:text-green-400 disabled:border-green-500/30 disabled:cursor-default
                  enabled:bg-gray-800 enabled:hover:bg-blue-600/20 enabled:hover:text-blue-400 enabled:border-gray-700 enabled:hover:border-blue-500/50 enabled:text-gray-300"
                >
                  {frameworks.some((f) => f.type === fw.type)
                    ? `✓ ${fw.flag} ${fw.label}`
                    : `+ ${fw.flag} ${fw.label}`}
                </button>
              ))}
          </div>
        </div>

        {/* India Frameworks */}
        <div>
          <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">
            🇮🇳 India Specific
          </p>
          <div className="flex flex-wrap gap-2">
            {availableFrameworks
              .filter((f) => ["DPDP", "RBI", "SEBI"].includes(f.type))
              .map((fw) => (
                <button
                  key={fw.type}
                  onClick={() => createFramework(fw.type)}
                  disabled={
                    creating || frameworks.some((f) => f.type === fw.type)
                  }
                  className="px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150
                  disabled:bg-green-500/10 disabled:text-green-400 disabled:border-green-500/30 disabled:cursor-default
                  enabled:bg-orange-500/10 enabled:hover:bg-orange-500/20 enabled:hover:text-orange-300 enabled:border-orange-500/30 enabled:hover:border-orange-400/50 enabled:text-orange-400"
                >
                  {frameworks.some((f) => f.type === fw.type)
                    ? `✓ ${fw.flag} ${fw.label}`
                    : `+ ${fw.flag} ${fw.label}`}
                </button>
              ))}
          </div>
        </div>
      </div>

      {/* Frameworks Grid */}
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
          {frameworks.map((framework) => {
            const fw = availableFrameworks.find(
              (f) => f.type === framework.type,
            );
            const isIndia = ["DPDP", "RBI", "SEBI"].includes(framework.type);
            return (
              <div
                key={framework.id}
                onClick={() => viewFramework(framework)}
                className={`bg-gray-900 rounded-2xl p-6 border cursor-pointer transition-all duration-150 hover:scale-[1.01] ${
                  isIndia
                    ? "border-orange-500/20 hover:border-orange-400/50"
                    : "border-gray-800 hover:border-blue-500/50"
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      isIndia
                        ? "bg-orange-500/10 text-orange-400"
                        : "bg-blue-500/10 text-blue-400"
                    }`}
                  >
                    {fw?.flag} {framework.type}
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
                  <div className="h-1.5 bg-gray-800 rounded-full">
                    <div
                      className="h-1.5 rounded-full bg-gray-600"
                      style={{ width: "0%" }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Controls Panel */}
      {selected && (
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-white font-semibold text-lg">
                {selected.name}
              </h3>
              <p className="text-gray-400 text-sm mt-0.5">
                {controls.length} controls
              </p>
            </div>
            <button
              onClick={() => {
                setSelected(null);
                setControls([]);
              }}
              className="text-gray-400 hover:text-white text-sm bg-gray-800 px-3 py-1.5 rounded-lg"
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
                    <span className="text-blue-400 text-xs font-mono bg-blue-400/10 px-2 py-0.5 rounded">
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
                <div className="flex flex-col items-end gap-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(control.status)}`}
                  >
                    {control.status.replace("_", " ")}
                  </span>
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
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
