"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import api from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Check, Layers } from "lucide-react";

const FRAMEWORKS = [
  {
    id: "DPDP",
    label: "DPDP 2023",
    flag: "🇮🇳",
    desc: "India data protection law",
  },
  {
    id: "SOC2",
    label: "SOC 2",
    flag: "🔐",
    desc: "For US enterprise customers",
  },
  {
    id: "ISO27001",
    label: "ISO 27001",
    flag: "🌐",
    desc: "International security standard",
  },
  {
    id: "RBI",
    label: "RBI Framework",
    flag: "🏦",
    desc: "RBI IT security for fintechs",
  },
  {
    id: "GDPR",
    label: "GDPR",
    flag: "🇪🇺",
    desc: "EU data protection regulation",
  },
  {
    id: "SEBI",
    label: "SEBI CSCRF",
    flag: "📈",
    desc: "SEBI cyber resilience",
  },
  {
    id: "HIPAA",
    label: "HIPAA",
    flag: "🏥",
    desc: "Healthcare data protection",
  },
  {
    id: "PCI_DSS",
    label: "PCI DSS",
    flag: "💳",
    desc: "Payment card security",
  },
];

const COMPANY_SIZES = [
  { id: "1-10", label: "1–10", desc: "Early stage startup" },
  { id: "11-50", label: "11–50", desc: "Growing startup" },
  { id: "51-200", label: "51–200", desc: "Scale-up" },
  { id: "201-500", label: "201–500", desc: "Mid-size company" },
  { id: "500+", label: "500+", desc: "Enterprise" },
];

const INDUSTRIES = [
  { id: "saas", label: "SaaS / Tech", icon: "💻" },
  { id: "fintech", label: "Fintech / NBFC", icon: "🏦" },
  { id: "healthcare", label: "Healthcare", icon: "🏥" },
  { id: "ecommerce", label: "E-Commerce", icon: "🛒" },
  { id: "edtech", label: "EdTech", icon: "📚" },
  { id: "hrtech", label: "HR Tech", icon: "👥" },
  { id: "consulting", label: "Consulting", icon: "🤝" },
  { id: "other", label: "Other", icon: "🏢" },
];

const ROLES = [
  { id: "cto", label: "CTO / VP Eng", icon: "⚙️" },
  { id: "ciso", label: "CISO / Security", icon: "🔒" },
  { id: "compliance", label: "Compliance Officer", icon: "📋" },
  { id: "ceo", label: "CEO / Founder", icon: "🚀" },
  { id: "legal", label: "Legal / DPO", icon: "⚖️" },
  { id: "other", label: "Other", icon: "👤" },
];

