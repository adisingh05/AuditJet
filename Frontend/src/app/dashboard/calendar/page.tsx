"use client";

import { useState } from "react";
import {
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  Bell,
} from "lucide-react";

interface Deadline {
  id: string;
  title: string;
  description: string;
  framework: string;
  dueDate: string;
  category: string;
  severity: "critical" | "high" | "medium" | "low";
  recurring: string;
  authority: string;
  penalty?: string;
}

const INDIAN_DEADLINES: Deadline[] = [
  // DPDP Act 2023
  {
    id: "1",
    title: "DPDP Consent Notice Update",
    description:
      "Review and update all data collection consent notices to comply with DPDP Act 2023 requirements.",
    framework: "DPDP",
    dueDate: "2026-04-30",
    category: "Legal",
    severity: "critical",
    recurring: "Annual",
    authority: "Data Protection Board of India",
    penalty: "Up to ₹250 Crore",
  },
  {
    id: "2",
    title: "Data Protection Officer Appointment",
    description:
      "Significant Data Fiduciaries must appoint a qualified Data Protection Officer.",
    framework: "DPDP",
    dueDate: "2026-05-15",
    category: "Governance",
    severity: "critical",
    recurring: "One-time",
    authority: "Data Protection Board of India",
    penalty: "Up to ₹150 Crore",
  },
  {
    id: "3",
    title: "DPDP Data Processing Impact Assessment",
    description:
      "Complete Data Protection Impact Assessment for all high-risk processing activities.",
    framework: "DPDP",
    dueDate: "2026-06-30",
    category: "Assessment",
    severity: "high",
    recurring: "Annual",
    authority: "Data Protection Board of India",
    penalty: "Up to ₹100 Crore",
  },
  {
    id: "4",
    title: "Children Data Protection Review",
    description:
      "Review and implement parental consent mechanisms for processing data of minors under 18.",
    framework: "DPDP",
    dueDate: "2026-04-15",
    category: "Compliance",
    severity: "critical",
    recurring: "Annual",
    authority: "Data Protection Board of India",
    penalty: "Up to ₹200 Crore",
  },

  // RBI Compliance
  {
    id: "5",
    title: "RBI Cyber Security Framework Audit",
    description:
      "Annual cyber security audit as mandated by RBI IT Security Framework for regulated entities.",
    framework: "RBI",
    dueDate: "2026-06-30",
    category: "Audit",
    severity: "critical",
    recurring: "Annual",
    authority: "Reserve Bank of India",
    penalty: "License cancellation risk",
  },
  {
    id: "6",
    title: "RBI Incident Reporting",
    description:
      "Report all cyber security incidents to RBI within 6 hours of detection.",
    framework: "RBI",
    dueDate: "2026-04-01",
    category: "Reporting",
    severity: "critical",
    recurring: "Ongoing",
    authority: "Reserve Bank of India",
    penalty: "Monetary penalty",
  },
  {
    id: "7",
    title: "RBI Business Continuity Plan Review",
    description:
      "Annual review and testing of Business Continuity Plan and Disaster Recovery procedures.",
    framework: "RBI",
    dueDate: "2026-07-31",
    category: "Risk",
    severity: "high",
    recurring: "Annual",
    authority: "Reserve Bank of India",
    penalty: "Regulatory action",
  },
  {
    id: "8",
    title: "RBI Vendor Risk Assessment",
    description:
      "Complete risk assessment of all IT vendors and outsourced service providers.",
    framework: "RBI",
    dueDate: "2026-05-31",
    category: "Risk",
    severity: "high",
    recurring: "Annual",
    authority: "Reserve Bank of India",
    penalty: "Regulatory action",
  },

  // SEBI Compliance
  {
    id: "9",
    title: "SEBI CSCRF Annual Report",
    description:
      "Submit annual Cyber Security and Cyber Resilience Framework compliance report to SEBI.",
    framework: "SEBI",
    dueDate: "2026-04-30",
    category: "Reporting",
    severity: "critical",
    recurring: "Annual",
    authority: "Securities and Exchange Board of India",
    penalty: "Trading suspension risk",
  },
  {
    id: "10",
    title: "SEBI Penetration Testing",
    description:
      "Conduct mandatory VAPT (Vulnerability Assessment and Penetration Testing) and submit results.",
    framework: "SEBI",
    dueDate: "2026-06-30",
    category: "Security",
    severity: "high",
    recurring: "Annual",
    authority: "Securities and Exchange Board of India",
    penalty: "Up to ₹1 Crore per day",
  },
  {
    id: "11",
    title: "SEBI Cyber Incident Report",
    description: "Report cyber incidents to SEBI within 6 hours of detection.",
    framework: "SEBI",
    dueDate: "2026-04-01",
    category: "Reporting",
    severity: "critical",
    recurring: "Ongoing",
    authority: "SEBI",
    penalty: "Up to ₹25 Crore",
  },

  // SOC2
  {
    id: "12",
    title: "SOC2 Type II Audit Window",
    description:
      "Annual SOC2 Type II audit period — ensure all controls are implemented and evidence collected.",
    framework: "SOC2",
    dueDate: "2026-09-30",
    category: "Audit",
    severity: "high",
    recurring: "Annual",
    authority: "AICPA",
    penalty: "Loss of certification",
  },
  {
    id: "13",
    title: "SOC2 Vendor Review",
    description: "Annual review of all vendors with access to customer data.",
    framework: "SOC2",
    dueDate: "2026-05-31",
    category: "Risk",
    severity: "medium",
    recurring: "Annual",
    authority: "AICPA",
    penalty: "Audit finding",
  },

  // ISO27001
  {
    id: "14",
    title: "ISO 27001 Internal Audit",
    description:
      "Conduct mandatory internal audit of Information Security Management System.",
    framework: "ISO27001",
    dueDate: "2026-07-31",
    category: "Audit",
    severity: "high",
    recurring: "Annual",
    authority: "Certification Body",
    penalty: "Loss of certification",
  },
  {
    id: "15",
    title: "ISO 27001 Management Review",
    description:
      "Annual management review of ISMS effectiveness and performance.",
    framework: "ISO27001",
    dueDate: "2026-08-31",
    category: "Governance",
    severity: "medium",
    recurring: "Annual",
    authority: "Certification Body",
    penalty: "Non-conformity",
  },

  // GDPR
  {
    id: "16",
    title: "GDPR Data Processing Records Review",
    description:
      "Annual review and update of Records of Processing Activities (ROPA).",
    framework: "GDPR",
    dueDate: "2026-05-25",
    category: "Compliance",
    severity: "high",
    recurring: "Annual",
    authority: "Data Protection Authority",
    penalty: "Up to €20M or 4% global turnover",
  },
  {
    id: "17",
    title: "GDPR Privacy Notice Review",
    description: "Review and update all privacy notices and cookie policies.",
    framework: "GDPR",
    dueDate: "2026-05-25",
    category: "Legal",
    severity: "medium",
    recurring: "Annual",
    authority: "Data Protection Authority",
    penalty: "Up to €10M",
  },
];

