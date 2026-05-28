"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import api from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Check, Shield } from "lucide-react";

// ── Data ──────────────────────────────────────────────────────
const STEPS = [
  { label: "Welcome", sub: "Getting started" },
  { label: "Company Name", sub: "Your identity" },
  { label: "Industry & Size", sub: "Your context" },
  { label: "Your Role", sub: "Personalisation" },
  { label: "Frameworks", sub: "Compliance goals" },
];

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
  { id: "GDPR", label: "GDPR", flag: "🇪🇺", desc: "EU data protection" },
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

const SIZES = [
  { id: "1-10", label: "1–10", desc: "Early stage" },
  { id: "11-50", label: "11–50", desc: "Growing" },
  { id: "51-200", label: "51–200", desc: "Scale-up" },
  { id: "201-500", label: "201–500", desc: "Mid-size" },
  { id: "500+", label: "500+", desc: "Enterprise" },
];

const ROLES = [
  { id: "cto", label: "CTO / VP Engineering", icon: "⚙️" },
  { id: "ciso", label: "CISO / Security Lead", icon: "🔒" },
  { id: "compliance", label: "Compliance Officer", icon: "📋" },
  { id: "ceo", label: "CEO / Founder", icon: "🚀" },
  { id: "legal", label: "Legal / DPO", icon: "⚖️" },
  { id: "other", label: "Other", icon: "👤" },
];

// ── Reusable SelectCard ───────────────────────────────────────
function SelectCard({
  selected,
  onClick,
  children,
  className = "",
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`relative flex flex-col items-center gap-3 p-6 rounded-2xl border transition-all duration-200 cursor-pointer text-center
        ${
          selected
            ? "border-blue-500/60 bg-blue-500/10 shadow-lg shadow-blue-500/10"
            : "border-white/8 bg-white/3 hover:border-white/15 hover:bg-white/6"
        } ${className}`}
    >
      {selected && (
        <div className="absolute top-3 right-3 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-600/30">
          <Check size={10} className="text-white" strokeWidth={3} />
        </div>
      )}
      {children}
    </motion.button>
  );
}

