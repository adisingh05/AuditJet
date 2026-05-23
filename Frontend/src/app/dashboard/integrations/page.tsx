"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Github, CheckCircle, XCircle, RefreshCw, Plug } from "lucide-react";

const AVAILABLE_INTEGRATIONS = [
  {
    id: "github",
    name: "GitHub",
    icon: "🐙",
    description:
      "Auto-collect evidence from repositories, PRs, and branch protection rules",
    controls: [
      "CC8.1 Change Management",
      "CC6.1 Access Controls",
      "CC7.1 System Operations",
    ],
    category: "DevOps",
    available: true,
  },
  {
    id: "google_workspace",
    name: "Google Workspace",
    icon: "🔵",
    description:
      "Collect evidence from Gmail, Drive, and admin console for access controls",
    controls: [
      "CC6.1 Logical Access",
      "CC6.2 Access Provisioning",
      "P1.0 Privacy",
    ],
    category: "Identity",
    available: false,
    comingSoon: true,
  },
  {
    id: "aws",
    name: "AWS",
    icon: "☁️",
    description:
      "Monitor CloudTrail, IAM, S3 policies, and security configurations",
    controls: ["CC6.1 Logical Access", "A1.1 Availability", "CC7.1 Operations"],
    category: "Cloud",
    available: false,
    comingSoon: true,
  },
  {
    id: "slack",
    name: "Slack",
    icon: "💬",
    description: "Send compliance alerts and deadline reminders to your team",
    controls: ["CC2.1 Information & Communication"],
    category: "Business",
    available: false,
    comingSoon: true,
  },
  {
    id: "jira",
    name: "Jira",
    icon: "📋",
    description: "Track compliance tasks and remediation items as Jira tickets",
    controls: ["CC3.1 Risk Assessment", "CC8.1 Change Management"],
    category: "Business",
    available: false,
    comingSoon: true,
  },
  {
    id: "azure",
    name: "Microsoft Azure",
    icon: "🔷",
    description:
      "Monitor Azure AD, security policies, and cloud configurations",
    controls: ["CC6.1 Logical Access", "CC6.2 Access Provisioning"],
    category: "Cloud",
    available: false,
    comingSoon: true,
  },
];

