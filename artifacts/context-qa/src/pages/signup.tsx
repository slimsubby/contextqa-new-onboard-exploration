import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import logo from "@assets/cqa-logo-with-text_1775832971845.png";
import SignupAnimation from "@/components/SignupAnimation";
import CQARobot from "../components/CQARobot";

type Step = "email" | "org" | "building" | "details";

const KNOWN_ORGS: Record<string, string> = {
  "halight.com": "Halight Inc.",
  "contextqa.com": "ContextQA",
  "acme.com": "Acme Corporation",
  "google.com": "Google",
  "microsoft.com": "Microsoft",
};

const VERTICALS = [
  "SaaS / Software",
  "E-commerce & Retail",
  "FinTech & Banking",
  "HealthTech & MedTech",
  "EdTech",
  "Enterprise Software",
  "Media & Entertainment",
  "Logistics & Supply Chain",
  "HR & Workforce",
  "Other",
];

const BUILD_STEPS = [
  { label: "Searching for organization…", duration: 900 },
  { label: "Identifying industry vertical…", duration: 800 },
  { label: "Mapping common user workflows…", duration: 900 },
  { label: "Building knowledge base…", duration: 1000 },
  { label: "Preparing test patterns…", duration: 700 },
];

function lookupOrg(email: string): string | null {
  const domain = email.split("@")[1]?.toLowerCase();
  return domain ? (KNOWN_ORGS[domain] ?? null) : null;
}