// ── Main Component ────────────────────────────────────────────
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

  const toggleFramework = (id: string) =>
    setForm((p) => ({
      ...p,
      frameworks: p.frameworks.includes(id)
        ? p.frameworks.filter((f) => f !== id)
        : [...p.frameworks, id],
    }));

  const canNext = () => {
    if (step === 1) return form.companyName.trim().length > 0;
    if (step === 2) return !!form.industry && !!form.companySize;
    if (step === 3) return !!form.role;
    if (step === 4) return form.frameworks.length > 0;
    return true;
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex overflow-hidden"
      style={{ background: "#020817" }}
    >
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-blue-600/8 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-blue-500/6 rounded-full blur-3xl" />
      </div>

      {/* ══════════════════ SIDEBAR ══════════════════ */}
      <aside
        className="w-72 shrink-0 flex flex-col justify-between py-10 px-7 relative z-10"
        style={{
          background: "linear-gradient(180deg, #0d1117 0%, #0a0f1e 100%)",
          borderRight: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        {/* Logo */}
        <div>
          <div className="flex items-center gap-3 mb-12">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
              style={{
                background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
                boxShadow: "0 0 20px rgba(37,99,235,0.4)",
              }}
            >
              <Shield size={18} className="text-white" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm leading-none tracking-tight">
                ComplyGuy
              </p>
              <p className="text-blue-400/50 text-xs mt-0.5">
                Compliance Platform
              </p>
            </div>
          </div>

          {/* Step list */}
          <div className="space-y-1">
            {STEPS.map((s, i) => {
              const isActive = i === step;
              const isDone = i < step;
              return (
                <div
                  key={i}
                  className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive ? "bg-blue-600/12" : ""
                  }`}
                  style={
                    isActive
                      ? { border: "1px solid rgba(59,130,246,0.2)" }
                      : { border: "1px solid transparent" }
                  }
                >
                  {/* Circle */}
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all duration-300 ${
                      isDone
                        ? "bg-blue-600 text-white"
                        : isActive
                          ? "text-white"
                          : "text-gray-600"
                    }`}
                    style={
                      isActive
                        ? {
                            background:
                              "linear-gradient(135deg,#2563eb,#1d4ed8)",
                            boxShadow: "0 0 12px rgba(37,99,235,0.5)",
                          }
                        : isDone
                          ? { background: "#2563eb" }
                          : { background: "rgba(255,255,255,0.05)" }
                    }
                  >
                    {isDone ? <Check size={12} strokeWidth={3} /> : i + 1}
                  </div>

                  {/* Labels */}
                  <div>
                    <p
                      className={`text-sm font-medium leading-none ${isActive ? "text-white" : isDone ? "text-blue-400" : "text-gray-600"}`}
                    >
                      {s.label}
                    </p>
                    <p className="text-xs text-gray-700 mt-1">{s.sub}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quote */}
        <div
          style={{ borderLeft: "2px solid rgba(37,99,235,0.3)" }}
          className="pl-4"
        >
          <p className="text-gray-600 text-xs italic leading-relaxed">
            "Compliance shouldn't feel like a chore."
          </p>
        </div>
      </aside>

      {/* ══════════════════ MAIN CONTENT ══════════════════ */}
      <main className="flex-1 flex flex-col relative z-10">
        {/* Top progress bar */}
        <div className="h-0.5" style={{ background: "rgba(255,255,255,0.04)" }}>
          <motion.div
            className="h-0.5"
            style={{ background: "linear-gradient(90deg, #2563eb, #60a5fa)" }}
            initial={{ width: "0%" }}
            animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        </div>

        {/* Scrollable content area */}
        <div className="flex-1 flex flex-col justify-between px-16 pt-16 pb-10 max-w-5xl mx-auto w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {/* ── STEP 0: Welcome ── */}
              {step === 0 && (
                <div className="flex flex-col items-center text-center">
                  {/* Icon */}
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1, duration: 0.4 }}
                    className="w-24 h-24 rounded-3xl flex items-center justify-center mb-10"
                    style={{
                      background: "linear-gradient(135deg, #1e40af, #2563eb)",
                      boxShadow:
                        "0 0 60px rgba(37,99,235,0.35), 0 20px 40px rgba(0,0,0,0.4)",
                    }}
                  >
                    <Shield size={44} className="text-white" />
                  </motion.div>

                  {/* Label */}
                  <p
                    className="text-xs font-semibold tracking-widest uppercase mb-5"
                    style={{ color: "rgba(96,165,250,0.8)" }}
                  >
                    Welcome to ComplyGuy
                  </p>

                  {/* Heading */}
                  <h1
                    className="text-6xl font-bold text-white mb-2 leading-tight"
                    style={{
                      fontFamily: "Georgia, serif",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    Compliance, made
                  </h1>
                  <h1
                    className="text-6xl font-bold mb-8 leading-tight italic"
                    style={{
                      fontFamily: "Georgia, serif",
                      letterSpacing: "-0.02em",
                      background:
                        "linear-gradient(135deg, #60a5fa, #3b82f6, #93c5fd)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    human.
                  </h1>

                  {/* Subtext */}
                  <p className="text-gray-400 text-lg leading-relaxed max-w-lg mb-14">
                    Hi {user?.firstName || "there"}! We'll guide you through a
                    quick 2-minute setup to pick the right frameworks for your
                    business — no jargon, no noise.
                  </p>

                  {/* Framework preview cards */}
                  <div className="grid grid-cols-4 gap-4 w-full max-w-2xl">
                    {[
                      { flag: "🇮🇳", label: "DPDP 2023" },
                      { flag: "🔐", label: "SOC 2" },
                      { flag: "🌐", label: "ISO 27001" },
                      { flag: "🏦", label: "RBI Framework" },
                    ].map((f, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + i * 0.08 }}
                        whileHover={{
                          y: -4,
                          boxShadow: "0 0 24px rgba(37,99,235,0.2)",
                        }}
                        className="flex flex-col items-center gap-3 py-6 px-4 rounded-2xl cursor-default"
                        style={{
                          background: "rgba(255,255,255,0.03)",
                          border: "1px solid rgba(255,255,255,0.08)",
                        }}
                      >
                        <span className="text-4xl">{f.flag}</span>
                        <p className="text-white text-sm font-medium">
                          {f.label}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── STEP 1: Company Name ── */}
              {step === 1 && (
                <div className="max-w-lg">
                  <StepLabel text="Step 2 of 5" />
                  <StepHeading>What's your company name?</StepHeading>
                  <StepSubheading>
                    This appears on all compliance reports, audit packages, and
                    your Trust Center.
                  </StepSubheading>
                  <input
                    value={form.companyName}
                    onChange={(e) =>
                      setForm({ ...form, companyName: e.target.value })
                    }
                    onKeyDown={(e) =>
                      e.key === "Enter" && canNext() && setStep(2)
                    }
                    placeholder="e.g. Acme Technologies Pvt Ltd"
                    autoFocus
                    className="w-full text-white text-xl rounded-2xl px-6 py-5 mt-2 outline-none transition-all"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: form.companyName
                        ? "1px solid rgba(59,130,246,0.5)"
                        : "1px solid rgba(255,255,255,0.08)",
                      caretColor: "#3b82f6",
                    }}
                  />
                  {form.companyName && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-blue-400 text-sm mt-3 flex items-center gap-2"
                    >
                      <Check size={14} /> Reports generated for{" "}
                      <strong>{form.companyName}</strong>
                    </motion.p>
                  )}
                </div>
              )}

              {/* ── STEP 2: Industry & Size ── */}
              {step === 2 && (
                <div className="max-w-2xl">
                  <StepLabel text="Step 3 of 5" />
                  <StepHeading>Tell us about your company</StepHeading>
                  <StepSubheading>
                    Helps us surface the most relevant frameworks and controls
                    for your context.
                  </StepSubheading>

                  <p className="text-gray-300 text-sm font-semibold mb-4 mt-8">
                    Industry
                  </p>
                  <div className="grid grid-cols-4 gap-3 mb-8">
                    {INDUSTRIES.map((ind) => (
                      <SelectCard
                        key={ind.id}
                        selected={form.industry === ind.id}
                        onClick={() => setForm({ ...form, industry: ind.id })}
                      >
                        <span className="text-3xl">{ind.icon}</span>
                        <span
                          className={`text-xs font-medium ${form.industry === ind.id ? "text-white" : "text-gray-400"}`}
                        >
                          {ind.label}
                        </span>
                      </SelectCard>
                    ))}
                  </div>

                  <p className="text-gray-300 text-sm font-semibold mb-4">
                    Team size
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {SIZES.map((s) => (
                      <SelectCard
                        key={s.id}
                        selected={form.companySize === s.id}
                        onClick={() => setForm({ ...form, companySize: s.id })}
                        className="min-w-27.5 gap-1"
                      >
                        <span
                          className={`text-lg font-bold ${form.companySize === s.id ? "text-white" : "text-gray-300"}`}
                        >
                          {s.label}
                        </span>
                        <span className="text-xs text-gray-500">{s.desc}</span>
                      </SelectCard>
                    ))}
                  </div>
                </div>
              )}

              {/* ── STEP 3: Role ── */}
              {step === 3 && (
                <div className="max-w-2xl">
                  <StepLabel text="Step 4 of 5" />
                  <StepHeading>What's your role?</StepHeading>
                  <StepSubheading>
                    We'll personalise your dashboard, alerts, and AI
                    recommendations.
                  </StepSubheading>
                  <div className="grid grid-cols-3 gap-4 mt-8">
                    {ROLES.map((role) => (
                      <SelectCard
                        key={role.id}
                        selected={form.role === role.id}
                        onClick={() => setForm({ ...form, role: role.id })}
                        className="gap-3 py-8"
                      >
                        <span className="text-4xl">{role.icon}</span>
                        <span
                          className={`text-sm font-medium ${form.role === role.id ? "text-white" : "text-gray-400"}`}
                        >
                          {role.label}
                        </span>
                      </SelectCard>
                    ))}
                  </div>
                </div>
              )}

              {/* ── STEP 4: Frameworks ── */}
              {step === 4 && (
                <div className="max-w-3xl">
                  <StepLabel text="Step 5 of 5" />
                  <StepHeading>Which frameworks do you need?</StepHeading>
                  <StepSubheading>
                    Select all that apply — we'll provision your controls
                    automatically.
                  </StepSubheading>
                  <div className="grid grid-cols-4 gap-4 mt-8">
                    {FRAMEWORKS.map((fw) => (
                      <SelectCard
                        key={fw.id}
                        selected={form.frameworks.includes(fw.id)}
                        onClick={() => toggleFramework(fw.id)}
                        className="py-7 gap-2"
                      >
                        <span className="text-4xl">{fw.flag}</span>
                        <p
                          className={`text-sm font-semibold ${form.frameworks.includes(fw.id) ? "text-white" : "text-gray-300"}`}
                        >
                          {fw.label}
                        </p>
                        <p className="text-xs text-gray-600 leading-tight">
                          {fw.desc}
                        </p>
                      </SelectCard>
                    ))}
                  </div>
                  {form.frameworks.length > 0 && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-blue-400 text-sm mt-5 flex items-center gap-2"
                    >
                      <Check size={14} />
                      {form.frameworks.length} framework
                      {form.frameworks.length > 1 ? "s" : ""} selected — we'll
                      set these up for you!
                    </motion.p>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* ── Bottom Navigation ── */}
          <div
            className="flex items-center justify-between pt-8 mt-12"
            style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setStep((s) => s - 1)}
              disabled={step === 0}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-gray-500 hover:text-gray-300 transition-all disabled:opacity-0"
              style={{ border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <ChevronLeft size={16} />
              Back
            </motion.button>

            <p className="text-gray-700 text-sm">
              Step {step + 1} of {STEPS.length}
            </p>

            {step < STEPS.length - 1 ? (
              <motion.button
                whileHover={{
                  scale: 1.03,
                  boxShadow: "0 0 24px rgba(37,99,235,0.4)",
                }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setStep((s) => s + 1)}
                disabled={!canNext()}
                className="flex items-center gap-2 px-8 py-3 rounded-xl text-white font-semibold transition-all disabled:opacity-30"
                style={{
                  background: canNext()
                    ? "linear-gradient(135deg, #2563eb, #1d4ed8)"
                    : "rgba(255,255,255,0.05)",
                  boxShadow: canNext()
                    ? "0 0 20px rgba(37,99,235,0.3)"
                    : "none",
                }}
              >
                Continue
                <ChevronRight size={16} />
              </motion.button>
            ) : (
              <motion.button
                whileHover={{
                  scale: 1.03,
                  boxShadow: "0 0 28px rgba(37,99,235,0.5)",
                }}
                whileTap={{ scale: 0.97 }}
                onClick={handleFinish}
                disabled={!canNext() || loading}
                className="flex items-center gap-2 px-8 py-3 rounded-xl text-white font-semibold transition-all disabled:opacity-30"
                style={{
                  background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
                  boxShadow: "0 0 20px rgba(37,99,235,0.3)",
                }}
              >
                {loading ? "Setting up..." : "Launch ComplyGuy 🚀"}
                {!loading && <ChevronRight size={16} />}
              </motion.button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// ── Tiny helpers ──────────────────────────────────────────────
function StepLabel({ text }: { text: string }) {
  return (
    <p
      className="text-xs font-semibold tracking-widest uppercase mb-4"
      style={{ color: "rgba(96,165,250,0.7)" }}
    >
      {text}
    </p>
  );
}

function StepHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="text-4xl font-bold text-white mb-3 leading-tight"
      style={{ letterSpacing: "-0.02em" }}
    >
      {children}
    </h2>
  );
}

function StepSubheading({ children }: { children: React.ReactNode }) {
  return <p className="text-gray-500 text-lg leading-relaxed">{children}</p>;
}
