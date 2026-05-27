"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import api from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";

/* ─── Data ─────────────────────────────────────────────────────────────── */

const STEPS = [
  { label: "Welcome", sub: "Getting started" },
  { label: "Company name", sub: "Your identity" },
  { label: "Industry & size", sub: "Your context" },
  { label: "Your role", sub: "Personalisation" },
  { label: "Frameworks", sub: "Compliance goals" },
];

const INDUSTRIES = [
  { id: "saas", label: "SaaS / Tech", icon: "💻" },
  { id: "fintech", label: "Fintech / NBFC", icon: "🏦" },
  { id: "healthcare", label: "Healthcare", icon: "🏥" },
  { id: "ecommerce", label: "E-Commerce", icon: "🛒" },
  { id: "edtech", label: "EdTech", icon: "📚" },
  { id: "hrtech", label: "HR Tech", icon: "👥" },
  { id: "other", label: "Other", icon: "🏢" },
];

const SIZES = ["1–10", "11–50", "51–200", "201–500", "500+"];

const ROLES = [
  { id: "cto", label: "CTO / VP Engineering", icon: "⚙️" },
  { id: "ciso", label: "CISO / Security Lead", icon: "🔒" },
  { id: "compliance", label: "Compliance Officer", icon: "📋" },
  { id: "ceo", label: "CEO / Founder", icon: "🚀" },
  { id: "legal", label: "Legal / DPO", icon: "⚖️" },
  { id: "other", label: "Other", icon: "👤" },
];

const FRAMEWORKS = [
  {
    id: "SOC2",
    label: "SOC 2",
    flag: "🔐",
    desc: "For selling to US enterprise customers",
  },
  {
    id: "ISO27001",
    label: "ISO 27001",
    flag: "🌐",
    desc: "International security standard",
  },
  {
    id: "GDPR",
    label: "GDPR",
    flag: "🇪🇺",
    desc: "EU data protection regulation",
  },
  {
    id: "DPDP",
    label: "DPDP 2023",
    flag: "🇮🇳",
    desc: "India data protection law",
  },
  {
    id: "RBI",
    label: "RBI Framework",
    flag: "🏦",
    desc: "RBI IT security for fintechs",
  },
  {
    id: "SEBI",
    label: "SEBI CSCRF",
    flag: "📈",
    desc: "SEBI cyber resilience framework",
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
    desc: "Payment card security standard",
  },
];

/* ─── Types ─────────────────────────────────────────────────────────────── */

interface FormState {
  companyName: string;
  industry: string;
  size: string;
  role: string;
  frameworks: string[];
}

/* ─── Sub-components ─────────────────────────────────────────────────────── */

function LayersIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  );
}

/* ─── Sidebar ────────────────────────────────────────────────────────────── */