export default function IntegrationsPage() {
  const [connected, setConnected] = useState<any[]>([]);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [evidence, setEvidence] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIntegrations();
    // Check if returning from OAuth
    const params = new URLSearchParams(window.location.search);
    if (params.get("connected")) {
      fetchIntegrations();
    }
  }, []);

  const fetchIntegrations = async () => {
    try {
      const { data } = await api.get("/integrations");
      setConnected(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const connectGithub = async () => {
    try {
      const { data } = await api.get("/integrations/github/auth-url");
      window.location.href = data.url;
    } catch (err) {
      console.error(err);
    }
  };

  const syncIntegration = async (type: string) => {
    setSyncing(type);
    try {
      const { data } = await api.post(`/integrations/${type}/sync`);
      setEvidence(data);
    } catch (err) {
      console.error(err);
    } finally {
      setSyncing(null);
    }
  };

  const isConnected = (type: string) =>
    connected.find((c) => c.type === type && c.status === "connected");

  const categoryColors: Record<string, string> = {
    DevOps: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    Identity: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    Cloud: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    Business: "bg-green-500/10 text-green-400 border-green-500/20",
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Integrations</h1>
        <p className="text-gray-400 mt-1">
          Connect your tools to automatically collect compliance evidence
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: "Connected",
            value: connected.filter((c) => c.status === "connected").length,
            color: "text-green-400",
          },
          {
            label: "Available",
            value: AVAILABLE_INTEGRATIONS.filter((i) => i.available).length,
            color: "text-blue-400",
          },
          {
            label: "Coming Soon",
            value: AVAILABLE_INTEGRATIONS.filter((i) => i.comingSoon).length,
            color: "text-gray-400",
          },
        ].map((s, i) => (
          <div
            key={i}
            className="bg-gray-900 rounded-2xl p-5 border border-gray-800"
          >
            <p className="text-gray-400 text-sm">{s.label}</p>
            <p className={`text-3xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Evidence Panel */}
      {evidence && (
        <div className="bg-gray-900 rounded-2xl p-6 border border-green-500/30">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="text-green-400" size={20} />
            <h3 className="text-white font-semibold">
              GitHub Evidence Collected
            </h3>
            <span className="text-gray-500 text-xs ml-auto">
              {new Date(evidence.collectedAt).toLocaleString()}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(evidence.controls || {}).map(
              ([controlId, ctrl]: any) => (
                <div key={controlId} className="bg-gray-800 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-blue-400 text-xs font-mono bg-blue-400/10 px-2 py-0.5 rounded">
                      {controlId}
                    </span>
                    <span
                      className={`text-xs font-bold ${ctrl.score >= 80 ? "text-green-400" : ctrl.score >= 50 ? "text-yellow-400" : "text-red-400"}`}
                    >
                      {ctrl.score}%
                    </span>
                  </div>
                  <p className="text-white text-sm font-medium">{ctrl.name}</p>
                  <div className="mt-2 h-1.5 bg-gray-700 rounded-full">
                    <div
                      className="h-1.5 rounded-full bg-blue-500"
                      style={{ width: `${ctrl.score}%` }}
                    />
                  </div>
                  <p
                    className={`text-xs mt-1 ${ctrl.status === "implemented" ? "text-green-400" : "text-yellow-400"}`}
                  >
                    {ctrl.status.replace("_", " ")}
                  </p>
                </div>
              ),
            )}
          </div>
        </div>
      )}

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {AVAILABLE_INTEGRATIONS.map((integration) => {
          const conn = isConnected(integration.id);
          return (
            <div
              key={integration.id}
              className={`bg-gray-900 rounded-2xl p-5 border transition-all ${
                conn
                  ? "border-green-500/30"
                  : integration.comingSoon
                    ? "border-gray-800 opacity-70"
                    : "border-gray-800 hover:border-blue-500/30"
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{integration.icon}</span>
                  <div>
                    <p className="text-white font-semibold text-sm">
                      {integration.name}
                    </p>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full border ${categoryColors[integration.category]}`}
                    >
                      {integration.category}
                    </span>
                  </div>
                </div>
                {conn ? (
                  <CheckCircle className="text-green-400" size={18} />
                ) : integration.comingSoon ? (
                  <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded-full">
                    Soon
                  </span>
                ) : null}
              </div>

              <p className="text-gray-400 text-xs mb-3">
                {integration.description}
              </p>

              <div className="space-y-1 mb-4">
                {integration.controls.map((ctrl, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    <span className="text-gray-500 text-xs">{ctrl}</span>
                  </div>
                ))}
              </div>

              {conn ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => syncIntegration(integration.id)}
                    disabled={syncing === integration.id}
                    className="flex-1 flex items-center justify-center gap-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/30 px-3 py-2 rounded-lg text-xs font-medium transition-colors"
                  >
                    <RefreshCw
                      size={12}
                      className={
                        syncing === integration.id ? "animate-spin" : ""
                      }
                    />
                    {syncing === integration.id ? "Syncing..." : "Sync Now"}
                  </button>
                  <button className="text-gray-500 hover:text-red-400 bg-gray-800 px-3 py-2 rounded-lg text-xs transition-colors">
                    Disconnect
                  </button>
                </div>
              ) : integration.available ? (
                <button
                  onClick={() => integration.id === "github" && connectGithub()}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-xs font-medium transition-colors"
                >
                  <Plug size={12} />
                  Connect {integration.name}
                </button>
              ) : (
                <button
                  disabled
                  className="w-full bg-gray-800 text-gray-600 px-3 py-2 rounded-lg text-xs cursor-not-allowed"
                >
                  Coming Soon
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
