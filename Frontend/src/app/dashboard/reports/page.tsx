"use client";

import { useState, useEffect } from "react";
import api from "../../../lib/api";
import {
  FileText,
  Download,
  Shield,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function ReportsPage() {
  const [frameworks, setFrameworks] = useState<any[]>([]);
  const [risks, setRisks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedFramework, setSelectedFramework] = useState<string>("all");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [fwRes, riskRes] = await Promise.all([
        api.get("/compliance/frameworks"),
        api.get("/compliance/risks"),
      ]);

      const withStats = await Promise.all(
        fwRes.data.map(async (fw: any) => {
          const { data } = await api.get(`/compliance/frameworks/${fw.id}`);
          return { ...fw, controls: data.controls, stats: data.stats };
        }),
      );

      setFrameworks(withStats);
      setRisks(riskRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = async () => {
    setGenerating(true);
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      let y = 20;

      // Header
      doc.setFillColor(37, 99, 235);
      doc.rect(0, 0, pageWidth, 40, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.text("ComplyGuy", 14, 18);
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text("Compliance Audit Report", 14, 28);
      doc.text(`Generated: ${new Date().toLocaleDateString("en-IN")}`, 14, 36);
      y = 55;

      // Executive Summary
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("Executive Summary", 14, y);
      y += 8;

      doc.setDrawColor(37, 99, 235);
      doc.setLineWidth(0.5);
      doc.line(14, y, pageWidth - 14, y);
      y += 8;

      const totalControls = frameworks.reduce(
        (acc, fw) => acc + (fw.stats?.total || 0),
        0,
      );
      const implemented = frameworks.reduce(
        (acc, fw) => acc + (fw.stats?.implemented || 0),
        0,
      );
      const overallScore = totalControls
        ? Math.round((implemented / totalControls) * 100)
        : 0;

      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(60, 60, 60);

      const summaryData = [
        ["Total Frameworks", frameworks.length.toString()],
        ["Total Controls", totalControls.toString()],
        ["Implemented Controls", implemented.toString()],
        ["Overall Compliance Score", `${overallScore}%`],
        ["Total Risks", risks.length.toString()],
        [
          "Open Risks",
          risks.filter((r) => r.status === "open").length.toString(),
        ],
        [
          "Critical Risks",
          risks.filter((r) => r.severity === "critical").length.toString(),
        ],
      ];

      autoTable(doc, {
        startY: y,
        head: [["Metric", "Value"]],
        body: summaryData,
        theme: "grid",
        headStyles: {
          fillColor: [37, 99, 235],
          textColor: 255,
          fontStyle: "bold",
        },
        alternateRowStyles: { fillColor: [245, 247, 255] },
        margin: { left: 14, right: 14 },
      });

      y = (doc as any).lastAutoTable.finalY + 15;

      // Framework Details
      const selectedFws =
        selectedFramework === "all"
          ? frameworks
          : frameworks.filter((fw) => fw.id === selectedFramework);

      for (const fw of selectedFws) {
        if (y > 240) {
          doc.addPage();
          y = 20;
        }

        // Framework Header
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0, 0, 0);
        doc.text(`${fw.name}`, 14, y);
        y += 6;

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100, 100, 100);
        doc.text(
          `Compliance Score: ${fw.stats?.score || 0}% | Controls: ${fw.stats?.total || 0} | Implemented: ${fw.stats?.implemented || 0}`,
          14,
          y,
        );
        y += 8;

        if (fw.controls && fw.controls.length > 0) {
          autoTable(doc, {
            startY: y,
            head: [["Control ID", "Name", "Category", "Status"]],
            body: fw.controls.map((c: any) => [
              c.controlId,
              c.name,
              c.category || "-",
              c.status?.replace("_", " ").toUpperCase() || "NOT STARTED",
            ]),
            theme: "striped",
            headStyles: {
              fillColor: [15, 23, 42],
              textColor: 255,
              fontStyle: "bold",
              fontSize: 9,
            },
            bodyStyles: { fontSize: 8 },
            columnStyles: {
              0: { cellWidth: 25 },
              1: { cellWidth: 70 },
              2: { cellWidth: 50 },
              3: { cellWidth: 35 },
            },
            margin: { left: 14, right: 14 },
            didParseCell: (data) => {
              if (data.column.index === 3 && data.section === "body") {
                const status = data.cell.raw as string;
                if (status === "IMPLEMENTED")
                  data.cell.styles.textColor = [34, 197, 94];
                else if (status === "IN PROGRESS")
                  data.cell.styles.textColor = [234, 179, 8];
                else if (status === "FAILED")
                  data.cell.styles.textColor = [239, 68, 68];
              }
            },
          });
          y = (doc as any).lastAutoTable.finalY + 12;
        }
      }

      // Risks Section
      if (risks.length > 0) {
        if (y > 200) {
          doc.addPage();
          y = 20;
        }

        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0, 0, 0);
        doc.text("Risk Register", 14, y);
        y += 6;

        doc.setDrawColor(37, 99, 235);
        doc.line(14, y, pageWidth - 14, y);
        y += 6;

        autoTable(doc, {
          startY: y,
          head: [["Title", "Category", "Severity", "Status", "Score"]],
          body: risks.map((r: any) => [
            r.title,
            r.category || "-",
            r.severity?.toUpperCase(),
            r.status?.toUpperCase(),
            `${(r.likelihood || 0) * (r.impact || 0)}/25`,
          ]),
          theme: "striped",
          headStyles: {
            fillColor: [15, 23, 42],
            textColor: 255,
            fontStyle: "bold",
            fontSize: 9,
          },
          bodyStyles: { fontSize: 8 },
          margin: { left: 14, right: 14 },
          didParseCell: (data) => {
            if (data.column.index === 2 && data.section === "body") {
              const severity = data.cell.raw as string;
              if (severity === "CRITICAL")
                data.cell.styles.textColor = [239, 68, 68];
              else if (severity === "HIGH")
                data.cell.styles.textColor = [249, 115, 22];
              else if (severity === "MEDIUM")
                data.cell.styles.textColor = [234, 179, 8];
              else data.cell.styles.textColor = [34, 197, 94];
            }
          },
        });
      }

      // Footer on each page
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(
          `ComplyGuy Compliance Report | Page ${i} of ${totalPages} | Confidential`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: "center" },
        );
      }

      doc.save(
        `ComplyGuy-Compliance-Report-${new Date().toISOString().split("T")[0]}.pdf`,
      );
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );

  const totalControls = frameworks.reduce(
    (acc, fw) => acc + (fw.stats?.total || 0),
    0,
  );
  const implemented = frameworks.reduce(
    (acc, fw) => acc + (fw.stats?.implemented || 0),
    0,
  );
  const overallScore = totalControls
    ? Math.round((implemented / totalControls) * 100)
    : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Compliance Reports</h1>
          <p className="text-gray-400 mt-1">Generate audit-ready PDF reports</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
              <Shield className="text-blue-400" size={20} />
            </div>
            <p className="text-gray-400 text-sm">Overall Score</p>
          </div>
          <p className="text-3xl font-bold text-white">{overallScore}%</p>
          <p className="text-gray-500 text-xs mt-1">
            {implemented}/{totalControls} controls implemented
          </p>
        </div>

        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center">
              <CheckCircle className="text-green-400" size={20} />
            </div>
            <p className="text-gray-400 text-sm">Frameworks</p>
          </div>
          <p className="text-3xl font-bold text-white">{frameworks.length}</p>
          <p className="text-gray-500 text-xs mt-1">
            Active compliance frameworks
          </p>
        </div>

        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center">
              <AlertTriangle className="text-red-400" size={20} />
            </div>
            <p className="text-gray-400 text-sm">Open Risks</p>
          </div>
          <p className="text-3xl font-bold text-white">
            {risks.filter((r) => r.status === "open").length}
          </p>
          <p className="text-gray-500 text-xs mt-1">
            {risks.filter((r) => r.severity === "critical").length} critical
            risks
          </p>
        </div>
      </div>

      {/* Report Generator */}
      <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
        <h3 className="text-white font-semibold text-lg mb-2">
          Generate Report
        </h3>
        <p className="text-gray-400 text-sm mb-6">
          Download a professional audit-ready PDF report with all compliance
          controls and risks
        </p>

        <div className="mb-6">
          <label className="block text-sm text-gray-400 mb-2">
            Select Framework
          </label>
          <select
            value={selectedFramework}
            onChange={(e) => setSelectedFramework(e.target.value)}
            className="bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64"
          >
            <option value="all">All Frameworks</option>
            {frameworks.map((fw) => (
              <option key={fw.id} value={fw.id}>
                {fw.name}
              </option>
            ))}
          </select>
        </div>

        {/* Framework Preview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {frameworks
            .filter(
              (fw) =>
                selectedFramework === "all" || fw.id === selectedFramework,
            )
            .map((fw) => (
              <div
                key={fw.id}
                className="bg-gray-800 rounded-xl p-4 border border-gray-700"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-blue-400 text-xs font-medium">
                    {fw.type}
                  </span>
                  <span className="text-white text-sm font-bold">
                    {fw.stats?.score || 0}%
                  </span>
                </div>
                <p className="text-white text-sm font-medium truncate">
                  {fw.name}
                </p>
                <div className="mt-2 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-1.5 rounded-full bg-blue-500"
                    style={{ width: `${fw.stats?.score || 0}%` }}
                  />
                </div>
                <p className="text-gray-500 text-xs mt-1">
                  {fw.stats?.implemented || 0}/{fw.stats?.total || 0} controls
                </p>
              </div>
            ))}
        </div>

        <button
          onClick={generatePDF}
          disabled={generating || frameworks.length === 0}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-medium transition-colors"
        >
          <Download size={18} />
          {generating ? "Generating PDF..." : "Download PDF Report"}
        </button>
      </div>
    </div>
  );
}