function Sidebar({ step }: { step: number }) {
  return (
    <aside
      className="hidden md:flex w-75 lg:w-85 shrink-0 flex-col justify-between
      bg-linear-to-b from-[#0f1629] via-[#0a0f1e] to-[#060a14]
      border-r border-white/6 px-10 py-12 relative overflow-hidden"
    >
      {/* ambient glows */}
      <div
        className="pointer-events-none absolute -top-20 -right-20 w-72 h-72 rounded-full
        bg-[radial-gradient(circle,rgba(59,130,246,0.12)_0%,transparent_70%)]"
      />
      <div
        className="pointer-events-none absolute -bottom-16 -left-10 w-56 h-56 rounded-full
        bg-[radial-gradient(circle,rgba(99,102,241,0.08)_0%,transparent_70%)]"
      />

      <div className="relative z-10">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-16">
          <div
            className="w-10 h-10 rounded-xl bg-linear-to-br from-blue-500 to-indigo-500
            flex items-center justify-center shadow-lg shadow-blue-500/20"
          >
            <LayersIcon className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-medium text-[17px] tracking-tight">
            ComplyGuy
          </span>
        </div>

        {/* Step list */}
        <div className="flex flex-col gap-1">
          {STEPS.map((s, i) => {
            const state = i < step ? "done" : i === step ? "active" : "pending";
            return (
              <div
                key={i}
                className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all
                ${state === "active" ? "bg-blue-500/10 border border-blue-500/20" : ""}
                ${state === "done" ? "opacity-60" : ""}
                ${state === "pending" ? "opacity-30" : ""}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium shrink-0
                  ${state === "active" ? "bg-linear-to-br from-blue-500 to-indigo-500 text-white" : ""}
                  ${state === "done" ? "bg-emerald-500/15 border border-emerald-400/30 text-emerald-400" : ""}
                  ${state === "pending" ? "bg-white/5 border border-white/10 text-white/40" : ""}`}
                >
                  {state === "done" ? (
                    <Check size={13} strokeWidth={2.5} />
                  ) : (
                    i + 1
                  )}
                </div>

                <div>
                  <p
                    className={`text-sm font-medium leading-tight
                    ${state === "active" ? "text-white" : "text-white/60"}`}
                  >
                    {s.label}
                  </p>
                  <p
                    className={`text-xs mt-0.5
                    ${state === "active" ? "text-white/40" : "text-white/25"}`}
                  >
                    {s.sub}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer quote */}
      <div className="relative z-10 pt-8 border-t border-white/6">
        <p
          className="text-[14px] text-white/30 leading-relaxed italic font-light"
          style={{ fontFamily: "'DM Serif Display', serif" }}
        >
          "Compliance shouldn't feel like a chore."
        </p>
      </div>
    </aside>
  );
}

/* ─── Step content panels ────────────────────────────────────────────────── */

function StepTag({ label }: { label: string }) {
  return (
    <div
      className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20
      rounded-full px-3 py-1 text-xs text-blue-400 font-medium mb-6 w-fit"
    >
      <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
      {label}
    </div>
  );
}

function Step0({ firstName }: { firstName?: string }) {
  return (
    <div>
      <div
        className="w-17.5 h-17.5 rounded-[22px] bg-linear-to-br from-blue-500 to-indigo-500
        flex items-center justify-center mb-8 shadow-2xl shadow-blue-500/20"
      >
        <LayersIcon className="w-9 h-9 text-white" />
      </div>
      <p className="text-[11px] font-medium tracking-[0.8px] uppercase text-white/25 mb-3">
        Welcome to ComplyGuy
      </p>
      <h1
        className="text-[38px] leading-[1.12] font-light text-white mb-4 tracking-tight"
        style={{ fontFamily: "'DM Serif Display', serif" }}
      >
        Compliance, made
        <br />
        <em>human.</em>
      </h1>
      <p className="text-[15px] text-white/40 font-light leading-relaxed max-w-100 mb-10">
        Hi {firstName ?? "there"}! We'll guide you through a quick 2-minute
        setup to pick the right frameworks for your business — no jargon, no
        noise.
      </p>
      <div className="flex gap-2.5 flex-wrap">
        {[
          { icon: "🇮🇳", label: "DPDP 2023" },
          { icon: "🔐", label: "SOC 2" },
          { icon: "🌐", label: "ISO 27001" },
          { icon: "🏦", label: "RBI Framework" },
        ].map((b, i) => (
          <div
            key={i}
            className="bg-white/5 border border-white/9 rounded-xl
            px-4 py-3 flex flex-col items-center gap-1.5 flex-1 min-w-22.5"
          >
            <span className="text-[22px]">{b.icon}</span>
            <span className="text-[12px] text-white/35 whitespace-nowrap">
              {b.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Step1({
  form,
  setForm,
}: {
  form: FormState;
  setForm: (f: FormState) => void;
}) {
  return (
    <div>
      <StepTag label="Company" />
      <h2
        className="text-[32px] leading-tight text-white mb-3 tracking-tight"
        style={{ fontFamily: "'DM Serif Display', serif" }}
      >
        What's your company called?
      </h2>
      <p className="text-[15px] text-white/40 font-light mb-10">
        This will appear across your reports and compliance documents.
      </p>
      <input
        autoFocus
        value={form.companyName}
        onChange={(e) => setForm({ ...form, companyName: e.target.value })}
        placeholder="e.g. Acme Technologies Pvt Ltd"
        className="w-full bg-white/4 border border-white/10 text-white rounded-2xl
          px-6 py-4.5 text-[16px] font-light outline-none caret-blue-500
          placeholder:text-white/20 focus:border-blue-500/50 focus:bg-blue-500/4
          transition-all duration-200"
      />
    </div>
  );
}

function Step2({
  form,
  setForm,
}: {
  form: FormState;
  setForm: (f: FormState) => void;
}) {
  return (
    <div>
      <StepTag label="Industry & Size" />
      <h2
        className="text-[32px] leading-tight text-white mb-3 tracking-tight"
        style={{ fontFamily: "'DM Serif Display', serif" }}
      >
        Tell us about your company.
      </h2>
      <p className="text-[15px] text-white/40 font-light mb-8">
        We use this to surface the most relevant compliance frameworks for you.
      </p>

      <p className="text-[11px] font-medium tracking-[0.7px] uppercase text-white/25 mb-3">
        Industry
      </p>
      <div className="grid grid-cols-2 gap-2.5 mb-6">
        {INDUSTRIES.map((ind) => (
          <button
            key={ind.id}
            onClick={() => setForm({ ...form, industry: ind.id })}
            className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border text-left transition-all duration-200
              ${
                form.industry === ind.id
                  ? "border-blue-500/50 bg-blue-500/8 text-white"
                  : "border-white/8 bg-white/3 text-white/50 hover:border-white/20 hover:bg-white/5"
              }`}
          >
            <span className="text-xl">{ind.icon}</span>
            <span className="text-[13px] font-medium">{ind.label}</span>
          </button>
        ))}
      </div>

      <p className="text-[11px] font-medium tracking-[0.7px] uppercase text-white/25 mb-3">
        Team size
      </p>
      <div className="flex gap-2 flex-wrap">
        {SIZES.map((s) => (
          <button
            key={s}
            onClick={() => setForm({ ...form, size: s })}
            className={`px-4 py-2 rounded-lg border text-[13px] transition-all duration-200
              ${
                form.size === s
                  ? "border-blue-500/50 bg-blue-500/8 text-blue-400"
                  : "border-white/8 bg-white/3 text-white/40 hover:border-white/20 hover:text-white/70"
              }`}
          >
            {s} employees
          </button>
        ))}
      </div>
    </div>
  );
}

function Step3({
  form,
  setForm,
}: {
  form: FormState;
  setForm: (f: FormState) => void;
}) {
  return (
    <div>
      <StepTag label="Your Role" />
      <h2
        className="text-[32px] leading-tight text-white mb-3 tracking-tight"
        style={{ fontFamily: "'DM Serif Display', serif" }}
      >
        What's your role?
      </h2>
      <p className="text-[15px] text-white/40 font-light mb-8">
        We'll personalise your dashboard, alerts, and reports around how you
        work.
      </p>
      <div className="grid grid-cols-2 gap-2.5">
        {ROLES.map((r) => (
          <button
            key={r.id}
            onClick={() => setForm({ ...form, role: r.id })}
            className={`flex items-center gap-3 px-4 py-4.5 rounded-xl border text-left transition-all duration-200
              ${
                form.role === r.id
                  ? "border-blue-500/50 bg-blue-500/8 text-white"
                  : "border-white/8 bg-white/3 text-white/50 hover:border-white/20 hover:bg-white/5"
              }`}
          >
            <span className="text-xl">{r.icon}</span>
            <span className="text-[13px] font-medium">{r.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function Step4({
  form,
  setForm,
}: {
  form: FormState;
  setForm: (f: FormState) => void;
}) {
  const toggle = (id: string) =>
    setForm({
      ...form,
      frameworks: form.frameworks.includes(id)
        ? form.frameworks.filter((f) => f !== id)
        : [...form.frameworks, id],
    });

  const cnt = form.frameworks.length;

  return (
    <div>
      <StepTag label="Frameworks" />
      <h2
        className="text-[32px] leading-tight text-white mb-3 tracking-tight"
        style={{ fontFamily: "'DM Serif Display', serif" }}
      >
        Which frameworks do you need?
      </h2>
      <p className="text-[15px] text-white/40 font-light mb-8">
        {cnt > 0 ? (
          <>
            <span className="text-blue-400">{cnt} selected</span> — you can add
            more anytime from your dashboard.
          </>
        ) : (
          "Select all that apply. You can always add more later."
        )}
      </p>
      <div
        className="grid grid-cols-2 gap-2 max-h-85 overflow-y-auto pr-1
        [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.1)_transparent]"
      >
        {FRAMEWORKS.map((fw) => {
          const sel = form.frameworks.includes(fw.id);
          return (
            <button
              key={fw.id}
              onClick={() => toggle(fw.id)}
              className={`flex items-start gap-3 px-4 py-4 rounded-xl border text-left transition-all duration-200
                ${
                  sel
                    ? "border-blue-500/45 bg-blue-500/7"
                    : "border-white/7 bg-white/3 hover:border-white/14 hover:bg-white/5"
                }`}
            >
              <span className="text-[22px] mt-0.5">{fw.flag}</span>
              <div className="flex-1 min-w-0">
                <p
                  className={`text-[13px] font-medium leading-tight ${sel ? "text-white" : "text-white/70"}`}
                >
                  {fw.label}
                </p>
                <p className="text-[11px] text-white/30 mt-1 leading-relaxed">
                  {fw.desc}
                </p>
              </div>
              <div
                className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5
                ${sel ? "bg-blue-500 border-blue-500" : "border-white/15"}`}
              >
                {sel && (
                  <Check size={9} strokeWidth={3} className="text-white" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Main page ──────────────────────────────────────────────────────────── */

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<FormState>({
    companyName: "",
    industry: "",
    size: "",
    role: "",
    frameworks: [],
  });

  const totalSteps = 5;

  const canNext = () => {
    switch (step) {
      case 0:
        return true;
      case 1:
        return form.companyName.trim().length > 0;
      case 2:
        return !!form.industry && !!form.size;
      case 3:
        return !!form.role;
      case 4:
        return form.frameworks.length > 0;
      default:
        return true;
    }
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      for (const type of form.frameworks) {
        try {
          await api.post("/compliance/frameworks", { type });
        } catch {
          /* already exists */
        }
      }
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const stepTags = [
    "Welcome",
    "Company",
    "Industry & Size",
    "Your Role",
    "Frameworks",
  ];

  return (
    <>
      {/* Google Fonts */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500&display=swap');`}</style>

      <div className="min-h-screen bg-[#0d0d14] flex items-stretch font-['DM_Sans',sans-serif]">
        <Sidebar step={step} />

        {/* Main panel */}
        <main className="flex-1 flex flex-col justify-between px-8 md:px-16 py-12 relative overflow-hidden">
          {/* Ambient glow */}
          <div
            className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 rounded-full
            bg-[radial-gradient(circle,rgba(99,102,241,0.04)_0%,transparent_60%)]"
          />

          {/* Progress bar */}
          <div className="h-0.5 bg-white/6 rounded-full mb-12 overflow-hidden">
            <div
              className="h-full bg-linear-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500 ease-in-out"
              style={{ width: `${(step / (totalSteps - 1)) * 100}%` }}
            />
          </div>

          {/* Animated step content */}
          <div className="flex-1 flex flex-col justify-center max-w-140">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
              >
                {step === 0 && <Step0 firstName={user?.firstName} />}
                {step === 1 && <Step1 form={form} setForm={setForm} />}
                {step === 2 && <Step2 form={form} setForm={setForm} />}
                {step === 3 && <Step3 form={form} setForm={setForm} />}
                {step === 4 && <Step4 form={form} setForm={setForm} />}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-8 border-t border-white/5 mt-8">
            <button
              onClick={() => setStep((s) => s - 1)}
              disabled={step === 0}
              className="flex items-center gap-2 border border-white/10 text-white/40 rounded-xl
                px-5 py-3 text-sm transition-all duration-200
                hover:border-white/20 hover:text-white/70
                disabled:opacity-0 disabled:pointer-events-none"
            >
              ← Back
            </button>

            <span className="text-[12px] text-white/20">
              Step {step + 1} of {totalSteps}
            </span>

            {step < totalSteps - 1 ? (
              <button
                onClick={() => setStep((s) => s + 1)}
                disabled={!canNext()}
                className="flex items-center gap-2 bg-linear-to-r from-blue-500 to-indigo-500
                  text-white rounded-xl px-6 py-3 text-sm font-medium transition-all duration-200
                  hover:-translate-y-px hover:shadow-lg hover:shadow-blue-500/30
                  disabled:from-white/7 disabled:to-white/7 disabled:text-white/20
                  disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
              >
                Continue →
              </button>
            ) : (
              <button
                onClick={handleFinish}
                disabled={!canNext() || loading}
                className="flex items-center gap-2 bg-linear-to-r from-emerald-600 to-teal-500
                  text-white rounded-xl px-6 py-3 text-sm font-medium transition-all duration-200
                  hover:-translate-y-px hover:shadow-lg hover:shadow-emerald-500/30
                  disabled:from-white/7 disabled:to-white/7 disabled:text-white/20
                  disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
              >
                {loading ? "Setting up..." : "Launch ComplyGuy 🚀"}
              </button>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