const STEPS = [
  { label: "Welcome", sub: "Getting started" },
  { label: "Company name", sub: "Your identity" },
  { label: "Industry & size", sub: "Your context" },
  { label: "Your role", sub: "Personalisation" },
  { label: "Frameworks", sub: "Compliance goals" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    companyName: "",
    industry: "",
    companySize: "",
    role: "",
    frameworks: [] as string[],
  });

  const toggleFramework = (id: string) => {
    setForm((prev) => ({
      ...prev,
      frameworks: prev.frameworks.includes(id)
        ? prev.frameworks.filter((f) => f !== id)
        : [...prev.frameworks, id],
    }));
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      for (const type of form.frameworks) {
        try {
          await api.post("/compliance/frameworks", { type });
        } catch {}
      }
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const canNext = () => {
    if (step === 1) return form.companyName.length > 0;
    if (step === 2) return form.industry !== "" && form.companySize !== "";
    if (step === 3) return form.role !== "";
    if (step === 4) return form.frameworks.length > 0;
    return true;
  };

  return (
    <div className="min-h-screen bg-[#0a0f1e] flex">
      {/* ── Sidebar ── */}
      <aside className="w-72 shrink-0 flex flex-col justify-between px-6 py-10 border-r border-white/5">
        {/* Logo */}
        <div>
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/30">
              <Layers size={20} className="text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-base leading-none">
                ComplyGuy
              </p>
              <p className="text-blue-400/70 text-xs mt-0.5">
                Compliance Platform
              </p>
            </div>
          </div>

          {/* Steps */}
          <nav className="space-y-1">
            {STEPS.map((s, i) => (
              <div
                key={i}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
                  i === step ? "bg-blue-600/20 border border-blue-500/30" : ""
                }`}
              >
                {/* Step circle */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-all ${
                    i < step
                      ? "bg-blue-600 text-white"
                      : i === step
                        ? "bg-blue-600 text-white ring-4 ring-blue-600/20"
                        : "bg-white/5 text-gray-500"
                  }`}
                >
                  {i < step ? <Check size={14} /> : i + 1}
                </div>

                {/* Connector line */}
                <div className="flex-1">
                  <p
                    className={`text-sm font-medium ${i === step ? "text-white" : i < step ? "text-blue-400" : "text-gray-500"}`}
                  >
                    {s.label}
                  </p>
                  <p className="text-xs text-gray-600">{s.sub}</p>
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Quote */}
        <div className="border-l-2 border-blue-600/40 pl-4">
          <p className="text-gray-500 text-sm italic leading-relaxed">
            "Compliance shouldn't feel like a chore."
          </p>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 flex flex-col">
        {/* Progress bar */}
        <div className="h-1 bg-white/5">
          <div
            className="h-1 bg-blue-600 transition-all duration-500"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>

        <div className="flex-1 flex flex-col justify-between p-12">
          {/* Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.25 }}
              className="flex-1"
            >
              {/* ── Step 0: Welcome ── */}
              {step === 0 && (
                <div className="flex flex-col items-center text-center max-w-2xl mx-auto pt-8">
                  <div className="w-24 h-24 bg-blue-600 rounded-3xl flex items-center justify-center mb-8 shadow-2xl shadow-blue-600/30">
                    <Layers size={48} className="text-white" />
                  </div>
                  <p className="text-blue-400 text-sm font-semibold tracking-widest uppercase mb-4">
                    Welcome to ComplyGuy
                  </p>
                  <h1 className="text-5xl font-bold text-white mb-2 leading-tight">
                    Compliance, made
                  </h1>
                  <h1 className="text-5xl font-bold text-blue-400 italic mb-6">
                    human.
                  </h1>
                  <p className="text-gray-400 text-lg leading-relaxed max-w-lg">
                    Hi {user?.firstName}! We'll guide you through a quick
                    2-minute setup to pick the right frameworks for your
                    business — no jargon, no noise.
                  </p>

                  {/* Framework preview cards */}
                  <div className="grid grid-cols-4 gap-4 mt-10 w-full">
                    {[
                      { flag: "🇮🇳", label: "DPDP 2023" },
                      { flag: "🔐", label: "SOC 2" },
                      { flag: "🌐", label: "ISO 27001" },
                      { flag: "🏦", label: "RBI Framework" },
                    ].map((f, i) => (
                      <div
                        key={i}
                        className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col items-center gap-3 hover:bg-white/8 transition-all"
                      >
                        <span className="text-4xl">{f.flag}</span>
                        <p className="text-white text-sm font-medium">
                          {f.label}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Step 1: Company Name ── */}
              {step === 1 && (
                <div className="max-w-xl">
                  <p className="text-blue-400 text-sm font-semibold tracking-widest uppercase mb-4">
                    Step 2 of 5
                  </p>
                  <h2 className="text-4xl font-bold text-white mb-3">
                    What's your company name?
                  </h2>
                  <p className="text-gray-400 text-lg mb-10">
                    This will appear on your compliance reports and audit
                    documents.
                  </p>
                  <input
                    value={form.companyName}
                    onChange={(e) =>
                      setForm({ ...form, companyName: e.target.value })
                    }
                    placeholder="e.g. Acme Technologies Pvt Ltd"
                    className="w-full bg-white/5 border border-white/10 text-white rounded-2xl px-6 py-5 text-xl focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-600"
                    autoFocus
                    onKeyDown={(e) =>
                      e.key === "Enter" && canNext() && setStep(2)
                    }
                  />
                  {form.companyName && (
                    <p className="text-blue-400 text-sm mt-3">
                      ✓ Reports will be generated for{" "}
                      <strong>{form.companyName}</strong>
                    </p>
                  )}
                </div>
              )}

              {/* ── Step 2: Industry & Size ── */}
              {step === 2 && (
                <div className="max-w-2xl">
                  <p className="text-blue-400 text-sm font-semibold tracking-widest uppercase mb-4">
                    Step 3 of 5
                  </p>
                  <h2 className="text-4xl font-bold text-white mb-3">
                    Tell us about your company
                  </h2>
                  <p className="text-gray-400 text-lg mb-8">
                    Helps us recommend the right frameworks for your context.
                  </p>

                  <p className="text-gray-300 font-semibold mb-4">Industry</p>
                  <div className="grid grid-cols-4 gap-3 mb-8">
                    {INDUSTRIES.map((ind) => (
                      <button
                        key={ind.id}
                        onClick={() => setForm({ ...form, industry: ind.id })}
                        className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${
                          form.industry === ind.id
                            ? "border-blue-500 bg-blue-500/15 text-white"
                            : "border-white/10 bg-white/5 text-gray-400 hover:border-white/20 hover:bg-white/8"
                        }`}
                      >
                        <span className="text-3xl">{ind.icon}</span>
                        <span className="text-xs font-medium text-center leading-tight">
                          {ind.label}
                        </span>
                      </button>
                    ))}
                  </div>

                  <p className="text-gray-300 font-semibold mb-4">
                    Company Size
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {COMPANY_SIZES.map((size) => (
                      <button
                        key={size.id}
                        onClick={() =>
                          setForm({ ...form, companySize: size.id })
                        }
                        className={`flex flex-col items-center px-6 py-4 rounded-2xl border transition-all min-w-25 ${
                          form.companySize === size.id
                            ? "border-blue-500 bg-blue-500/15 text-white"
                            : "border-white/10 bg-white/5 text-gray-400 hover:border-white/20"
                        }`}
                      >
                        <span className="text-lg font-bold">{size.label}</span>
                        <span className="text-xs text-gray-500 mt-1">
                          {size.desc}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Step 3: Role ── */}
              {step === 3 && (
                <div className="max-w-2xl">
                  <p className="text-blue-400 text-sm font-semibold tracking-widest uppercase mb-4">
                    Step 4 of 5
                  </p>
                  <h2 className="text-4xl font-bold text-white mb-3">
                    What's your role?
                  </h2>
                  <p className="text-gray-400 text-lg mb-8">
                    We'll personalise your dashboard and recommendations.
                  </p>
                  <div className="grid grid-cols-3 gap-4">
                    {ROLES.map((role) => (
                      <button
                        key={role.id}
                        onClick={() => setForm({ ...form, role: role.id })}
                        className={`flex flex-col items-center gap-3 p-6 rounded-2xl border transition-all ${
                          form.role === role.id
                            ? "border-blue-500 bg-blue-500/15 text-white"
                            : "border-white/10 bg-white/5 text-gray-400 hover:border-white/20 hover:bg-white/8"
                        }`}
                      >
                        <span className="text-4xl">{role.icon}</span>
                        <span className="text-sm font-medium text-center">
                          {role.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Step 4: Frameworks ── */}
              {step === 4 && (
                <div className="max-w-3xl">
                  <p className="text-blue-400 text-sm font-semibold tracking-widest uppercase mb-4">
                    Step 5 of 5
                  </p>
                  <h2 className="text-4xl font-bold text-white mb-3">
                    Which frameworks do you need?
                  </h2>
                  <p className="text-gray-400 text-lg mb-8">
                    Select all that apply — we'll set them up automatically.
                  </p>
                  <div className="grid grid-cols-4 gap-4">
                    {FRAMEWORKS.map((fw) => (
                      <button
                        key={fw.id}
                        onClick={() => toggleFramework(fw.id)}
                        className={`relative flex flex-col items-center gap-3 p-6 rounded-2xl border transition-all ${
                          form.frameworks.includes(fw.id)
                            ? "border-blue-500 bg-blue-500/15"
                            : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8"
                        }`}
                      >
                        {form.frameworks.includes(fw.id) && (
                          <div className="absolute top-3 right-3 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                            <Check size={10} className="text-white" />
                          </div>
                        )}
                        <span className="text-4xl">{fw.flag}</span>
                        <p
                          className={`text-sm font-semibold text-center ${form.frameworks.includes(fw.id) ? "text-white" : "text-gray-300"}`}
                        >
                          {fw.label}
                        </p>
                        <p className="text-xs text-gray-500 text-center leading-tight">
                          {fw.desc}
                        </p>
                      </button>
                    ))}
                  </div>
                  {form.frameworks.length > 0 && (
                    <p className="text-blue-400 text-sm mt-4">
                      ✅ {form.frameworks.length} framework
                      {form.frameworks.length > 1 ? "s" : ""} selected — we'll
                      set these up for you!
                    </p>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* ── Navigation ── */}
          <div className="flex items-center justify-between pt-8 border-t border-white/5 mt-8">
            <button
              onClick={() => setStep((s) => s - 1)}
              disabled={step === 0}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-gray-400 hover:text-white border border-white/10 hover:border-white/20 disabled:opacity-0 transition-all"
            >
              <ChevronLeft size={18} />
              Back
            </button>

            <span className="text-gray-600 text-sm">
              Step {step + 1} of {STEPS.length}
            </span>

            {step < STEPS.length - 1 ? (
              <button
                onClick={() => setStep((s) => s + 1)}
                disabled={!canNext()}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:bg-white/5 disabled:text-gray-600 text-white px-8 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-blue-600/20"
              >
                Continue
                <ChevronRight size={18} />
              </button>
            ) : (
              <button
                onClick={handleFinish}
                disabled={!canNext() || loading}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:bg-white/5 disabled:text-gray-600 text-white px-8 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-blue-600/20"
              >
                {loading ? "Setting up..." : "Launch ComplyGuy 🚀"}
                {!loading && <ChevronRight size={18} />}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
