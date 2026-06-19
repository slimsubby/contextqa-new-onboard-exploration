import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import CQARobot from "./CQARobot";

function Toggle({ on, onChange, label }: { on: boolean; onChange: () => void; label: string }) {
  return (
    <button onClick={onChange} className="flex items-center gap-2 text-xs font-medium text-gray-700 select-none">
      <div className={`relative w-9 h-5 rounded-full transition-colors duration-200 ${on ? "bg-indigo-600" : "bg-gray-300"}`}>
        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${on ? "translate-x-4" : "translate-x-0.5"}`} />
      </div>
      {label}
    </button>
  );
}

const PUNS = [
  "Context switching at the speed of thought…",
  "Running regression on your requirements…",
  "Asserting your test cases aren't null…",
  "Mocking all the right dependencies…",
  "Finding edge cases in your edge cases…",
  "Building your test pyramid from the base up…",
  "Parsing requirements — no semicolons harmed…",
  "Integrating continuously (and carefully)…",
  "Test-driving through your context…",
  "Checking if your spec is fully typed…",
  "Squashing bugs before they enter scope…",
  "Coverage: 0% → hold tight…",
];

const INSIGHTS = [
  "Identified 3 authentication flows — social login, email/password, and SSO via SAML",
  "Checkout has 14 distinct states: cart, address, shipping, payment, confirmation + error paths",
  "REST API exposes 38 endpoints across 6 resource types — full coverage mapped",
  "Admin panel contains 52 interactive components flagged for regression testing",
  "Mobile breakpoints at 375px, 768px, 1024px, and 1280px — cross-device suite scoped",
  "Payment integrations: Stripe, PayPal, Apple Pay — sandbox + live env matrix required",
  "Search latency SLA under 200ms for 500k+ indexed records — perf tests identified",
  "6 role types detected: Viewer, Editor, QA Lead, Manager, Admin, Super Admin",
  "Async notification pipeline: email, SMS, push, in-app — delivery confirmation flows mapped",
  "Data export triggers async job — CSV, XLSX, PDF formats each need end-to-end coverage",
  "Session timeout enforced at 30 min — token refresh and re-auth flows identified",
  "File upload: 50MB limit with virus scan gate — upload, rejection, and retry paths scoped",
];

export function AddContextDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [, navigate] = useLocation();
  const [step, setStep] = useState<"form" | "loading">("form");
  const [insightIndex, setInsightIndex] = useState(0);
  const [completedInsights, setCompletedInsights] = useState<string[]>([]);
  const [punIndex, setPunIndex] = useState(0);
  const [punVisible, setPunVisible] = useState(true);
  const [findingsOpen, setFindingsOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const insightsEndRef = useRef<HTMLDivElement>(null);
  const completionRef = useRef<HTMLDivElement>(null);

  const [activeOption, setActiveOption] = useState<"upload" | "source" | "video" | "knowledge">("upload");
  const [knowledgeCat, setKnowledgeCat] = useState("industry");
  const [knowledgeText, setKnowledgeText] = useState("");
  const [configOpen, setConfigOpen] = useState(false);
  const [platform, setPlatform] = useState<"web" | "mobile" | "api">("web");
  const [createTestSuite, setCreateTestSuite] = useState(true);
  const [addToTestPlan, setAddToTestPlan] = useState(true);
  const [publishMode, setPublishMode] = useState<"approval" | "auto">("approval");

  const [attachedFiles, setAttachedFiles] = useState<{ name: string; size: string; type: string }[]>([]);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) {
      setStep("form");
      setInsightIndex(0);
      setCompletedInsights([]);
      setPunIndex(0);
      setPunVisible(true);
      setFindingsOpen(false);
      setShowSuccess(false);
    }
  }, [open]);

  useEffect(() => {
    if (step !== "loading") return;
    setInsightIndex(0);
    setCompletedInsights([]);
    const id = setInterval(() => {
      setInsightIndex((prev) => {
        const next = prev + 1;
        if (next < INSIGHTS.length) {
          setCompletedInsights((c) => [...c, INSIGHTS[prev]]);
          return next;
        }
        clearInterval(id);
        return prev;
      });
    }, 3000);
    return () => clearInterval(id);
  }, [step]);

  useEffect(() => {
    if (step !== "loading") return;
    setPunIndex(0);
    setPunVisible(true);
    const id = setInterval(() => {
      setPunVisible(false);
      setTimeout(() => {
        setPunIndex((i) => (i + 1) % PUNS.length);
        setPunVisible(true);
      }, 300);
    }, 3000);
    return () => clearInterval(id);
  }, [step]);

  useEffect(() => {
    insightsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [completedInsights]);

  useEffect(() => {
    if (completedInsights.length < 5) return;
    const t1 = setTimeout(() => {
      setShowSuccess(true);
      completionRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 600);
    return () => clearTimeout(t1);
  }, [completedInsights.length]);

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files).map((f) => ({
      name: f.name,
      size: formatSize(f.size),
      type: f.type,
    }));
    setAttachedFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (name: string) =>
    setAttachedFiles((prev) => prev.filter((f) => f.name !== name));

  const fileIcon = (name: string) => {
    const ext = name.split(".").pop()?.toLowerCase();
    if (["mp4", "mov", "avi", "webm"].includes(ext ?? ""))
      return <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0"><svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg></div>;
    if (["xlsx", "xls", "csv"].includes(ext ?? ""))
      return <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0"><svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg></div>;
    if (["pdf"].includes(ext ?? ""))
      return <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0"><svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg></div>;
    return <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0"><svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg></div>;
  };

  const optionCards = [
    {
      id: "upload" as const,
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>,
      label: "Upload files",
      sub: "PDF, DOCX, XLSX, CSV",
    },
    {
      id: "source" as const,
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>,
      label: "Connect source",
      sub: "Figma, Github",
    },
    {
      id: "video" as const,
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>,
      label: "Add Video",
      sub: "Video or recording",
    },
    {
      id: "knowledge" as const,
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>,
      label: "Add Knowledge",
      sub: "Patterns, constraints & more",
    },
  ];

  const knowledgeCats = [
    { id: "industry",    label: "Industry",       color: "bg-indigo-100 text-indigo-700 border-indigo-200"  },
    { id: "workflows",   label: "Key Workflows",  color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
    { id: "patterns",    label: "Patterns",       color: "bg-violet-100 text-violet-700 border-violet-200"  },
    { id: "constraints", label: "Constraints",    color: "bg-amber-100 text-amber-700 border-amber-200"     },
    { id: "notes",       label: "Notes",          color: "bg-rose-100 text-rose-700 border-rose-200"        },
  ];

  const platformOptions = [
    { id: "web" as const, label: "Web Application", icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="2"/><path strokeLinecap="round" strokeWidth={2} d="M3 9h18"/></svg> },
    { id: "mobile" as const, label: "Mobile", icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="5" y="2" width="14" height="20" rx="2" strokeWidth="2"/><path strokeLinecap="round" strokeWidth={2} d="M12 18h.01"/></svg> },
    { id: "api" as const, label: "API", icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/></svg> },
  ];

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/25 backdrop-blur-[2px] transition-opacity duration-300"
        style={{ opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none" }}
        onClick={onClose}
      />

      <div
        className="fixed top-0 right-0 bottom-0 z-50 w-[460px] bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-out"
        style={{ transform: open ? "translateX(0)" : "translateX(100%)" }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
          {step === "loading" ? (
            <>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setStep("form")}
                  className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h2 className="font-semibold text-gray-900 text-sm">Analyzing Context</h2>
              </div>
              <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                  <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                </div>
                <h2 className="font-semibold text-gray-900 text-sm">Upload Requirements</h2>
              </div>
              <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </>
          )}
        </div>

        {step === "loading" && (
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-3">
            {completedInsights.length < 5 && (<>
              {completedInsights.map((insight, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-500 leading-snug">{insight}</p>
                </div>
              ))}
              <div
                className="flex items-center gap-2 transition-opacity duration-300"
                style={{ opacity: punVisible ? 1 : 0 }}
                ref={insightsEndRef}
              >
                <div className="w-[66px] h-[66px] flex-shrink-0" style={{ marginLeft: "-23px" }}>
                  <CQARobot className="w-full h-full" />
                </div>
                <p className="text-sm text-gray-700 font-medium leading-snug" style={{ marginLeft: "-15px" }}>{PUNS[punIndex]}</p>
              </div>
            </>)}

            {completedInsights.length >= 5 && (
              <div className="rounded-xl border border-gray-200 overflow-hidden">
                <button
                  onClick={() => setFindingsOpen((o) => !o)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm font-semibold text-gray-800">5 key findings extracted</span>
                  </div>
                  <svg
                    className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${findingsOpen ? "rotate-180" : ""}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div
                  className="overflow-hidden transition-all duration-400 ease-in-out"
                  style={{ maxHeight: findingsOpen ? `${completedInsights.length * 56}px` : "0px" }}
                >
                  {completedInsights.map((insight, i) => (
                    <div key={i} className="flex items-start gap-3 px-4 py-2.5 border-t border-gray-100">
                      <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-2.5 h-2.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="text-xs text-gray-500 leading-snug">{insight}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {showSuccess && (
              <div className="flex flex-col items-center text-center py-4" ref={completionRef}>
                <div className="w-48 h-48">
                  <CQARobot className="w-full h-full" />
                </div>
                <p className="text-sm font-semibold text-indigo-900 -mt-8">Dispatching your context to Tests</p>
                <p className="text-xs text-indigo-500 mt-0.5 leading-relaxed">Your findings are on their way — test generation is starting now.</p>
              </div>
            )}
          </div>
        )}

        {step === "form" && (
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-3">Select an option to begin with</p>
              <div className="grid grid-cols-2 gap-3">
                {optionCards.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setActiveOption(opt.id)}
                    className={`flex flex-col items-center gap-2.5 p-4 rounded-xl border-2 text-center transition-all ${
                      activeOption === opt.id
                        ? "border-indigo-500 bg-indigo-50/70"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                      activeOption === opt.id ? "bg-indigo-100 text-indigo-600" : "bg-gray-100 text-gray-400"
                    }`}>
                      {opt.icon}
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-gray-800 leading-tight">{opt.label}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">{opt.sub}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {activeOption === "knowledge" && (
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2.5">Category</p>
                  <div className="flex flex-wrap gap-2">
                    {knowledgeCats.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setKnowledgeCat(cat.id)}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                          knowledgeCat === cat.id
                            ? cat.color + " border-current"
                            : "bg-gray-50 text-gray-500 border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Item</p>
                  <textarea
                    value={knowledgeText}
                    onChange={(e) => setKnowledgeText(e.target.value)}
                    placeholder={
                      knowledgeCat === "industry"    ? "e.g. SaaS, Fintech, Multi-tenant…" :
                      knowledgeCat === "workflows"   ? "e.g. Checkout flow, Password reset…" :
                      knowledgeCat === "patterns"    ? "e.g. Always test empty states on list views…" :
                      knowledgeCat === "constraints" ? "e.g. Max file upload: 10 MB…" :
                      "e.g. Payment gateway offline Sundays 02:00–04:00 UTC…"
                    }
                    rows={3}
                    className="w-full text-sm text-gray-700 border border-gray-200 rounded-xl px-3.5 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 placeholder-gray-300"
                  />
                </div>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => addFiles(e.target.files)}
            />

            <div
              onClick={() => activeOption !== "knowledge" && fileInputRef.current?.click()}
              onDragOver={(e) => { if (activeOption === "knowledge") return; e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => { if (activeOption === "knowledge") return; e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
              style={{ display: activeOption === "knowledge" ? "none" : undefined }}
              className={`border-2 border-dashed rounded-xl py-8 px-6 flex flex-col items-center gap-2 cursor-pointer transition-colors ${
                dragging
                  ? "border-indigo-400 bg-indigo-50/40"
                  : "border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/20"
              }`}
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors ${dragging ? "bg-indigo-200" : "bg-indigo-50"}`}>
                <svg className={`w-5 h-5 transition-colors ${dragging ? "text-indigo-700" : "text-indigo-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-700">Click to upload or drag and drop</p>
              <p className="text-xs text-gray-400">Supports PDF, DOCX, XLSX, CSV, MP4 · Max 500 MB</p>
            </div>

            {attachedFiles.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2.5">
                  Inputs Attached ({attachedFiles.length})
                </p>
                <div className="space-y-2">
                  {attachedFiles.map((file) => (
                    <div key={file.name} className="flex items-center justify-between px-3 py-2.5 rounded-lg border border-gray-200 bg-white hover:border-gray-300 transition-colors">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {fileIcon(file.name)}
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-gray-800 truncate">{file.name}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">Local Upload • {file.size}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFile(file.name)}
                        className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-gray-300 hover:text-red-400 hover:bg-red-50 rounded-md transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeOption !== "knowledge" && <div>
              <button
                onClick={() => setConfigOpen(!configOpen)}
                className="flex items-center justify-between w-full py-2 transition-colors group"
              >
                <div className="flex items-center gap-2 text-sm font-medium text-gray-400 group-hover:text-gray-500 transition-colors">
                  <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><circle cx="12" cy="12" r="3" strokeWidth={2}/>
                  </svg>
                  {configOpen ? "Hide" : "Show"} Configuration Options
                </div>
                <svg className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${configOpen ? "" : "rotate-180"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </button>

              {configOpen && (
                <div className="pt-3 space-y-5">
                  <div>
                    <div className="flex items-center gap-1.5 mb-2.5">
                      <p className="cqa-label">Select Target Platform</p>
                      <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" strokeWidth="2"/><path strokeLinecap="round" strokeWidth={2} d="M12 16v-4M12 8h.01"/>
                      </svg>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {platformOptions.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => setPlatform(p.id)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-colors ${
                            platform === p.id
                              ? "border-indigo-500 text-indigo-700 bg-indigo-50"
                              : "border-gray-200 text-gray-600 hover:border-gray-300"
                          }`}
                        >
                          <div className={`w-3.5 h-3.5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${platform === p.id ? "border-indigo-500" : "border-gray-300"}`}>
                            {platform === p.id && <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />}
                          </div>
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-6">
                    <Toggle on={createTestSuite} onChange={() => setCreateTestSuite(!createTestSuite)} label="Create Test Suite" />
                    <Toggle on={addToTestPlan} onChange={() => setAddToTestPlan(!addToTestPlan)} label="Add to Test Plan" />
                  </div>

                  <div>
                    <p className="cqa-label mb-2.5">Publish Mode</p>
                    <div className="grid grid-cols-2 gap-2">
                      {([
                        { id: "approval" as const, label: "Require Approval" },
                        { id: "auto" as const, label: "Auto Publish" },
                      ]).map((m) => (
                        <button
                          key={m.id}
                          onClick={() => setPublishMode(m.id)}
                          className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-xs font-medium transition-colors ${
                            publishMode === m.id
                              ? "border-indigo-500 text-indigo-700 bg-indigo-50"
                              : "border-gray-200 text-gray-600 hover:border-gray-300"
                          }`}
                        >
                          <div className={`w-3.5 h-3.5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${publishMode === m.id ? "border-indigo-500" : "border-gray-300"}`}>
                            {publishMode === m.id && <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />}
                          </div>
                          {m.label}
                        </button>
                      ))}
                    </div>
                    {publishMode === "approval" && (
                      <p className="text-[10px] text-gray-400 mt-2 leading-relaxed">
                        "Require Approval" keeps tests in a draft state until manually reviewed.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>}
          </div>
        )}

        {step === "form" && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center gap-3 shrink-0 bg-white">
            <button
              onClick={() => setStep("loading")}
              className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-indigo-700 active:scale-95 transition-all shadow-sm hover:shadow-md"
            >
              {activeOption === "knowledge" ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Save to Knowledge Base
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Import Context
                </>
              )}
            </button>
          </div>
        )}

        {step === "loading" && showSuccess && (
          <div className="px-6 py-4 border-t border-gray-200 shrink-0 bg-white">
            <button
              onClick={() => { onClose(); navigate("/tests"); }}
              className="w-full py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-indigo-700 active:scale-95 transition-all shadow-sm hover:shadow-md"
            >
              Go to Tests
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </>
  );
}