export default function CalendarPage() {
  const [selectedFramework, setSelectedFramework] = useState("all");
  const [selectedSeverity, setSelectedSeverity] = useState("all");
  const [view, setView] = useState<"list" | "timeline">("list");

  const today = new Date();

  const getDaysUntil = (dateStr: string) => {
    const due = new Date(dateStr);
    const diff = Math.ceil(
      (due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );
    return diff;
  };

  const getUrgencyColor = (days: number) => {
    if (days < 0) return "text-red-400 bg-red-400/10 border-red-500/30";
    if (days <= 30) return "text-red-400 bg-red-400/10 border-red-500/30";
    if (days <= 60)
      return "text-orange-400 bg-orange-400/10 border-orange-500/30";
    if (days <= 90)
      return "text-yellow-400 bg-yellow-400/10 border-yellow-500/30";
    return "text-green-400 bg-green-400/10 border-green-500/30";
  };

  const getUrgencyLabel = (days: number) => {
    if (days < 0) return `${Math.abs(days)} days overdue!`;
    if (days === 0) return "Due today!";
    if (days === 1) return "Due tomorrow!";
    return `${days} days left`;
  };

  const frameworkColors: Record<string, string> = {
    DPDP: "bg-orange-500/10 text-orange-400 border border-orange-500/20",
    RBI: "bg-green-500/10 text-green-400 border border-green-500/20",
    SEBI: "bg-purple-500/10 text-purple-400 border border-purple-500/20",
    SOC2: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
    ISO27001: "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20",
    GDPR: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
    HIPAA: "bg-pink-500/10 text-pink-400 border border-pink-500/20",
  };

  const severityColors: Record<string, string> = {
    critical: "text-red-400",
    high: "text-orange-400",
    medium: "text-yellow-400",
    low: "text-green-400",
  };

  const filtered = INDIAN_DEADLINES.filter(
    (d) => selectedFramework === "all" || d.framework === selectedFramework,
  )
    .filter(
      (d) => selectedSeverity === "all" || d.severity === selectedSeverity,
    )
    .sort(
      (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
    );

  const upcoming30 = INDIAN_DEADLINES.filter((d) => {
    const days = getDaysUntil(d.dueDate);
    return days >= 0 && days <= 30;
  }).length;

  const overdue = INDIAN_DEADLINES.filter(
    (d) => getDaysUntil(d.dueDate) < 0,
  ).length;

  const frameworks = [
    "all",
    ...Array.from(new Set(INDIAN_DEADLINES.map((d) => d.framework))),
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Compliance Calendar</h1>
          <p className="text-gray-400 mt-1">
            Track all regulatory deadlines — India & Global
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setView("list")}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${view === "list" ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-400"}`}
          >
            List
          </button>
          <button
            onClick={() => setView("timeline")}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${view === "timeline" ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-400"}`}
          >
            Timeline
          </button>
        </div>
      </div>

      {/* Alert Banner */}
      {(upcoming30 > 0 || overdue > 0) && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex items-center gap-3">
          <Bell className="text-red-400 shrink-0" size={20} />
          <div>
            <p className="text-red-400 font-medium text-sm">
              {overdue > 0 &&
                `⚠️ ${overdue} deadline${overdue > 1 ? "s" : ""} overdue! `}
              {upcoming30 > 0 &&
                `🔔 ${upcoming30} deadline${upcoming30 > 1 ? "s" : ""} due within 30 days`}
            </p>
            <p className="text-red-400/70 text-xs mt-0.5">
              Take immediate action to avoid penalties
            </p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Deadlines",
            value: INDIAN_DEADLINES.length,
            color: "text-white",
            icon: Calendar,
          },
          {
            label: "Due in 30 days",
            value: upcoming30,
            color: "text-red-400",
            icon: AlertTriangle,
          },
          {
            label: "Due in 90 days",
            value: INDIAN_DEADLINES.filter((d) => {
              const days = getDaysUntil(d.dueDate);
              return days >= 0 && days <= 90;
            }).length,
            color: "text-yellow-400",
            icon: Clock,
          },
          {
            label: "On Track",
            value: INDIAN_DEADLINES.filter((d) => getDaysUntil(d.dueDate) > 90)
              .length,
            color: "text-green-400",
            icon: CheckCircle,
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-gray-900 rounded-2xl p-5 border border-gray-800"
          >
            <div className="flex items-center gap-2 mb-2">
              <stat.icon size={16} className="text-gray-500" />
              <p className="text-gray-400 text-sm">{stat.label}</p>
            </div>
            <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div>
          <select
            value={selectedFramework}
            onChange={(e) => setSelectedFramework(e.target.value)}
            className="bg-gray-900 border border-gray-800 text-white rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {frameworks.map((fw) => (
              <option key={fw} value={fw}>
                {fw === "all" ? "All Frameworks" : fw}
              </option>
            ))}
          </select>
        </div>
        <div>
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="bg-gray-900 border border-gray-800 text-white rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Severity</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* List View */}
      {view === "list" && (
        <div className="space-y-3">
          {filtered.map((deadline) => {
            const days = getDaysUntil(deadline.dueDate);
            return (
              <div
                key={deadline.id}
                className={`bg-gray-900 rounded-2xl p-5 border transition-all hover:scale-[1.005] ${getUrgencyColor(days)}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${frameworkColors[deadline.framework] || "bg-gray-800 text-gray-400"}`}
                      >
                        {deadline.framework}
                      </span>
                      <span
                        className={`text-xs font-medium ${severityColors[deadline.severity]}`}
                      >
                        ● {deadline.severity.toUpperCase()}
                      </span>
                      <span className="text-gray-600 text-xs">
                        {deadline.category}
                      </span>
                      <span className="text-gray-600 text-xs">
                        • {deadline.recurring}
                      </span>
                    </div>
                    <h3 className="text-white font-semibold mb-1">
                      {deadline.title}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      {deadline.description}
                    </p>
                    <div className="flex items-center gap-4 mt-3 flex-wrap">
                      <span className="text-gray-500 text-xs flex items-center gap-1">
                        <Calendar size={12} />
                        Due:{" "}
                        {new Date(deadline.dueDate).toLocaleDateString(
                          "en-IN",
                          { day: "numeric", month: "long", year: "numeric" },
                        )}
                      </span>
                      <span className="text-gray-500 text-xs">
                        Authority: {deadline.authority}
                      </span>
                      {deadline.penalty && (
                        <span className="text-red-400/70 text-xs">
                          Penalty: {deadline.penalty}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p
                      className={`text-sm font-bold ${days < 0 ? "text-red-400" : days <= 30 ? "text-red-400" : days <= 60 ? "text-orange-400" : days <= 90 ? "text-yellow-400" : "text-green-400"}`}
                    >
                      {getUrgencyLabel(days)}
                    </p>
                    <p className="text-gray-600 text-xs mt-1">
                      {new Date(deadline.dueDate).toLocaleDateString("en-IN", {
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Timeline View */}
      {view === "timeline" && (
        <div className="space-y-2">
          {[
            "April 2026",
            "May 2026",
            "June 2026",
            "July 2026",
            "August 2026",
            "September 2026",
          ].map((month) => {
            const monthDeadlines = filtered.filter((d) => {
              const date = new Date(d.dueDate);
              return (
                date.toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                }) === month
              );
            });
            if (monthDeadlines.length === 0) return null;
            return (
              <div key={month}>
                <div className="flex items-center gap-3 mb-3 mt-6">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <h3 className="text-white font-semibold">{month}</h3>
                  <div className="flex-1 h-px bg-gray-800" />
                  <span className="text-gray-500 text-xs">
                    {monthDeadlines.length} deadline
                    {monthDeadlines.length > 1 ? "s" : ""}
                  </span>
                </div>
                <div className="ml-5 space-y-2">
                  {monthDeadlines.map((deadline) => {
                    const days = getDaysUntil(deadline.dueDate);
                    return (
                      <div
                        key={deadline.id}
                        className="bg-gray-900 rounded-xl p-4 border border-gray-800 flex items-center gap-4"
                      >
                        <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center shrink-0">
                          <span className="text-white text-sm font-bold">
                            {new Date(deadline.dueDate).getDate()}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-medium ${frameworkColors[deadline.framework] || ""}`}
                            >
                              {deadline.framework}
                            </span>
                            <span
                              className={`text-xs ${severityColors[deadline.severity]}`}
                            >
                              ● {deadline.severity}
                            </span>
                          </div>
                          <p className="text-white text-sm font-medium">
                            {deadline.title}
                          </p>
                        </div>
                        <p
                          className={`text-xs font-medium shrink-0 ${days <= 30 ? "text-red-400" : days <= 60 ? "text-orange-400" : "text-green-400"}`}
                        >
                          {getUrgencyLabel(days)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
