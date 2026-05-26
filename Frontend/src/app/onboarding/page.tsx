"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import api from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Shield,
  Users,
  Briefcase,
  ChevronRight,
  ChevronLeft,
  Check,
  Sparkles,
} from "lucide-react";

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

const COMPANY_SIZES = [
  { id: "1-10", label: "1-10", desc: "Early stage startup" },
  { id: "11-50", label: "11-50", desc: "Growing startup" },
  { id: "51-200", label: "51-200", desc: "Scale-up" },
  { id: "201-500", label: "201-500", desc: "Mid-size company" },
  { id: "500+", label: "500+", desc: "Enterprise" },
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

const ROLES = [
  { id: "cto", label: "CTO / VP Engineering", icon: "⚙️" },
  { id: "ciso", label: "CISO / Security Lead", icon: "🔒" },
  { id: "compliance", label: "Compliance Officer", icon: "📋" },
  { id: "ceo", label: "CEO / Founder", icon: "🚀" },
  { id: "legal", label: "Legal / DPO", icon: "⚖️" },
  { id: "other", label: "Other", icon: "👤" },
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

  const totalSteps = 5;

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
      // Create selected frameworks
      for (const type of form.frameworks) {
        try {
          await api.post("/compliance/frameworks", { type });
        } catch {
          /* already exists */
        }
      }
      // Redirect to dashboard
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const canNext = () => {
    switch (step) {
      case 0:
        return true;
      case 1:
        return form.companyName.length > 0;
      case 2:
        return form.industry !== "" && form.companySize !== "";
      case 3:
        return form.role !== "";
      case 4:
        return form.frameworks.length > 0;
      default:
        return true;
    }
  };

  const steps = [
    { title: "Welcome", icon: Sparkles },
    { title: "Company", icon: Building2 },
    { title: "About You", icon: Briefcase },
    { title: "Your Role", icon: Users },
    { title: "Frameworks", icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            {steps.map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    i < step
                      ? "bg-green-500 text-white"
                      : i === step
                        ? "bg-blue-600 text-white"
                        : "bg-gray-800 text-gray-500"
                  }`}
                >
                  {i < step ? <Check size={14} /> : i + 1}
                </div>
                {i < steps.length - 1 && (
                  <div
                    className={`h-0.5 w-8 md:w-16 transition-all ${i < step ? "bg-green-500" : "bg-gray-800"}`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="h-1 bg-gray-800 rounded-full">
            <div
              className="h-1 bg-blue-600 rounded-full transition-all duration-500"
              style={{ width: `${(step / (totalSteps - 1)) * 100}%` }}
            />
          </div>
        </div>

        {/* Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="bg-gray-900 rounded-3xl p-8 border border-gray-800"
          >
            {/* Step 0 — Welcome */}
            {step === 0 && (
              <div className="text-center py-4">
                <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-600/20">
                  <Building2 className="text-white" size={40} />
                </div>
                <h1 className="text-3xl font-bold text-white mb-3">
                  Welcome to ComplyGuy! 🎉
                </h1>
                <p className="text-gray-400 text-lg mb-2">
                  Hi {user?.firstName}! Let's get you set up in 2 minutes.
                </p>
                <p className="text-gray-500 text-sm">
                  We'll help you pick the right compliance frameworks for your
                  business.
                </p>
                <div className="grid grid-cols-3 gap-4 mt-8">
                  {[
                    { icon: "🇮🇳", label: "DPDP 2023" },
                    { icon: "🔐", label: "SOC 2" },
                    { icon: "🏦", label: "RBI Framework" },
                  ].map((f, i) => (
                    <div
                      key={i}
                      className="bg-gray-800 rounded-2xl p-4 text-center"
                    >
                      <p className="text-2xl mb-1">{f.icon}</p>
                      <p className="text-white text-sm font-medium">
                        {f.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 1 — Company Name */}
            {step === 1 && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  What's your company name?
                </h2>
                <p className="text-gray-400 mb-8">
                  This will appear on your compliance reports.
                </p>
                <input
                  value={form.companyName}
                  onChange={(e) =>
                    setForm({ ...form, companyName: e.target.value })
                  }
                  placeholder="e.g. Acme Technologies Pvt Ltd"
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-2xl px-6 py-4 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
                  autoFocus
                />
              </div>
            )}

            {/* Step 2 — Industry & Size */}
            {step === 2 && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Tell us about your company
                </h2>
                <p className="text-gray-400 mb-6">
                  Helps us recommend the right frameworks.
                </p>

                <p className="text-gray-300 text-sm font-medium mb-3">
                  Industry
                </p>
                <div className="grid grid-cols-2 gap-2 mb-6">
                  {INDUSTRIES.map((ind) => (
                    <button
                      key={ind.id}
                      onClick={() => setForm({ ...form, industry: ind.id })}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                        form.industry === ind.id
                          ? "border-blue-500 bg-blue-500/10 text-white"
                          : "border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600"
                      }`}
                    >
                      <span>{ind.icon}</span>
                      <span className="text-sm font-medium">{ind.label}</span>
                    </button>
                  ))}
                </div>

                <p className="text-gray-300 text-sm font-medium mb-3">
                  Company Size
                </p>
                <div className="flex flex-wrap gap-2">
                  {COMPANY_SIZES.map((size) => (
                    <button
                      key={size.id}
                      onClick={() => setForm({ ...form, companySize: size.id })}
                      className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                        form.companySize === size.id
                          ? "border-blue-500 bg-blue-500/10 text-white"
                          : "border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600"
                      }`}
                    >
                      {size.label} employees
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3 — Role */}
            {step === 3 && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  What's your role?
                </h2>
                <p className="text-gray-400 mb-6">
                  We'll personalise your experience based on your role.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {ROLES.map((role) => (
                    <button
                      key={role.id}
                      onClick={() => setForm({ ...form, role: role.id })}
                      className={`flex items-center gap-3 p-4 rounded-2xl border transition-all text-left ${
                        form.role === role.id
                          ? "border-blue-500 bg-blue-500/10 text-white"
                          : "border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600"
                      }`}
                    >
                      <span className="text-2xl">{role.icon}</span>
                      <span className="text-sm font-medium">{role.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4 — Frameworks */}
            {step === 4 && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Which frameworks do you need?
                </h2>
                <p className="text-gray-400 mb-6">
                  Select all that apply. You can add more later.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {FRAMEWORKS.map((fw) => (
                    <button
                      key={fw.id}
                      onClick={() => toggleFramework(fw.id)}
                      className={`flex items-start gap-3 p-4 rounded-2xl border transition-all text-left ${
                        form.frameworks.includes(fw.id)
                          ? "border-blue-500 bg-blue-500/10"
                          : "border-gray-700 bg-gray-800 hover:border-gray-600"
                      }`}
                    >
                      <span className="text-xl mt-0.5">{fw.flag}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p
                            className={`text-sm font-semibold ${form.frameworks.includes(fw.id) ? "text-white" : "text-gray-300"}`}
                          >
                            {fw.label}
                          </p>
                          {form.frameworks.includes(fw.id) && (
                            <Check size={14} className="text-blue-400" />
                          )}
                        </div>
                        <p className="text-gray-500 text-xs mt-0.5">
                          {fw.desc}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
                {form.frameworks.length > 0 && (
                  <p className="text-blue-400 text-sm mt-3 text-center">
                    ✅ {form.frameworks.length} framework
                    {form.frameworks.length > 1 ? "s" : ""} selected
                  </p>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 0}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-gray-400 hover:text-white disabled:opacity-0 transition-all"
          >
            <ChevronLeft size={18} />
            Back
          </button>

          <span className="text-gray-600 text-sm">
            {step + 1} / {totalSteps}
          </span>

          {step < totalSteps - 1 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              disabled={!canNext()}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-800 disabled:text-gray-600 text-white px-6 py-2.5 rounded-xl font-medium transition-all"
            >
              Next
              <ChevronRight size={18} />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              disabled={!canNext() || loading}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-800 disabled:text-gray-600 text-white px-6 py-2.5 rounded-xl font-medium transition-all"
            >
              {loading ? "Setting up..." : "Launch ComplyGuy 🚀"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
