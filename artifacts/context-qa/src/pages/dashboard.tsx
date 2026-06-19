import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useSearch } from "wouter";
import { X, Send, Calendar, Check, Link2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import CQARobot from "../components/CQARobot";
import CQARobotCelebrate from "../components/CQARobotCelebrate";
import { AddContextDrawer } from "../components/AddContextDrawer";
import { IndigoSidebar } from "../components/IndigoSidebar";
import { WorkspaceDropdown } from "../components/WorkspaceDropdown";
import imgFigma      from "@assets/figma-logo-icon-figma-app-editable-transparent-background-prem_1777647852938.png";
import imgWord       from "@assets/Microsoft_Office_Word_(2025–present).svg_(1)_1777647852941.png";
import imgExcel      from "@assets/Microsoft_Office_Excel_(2019–2025).svg_1777647852942.png";
import imgJira       from "@assets/vectorseek.com-Jira-Logo-Vector_1777647852944.png";
import imgSalesforce from "@assets/Salesforce.com_logo.svg_1777647852944.png";
import imgSwagger    from "@assets/swagger-logo_1777647852945.png";

function DuoIcon({ icon, className = "" }: { icon: string; className?: string }) {
  return <i className={`fa-duotone solid fa-${icon} ${className}`} />;
}

// ── Heatmap ──────────────────────────────────────────────────────────────────
const _TODAY = new Date(2026, 3, 29);

type HeatCell = { date: Date; count: number };

function _buildHeatmapCells(): HeatCell[] {
  const cells: HeatCell[] = [];
  for (let i = 363; i >= 0; i--) {
    const d = new Date(_TODAY);
    d.setDate(_TODAY.getDate() - i);
    const dow = d.getDay();
    const isWeekend = dow === 0 || dow === 6;
    const h = (d.getDate() * 17 + (d.getMonth() + 1) * 31 + i * 7) % 100;
    let count = 0;
    if (!isWeekend) {
      if (h > 25) count = 1 + (h % 4);
      if (h > 55) count = 5 + (h % 8);
      if (h > 80) count = 12 + (h % 10);
    } else {
      if (h > 75) count = 1 + (h % 3);
    }
    if (i >= 185 && i <= 200) count = 0;
    if (i < 35 && !isWeekend) count = Math.max(count, 3 + (h % 10));
    cells.push({ date: new Date(d), count });
  }
  return cells;
}

const HEATMAP_CELLS = _buildHeatmapCells();

function _computeStreak(): number {
  let s = 0;
  for (let i = HEATMAP_CELLS.length - 1; i >= 0; i--) {
    if (HEATMAP_CELLS[i].count > 0) s++;
    else break;
  }
  return s;
}

const CURRENT_STREAK = _computeStreak();
const LONGEST_STREAK = 23;

function cellColorClass(count: number): string {
  if (count <= 0) return "bg-gray-100";
  if (count <= 4) return "bg-indigo-100";
  if (count <= 8) return "bg-indigo-300";
  if (count <= 15) return "bg-indigo-500";
  return "bg-indigo-700";
}

function ActivityHeatmap() {
  const firstDow = HEATMAP_CELLS[0].date.getDay();
  const padded: (HeatCell | null)[] = [...Array(firstDow).fill(null), ...HEATMAP_CELLS];
  const weeks: (HeatCell | null)[][] = [];
  for (let i = 0; i < padded.length; i += 7) {
    weeks.push(padded.slice(i, Math.min(i + 7, padded.length)));
  }
  const lastWeek = weeks[weeks.length - 1];
  while (lastWeek.length < 7) lastWeek.push(null);

  const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const weekMonthLabels: (string | null)[] = weeks.map((week, wi) => {
    const firstCell = week.find(c => c !== null);
    if (!firstCell) return null;
    if (wi === 0) return MONTH_NAMES[firstCell.date.getMonth()];
    const prevCell = weeks[wi - 1].find(c => c !== null);
    if (!prevCell || prevCell.date.getMonth() !== firstCell.date.getMonth()) {
      return MONTH_NAMES[firstCell.date.getMonth()];
    }
    return null;
  });

  const CS = 11;
  const G = 2;

  return (
    <div className="overflow-x-auto">
      <div style={{ display: "inline-flex", flexDirection: "column" }}>
        <div style={{ display: "flex", marginLeft: 30, gap: G, marginBottom: 6 }}>
          {weeks.map((_, wi) => (
            <div key={wi} style={{ width: CS, flexShrink: 0, position: "relative", height: 12 }}>
              {weekMonthLabels[wi] && (
                <span className="text-gray-400 whitespace-nowrap absolute" style={{ fontSize: 9, top: 0, left: 0 }}>
                  {weekMonthLabels[wi]}
                </span>
              )}
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: G }}>
          <div style={{ width: 28, display: "flex", flexDirection: "column", gap: G }}>
            {[0,1,2,3,4,5,6].map(d => (
              <div key={d} style={{ height: CS, display: "flex", alignItems: "center" }}>
                <span className="text-gray-400" style={{ fontSize: 9 }}>
                  {d === 1 ? "Mon" : d === 3 ? "Wed" : d === 5 ? "Fri" : ""}
                </span>
              </div>
            ))}
          </div>
          {weeks.map((week, wi) => (
            <div key={wi} style={{ display: "flex", flexDirection: "column", gap: G }}>
              {week.map((cell, di) => (
                <div
                  key={di}
                  style={{ width: CS, height: CS, borderRadius: 2, flexShrink: 0 }}
                  className={cell ? cellColorClass(cell.count) : ""}
                  title={cell ? `${cell.date.toLocaleDateString()}: ${cell.count} tests run` : ""}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Static demo data ──────────────────────────────────────────────────────────
const FAILING_TESTS = [
  { id: 1, name: "Login flow — invalid password handling", env: "adminlms", ago: "2h ago" },
  { id: 2, name: "Checkout — promo code validation", env: "dev2.halightdev.com", ago: "4h ago" },
  { id: 3, name: "User profile — avatar upload", env: "orangehrmlive", ago: "6h ago" },
  { id: 4, name: "Password reset — email delivery", env: "test1.halightdev.com", ago: "Yesterday" },
];

const AI_GAPS = [
  { id: 1, module: "Checkout Flow", count: 5, desc: "Untested edge cases in payment validation" },
  { id: 2, module: "User Auth", count: 3, desc: "Multi-device session handling not covered" },
  { id: 3, module: "API Coverage", count: 3, desc: "New endpoints added without test cases" },
];

const COVERAGE_FEATURES = [
  { id: 1, name: "Authentication",     usage: 98, coverage: 82 },
  { id: 2, name: "Checkout & Payment", usage: 87, coverage: 54 },
  { id: 3, name: "User Profile",       usage: 74, coverage: 91 },
  { id: 4, name: "Search & Filters",   usage: 68, coverage: 43 },
  { id: 5, name: "Dashboard",          usage: 63, coverage: 95 },
  { id: 6, name: "Notifications",      usage: 51, coverage: 28 },
  { id: 7, name: "Settings",           usage: 44, coverage: 73 },
  { id: 8, name: "API Integrations",   usage: 38, coverage: 61 },
];


const ICON_SIZE = 44;
const CONTEXT_SOURCES = [
  { name: "Figma",      tests: 14, icon: imgFigma,      bubCls: "bg-pink-100 text-pink-800",    left:  16, top:  20 },
  { name: "Swagger",    tests: 22, icon: imgSwagger,    bubCls: "bg-emerald-100 text-emerald-800", left: 96, top:  30 },
  { name: "Word",       tests: 18, icon: imgWord,       bubCls: "bg-blue-100 text-blue-800",    left: 178, top:  13 },
  { name: "Salesforce", tests: 31, icon: imgSalesforce, bubCls: "bg-sky-100 text-sky-800",      left: 180, top:  98 },
  { name: "Jira",       tests: 16, icon: imgJira,       bubCls: "bg-amber-100 text-amber-800",  left:  26, top:  98 },
  { name: "Excel",      tests: 11, icon: imgExcel,      bubCls: "bg-violet-100 text-violet-800",left: 106, top: 108 },
];

// ── Flip counter ──────────────────────────────────────────────────────────────
function FlipCounter({ value, colorClass }: { value: number; colorClass: string }) {
  const [display, setDisplay] = useState(0);
  const rafRef  = useRef<number | null>(null);
  const fromRef = useRef(0);
  const startTsRef = useRef(0);
  const targetRef = useRef(0);

  useEffect(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    fromRef.current    = display;
    startTsRef.current = performance.now();
    targetRef.current  = value;
    const diff     = value - fromRef.current;
    const duration = Math.min(120 + diff * 8, 700);
    function easeOutCubic(t: number) { return 1 - Math.pow(1 - t, 3); }
    function tick(now: number) {
      const elapsed  = now - startTsRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const val      = Math.round(fromRef.current + (targetRef.current - fromRef.current) * easeOutCubic(progress));
      setDisplay(val);
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
      else setDisplay(targetRef.current);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="relative overflow-hidden w-full flex items-center justify-center" style={{ height: "3rem" }}>
      <span className={`text-4xl font-black tabular-nums ${colorClass}`}>{display}</span>
    </div>
  );
}

// ── Onboarding modal ──────────────────────────────────────────────────────────
const MODAL_TAGLINE   = "Add any context. Get tests instantly";
const MODAL_CHAR_DELAY = 35;
const END_TEXT        = "Let's start by showing you how we build context with your website.";
const END_CHAR_DELAY  = 28;

function OnboardingModal({ flow, onClose, onOpenDrawer }: { flow: "existing" | "new"; onClose: () => void; onOpenDrawer: () => void }) {
  const isExisting = flow === "existing";
  const [, navigate] = useLocation();

  type AnimPhase = "idle" | "populating" | "vibrating" | "popping" | "numbers" | "counting" | "done";
  const [animPhase, setAnimPhase]       = useState<AnimPhase>("idle");
  const [visibleCount, setVisibleCount] = useState(0);
  const [countedCount, setCountedCount] = useState(0);
  const [counterValue, setCounterValue] = useState(0);
  const [typedText, setTypedText]         = useState("");
  const [robotReady, setRobotReady]       = useState(false);
  const [expandState, setExpandState]     = useState<"collapsed" | "tagline" | "full">("collapsed");
  const [endTypedText, setEndTypedText]   = useState("");
  const [endBtnVisible, setEndBtnVisible] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  /* 1s pause → expand tagline row → start typing */
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;
    const startId = setTimeout(() => {
      if (!mountedRef.current) return;
      setExpandState("tagline");
      let i = 0;
      intervalId = setInterval(() => {
        if (!mountedRef.current) { clearInterval(intervalId); return; }
        i++;
        setTypedText(MODAL_TAGLINE.slice(0, i));
        if (i === MODAL_TAGLINE.length) {
          clearInterval(intervalId);
          setRobotReady(true);
        }
      }, MODAL_CHAR_DELAY);
    }, 1000);
    return () => { clearTimeout(startId); clearInterval(intervalId); };
  }, []);

  /* 1s after typing → expand full body → start source animation */
  useEffect(() => {
    if (!robotReady) return;
    const ids: ReturnType<typeof setTimeout>[] = [];
    const at = (ms: number, fn: () => void) =>
      ids.push(setTimeout(() => { if (mountedRef.current) fn(); }, ms));
    const N = CONTEXT_SOURCES.length;
    const STAGGER = 650;
    at(1000, () => setExpandState("full"));
    at(1500, () => setAnimPhase("populating"));
    for (let i = 0; i < N; i++) {
      const ii = i;
      at(1500 + ii * STAGGER, () => setVisibleCount(ii + 1));
    }
    const afterPop = 1500 + (N - 1) * STAGGER + 400;
    at(afterPop, () => setAnimPhase("vibrating"));
    const popAt = afterPop + 650;
    at(popAt, () => setAnimPhase("popping"));
    const numsAt = popAt + 320;
    at(numsAt, () => setAnimPhase("numbers"));
    const countAt = numsAt + 500;
    at(countAt, () => setAnimPhase("counting"));
    for (let i = 0; i < N; i++) {
      const ii = i;
      at(countAt + ii * 420, () => {
        setCountedCount(ii + 1);
        setCounterValue(v => v + CONTEXT_SOURCES[ii].tests);
      });
    }
    at(countAt + N * 420 + 300, () => setAnimPhase("done"));
    return () => ids.forEach(clearTimeout);
  }, [robotReady]);

  /* End typewriter — fires once the counter animation completes */
  useEffect(() => {
    if (animPhase !== "done") return;
    let intervalId: ReturnType<typeof setInterval>;
    const startId = setTimeout(() => {
      if (!mountedRef.current) return;
      let i = 0;
      intervalId = setInterval(() => {
        if (!mountedRef.current) { clearInterval(intervalId); return; }
        i++;
        setEndTypedText(END_TEXT.slice(0, i));
        if (i === END_TEXT.length) {
          clearInterval(intervalId);
          setTimeout(() => { if (mountedRef.current) setEndBtnVisible(true); }, 500);
        }
      }, END_CHAR_DELAY);
    }, 700);
    return () => { clearTimeout(startId); clearInterval(intervalId); };
  }, [animPhase]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <style>{`
          @keyframes cqa-pill-in   { 0%{opacity:0;transform:scale(.3);} 65%{transform:scale(1.18);} 100%{opacity:1;transform:scale(1);} }
          @keyframes cqa-vibrate   { 0%,100%{transform:translate(0,0);} 15%{transform:translate(-3px,-1px) rotate(-1deg);} 30%{transform:translate(3px,1px) rotate(1deg);} 45%{transform:translate(-2px,2px) rotate(-.5deg);} 60%{transform:translate(2px,-2px) rotate(.5deg);} 75%{transform:translate(-3px,1px) rotate(-1deg);} 90%{transform:translate(3px,-1px) rotate(.5deg);} }
          @keyframes cqa-pop-out   { 0%{opacity:1;transform:scale(1);} 35%{transform:scale(1.35);} 100%{opacity:0;transform:scale(0) rotate(15deg);} }
          @keyframes cqa-num-in    { 0%{opacity:0;transform:scale(0.3);} 70%{transform:scale(1.15);} 100%{opacity:1;transform:scale(1);} }
          @keyframes cqa-num-out   { 0%{opacity:1;transform:translateY(0) scale(1);} 100%{opacity:0;transform:translateY(-28px) scale(0.6);} }
          @keyframes cqa-done-in   { 0%{opacity:0;transform:scale(.82);} 70%{transform:scale(1.03);} 100%{opacity:1;transform:scale(1);} }
        `}</style>
        <div className={`px-8 py-5 ${isExisting ? "bg-indigo-600" : "bg-violet-600"}`}>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 flex-shrink-0">
              <CQARobotCelebrate className="w-full h-full" animate={robotReady} />
            </div>
            <div>
              <p className="text-white/70 text-xs font-medium uppercase tracking-wide">
                {isExisting ? "Welcome to the team" : "You're all set up"}
              </p>
              <h2 className="text-white text-xl font-bold leading-tight mt-0.5">
                {isExisting ? "Start adding context, get tests" : "Turn your docs into tests"}
              </h2>
            </div>
          </div>
        </div>
        {/* Stage 1: tagline row — slides in when typing starts */}
        <div style={{ display:"grid", gridTemplateRows: expandState !== "collapsed" ? "1fr" : "0fr", transition:"grid-template-rows 0.45s cubic-bezier(0.4,0,0.2,1)" }}>
          <div style={{ overflow:"hidden" }}>
            <div className="px-7 pt-5 pb-6">
              <p className="text-gray-900 font-semibold text-sm min-h-[1.25rem]">
                {typedText}
                {!robotReady && expandState !== "collapsed" && (
                  <span className="inline-block w-px h-3.5 bg-gray-700 ml-0.5 align-middle animate-pulse" />
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Stage 2: animation area + CTA — slides in after 1s pause post-typing */}
        <div style={{ display:"grid", gridTemplateRows: expandState === "full" ? "1fr" : "0fr", transition:"grid-template-rows 0.5s cubic-bezier(0.4,0,0.2,1)" }}>
          <div style={{ overflow:"hidden" }}>
        <div className="px-7 pt-3 pb-4">
          {animPhase === "done" ? (
            <div className="flex flex-col gap-4">
              <div
                className={`w-full rounded-2xl flex flex-col items-center justify-center gap-2 py-7 ${isExisting ? "bg-indigo-50" : "bg-violet-50"}`}
                style={{ animation: "cqa-done-in 0.5s cubic-bezier(.2,.8,.4,1) forwards", minHeight: 120 }}
              >
                <span className={`text-6xl font-black tabular-nums leading-none ${isExisting ? "text-indigo-700" : "text-violet-700"}`}>
                  {counterValue}
                </span>
                <span className="text-sm text-gray-500 font-medium tracking-wide">tests generated</span>
              </div>
              {endTypedText && (
                <p className="text-gray-900 font-semibold text-sm leading-snug">
                  {endTypedText}
                  {!endBtnVisible && (
                    <span className="inline-block w-px h-3.5 bg-gray-700 ml-0.5 align-middle animate-pulse" />
                  )}
                </p>
              )}
              {endBtnVisible && (
                <button
                  onClick={() => { onClose(); navigate("/execution/onboarding"); }}
                  className={`w-full py-3 rounded-xl font-semibold text-sm text-white shadow-sm hover:shadow-md active:scale-95 transition-all ${
                    isExisting ? "bg-indigo-600 hover:bg-indigo-700" : "bg-violet-600 hover:bg-violet-700"
                  }`}
                  style={{ animation: "cqa-done-in 0.4s cubic-bezier(.2,.8,.4,1) forwards" }}
                >
                  Get Started
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="flex-1 relative overflow-hidden" style={{ height: 165 }}>
                {animPhase === "idle" && (
                  <p className="absolute inset-0 flex items-center justify-center text-xs text-gray-400 italic">
                    Connecting your sources…
                  </p>
                )}
                {CONTEXT_SOURCES.map((src, i) => {
                  const shown    = i < visibleCount;
                  const counted  = i < countedCount;
                  const showNums = animPhase === "numbers" || animPhase === "counting";
                  if (!shown) return null;
                  const isPopping   = animPhase === "popping";
                  const isVibrating = animPhase === "vibrating";
                  const justEntered = i === visibleCount - 1 && animPhase === "populating";
                  if (showNums) {
                    if (counted) return null;
                    return (
                      <div key={`num-${i}`}
                        className={`absolute flex flex-col items-center justify-center rounded-full font-black ${src.bubCls}`}
                        style={{ width: ICON_SIZE, height: ICON_SIZE, left: src.left, top: src.top,
                          animation: animPhase === "counting"
                            ? `cqa-num-out 0.32s ${i * 420}ms ease-in both`
                            : "cqa-num-in 0.28s cubic-bezier(.2,.8,.4,1) forwards" }}
                      >
                        <span className="text-[11px] leading-none">+{src.tests}</span>
                        <span className="text-[7px] opacity-70 leading-none mt-0.5">tests</span>
                      </div>
                    );
                  }
                  return (
                    <div key={`bub-${i}`}
                      className="absolute flex items-center justify-center"
                      style={{ width: ICON_SIZE, height: ICON_SIZE, left: src.left, top: src.top,
                        animation: isPopping
                          ? "cqa-pop-out 0.30s ease-in forwards"
                          : isVibrating
                            ? "cqa-vibrate 0.09s linear infinite"
                            : justEntered
                              ? "cqa-pill-in 0.32s cubic-bezier(.2,.8,.4,1) forwards"
                              : "none" }}
                    >
                      <img src={src.icon} alt={src.name} className="w-full h-full object-contain select-none" draggable={false} />
                    </div>
                  );
                })}
              </div>
              <svg className="w-4 h-4 text-gray-200 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              <div className={`flex-shrink-0 w-24 rounded-2xl flex flex-col items-center justify-center py-4 gap-1 ${isExisting ? "bg-indigo-50" : "bg-violet-50"}`}>
                <FlipCounter value={counterValue} colorClass={isExisting ? "text-indigo-700" : "text-violet-700"} />
                <span className="text-[11px] text-gray-500 text-center leading-tight">tests<br />generated</span>
              </div>
            </div>
          )}
        </div>
          </div>{/* overflow hidden stage 2 */}
        </div>{/* grid expander stage 2 */}
      </div>
    </div>
  );
}

// ── Share report modal ────────────────────────────────────────────────────────
const REPORT_STATS = [
  { icon: "🔥", label: "Testing streak",       value: `${CURRENT_STREAK} days`,          sub: `Longest: ${LONGEST_STREAK} days`,   color: "text-orange-500" },
  { icon: "✅", label: "Pass rate",            value: "91%",                              sub: "↑ 3% vs last week",                 color: "text-emerald-600" },
  { icon: "📋", label: "Tests run this week",  value: "247",                              sub: "↑ 31 vs previous week",             color: "text-indigo-600" },
  { icon: "🎯", label: "Feature coverage",     value: "3 / 8 on target",                 sub: "At 80% threshold",                  color: "text-violet-600" },
  { icon: "⚠️", label: "Failing — needs triage", value: `${FAILING_TESTS.length} tests`, sub: "Oldest: 6 h ago",                  color: "text-red-500" },
  { icon: "🤖", label: "AI-found gaps",        value: `${AI_GAPS.reduce((s,g) => s + g.count, 0)} potential gaps`, sub: "Across 3 modules", color: "text-sky-600" },
];

function ShareReportModal({ onClose }: { onClose: () => void }) {
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [frequency, setFrequency] = useState<"weekly" | "biweekly" | "monthly" | "milestone">("weekly");
  const [sendDay, setSendDay] = useState("Mon");
  const [milestoneFeature, setMilestoneFeature] = useState(COVERAGE_FEATURES[0].name);
  const [milestoneCoverage, setMilestoneCoverage] = useState(80);
  const [recipients, setRecipients] = useState("");
  const [slackEnabled, setSlackEnabled] = useState(false);
  const [sendState, setSendState] = useState<"idle" | "sending" | "sent">("idle");
  const [schedSaved, setSchedSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleSendNow = () => {
    setSendState("sending");
    setTimeout(() => setSendState("sent"), 1200);
  };
  const handleSaveSchedule = () => {
    setSchedSaved(true);
    setTimeout(() => { setSchedSaved(false); }, 2500);
  };
  const handleCopyLink = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const reportDate = "Apr 29, 2026";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ background: "rgba(15,23,42,0.45)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Full-width indigo header ──────────────────────────────────────── */}
        <div className="bg-indigo-600 px-6 py-5 flex items-start justify-between shrink-0">
          <div>
            <h2 className="text-xl font-black text-white leading-tight">Share Leadership Report</h2>
            <p className="text-indigo-300 text-sm mt-1 leading-snug">
              Send a clean QA summary to stakeholders or schedule recurring delivery
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-indigo-300 hover:text-white hover:bg-indigo-700 transition-colors shrink-0 mt-0.5"
          >
            <X size={15} />
          </button>
        </div>

        {/* ── Two-panel body ────────────────────────────────────────────────── */}
        <div className="flex flex-1 overflow-hidden">

        {/* ── Left: report preview ─────────────────────────────────────────── */}
        <div className="w-64 shrink-0 bg-gray-50 border-r border-gray-100 flex flex-col">
          {/* badge */}
          <div className="px-5 pt-4 pb-2">
            <span className="inline-flex items-center gap-1 text-[9px] font-bold text-indigo-500 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full uppercase tracking-widest">
              <DuoIcon icon="sparkles" className="text-[8px]" /> Generated by ContextQA
            </span>
          </div>
          {/* stat rows */}
          <div className="px-5 pb-4 flex flex-col gap-2.5 flex-1">
            {REPORT_STATS.map((s, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <span className="text-[13px] mt-px shrink-0">{s.icon}</span>
                <div className="min-w-0">
                  <p className={`text-xs font-black ${s.color} leading-none`}>{s.value}</p>
                  <p className="text-[10px] text-gray-400 leading-tight mt-0.5">{s.label}</p>
                  <p className="text-[9px] text-gray-300 leading-tight">{s.sub}</p>
                </div>
              </div>
            ))}
          </div>
          {/* footer */}
          <div className="px-5 py-3 border-t border-gray-100">
            <p className="text-[10px] text-indigo-500 font-semibold">View full dashboard →</p>
          </div>
        </div>

        {/* ── Right: settings panel ─────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="px-6 py-5 flex flex-col gap-5 flex-1 overflow-y-auto">

            {/* Recipients */}
            <div>
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wide block mb-2">
                <DuoIcon icon="envelope" className="text-indigo-400 mr-1 text-[11px]" />
                Email Recipients
              </label>
              <input
                type="text"
                placeholder="cto@halight.com, vp-eng@halight.com…"
                value={recipients}
                onChange={e => setRecipients(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent placeholder-gray-300"
              />
              <p className="text-[11px] text-gray-400 mt-1">Separate multiple addresses with a comma</p>
            </div>

            {/* Slack toggle */}
            <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#4A154B] flex items-center justify-center text-white text-xs font-black leading-none">S</div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Post to Slack</p>
                  <p className="text-[11px] text-gray-400">#qa-leadership channel</p>
                </div>
              </div>
              <Switch
                checked={slackEnabled}
                onCheckedChange={setSlackEnabled}
                className="data-[state=checked]:bg-indigo-600"
              />
            </div>

            {/* Copy link */}
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-2.5 border border-dashed border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-500 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50/50 transition-colors w-full"
            >
              {copied ? <Check size={14} className="text-emerald-500 shrink-0" /> : <Link2 size={14} className="shrink-0" />}
              <span className="font-medium">{copied ? "Link copied!" : "Copy shareable report link"}</span>
            </button>

            {/* Schedule recurring delivery */}
            <div className="border border-gray-100 rounded-xl overflow-hidden">
              <button
                onClick={() => setScheduleEnabled(v => !v)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Calendar size={14} className={scheduleEnabled ? "text-indigo-500" : "text-gray-400"} />
                  <span className={`text-sm font-semibold ${scheduleEnabled ? "text-indigo-700" : "text-gray-700"}`}>Schedule recurring delivery</span>
                  {scheduleEnabled && <span className="text-[10px] font-bold bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-full uppercase tracking-wide">On</span>}
                </div>
                <span className={`text-xs font-semibold transition-colors ${scheduleEnabled ? "text-indigo-500" : "text-gray-400"}`}>
                  {scheduleEnabled ? "Enabled ▲" : "Set up ▼"}
                </span>
              </button>

              {scheduleEnabled && (
                <div className="px-4 pb-4 pt-1 border-t border-gray-100 flex flex-col gap-3">
                  {/* Frequency — time-based only */}
                  <div>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">Frequency</p>
                    <div className="flex gap-2">
                      {([
                        { key: "weekly",   label: "Weekly" },
                        { key: "biweekly", label: "Bi-weekly" },
                        { key: "monthly",  label: "Monthly" },
                      ] as const).map(({ key, label }) => (
                        <button
                          key={key}
                          onClick={() => setFrequency(key)}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                            frequency === key
                              ? "bg-indigo-600 text-white border-indigo-600"
                              : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:text-indigo-600"
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Day picker — weekly / bi-weekly only */}
                  {(frequency === "weekly" || frequency === "biweekly") && (
                    <div>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">Send on</p>
                      <div className="flex gap-1.5">
                        {["Mon","Tue","Wed","Thu","Fri"].map(d => (
                          <button
                            key={d}
                            onClick={() => setSendDay(d)}
                            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                              sendDay === d
                                ? "bg-indigo-600 text-white border-indigo-600"
                                : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:text-indigo-600"
                            }`}
                          >
                            {d}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Save schedule */}
                  <button
                    onClick={handleSaveSchedule}
                    className="w-full flex items-center justify-center gap-2 py-2 bg-gray-50 border border-gray-200 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600 rounded-xl text-sm font-semibold text-gray-600 transition-colors"
                  >
                    {schedSaved ? <><Check size={13} className="text-emerald-500" /> Schedule saved!</> : <><Calendar size={13} /> Save schedule</>}
                  </button>
                </div>
              )}
            </div>

            {/* On milestone */}
            <div className="border border-gray-100 rounded-xl overflow-hidden">
              <button
                onClick={() => setFrequency(v => v === "milestone" ? "weekly" : "milestone")}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <i className={`fa-duotone solid fa-flag-checkered text-sm ${frequency === "milestone" ? "text-indigo-500" : "text-gray-400"}`} />
                  <span className={`text-sm font-semibold ${frequency === "milestone" ? "text-indigo-700" : "text-gray-700"}`}>Send on milestone</span>
                  {frequency === "milestone" && <span className="text-[10px] font-bold bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-full uppercase tracking-wide">On</span>}
                </div>
                <span className={`text-xs font-semibold transition-colors ${frequency === "milestone" ? "text-indigo-500" : "text-gray-400"}`}>
                  {frequency === "milestone" ? "Enabled ▲" : "Set up ▼"}
                </span>
              </button>

              {frequency === "milestone" && (
                <div className="px-4 pb-4 pt-3 border-t border-gray-100 flex flex-col gap-4">
                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    Send the report automatically once a feature reaches a coverage threshold — no recurring schedule needed.
                  </p>

                  {/* Feature select */}
                  <div>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">Feature to watch</p>
                    <select
                      value={milestoneFeature}
                      onChange={e => setMilestoneFeature(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent text-gray-800"
                    >
                      {COVERAGE_FEATURES.map(f => (
                        <option key={f.id} value={f.name}>
                          {f.name} — currently {f.coverage}%
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Coverage % slider */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Trigger when coverage reaches</p>
                      <span className="text-sm font-black text-indigo-600 tabular-nums">{milestoneCoverage}%</span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={100}
                      step={5}
                      value={milestoneCoverage}
                      onChange={e => setMilestoneCoverage(Number(e.target.value))}
                      className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                      style={{ background: `linear-gradient(to right, #6366f1 ${milestoneCoverage}%, #e5e7eb ${milestoneCoverage}%)` }}
                    />
                    <p className="text-[11px] text-indigo-600 font-semibold mt-2 bg-indigo-50 rounded-lg px-3 py-1.5">
                      Report fires once <span className="font-black">{milestoneFeature}</span> hits <span className="font-black">{milestoneCoverage}%</span>
                    </p>
                  </div>

                  {/* Save */}
                  <button
                    onClick={handleSaveSchedule}
                    className="w-full flex items-center justify-center gap-2 py-2 bg-gray-50 border border-gray-200 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600 rounded-xl text-sm font-semibold text-gray-600 transition-colors"
                  >
                    {schedSaved ? <><Check size={13} className="text-emerald-500" /> Milestone saved!</> : <><i className="fa-duotone solid fa-flag-checkered text-xs" /> Save milestone</>}
                  </button>
                </div>
              )}
            </div>

          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <button
              onClick={onClose}
              className="text-sm font-semibold text-gray-400 hover:text-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSendNow}
              disabled={sendState !== "idle"}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm ${
                sendState === "sent"
                  ? "bg-emerald-500 text-white cursor-default"
                  : "bg-indigo-600 hover:bg-indigo-700 text-white active:scale-95"
              }`}
            >
              {sendState === "idle"   && <><Send size={13} /> Send Now</>}
              {sendState === "sending" && <><span className="w-3 h-3 rounded-full border-2 border-white/40 border-t-white animate-spin" /> Sending…</>}
              {sendState === "sent"   && <><Check size={13} /> Report sent!</>}
            </button>
          </div>
        </div>
        </div>{/* two-panel body */}
      </div>
    </div>
  );
}

// ── Dashboard page ────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [onboardingModal, setOnboardingModal] = useState<"existing" | "new" | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [hasContext, setHasContext] = useState(false);
  const [coverageTarget, setCoverageTarget] = useState(80);
  const [shareOpen, setShareOpen] = useState(false);
  const [, navigate] = useLocation();
  const search = useSearch();

  useEffect(() => {
    const params = new URLSearchParams(search);
    const flow = params.get("onboarding");
    if (flow === "existing" || flow === "new") {
      setOnboardingModal(flow);
    }
  }, [search]);

  const openDrawer = useCallback(() => {
    setOnboardingModal(null);
    setDrawerOpen(true);
  }, []);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {onboardingModal && (
        <OnboardingModal
          flow={onboardingModal}
          onClose={() => setOnboardingModal(null)}
          onOpenDrawer={openDrawer}
        />
      )}
      {shareOpen && <ShareReportModal onClose={() => setShareOpen(false)} />}
      <AddContextDrawer open={drawerOpen} onClose={() => { setDrawerOpen(false); setHasContext(true); }} />
      <IndigoSidebar
        onNew={openDrawer}
        onNavigate={navigate}
        onBilling={() => navigate("/settings?section=billing")}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold text-gray-900">
              <span className="text-gray-900">Context</span>
              <span className="text-indigo-600">QA</span>
            </span>
            <button
              onClick={() => navigate("/settings?section=billing")}
              className="text-xs bg-amber-100 text-amber-700 font-medium px-2 py-0.5 rounded-full hover:bg-amber-200 transition-colors"
            >
              1,222 Credits Left
            </button>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShareOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-600 text-sm font-semibold hover:bg-indigo-100 hover:border-indigo-300 transition-colors"
            >
              <Send size={13} />
              Share Report
            </button>
            <WorkspaceDropdown />
            <button className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </div>
        </header>

        {/* ── Empty state ───────────────────────────────────────────────────── */}
        {!hasContext && (
          <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
            <div className="mb-8 relative">
              <svg width="220" height="180" viewBox="0 0 220 180" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="110" cy="95" r="75" fill="#EEF2FF" />
                <rect x="70" y="40" width="80" height="100" rx="8" fill="white" stroke="#C7D2FE" strokeWidth="1.5"/>
                <rect x="82" y="58" width="56" height="5" rx="2.5" fill="#C7D2FE"/>
                <rect x="82" y="70" width="40" height="5" rx="2.5" fill="#E0E7FF"/>
                <rect x="82" y="82" width="50" height="5" rx="2.5" fill="#E0E7FF"/>
                <rect x="82" y="94" width="35" height="5" rx="2.5" fill="#E0E7FF"/>
                <circle cx="150" cy="50" r="18" fill="#6366F1"/>
                <path d="M150 43v14M143 50h14" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                <rect x="30" y="65" width="36" height="28" rx="5" fill="white" stroke="#C7D2FE" strokeWidth="1.2"/>
                <rect x="37" y="73" width="22" height="3" rx="1.5" fill="#C7D2FE"/>
                <rect x="37" y="80" width="14" height="3" rx="1.5" fill="#E0E7FF"/>
                <rect x="154" y="105" width="36" height="28" rx="5" fill="white" stroke="#C7D2FE" strokeWidth="1.2"/>
                <rect x="161" y="113" width="22" height="3" rx="1.5" fill="#C7D2FE"/>
                <rect x="161" y="120" width="14" height="3" rx="1.5" fill="#E0E7FF"/>
                <circle cx="66" cy="79" r="3" fill="#A5B4FC"/>
                <circle cx="154" cy="103" r="3" fill="#A5B4FC"/>
              </svg>
            </div>
            <h2 className="cqa-h1 mb-2">No context added yet</h2>
            <p className="text-gray-500 text-sm max-w-sm mb-8 leading-relaxed">
              Connect your documentation, PRDs, Swagger specs, or URLs to let ContextQA automatically generate and run test cases.
            </p>
            <div className="flex items-center gap-4">
              <button
                onClick={openDrawer}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 active:scale-95 transition-all shadow-md shadow-indigo-200"
              >
                <DuoIcon icon="plus" className="text-xs" />
                Add Context
              </button>
              <button
                onClick={() => navigate("/tests")}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-700 text-sm font-semibold hover:bg-gray-50 active:scale-95 transition-all"
              >
                <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                Build Tests
              </button>
            </div>
            <p className="mt-6 text-xs text-gray-400">You can also click the <span className="font-semibold text-indigo-500">+</span> icon in the sidebar at any time</p>
            <button
              onClick={() => setHasContext(true)}
              className="mt-4 text-xs text-gray-300 hover:text-indigo-400 transition-colors flex items-center gap-1"
            >
              <i className="fa-duotone solid fa-chart-mixed text-[10px]" />
              Preview dashboard
            </button>
          </div>
        )}

        {/* ── Habit Dashboard ───────────────────────────────────────────────── */}
        {hasContext && (
          <div className="flex-1 overflow-auto bg-gray-50">
            <div className="p-5 space-y-4 max-w-6xl">

              {/* Row 1: Streak + Today stats */}
              <div className="grid grid-cols-4 gap-4">

                {/* Streak */}
                <div className="relative bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-2xl p-5 text-white overflow-hidden">
                  <div className="absolute -right-5 -top-5 w-28 h-28 rounded-full bg-white/5" />
                  <div className="absolute -right-2 -bottom-6 w-20 h-20 rounded-full bg-white/5" />
                  <div className="text-3xl leading-none mb-2">🔥</div>
                  <div className="text-5xl font-black leading-none tabular-nums">{CURRENT_STREAK}</div>
                  <div className="text-indigo-200 text-sm font-medium mt-1.5">day streak</div>
                  <div className="mt-3 pt-3 border-t border-indigo-500/50 flex items-center gap-1.5 text-xs text-indigo-300">
                    <i className="fa-duotone solid fa-trophy text-[10px]" />
                    Longest: {LONGEST_STREAK} days
                  </div>
                </div>

                {/* Tests run today */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Tests Run Today</p>
                  <p className="text-4xl font-black text-gray-900 mt-2 tabular-nums">47</p>
                  <div className="mt-2 flex items-center gap-1.5">
                    <span className="text-xs text-emerald-500 font-semibold">↑ 12</span>
                    <span className="text-xs text-gray-400">from yesterday</span>
                  </div>
                  <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-400 rounded-full" style={{ width: "74%" }} />
                  </div>
                </div>

                {/* Pass rate */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Pass Rate</p>
                  <p className="text-4xl font-black text-emerald-600 mt-2 tabular-nums">91%</p>
                  <div className="mt-2 flex items-center gap-1.5">
                    <span className="text-xs text-emerald-500 font-semibold">↑ 3%</span>
                    <span className="text-xs text-gray-400">vs last week</span>
                  </div>
                  <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-400 rounded-full" style={{ width: "91%" }} />
                  </div>
                </div>

                {/* Needs triage */}
                <div className="bg-white rounded-2xl border border-red-100 p-5 cursor-pointer hover:border-red-200 transition-colors">
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Needs Triage</p>
                  <div className="flex items-end gap-2 mt-2">
                    <p className="text-4xl font-black text-red-500 tabular-nums">{FAILING_TESTS.length}</p>
                    <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse mb-2" />
                  </div>
                  <p className="text-xs text-red-400 font-semibold mt-2">failing tests · act now</p>
                </div>
              </div>

              {/* Row 2: Activity heatmap */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">Testing Activity</h3>
                    <p className="text-xs text-gray-400 mt-0.5">352 tests run in the last year · keep the squares green</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <span>Less</span>
                    {(["bg-gray-100","bg-indigo-100","bg-indigo-300","bg-indigo-500","bg-indigo-700"] as const).map((c,i) => (
                      <div key={i} className={`w-3 h-3 rounded-sm ${c}`} />
                    ))}
                    <span>More</span>
                  </div>
                </div>
                <ActivityHeatmap />
              </div>

              {/* Row 2b: Feature Coverage */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <style>{`
                  .cqa-slider { -webkit-appearance: none; appearance: none; height: 4px; border-radius: 9999px; outline: none; cursor: pointer; }
                  .cqa-slider::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 16px; height: 16px; border-radius: 9999px; background: #4f46e5; border: 2px solid white; box-shadow: 0 1px 3px rgba(0,0,0,.25); cursor: pointer; }
                  .cqa-slider::-moz-range-thumb { width: 16px; height: 16px; border-radius: 9999px; background: #4f46e5; border: 2px solid white; box-shadow: 0 1px 3px rgba(0,0,0,.25); cursor: pointer; border: none; }
                `}</style>

                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">Feature Coverage</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Ranked by usage frequency · drag to set your target</p>
                  </div>
                  <div className="flex items-center gap-3 min-w-[220px]">
                    <span className="text-xs text-gray-400 whitespace-nowrap">Target</span>
                    <input
                      type="range" min={0} max={100} value={coverageTarget}
                      onChange={e => setCoverageTarget(Number(e.target.value))}
                      className="cqa-slider flex-1"
                      style={{ background: `linear-gradient(to right, #6366f1 ${coverageTarget}%, #e5e7eb ${coverageTarget}%)` }}
                    />
                    <span className="text-sm font-bold text-indigo-600 w-9 text-right tabular-nums">{coverageTarget}%</span>
                  </div>
                </div>

                {/* Feature rows */}
                <div className="space-y-2.5">
                  {COVERAGE_FEATURES.map((f, idx) => {
                    const meetsTarget = f.coverage >= coverageTarget;
                    const barColor = f.coverage >= coverageTarget
                      ? "bg-emerald-400"
                      : f.coverage >= coverageTarget - 20
                      ? "bg-amber-400"
                      : "bg-red-400";
                    return (
                      <div key={f.id} className="flex items-center gap-3">
                        {/* Usage rank dot */}
                        <div className="w-5 text-right">
                          <span className="text-[10px] text-gray-300 font-bold tabular-nums">#{idx + 1}</span>
                        </div>
                        {/* Feature name */}
                        <span className="text-xs font-medium text-gray-700 w-36 shrink-0 truncate">{f.name}</span>
                        {/* Bar + target line */}
                        <div className="flex-1 relative h-2 bg-gray-100 rounded-full overflow-visible">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${barColor}`}
                            style={{ width: `${f.coverage}%` }}
                          />
                          {/* Target marker */}
                          <div
                            className="absolute top-1/2 -translate-y-1/2 w-px h-4 bg-indigo-400 rounded-full transition-all duration-150"
                            style={{ left: `${coverageTarget}%` }}
                          />
                        </div>
                        {/* % */}
                        <span className={`text-xs font-bold tabular-nums w-8 text-right ${
                          meetsTarget ? "text-emerald-500" : "text-red-400"
                        }`}>
                          {f.coverage}%
                        </span>
                        {/* Badge */}
                        <div className="w-14 flex justify-end">
                          {meetsTarget
                            ? <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">On track</span>
                            : <span className="text-[10px] font-semibold text-red-500 bg-red-50 px-1.5 py-0.5 rounded-full">Gap</span>
                          }
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Summary footer */}
                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs text-gray-400">
                    <span className="font-semibold text-gray-700">{COVERAGE_FEATURES.filter(f => f.coverage >= coverageTarget).length}</span> of {COVERAGE_FEATURES.length} features meet target
                  </span>
                  <div className="flex items-center gap-3 text-[10px] text-gray-400">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" /> On track</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> Close</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" /> Gap</span>
                  </div>
                </div>
              </div>

              {/* Row 3: Triage + AI Gaps */}
              <div className="grid grid-cols-5 gap-4">

                {/* Failing tests triage */}
                <div className="col-span-3 bg-white rounded-2xl border border-gray-100 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      <h3 className="font-bold text-gray-900 text-sm">Needs Attention</h3>
                      <span className="text-xs bg-red-50 text-red-600 font-bold px-2 py-0.5 rounded-full">{FAILING_TESTS.length}</span>
                    </div>
                    <button className="text-xs text-indigo-500 hover:text-indigo-700 font-semibold transition-colors">
                      View all →
                    </button>
                  </div>
                  <div className="space-y-2">
                    {FAILING_TESTS.map(t => (
                      <div key={t.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-red-50/60 transition-colors cursor-pointer group">
                        <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
                          <i className="fa-duotone solid fa-triangle-exclamation text-red-500 text-xs" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{t.name}</p>
                          <p className="text-xs text-gray-400">{t.env} · {t.ago}</p>
                        </div>
                        <span className="text-xs text-gray-300 group-hover:text-red-400 transition-colors shrink-0">Investigate →</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI-found gaps */}
                <div className="col-span-2 bg-white rounded-2xl border border-gray-100 p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <i className="fa-duotone solid fa-sparkles text-indigo-500 text-sm" />
                    <h3 className="font-bold text-gray-900 text-sm">AI-Found Gaps</h3>
                    <span className="text-xs bg-indigo-50 text-indigo-600 font-bold px-2 py-0.5 rounded-full">{AI_GAPS.length}</span>
                  </div>
                  <div className="space-y-3">
                    {AI_GAPS.map(g => (
                      <div key={g.id} className="p-3 rounded-xl border border-dashed border-indigo-200 bg-indigo-50/40 hover:bg-indigo-50 transition-colors cursor-pointer">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs font-bold text-indigo-700">{g.module}</p>
                          <span className="text-xs text-indigo-400 font-semibold">{g.count} gaps</span>
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed">{g.desc}</p>
                        <button className="text-xs text-indigo-600 font-semibold mt-2 hover:underline">Build tests →</button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Row 4: Quick actions */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h3 className="font-bold text-gray-900 text-sm mb-3">Quick Actions</h3>
                <div className="flex flex-wrap gap-2.5">
                  <button
                    onClick={() => navigate("/tests")}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 active:scale-95 transition-all"
                  >
                    <i className="fa-duotone solid fa-play text-xs" />
                    Run All Tests
                  </button>
                  <button
                    onClick={() => navigate("/tests")}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 active:scale-95 transition-all"
                  >
                    <i className="fa-duotone solid fa-plus text-xs" />
                    Add Test Case
                  </button>
                  <button
                    onClick={() => navigate("/tests")}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 active:scale-95 transition-all"
                  >
                    <i className="fa-duotone solid fa-shuffle text-xs" />
                    Review Flaky Tests
                  </button>
                  <button
                    onClick={openDrawer}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 active:scale-95 transition-all"
                  >
                    <i className="fa-duotone solid fa-brain text-xs" />
                    Add Context
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