export default function SignUpPage() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [recognizedOrg, setRecognizedOrg] = useState<string | null>(null);
  const [orgName, setOrgName] = useState("");
  const [vertical, setVertical] = useState("");
  const [website, setWebsite] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [buildIndex, setBuildIndex] = useState(0);
  const [buildDone, setBuildDone] = useState(false);
  const [, navigate] = useLocation();

  /* ── Building animation sequencer ── */
  useEffect(() => {
    if (step !== "building") return;
    let idx = 0;
    setBuildIndex(0);
    setBuildDone(false);

    function advance() {
      idx++;
      if (idx < BUILD_STEPS.length) {
        setBuildIndex(idx);
        setTimeout(advance, BUILD_STEPS[idx].duration);
      } else {
        setBuildDone(true);
        setTimeout(() => navigate("/dashboard?onboarding=new"), 600);
      }
    }
    const t = setTimeout(advance, BUILD_STEPS[0].duration);
    return () => clearTimeout(t);
  }, [step]);

  function handleEmailContinue(e: React.FormEvent) {
    e.preventDefault();
    const org = lookupOrg(email);
    setRecognizedOrg(org);
    setStep("details");
  }

  function handleDetailsSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (recognizedOrg) {
      navigate("/dashboard?onboarding=new");
    } else {
      setStep("org");
    }
  }

  function handleOrgSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStep("building");
  }

  const EyeIcon = ({ open }: { open: boolean }) =>
    open ? (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    ) : (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
      </svg>
    );

  const backButton = (target: Step) => (
    <button
      onClick={() => setStep(target)}
      className="flex items-center gap-1 text-indigo-200 hover:text-white transition-colors text-xs font-medium"
    >
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
      </svg>
      Back
    </button>
  );

  /* step progress dots */
  const steps: Step[] = ["email", "details", "org", "building"];
  const dotSteps = ["email", "details", "org"];
  const dotActive = step === "building" ? "org" : step;

  return (
    <div className="min-h-screen w-full bg-white relative overflow-hidden flex flex-col">
      <div className="absolute inset-0 z-0">
        <SignupAnimation skipToEnd />
      </div>

      <header className="px-6 py-4 flex items-center gap-2 z-10 relative">
        <img src={logo} alt="ContextQA" className="h-12 w-auto cursor-pointer" onClick={() => navigate("/")} />
      </header>

      <div className="flex-1 flex relative">
        <div className="flex-1" />

        <div className="flex flex-col justify-center pr-16 pb-16 z-10 relative">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden flex flex-row">

            {/* ── Left panel ── */}
            <div className="w-56 bg-gradient-to-b from-indigo-600 to-indigo-800 flex flex-col flex-shrink-0">
              <div className="px-4 py-3 border-b border-indigo-500/40 flex items-center">
                {step === "details" && backButton("email")}
                {step === "org" && backButton("details")}
                {(step === "email" || step === "building") && <span className="h-4" />}
              </div>

              <div className="flex-1 flex items-center justify-center px-4 py-4">
                <CQARobot className="w-36 h-36 flex-shrink-0" />
              </div>

              {/* Step dots */}
              <div className="flex items-center justify-center gap-1.5 pb-4">
                {dotSteps.map((s) => (
                  <div
                    key={s}
                    className={`rounded-full transition-all duration-300 ${
                      dotActive === s
                        ? "w-4 h-1.5 bg-white"
                        : steps.indexOf(dotActive as Step) > dotSteps.indexOf(s)
                        ? "w-1.5 h-1.5 bg-white/70"
                        : "w-1.5 h-1.5 bg-white/25"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* ── Right panel ── */}
            <div className="w-96 flex-shrink-0">

              {/* STEP 1: Email */}
              {step === "email" && (
                <>
                  <div className="border-b border-gray-100 px-6 py-3">
                    <h2 className="text-lg font-semibold text-gray-900">Create your account</h2>
                    <p className="text-sm text-gray-500 mt-0.5">Start by entering your work email</p>
                  </div>
                  <div className="p-6">
                    <form onSubmit={handleEmailContinue} className="space-y-3">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoFocus
                        className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        placeholder="Work email"
                      />
                      <button type="submit" className="w-full py-2.5 rounded-xl font-semibold text-sm bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-sm">
                        Continue
                      </button>
                      <button type="button" onClick={() => navigate("/")} className="w-full py-2.5 rounded-xl font-semibold text-sm border border-indigo-400 bg-white text-indigo-600 hover:bg-indigo-50 transition-colors">
                        Back to Sign In
                      </button>
                    </form>
                  </div>
                </>
              )}

              {/* STEP 2: New Org setup */}
              {step === "org" && (
                <>
                  <div className="border-b border-gray-100 px-6 py-3">
                    <h2 className="text-lg font-semibold text-gray-900">Set up your organization</h2>
                    <p className="text-sm text-gray-500 mt-0.5">Tell us about your company</p>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-xl px-3 py-2.5 mb-4">
                      <i
                        className="fa-duotone fa-building fa-lg"
                        style={{
                          "--fa-primary-color": "#4338ca",
                          "--fa-secondary-color": "#a5b4fc",
                          "--fa-secondary-opacity": "1",
                        } as React.CSSProperties}
                      />
                      <p className="text-xs text-indigo-700 leading-snug">
                        We'll use this to build contextual knowledge of your product and vertical.
                      </p>
                    </div>

                    <form onSubmit={handleOrgSubmit} className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                          Organization name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={orgName}
                          onChange={(e) => setOrgName(e.target.value)}
                          required
                          autoFocus
                          className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 placeholder-gray-400"
                          placeholder="e.g. Acme Corp"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                          Company website <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm select-none pointer-events-none">
                            https://
                          </span>
                          <input
                            type="text"
                            value={website}
                            onChange={(e) => setWebsite(e.target.value)}
                            required
                            className="w-full pl-[72px] pr-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 placeholder-gray-400"
                            placeholder="yourcompany.com"
                          />
                        </div>
                      </div>
                      <button type="submit" className="w-full py-2.5 rounded-xl font-semibold text-sm bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-sm">
                        Continue
                      </button>
                    </form>
                  </div>
                </>
              )}

              {/* STEP 2b: Building animation */}
              {step === "building" && (
                <>
                  <div className="border-b border-gray-100 px-6 py-3">
                    <h2 className="text-lg font-semibold text-gray-900">Building your workspace</h2>
                    <p className="text-sm text-gray-500 mt-0.5 truncate">
                      {orgName || "Your organization"}
                      {vertical ? ` · ${vertical}` : ""}
                    </p>
                  </div>
                  <div className="p-6 flex flex-col gap-5">
                    {/* Animated steps list */}
                    <div className="space-y-3">
                      {BUILD_STEPS.map((s, i) => {
                        const done = i < buildIndex;
                        const active = i === buildIndex && !buildDone;
                        const pending = i > buildIndex && !buildDone;
                        return (
                          <div key={i} className="flex items-center gap-3">
                            {/* Icon */}
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                              done ? "bg-green-100" : active ? "bg-indigo-100" : "bg-gray-100"
                            }`}>
                              {done ? (
                                <svg className="w-3.5 h-3.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                </svg>
                              ) : active ? (
                                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
                              ) : (
                                <span className="w-2 h-2 rounded-full bg-gray-300" />
                              )}
                            </div>
                            {/* Label */}
                            <span className={`text-sm transition-colors duration-300 ${
                              done ? "text-gray-400 line-through" : active ? "text-indigo-700 font-medium" : "text-gray-400"
                            }`}>
                              {s.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-1.5 bg-indigo-500 rounded-full transition-all duration-700"
                        style={{ width: buildDone ? "100%" : `${((buildIndex) / BUILD_STEPS.length) * 100}%` }}
                      />
                    </div>

                    {/* Done indicator */}
                    {buildDone && (
                      <div className="flex items-center justify-center gap-2 pt-1">
                        <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                          <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <p className="text-sm font-semibold text-green-700">Knowledge base ready!</p>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* STEP 2: Profile details */}
              {step === "details" && (
                <>
                  <div className="border-b border-gray-100 px-6 py-3">
                    <h2 className="text-lg font-semibold text-gray-900">Complete your profile</h2>
                    {recognizedOrg && (
                      <div className="flex items-center gap-1.5 mt-1">
                        <svg className="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-xs text-green-600 font-medium">{recognizedOrg}</span>
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <form onSubmit={handleDetailsSubmit} className="space-y-3">
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        autoFocus
                        className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        placeholder="Full Name"
                      />
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 pr-12"
                          placeholder="Password"
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                          <EyeIcon open={showPassword} />
                        </button>
                      </div>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        placeholder="Confirm Password"
                      />
                      <button type="submit" className="w-full py-2.5 rounded-xl font-semibold text-sm bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-sm">
                        {recognizedOrg ? "Create Account" : "Continue"}
                      </button>
                    </form>
                  </div>
                </>
              )}

            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded px-2 py-1 text-xs text-gray-500 shadow-sm flex items-center gap-1">
        <div className="w-4 h-4 border border-gray-300 rounded-sm flex items-center justify-center">
          <div className="w-2 h-2 bg-gray-400 rounded-sm" />
        </div>
        reCAPTCHA
      </div>
    </div>
  );
}
