import React, { useState, useEffect, useRef } from "react";
import { useLocation, useParams } from "wouter";
import { AddContextDrawer } from "../components/AddContextDrawer";
import { IndigoSidebar } from "../components/IndigoSidebar";
import { FaRobot } from "react-icons/fa6";
import {
  ChevronLeft, Clock, CheckCircle2, Circle, Loader2, ChevronDown,
  ArrowLeft, ArrowRight, RotateCcw, Star, MoreVertical, Plus, X,
  Link2, Repeat,
} from "lucide-react";

function DuoIcon({ icon, className = "" }: { icon: string; className?: string }) {
  return <i className={`fa-duotone solid fa-${icon} ${className}`} />;
}


// ── Prep phase ──────────────────────────────────────────────────────────────
type StepStatus = "done" | "running" | "pending";

const STEPS = [
  { id: 1, label: "Context Analysis",      sub: "Understanding test case requirements and scenarios", duration: 1900 },
  { id: 2, label: "Environment Setup",     sub: "Configuring test environment and dependencies",      duration: 2400 },
  { id: 3, label: "Browser Configuration", sub: "Setting up browser instances and WebDriver",         duration: 2000 },
  { id: 4, label: "Test Design",           sub: "Generating test scripts and data models",            duration: 1700 },
  { id: 5, label: "Execution Ready",       sub: "All systems ready for test execution",               duration: 1500 },
  { id: 6, label: "Starting Soon",         sub: "Initializing execution, please wait…",              duration: 1250 },
];

const PREP_STREAM = [
  { t: 400,  text: "Booting ContextQA execution engine…"            },
  { t: 2100, text: "Analysing test case C-623 requirements…"        },
  { t: 4450, text: "Provisioning isolated test environment…"        },
  { t: 6400, text: "Configuring Chromium runtime…"                  },
  { t: 8150, text: "Generating test scripts from context…"          },
  { t: 9650, text: "Running pre-flight checks…"                     },
  { t: 10850,text: "All systems ready — launching agent…"           },
];

const PREP_STREAM_ONBOARDING = [
  { t: 400,  text: "Booting ContextQA execution engine…"            },
  { t: 2100, text: "Analysing your website context…"                },
  { t: 4450, text: "Provisioning isolated test environment…"        },
  { t: 6400, text: "Configuring Chromium runtime…"                  },
  { t: 8150, text: "Generating test scenarios from context…"        },
  { t: 9650, text: "Running pre-flight checks…"                     },
  { t: 10850,text: "All systems ready — launching agent…"           },
];

// ── Agent phase timing (ms from agent start) ─────────────────────────────────
const A = {
  step11Start:  200,
  step11Log1:   500,
  step11Log2:  1300,
  step11Log3:  2100,
  step11Done:  2800,
  step12Start: 3000,
  step12Done:  4600,
  step13Start: 4800,
  step13Done:  6000,
  prereqDone:  6200,
  promptShow:  6600,
  agentStart:  7000,

  // Prompt step progression (each ~1.5–2s)
  p1Start: 7200, p1Log: 7900,  p1Done:  8900,
  p2Start: 9100, p2Log: 9700,  p2Done: 10700,
  p3Start:10900, p3Log:11600,  p3Done: 12800,
  p4Start:13000, p4Log:13600,  p4Done: 14700,
  p5Start:14900, p5Log:15700,  p5Done: 16900,
};

const PROMPT_STEPS = [
  { n: 1, label: <>Navigate to Admin content browse page at <span className="text-indigo-600">$(contentbrowseurl)</span></>, log: "Loading admin content page…",  logDone: "Page loaded ✓",           startLog: "› Navigating to admin content browse page…", doneLog: "  ✓ Page loaded"                },
  { n: 2, label: <>Click the <span className="text-indigo-600 font-medium">+ Create</span> button in the top right</>,      log: "Locating + Create button…",    logDone: "Button clicked ✓",        startLog: "› Locating + Create button…",               doneLog: "  ✓ Button clicked"             },
  { n: 3, label: <>Select <span className="text-indigo-600 font-medium">$(contenttype)</span> from the Type dropdown</>,    log: "Opening Type dropdown…",       logDone: "Video selected ✓",        startLog: "› Opening Type dropdown…",                  doneLog: "  ✓ Video selected"             },
  { n: 4, label: <>Enter <span className="text-indigo-600 font-medium">$(contenttitle)</span> into the Title field</>,      log: "Typing content title…",        logDone: "Title entered ✓",         startLog: "› Typing content title…",                   doneLog: "  ✓ Title entered"              },
  { n: 5, label: <>Click <span className="text-indigo-600 font-medium">Publish</span> and verify item appears in list</>,   log: "Clicking Publish…",            logDone: "Item verified in list ✓", startLog: "› Clicking Publish…",                       doneLog: "  ✓ Item verified in content list" },
];

const PROMPT_STEPS_ONBOARDING = [
  { n: 1, label: <>Navigate to homepage at <span className="text-indigo-600">$(siteurl)</span></>,                               log: "Loading homepage…",            logDone: "Homepage loaded ✓",       startLog: "› Loading homepage…",                       doneLog: "  ✓ Homepage loaded"            },
  { n: 2, label: <>Locate and click the <span className="text-indigo-600 font-medium">Sign Up</span> button</>,                  log: "Scanning for Sign Up CTA…",    logDone: "Button clicked ✓",        startLog: "› Scanning for Sign Up button…",            doneLog: "  ✓ Button clicked"             },
  { n: 3, label: <>Enter <span className="text-indigo-600 font-medium">$(email)</span> into the email field</>,                  log: "Typing test email address…",   logDone: "Email entered ✓",         startLog: "› Entering email address…",                 doneLog: "  ✓ Email entered"              },
  { n: 4, label: <>Submit form and wait for <span className="text-indigo-600 font-medium">confirmation</span></>,                log: "Submitting signup form…",      logDone: "Confirmation loaded ✓",   startLog: "› Submitting signup form…",                 doneLog: "  ✓ Confirmation page loaded"   },
  { n: 5, label: <>Verify <span className="text-indigo-600 font-medium">welcome email</span> is delivered to inbox</>,          log: "Checking inbox…",              logDone: "Welcome email verified ✓",startLog: "› Checking email inbox…",                   doneLog: "  ✓ Welcome email verified"     },
];

// ── Onboarding browser timeline ──────────────────────────────────────────────
type ObLogType = "init"|"nav"|"find"|"sub"|"agent"|"done"|"synth";
interface ObLog { id: number; type: ObLogType; text: string; ts: string; }
interface ObCursorWp { t: number; x: number; y: number; }
interface ObClick { t: number; }
interface ObUrlChange { t: number; url: string; }

const OB_LOGS: { t: number; type: ObLogType; text: string }[] = [
  { t:  200, type: "init",  text: "Agent initialized — target: contextqa.com" },
  { t:  900, type: "nav",   text: "🌐 Navigating to contextqa.com…" },
  { t: 2500, type: "find",  text: "✓ Homepage loaded — 127 DOM elements parsed" },
  { t: 3400, type: "find",  text: "🔍 Nav links: /features · /pricing · /docs · /blog · /about · /contact" },
  { t: 4200, type: "find",  text: "💡 CTAs found: 'Start Free Trial' · 'Schedule Demo'" },
  { t: 5000, type: "sub",   text: "Spawning SubAgent #1 → /features" },
  { t: 5600, type: "sub",   text: "Spawning SubAgent #2 → /pricing" },
  { t: 6200, type: "sub",   text: "Spawning SubAgent #3 → /docs" },
  { t: 7400, type: "nav",   text: "🌐 Navigating to /features…" },
  { t: 9000, type: "find",  text: "✓ /features — 8 feature sections mapped" },
  { t: 9600, type: "agent", text: "SubAgent #1 · AI Test Gen, Self-Healing, Visual, API, CI/CD, Mobile…" },
  { t:10900, type: "done",  text: "✓ SubAgent #1 complete — 31 elements · 3 CTAs catalogued" },
  { t:11700, type: "nav",   text: "🌐 Navigating to /pricing…" },
  { t:13200, type: "find",  text: "✓ /pricing — 3 pricing tiers found" },
  { t:13800, type: "agent", text: "SubAgent #2 · Starter / Pro / Enterprise — FAQ section mapped" },
  { t:14900, type: "done",  text: "✓ SubAgent #2 complete — 22 elements · 6 CTAs catalogued" },
  { t:15400, type: "nav",   text: "🌐 Navigating to /docs…" },
  { t:16900, type: "find",  text: "✓ /docs — 12 categories · 156 articles indexed" },
  { t:17500, type: "agent", text: "SubAgent #3 · Getting Started, API Reference, Integrations, CLI, Webhooks…" },
  { t:18600, type: "done",  text: "✓ SubAgent #3 complete — 89 elements · 0 CTAs catalogued" },
  { t:19200, type: "synth", text: "🗺️ Synthesizing sitemap context from 3 sub-agents…" },
  { t:20800, type: "done",  text: "✓ Context complete — 4 pages · 142 elements · 12 CTAs identified" },
];

const OB_URLS: ObUrlChange[] = [
  { t:  900, url: "contextqa.com" },
  { t: 7400, url: "contextqa.com/features" },
  { t:11700, url: "contextqa.com/pricing" },
  { t:15400, url: "contextqa.com/docs" },
];

const OB_CURSORS: ObCursorWp[] = [
  { t:  600, x: 50,  y: 50  },
  { t: 1200, x: 38,  y: 8   },
  { t: 2800, x: 52,  y: 42  },
  { t: 3600, x: 38,  y: 8   },
  { t: 5200, x: 48,  y: 8   },
  { t: 6800, x: 48,  y: 8   },
  { t: 7600, x: 27,  y: 38  },
  { t: 8400, x: 60,  y: 58  },
  { t: 9300, x: 35,  y: 65  },
  { t:10500, x: 55,  y: 8   },
  { t:11800, x: 37,  y: 50  },
  { t:13000, x: 64,  y: 62  },
  { t:14600, x: 63,  y: 8   },
  { t:15600, x: 28,  y: 42  },
  { t:16500, x: 28,  y: 58  },
  { t:17800, x: 50,  y: 50  },
];

const OB_CLICKS: ObClick[] = [
  { t: 3000 }, { t: 6800 }, { t: 8800 }, { t:11900 }, { t:13200 }, { t:15800 },
];

// ── Neural graph node geometry ────────────────────────────────────────────────
const GRAPH_CENTER = { cx: 200, cy: 100 };
const GRAPH_NODES = [
  { label: "Context",  icon: "sitemap",    cx: 200, cy: 25  },
  { label: "Environ",  icon: "gear",       cx: 265, cy: 62  },
  { label: "Browser",  icon: "globe",      cx: 265, cy: 138 },
  { label: "Tests",    icon: "flask",      cx: 200, cy: 175 },
  { label: "Execute",  icon: "bolt",       cx: 135, cy: 138 },
  { label: "Launch",   icon: "rocket",     cx: 135, cy: 62  },
];


// ── Elapsed hook ──────────────────────────────────────────────────────────────
function useElapsedTime() {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, []);
  const m = Math.floor(elapsed / 60).toString().padStart(2, "0");
  const s = (elapsed % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

// ── Fake browser — agent navigation UI ───────────────────────────────────────
const CONTENT_TITLE = "Getting Started with Video Content";
const EXISTING_ROWS = [
  { name: "Intro to ContextQA",  type: "Video",   status: "Published" },
  { name: "API Testing Guide",   type: "Article", status: "Draft"     },
  { name: "Release Notes v3.2",  type: "Video",   status: "Published" },
];

function FirstJourneyModal({ onKeepCrawling, onDashboard }: {
  onKeepCrawling: () => void;
  onDashboard: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6" style={{ background: "rgba(15,23,42,0.45)", backdropFilter: "blur(6px)" }}>
      <style>{`
        @keyframes fj-in       { from{opacity:0;transform:scale(0.94) translateY(12px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes fj-path     { from{stroke-dashoffset:1200} to{stroke-dashoffset:0} }
        @keyframes fj-node-lit { from{opacity:0;transform:scale(0)} to{opacity:1;transform:scale(1)} }
        @keyframes fj-spark-in { from{opacity:0;transform:scale(0)} to{opacity:1;transform:scale(1)} }
        @keyframes fj-spark-pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.45;transform:scale(0.65)} }
      `}</style>
      <div
        className="bg-white rounded-2xl shadow-2xl overflow-hidden flex max-w-2xl w-full"
        style={{ animation: "fj-in 0.4s cubic-bezier(.34,1.56,.64,1) both" }}
      >
        {/* Left panel */}
        <div className="flex-1 flex flex-col px-8 py-8 gap-5">
          {/* Badge */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center">
              <DuoIcon icon="sparkles" className="text-emerald-600 text-[13px]" />
            </div>
            <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest">First Journey Spotted</span>
          </div>

          {/* Heading */}
          <h2 className="text-2xl font-black text-gray-900 leading-tight">
            We found your<br />first journey!
          </h2>

          {/* Journey card */}
          <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 px-4 py-3.5 flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0 mt-0.5">
              <DuoIcon icon="route" className="text-indigo-600 text-[12px]" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 mb-1">User Signup Flow</p>
              <p className="text-[12px] text-gray-500 leading-relaxed">
                Mapped directly from your live site — this journey is now part of your business knowledge and ready to drive intelligent test coverage.
              </p>
            </div>
          </div>

          {/* Body */}
          <p className="text-[12.5px] text-gray-500 leading-relaxed">
            The AI has learned how your visitors move through your product — from discovery to conversion. Visit your Knowledge Base to see everything captured and teach it even more about your business.
          </p>

          {/* Footer actions */}
          <div className="flex items-center justify-between mt-auto pt-2">
            <button
              onClick={onKeepCrawling}
              className="text-sm font-semibold text-gray-400 hover:text-gray-600 transition-colors"
            >
              Keep Crawling
            </button>
            <button
              onClick={onDashboard}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-sm"
            >
              View Knowledge Base
              <ArrowRight size={15} />
            </button>
          </div>
        </div>

        {/* Right panel — journey path */}
        <div className="w-56 bg-gray-50 border-l border-gray-100 flex items-center justify-center py-6 px-3">
          <svg viewBox="0 0 200 390" className="w-full" style={{ maxHeight: 320 }} fill="none">
            <defs>
              <linearGradient id="fj-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#6366F1" />
                <stop offset="55%"  stopColor="#06B6D4" />
                <stop offset="100%" stopColor="#10B981" />
              </linearGradient>
            </defs>

            {/* ── Winding path: draws in over 2.4s ─────────────────────── */}
            <path
              d="M 100,10 C 100,50 50,55 50,95 C 50,135 160,145 160,185 C 160,225 50,235 50,275 C 50,315 160,325 160,360"
              stroke="url(#fj-grad)" strokeWidth="2.5" strokeLinecap="round" fill="none"
              strokeDasharray="1200"
              style={{ animation: "fj-path 2.4s cubic-bezier(.4,0,.2,1) both" }}
            />

            {/* ── Dim base rings: always visible, turn on before lit layer ── */}
            {([
              [50,  95],
              [160, 185],
              [50,  275],
              [160, 360],
            ] as [number, number][]).map(([cx, cy]) => (
              <circle key={cy} cx={cx} cy={cy} r="11"
                fill="white" stroke="#D1D5DB" strokeWidth="2" />
            ))}

            {/* ── Labels: always visible ────────────────────────────────── */}
            {([
              { cx: 50,  cy: 95,  label: "Home",     lx: 76,  anchor: "start" },
              { cx: 160, cy: 185, label: "Features",  lx: 134, anchor: "end"   },
              { cx: 50,  cy: 275, label: "Pricing",   lx: 76,  anchor: "start" },
              { cx: 160, cy: 360, label: "Sign Up",   lx: 134, anchor: "end"   },
            ] as { cx:number; cy:number; label:string; lx:number; anchor:string }[])
              .map(({ cx, cy, label, lx, anchor }) => (
                <text key={label} x={lx} y={cy + 4.5}
                  fontSize="11" fill="#6B7280" fontFamily="system-ui"
                  textAnchor={anchor as "start"|"end"}>{label}</text>
              ))
            }

            {/* ── Lit indigo nodes: pop in as path passes (nodes 1–3) ────── */}
            {([
              { cx: 50,  cy: 95,  delay: 0.70 },
              { cx: 160, cy: 185, delay: 1.30 },
              { cx: 50,  cy: 275, delay: 1.90 },
            ] as { cx:number; cy:number; delay:number }[]).map(({ cx, cy, delay }) => (
              <g key={cy}
                style={{
                  transformBox: "fill-box", transformOrigin: "center",
                  animation: `fj-node-lit 0.45s ${delay}s cubic-bezier(.34,1.56,.64,1) both`,
                }}
              >
                <circle cx={cx} cy={cy} r="11" fill="#6366F1" />
                <circle cx={cx} cy={cy} r="5"  fill="white" />
              </g>
            ))}

            {/* ── Final node: green checkmark ON Sign Up (node 4) ────────── */}
            <g style={{
              transformBox: "fill-box", transformOrigin: "center",
              animation: "fj-node-lit 0.5s 2.5s cubic-bezier(.34,1.56,.64,1) both",
            }}>
              <circle cx="160" cy="360" r="13" fill="#10B981" />
              {/* Checkmark: centered at 160,360 */}
              <path
                d="M 152.5,360.5 L 158,366.5 L 168.5,352.5"
                stroke="white" strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round" fill="none"
              />
            </g>

            {/* ── Sparkles around Sign Up, staggered appear then pulse ───── */}
            {([
              [-20, -18], [20, -20], [24,  6], [-24, 8], [0, -28],
            ] as [number, number][]).map(([dx, dy], i) => {
              const appearDelay = 2.8 + i * 0.1;
              const pulseDelay  = appearDelay + 0.4;
              return (
                <text key={i}
                  x={160 + dx} y={360 + dy}
                  fontSize="9" fill="#F59E0B" textAnchor="middle"
                  style={{
                    transformBox: "fill-box", transformOrigin: "center",
                    animation: `fj-spark-in 0.4s ${appearDelay}s both, fj-spark-pulse 1.1s ${pulseDelay}s ease-in-out infinite`,
                  }}
                >✦</text>
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
}

function OnboardingBrowser({
  url, cursorX, cursorY, clicking,
}: {
  url: string; cursorX: number; cursorY: number; clicking: boolean;
}) {
  const [clickKey, setClickKey] = useState(0);
  useEffect(() => { if (clicking) setClickKey((k) => k + 1); }, [clicking]);

  return (
    <div className="flex flex-col h-full rounded-xl overflow-hidden border border-gray-200 bg-white shadow-xl">
      <style>{`
        @keyframes ob-ripple { 0%{transform:scale(0);opacity:0.7} 100%{transform:scale(4);opacity:0} }
        @keyframes ob-cursor-enter { from{opacity:0;transform:scale(0.5)} to{opacity:1;transform:scale(1)} }
      `}</style>

      {/* Traffic lights */}
      <div className="flex items-center gap-1.5 px-3 py-2 bg-gray-900 shrink-0">
        <span className="w-3 h-3 rounded-full bg-red-500" />
        <span className="w-3 h-3 rounded-full bg-yellow-400" />
        <span className="w-3 h-3 rounded-full bg-green-400" />
      </div>
      {/* Tab bar */}
      <div className="flex items-center bg-gray-100 border-b border-gray-300 px-2 pt-1.5 shrink-0">
        <div className="flex items-center gap-1.5 bg-white rounded-t-lg px-3 py-1.5 border-t border-l border-r border-gray-300 text-[11px] text-gray-700 font-medium max-w-[260px] truncate">
          ContextQA — AI-Powered Testing
          <button className="ml-2 text-gray-400 shrink-0"><X size={10} /></button>
        </div>
        <button className="ml-1 text-gray-400 p-1"><Plus size={12} /></button>
      </div>
      {/* URL bar */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 border-b border-gray-200 shrink-0">
        <button className="text-gray-400"><ArrowLeft size={14} /></button>
        <button className="text-gray-400"><ArrowRight size={14} /></button>
        <button className="text-gray-400"><RotateCcw size={13} /></button>
        <div className="flex-1 flex items-center gap-1.5 bg-white border border-gray-300 rounded-full px-3 py-1 text-[11px] text-gray-600 transition-all duration-300">
          <span className="text-green-500 text-[10px]">●</span>
          <span className="truncate font-mono">{url}</span>
        </div>
        <button className="text-gray-400"><Star size={13} /></button>
        <button className="text-gray-400"><MoreVertical size={13} /></button>
      </div>

      {/* Iframe + cursor overlay */}
      <div className="flex-1 overflow-hidden relative">
        <iframe
          src="https://contextqa.com/"
          className="w-full h-full border-none"
          title="ContextQA website"
        />

        {/* Animated cursor */}
        <div
          className="absolute pointer-events-none z-20"
          style={{
            left: `${cursorX}%`,
            top: `${cursorY}%`,
            transform: "translate(-2px, -2px)",
            transition: "left 0.55s cubic-bezier(.4,0,.2,1), top 0.55s cubic-bezier(.4,0,.2,1)",
          }}
        >
          {/* Click ripple */}
          {clicking && (
            <div
              key={clickKey}
              className="absolute w-6 h-6 rounded-full bg-indigo-400"
              style={{
                top: "50%", left: "50%",
                transform: "translate(-50%,-50%) scale(0)",
                animation: "ob-ripple 0.5s ease-out forwards",
                opacity: 0,
              }}
            />
          )}
          {/* Cursor SVG */}
          <svg width="18" height="22" viewBox="0 0 18 22" fill="none" style={{ filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.5))", animation: "ob-cursor-enter 0.2s ease" }}>
            <path d="M2 2L2 16L6 12L9 19L11 18L8 11L14 11L2 2Z" fill="white" stroke="#333" strokeWidth="1.2" strokeLinejoin="round" />
          </svg>
        </div>

        {/* Agent status strip at bottom */}
        <div className="absolute bottom-0 left-0 right-0 bg-gray-900/80 backdrop-blur-sm px-3 py-1.5 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse shrink-0" />
          <span className="text-[10px] text-gray-300 font-mono truncate">Agent exploring {url}</span>
        </div>
      </div>
    </div>
  );
}

function FakeBrowser({ activePromptStep, donePromptSteps }: {
  activePromptStep: number;
  donePromptSteps: number[];
}) {
  const [typedTitle, setTypedTitle] = useState("");
  const typingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Animate typing when step 4 becomes active
  useEffect(() => {
    if (activePromptStep === 4) {
      setTypedTitle("");
      let i = 0;
      typingRef.current = setInterval(() => {
        i++;
        setTypedTitle(CONTENT_TITLE.slice(0, i));
        if (i >= CONTENT_TITLE.length) {
          clearInterval(typingRef.current!);
          typingRef.current = null;
        }
      }, 55);
    }
    if (donePromptSteps.includes(4) && activePromptStep !== 4) {
      setTypedTitle(CONTENT_TITLE);
    }
    return () => { if (typingRef.current) clearInterval(typingRef.current); };
  }, [activePromptStep, donePromptSteps]);

  const p1Done = donePromptSteps.includes(1);
  const p2Done = donePromptSteps.includes(2);
  const p3Done = donePromptSteps.includes(3);
  const p4Done = donePromptSteps.includes(4);
  const p5Done = donePromptSteps.includes(5);
  const p2Active = activePromptStep === 2;
  const p3Active = activePromptStep === 3;
  const p4Active = activePromptStep === 4;
  const p5Active = activePromptStep === 5;
  const showModal = p2Done && !p5Done;

  return (
    <div className="flex flex-col h-full rounded-xl overflow-hidden border border-gray-200 bg-white shadow-xl">
      {/* Browser chrome — traffic lights */}
      <div className="flex items-center gap-1.5 px-3 py-2 bg-gray-900 shrink-0">
        <span className="w-3 h-3 rounded-full bg-red-500" />
        <span className="w-3 h-3 rounded-full bg-yellow-400" />
        <span className="w-3 h-3 rounded-full bg-green-400" />
      </div>
      {/* Tab bar */}
      <div className="flex items-center bg-gray-100 border-b border-gray-300 px-2 pt-1.5 shrink-0">
        <div className="flex items-center gap-1.5 bg-white rounded-t-lg px-3 py-1.5 border-t border-l border-r border-gray-300 text-[11px] text-gray-700 font-medium max-w-[220px] truncate">
          {p1Done ? "Content Library — ContextQA" : "Loading…"}
          <button className="ml-2 text-gray-400 shrink-0"><X size={10} /></button>
        </div>
        <button className="ml-1 text-gray-400 p-1"><Plus size={12} /></button>
      </div>
      {/* URL bar */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 border-b border-gray-200 shrink-0">
        <button className="text-gray-400"><ArrowLeft size={14} /></button>
        <button className="text-gray-400"><ArrowRight size={14} /></button>
        <button className={`text-gray-400 ${!p1Done ? "animate-spin" : ""}`}><RotateCcw size={13} /></button>
        <div className="flex-1 flex items-center gap-1.5 bg-white border border-gray-300 rounded-full px-3 py-1 text-[11px] text-gray-600">
          {p1Done && <span className="text-green-500 text-[10px]">●</span>}
          <span className="truncate">{p1Done ? "app.contextqa.io/admin/content/browse" : "app.contextqa.io/admin/content"}</span>
        </div>
        <button className="text-gray-400"><Star size={13} /></button>
        <button className="text-gray-400"><MoreVertical size={13} /></button>
      </div>

      {/* Page content */}
      <div className="flex-1 overflow-hidden relative">

        {/* ── Loading state (step 1 active, before page loads) ── */}
        {!p1Done && (
          <div className="h-full flex items-center justify-center bg-gray-50">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin" />
              <p className="text-sm text-gray-400 font-medium">Loading content library…</p>
            </div>
          </div>
        )}

        {/* ── Admin content browse page ── */}
        {p1Done && (
          <div className="h-full flex flex-col bg-gray-50 overflow-hidden">

            {/* Admin top bar */}
            <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 bg-indigo-600 rounded flex items-center justify-center">
                    <span className="text-white text-[9px] font-bold">Q</span>
                  </div>
                  <span className="text-[11px] font-bold text-gray-800">ContextQA</span>
                </div>
                <nav className="flex gap-3">
                  {["Content", "Media", "Settings", "Users"].map((t) => (
                    <span key={t} className={`text-[11px] ${t === "Content" ? "text-indigo-600 font-semibold border-b border-indigo-500 pb-0.5" : "text-gray-400"}`}>{t}</span>
                  ))}
                </nav>
              </div>

              {/* + Create button — highlights on step 2 */}
              <div className="relative">
                <button
                  className={`relative flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg font-semibold transition-all duration-200
                    ${p2Active ? "bg-indigo-700 text-white scale-105" : "bg-indigo-600 text-white"}`}
                >
                  <Plus size={10} /> Create
                </button>
                {p2Active && (
                  <span className="absolute inset-0 rounded-lg ring-4 ring-indigo-400/60 animate-ping pointer-events-none" />
                )}
              </div>
            </div>

            {/* Content area with table */}
            <div className="flex-1 overflow-hidden p-3 relative">
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {/* Table header row */}
                <div className="px-4 py-2.5 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold text-gray-800">Content Library</p>
                    <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">{p5Done ? "13 items" : "12 items"}</span>
                  </div>
                  <div className="flex gap-1">
                    {["All", "Published", "Draft"].map((t) => (
                      <button key={t} className={`text-[10px] px-2 py-0.5 rounded-md ${t === "All" ? "bg-indigo-50 text-indigo-600 font-semibold" : "text-gray-400"}`}>{t}</button>
                    ))}
                  </div>
                </div>
                {/* Column headers */}
                <div className="grid grid-cols-3 px-4 py-1.5 bg-gray-50 border-b border-gray-100">
                  {["Title", "Type", "Status"].map((h) => (
                    <span key={h} className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">{h}</span>
                  ))}
                </div>

                {/* Newly published row — appears after step 5 */}
                {p5Done && (
                  <div className="grid grid-cols-3 px-4 py-2.5 border-b border-green-100 bg-green-50/60 animate-[fadeIn_0.5s_ease]">
                    <div>
                      <p className="text-[11px] font-semibold text-gray-800">{CONTENT_TITLE}</p>
                      <p className="text-[10px] text-gray-400">Just now</p>
                    </div>
                    <span className="text-[11px] text-gray-600 self-center">Video</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700 self-center w-fit">Published</span>
                  </div>
                )}

                {/* Existing rows */}
                {EXISTING_ROWS.map((item) => (
                  <div key={item.name} className="grid grid-cols-3 px-4 py-2.5 border-b border-gray-50">
                    <div>
                      <p className="text-[11px] font-medium text-gray-800">{item.name}</p>
                      <p className="text-[10px] text-gray-400">{item.type}</p>
                    </div>
                    <span className="text-[11px] text-gray-600 self-center">{item.type}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full self-center w-fit ${item.status === "Published" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{item.status}</span>
                  </div>
                ))}
              </div>

              {/* ── Create Content modal (steps 2–5) ── */}
              {showModal && (
                <div className="absolute inset-0 bg-black/25 flex items-start justify-center pt-8 animate-[fadeIn_0.2s_ease]">
                  <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-72 overflow-hidden">
                    {/* Modal header */}
                    <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
                      <p className="text-sm font-bold text-gray-900">Create Content</p>
                      <button className="text-gray-400 hover:text-gray-600"><X size={14} /></button>
                    </div>

                    {/* Modal body */}
                    <div className="px-5 py-4 space-y-3.5">

                      {/* Type dropdown */}
                      <div>
                        <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide block mb-1">Type</label>
                        <div className={`relative w-full px-3 py-2 rounded-lg border text-[11px] flex items-center justify-between cursor-pointer transition-all
                          ${p3Active ? "border-indigo-400 ring-2 ring-indigo-200 bg-indigo-50/30" : p3Done ? "border-gray-200" : "border-gray-200"}`}>
                          <span className={p3Done ? "text-gray-800 font-semibold" : "text-gray-400"}>
                            {p3Done ? "Video" : "Select type…"}
                          </span>
                          <ChevronDown size={11} className="text-gray-400 shrink-0" />
                          {/* Dropdown list */}
                          {p3Active && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-gray-200 shadow-xl overflow-hidden z-20 animate-[fadeIn_0.15s_ease]">
                              {["Article", "Video", "Tutorial", "Document"].map((opt) => (
                                <div key={opt} className={`flex items-center justify-between px-3 py-2 text-[11px] ${opt === "Video" ? "bg-indigo-600 text-white font-semibold" : "text-gray-600 hover:bg-gray-50"}`}>
                                  {opt}
                                  {opt === "Video" && <span className="w-1.5 h-1.5 rounded-full bg-amber-300 animate-pulse" />}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Title input */}
                      <div>
                        <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide block mb-1">Title</label>
                        <div className={`w-full px-3 py-2 rounded-lg border text-[11px] min-h-[32px] transition-all
                          ${p4Active ? "border-indigo-400 ring-2 ring-indigo-200 bg-indigo-50/20" : "border-gray-200"}`}>
                          {(p4Active || p4Done) ? (
                            <span className="text-gray-800">
                              {typedTitle}
                              {p4Active && <span className="border-r-2 border-indigo-500 animate-pulse ml-0.5 inline-block h-3 align-middle" />}
                            </span>
                          ) : (
                            <span className="text-gray-400">Enter title…</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Modal footer */}
                    <div className="flex items-center justify-end gap-2 px-5 py-3 bg-gray-50/80 border-t border-gray-100">
                      <button className="text-[11px] text-gray-500 font-medium px-3 py-1.5 rounded-lg hover:bg-gray-100">Cancel</button>
                      <button className="text-[11px] text-gray-500 font-medium px-3 py-1.5 rounded-lg border border-gray-200">Save Draft</button>

                      {/* Publish button — highlights on step 5 */}
                      <div className="relative">
                        <button
                          className={`relative text-[11px] font-semibold px-4 py-1.5 rounded-lg transition-all duration-200
                            ${p5Active ? "bg-indigo-700 text-white scale-105" : "bg-indigo-600 text-white"}`}
                        >
                          {p5Active
                            ? <span className="flex items-center gap-1.5"><Loader2 size={10} className="animate-spin" />Publishing…</span>
                            : "Publish"}
                        </button>
                        {p5Active && (
                          <span className="absolute inset-0 rounded-lg ring-4 ring-indigo-400/60 animate-ping pointer-events-none" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ExecutionPage() {
  const [, navigate] = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const params = useParams<{ id: string }>();
  const testId = params.id ?? "C-623";
  const isOnboarding = testId === "onboarding";
  const activeStream = isOnboarding ? PREP_STREAM_ONBOARDING : PREP_STREAM;
  const activeSteps  = isOnboarding ? PROMPT_STEPS_ONBOARDING : PROMPT_STEPS;
  const elapsed = useElapsedTime();

  // Prep phase
  const [stepStatuses, setStepStatuses] = useState<StepStatus[]>(STEPS.map(() => "pending"));
  const [prepLines, setPrepLines] = useState<{ text: string; ts: string }[]>([]);
  const prepStartRef = useRef(Date.now());

  // Phase control
  const [phase, setPhase] = useState<"prep" | "agent">("prep");
  const [panelFade, setPanelFade] = useState(true); // fades content on switch

  // Right-panel terminal lines for agent phase
  const [agentLines, setAgentLines] = useState<{ text: string; done?: boolean }[]>([]);

  // Agent phase — prereq
  const [step11Logs, setStep11Logs] = useState<{ text: string; ms: string }[]>([]);
  const [activeNested, setActiveNested] = useState<0 | 1 | 2 | 3>(0);
  const [doneNested, setDoneNested] = useState<number[]>([]);
  const [prereqDone, setPrereqDone] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showAgentStep, setShowAgentStep] = useState(false);

  // Agent phase — prompt step progress
  const [activePromptStep, setActivePromptStep] = useState(0);
  const [donePromptSteps, setDonePromptSteps] = useState<number[]>([]);
  const [promptStepLog, setPromptStepLog] = useState("");

  // Onboarding-specific browser state
  const [obUrl, setObUrl] = useState("contextqa.com");
  const [obCursorX, setObCursorX] = useState(50);
  const [obCursorY, setObCursorY] = useState(50);
  const [obClicking, setObClicking] = useState(false);
  const [obLogs, setObLogs] = useState<ObLog[]>([]);
  const [obModalVisible, setObModalVisible] = useState(false);
  const obLogsEndRef = useRef<HTMLDivElement>(null);
  const obAgentStart = useRef(Date.now());

  const doneCount = stepStatuses.filter((s) => s === "done").length;
  const progress = Math.round((doneCount / STEPS.length) * 100);

  // ── Drive prep steps ──────────────────────────────────────────────────────
  useEffect(() => {
    let cumulative = 0;
    const timers: ReturnType<typeof setTimeout>[] = [];
    STEPS.forEach((step, i) => {
      const startAt = cumulative;
      timers.push(setTimeout(() => {
        setStepStatuses((prev) => { const n = [...prev]; n[i] = "running"; return n; });
      }, startAt));
      cumulative += step.duration;
      timers.push(setTimeout(() => {
        setStepStatuses((prev) => { const n = [...prev]; n[i] = "done"; return n; });
      }, cumulative));
    });
    // Trigger agent phase after all steps — fade content, keep panels in place
    timers.push(setTimeout(() => {
      setPanelFade(false);
      setTimeout(() => {
        setPhase("agent");
        setPanelFade(true);
      }, 300);
    }, cumulative + 400));
    return () => timers.forEach(clearTimeout);
  }, []);

  // ── Drive prep stream text (with timestamps) ─────────────────────────────
  useEffect(() => {
    prepStartRef.current = Date.now();
    const timers = activeStream.map(({ t, text }) =>
      setTimeout(() => {
        const ms = Date.now() - prepStartRef.current;
        const s  = Math.floor(ms / 1000);
        const ts = `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}.${Math.floor((ms % 1000) / 100)}`;
        setPrepLines((prev) => [...prev, { text, ts }]);
      }, t)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  // ── Drive agent phase ─────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== "agent") return;
    const t = (ms: number, fn: () => void) => setTimeout(fn, ms);
    const timers = [
      t(A.step11Start, () => setActiveNested(1)),
      t(A.step11Log1,  () => setStep11Logs([{ text: "Started executing step", ms: "0ms" }])),
      t(A.step11Log2,  () => setStep11Logs((p) => [...p, { text: "Searching for element on screen", ms: "311ms" }])),
      t(A.step11Log3,  () => setStep11Logs((p) => [...p, { text: "Element found on screen ✓", ms: "22ms" }])),
      t(A.step11Done,  () => { setActiveNested(0); setDoneNested((p) => [...p, 1]); }),
      t(A.step12Start, () => setActiveNested(2)),
      t(A.step12Done,  () => { setActiveNested(0); setDoneNested((p) => [...p, 2]); }),
      t(A.step13Start, () => setActiveNested(3)),
      t(A.step13Done,  () => { setActiveNested(0); setDoneNested((p) => [...p, 3]); }),
      t(A.prereqDone,  () => setPrereqDone(true)),
      t(A.promptShow,  () => setShowPrompt(true)),
      t(A.agentStart,  () => { setShowAgentStep(true); setAgentLines([{ text: "Agent handoff complete — starting workflow…" }]); }),

      // Prompt step 1
      t(A.p1Start, () => { setActivePromptStep(1); setPromptStepLog(""); setAgentLines(p => [...p, { text: activeSteps[0].startLog }]); }),
      t(A.p1Log,   () => setPromptStepLog(activeSteps[0].log)),
      t(A.p1Done,  () => { setPromptStepLog(activeSteps[0].logDone); setAgentLines(p => [...p, { text: activeSteps[0].doneLog, done: true }]); setTimeout(() => { setDonePromptSteps(p => [...p, 1]); setActivePromptStep(0); setPromptStepLog(""); }, 500); }),

      // Prompt step 2
      t(A.p2Start, () => { setActivePromptStep(2); setPromptStepLog(""); setAgentLines(p => [...p, { text: activeSteps[1].startLog }]); }),
      t(A.p2Log,   () => setPromptStepLog(activeSteps[1].log)),
      t(A.p2Done,  () => { setPromptStepLog(activeSteps[1].logDone); setAgentLines(p => [...p, { text: activeSteps[1].doneLog, done: true }]); setTimeout(() => { setDonePromptSteps(p => [...p, 2]); setActivePromptStep(0); setPromptStepLog(""); }, 500); }),

      // Prompt step 3
      t(A.p3Start, () => { setActivePromptStep(3); setPromptStepLog(""); setAgentLines(p => [...p, { text: activeSteps[2].startLog }]); }),
      t(A.p3Log,   () => setPromptStepLog(activeSteps[2].log)),
      t(A.p3Done,  () => { setPromptStepLog(activeSteps[2].logDone); setAgentLines(p => [...p, { text: activeSteps[2].doneLog, done: true }]); setTimeout(() => { setDonePromptSteps(p => [...p, 3]); setActivePromptStep(0); setPromptStepLog(""); }, 500); }),

      // Prompt step 4
      t(A.p4Start, () => { setActivePromptStep(4); setPromptStepLog(""); setAgentLines(p => [...p, { text: activeSteps[3].startLog }]); }),
      t(A.p4Log,   () => setPromptStepLog(activeSteps[3].log)),
      t(A.p4Done,  () => { setPromptStepLog(activeSteps[3].logDone); setAgentLines(p => [...p, { text: activeSteps[3].doneLog, done: true }]); setTimeout(() => { setDonePromptSteps(p => [...p, 4]); setActivePromptStep(0); setPromptStepLog(""); }, 500); }),

      // Prompt step 5
      t(A.p5Start, () => { setActivePromptStep(5); setPromptStepLog(""); setAgentLines(p => [...p, { text: activeSteps[4].startLog }]); }),
      t(A.p5Log,   () => setPromptStepLog(activeSteps[4].log)),
      t(A.p5Done,  () => { setPromptStepLog(activeSteps[4].logDone); setAgentLines(p => [...p, { text: activeSteps[4].doneLog, done: true }]); setTimeout(() => { setDonePromptSteps(p => [...p, 5]); setActivePromptStep(0); setPromptStepLog(""); }, 500); }),
    ];
    return () => timers.forEach(clearTimeout);
  }, [phase]);

  // ── Onboarding agent phase — cursor, URL, logs ────────────────────────────
  useEffect(() => {
    if (!isOnboarding || phase !== "agent") return;
    obAgentStart.current = Date.now();
    const t = (ms: number, fn: () => void) => setTimeout(fn, ms);
    const makeTs = () => {
      const ms = Date.now() - obAgentStart.current;
      const s = Math.floor(ms / 1000);
      return `${String(Math.floor(s / 60)).padStart(2,"0")}:${String(s % 60).padStart(2,"0")}`;
    };
    const timers: ReturnType<typeof setTimeout>[] = [
      ...OB_LOGS.map(({ t: at, type, text }, i) =>
        t(at, () => setSitemapLog({ id: i, type, text, ts: makeTs() }))
      ),
      ...OB_URLS.map(({ t: at, url }) => t(at, () => setObUrl(url))),
      ...OB_CURSORS.map(({ t: at, x, y }) => t(at, () => { setObCursorX(x); setObCursorY(y); })),
      ...OB_CLICKS.map(({ t: at }) => t(at, () => {
        setObClicking(true);
        setTimeout(() => setObClicking(false), 600);
      })),
      // First journey modal — appears when SubAgent #1 completes
      t(11200, () => setObModalVisible(true)),
    ];
    return () => timers.forEach(clearTimeout);
  }, [phase, isOnboarding]);

  function setSitemapLog(log: ObLog) {
    setObLogs((prev) => {
      if (prev.some((l) => l.id === log.id)) return prev;
      return [...prev, log];
    });
  }

  // Auto-scroll onboarding logs
  useEffect(() => {
    obLogsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [obLogs]);

  // ── Left panel content ────────────────────────────────────────────────────
  const circumference = 2 * Math.PI * 30; // r=30 → ≈188.5
  const PrepPanel = (
    <div className="flex flex-col h-full">
      <style>{`
        @keyframes cqa-shimmer { 0%{transform:translateX(-200%)} 100%{transform:translateX(200%)} }
        @keyframes cqa-ring-pulse { 0%,100%{box-shadow:0 0 0 0 rgba(99,102,241,0.35)} 50%{box-shadow:0 0 0 7px rgba(99,102,241,0)} }
      `}</style>

      {/* Circular progress ring */}
      <div className="flex flex-col items-center pt-5 pb-3 px-4 shrink-0">
        <div className="relative w-24 h-24">
          <svg viewBox="0 0 80 80" className="w-full h-full" style={{ transform: "rotate(-90deg)" }}>
            <circle cx="40" cy="40" r="30" fill="none" stroke="#E0E7FF" strokeWidth="5" />
            <circle cx="40" cy="40" r="30" fill="none"
              stroke={progress === 100 ? "#10B981" : "#6366F1"}
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={`${circumference}`}
              strokeDashoffset={`${circumference - (progress / 100) * circumference}`}
              style={{ transition: "stroke-dashoffset 0.65s cubic-bezier(.4,0,.2,1), stroke 0.4s" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-black leading-none" style={{ color: progress === 100 ? "#059669" : "#4F46E5" }}>
              {progress}<span className="text-sm font-bold">%</span>
            </span>
          </div>
        </div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">Setup Progress</p>
        <p className="text-[11px] text-gray-400 mt-0.5">{doneCount} of {STEPS.length} complete</p>
      </div>

      {/* Step list */}
      <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1.5">
        {STEPS.map((step, i) => {
          const status = stepStatuses[i];
          if (status === "running") {
            return (
              <div key={step.id}
                className="relative overflow-hidden rounded-2xl border border-indigo-300 bg-gradient-to-br from-indigo-50 via-indigo-50 to-white px-3.5 py-3"
                style={{ animation: "cqa-ring-pulse 2.2s ease-in-out infinite" }}
              >
                {/* Shimmer sweep */}
                <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
                  <div className="absolute inset-y-0 w-2/5 bg-gradient-to-r from-transparent via-white/60 to-transparent"
                    style={{ animation: "cqa-shimmer 2s ease-in-out infinite" }} />
                </div>
                <div className="relative flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0 mt-0.5 shadow-md shadow-indigo-200">
                    <Loader2 size={14} className="text-white animate-spin" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-bold text-indigo-800">{step.label}</p>
                      <span className="shrink-0 text-[10px] font-bold text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full border border-indigo-200">Running</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          }
          if (status === "done") {
            return (
              <div key={step.id} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-50 border border-green-100">
                <CheckCircle2 size={13} className="text-green-500 shrink-0" />
                <span className="text-[11px] text-gray-600 font-medium flex-1 min-w-0 truncate">{step.label}</span>
                <span className="text-[10px] font-bold text-green-600 shrink-0">Done</span>
              </div>
            );
          }
          return (
            <div key={step.id} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-100">
              <Circle size={13} className="text-gray-200 shrink-0" />
              <span className="text-[11px] text-gray-300 flex-1 min-w-0 truncate">{step.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );

  const lastLog = step11Logs[step11Logs.length - 1];

  const AgentPanel = (
    <div className="flex flex-col h-full">
      {/* Tabs */}
      <div className="flex items-center border-b border-gray-200 px-4 shrink-0">
        {["Steps", "Console", "Network"].map((tab) => (
          <button key={tab} className={`py-2.5 mr-4 text-xs font-semibold border-b-2 transition-colors ${tab === "Steps" ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-400 hover:text-gray-600"}`}>{tab}</button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">

        {/* Prereq — hidden for onboarding, shown for regular test cases */}
        {!isOnboarding && (prereqDone ? (
          <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-green-50 border border-green-100 animate-[fadeIn_0.3s_ease]">
            <CheckCircle2 size={14} className="text-green-500 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest">Prerequisite</p>
              <p className="text-xs font-medium text-green-800 truncate">
                {isOnboarding ? "Open website homepage" : "Login as Super Admin user"}
              </p>
            </div>
            <span className="text-[10px] font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full shrink-0">Done</span>
          </div>
        ) : (
          /* Prereq — active focus card */
          <div className="rounded-2xl border border-indigo-200 bg-gradient-to-b from-indigo-50/60 to-white overflow-hidden shadow-sm">
            {/* Card header */}
            <div className="flex items-center gap-2.5 px-4 py-3 border-b border-indigo-100/80">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0">
                <Link2 size={12} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest mb-0.5">Prerequisite · 1 of 1</p>
                <p className="text-xs font-semibold text-gray-900 truncate">
                  {isOnboarding ? "Open website homepage" : "Login as Super Admin user"}
                </p>
              </div>
              <Loader2 size={14} className="text-indigo-400 animate-spin shrink-0" />
            </div>

            {/* Sub-steps */}
            <div className="px-4 py-3 space-y-1.5">
              {(isOnboarding ? [
                { n: 1, label: <>Navigate to <span className="font-mono text-indigo-600 text-[10px] bg-indigo-50 px-1 rounded">$(siteurl)</span></> },
                { n: 2, label: <>Wait for page <span className="text-indigo-600 font-medium">fully loaded</span></> },
                { n: 3, label: <>Capture <span className="text-indigo-600 font-medium">page structure</span></> },
              ] : [
                { n: 1, label: <>Enter <span className="font-mono text-indigo-600 text-[10px] bg-indigo-50 px-1 rounded">@|username|</span> in Email/Username</> },
                { n: 2, label: <>Enter <span className="font-mono text-indigo-600 text-[10px] bg-indigo-50 px-1 rounded">@|password|</span> in Password</> },
                { n: 3, label: <>Click <span className="text-indigo-600 font-medium">Login</span></> },
              ] as { n: 1|2|3; label: React.ReactNode }[]).map(({ n, label }) => {
                const isDone   = doneNested.includes(n);
                const isActive = activeNested === n;
                return (
                  <div key={n} className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all duration-300 ${isActive ? "bg-white shadow-sm border border-indigo-100" : "bg-transparent"}`}>
                    <div className="shrink-0">
                      {isDone   ? <CheckCircle2 size={13} className="text-green-500" />
                      : isActive ? <Loader2 size={13} className="text-indigo-500 animate-spin" />
                      : <Circle size={13} className="text-gray-300" />}
                    </div>
                    <span className={`text-[11px] leading-snug ${isDone ? "text-gray-400" : isActive ? "text-gray-800 font-medium" : "text-gray-400"}`}>
                      {label}
                    </span>
                  </div>
                );
              })}

              {/* Latest log line only */}
              {lastLog && (
                <div className="flex items-center gap-2 mt-1 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-100">
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${lastLog.text.includes("✓") ? "bg-green-400" : "bg-indigo-300 animate-pulse"}`} />
                  <span className="text-[10px] text-gray-500 flex-1 truncate">{lastLog.text}</span>
                  <span className="text-[10px] text-gray-400 font-mono shrink-0">{lastLog.ms}</span>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* AI Agent block — log stream for onboarding, step cards for regular */}
        {isOnboarding ? (
          obLogs.length > 0 && (
            <>
              {/* Header card */}
              <div className="rounded-2xl border border-indigo-100 bg-gradient-to-b from-indigo-50/50 to-white overflow-hidden shadow-sm animate-[fadeIn_0.4s_ease] shrink-0">
                <div className="flex items-center gap-2.5 px-4 py-3">
                  <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0">
                    <DuoIcon icon="sitemap" className="text-white text-[11px]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest mb-0.5">AI Agent · Context Builder</p>
                    <p className="text-xs font-semibold text-gray-900 leading-snug">Build website sitemap context</p>
                  </div>
                  {obLogs[obLogs.length - 1]?.type !== "done" || obLogs.length < OB_LOGS.length
                    ? <Loader2 size={14} className="text-indigo-400 animate-spin shrink-0" />
                    : <CheckCircle2 size={14} className="text-green-500 shrink-0" />}
                </div>
              </div>
              {/* Streaming log entries */}
              {obLogs.map((log) => {
                const cfg: Record<ObLogType, { dot: string; text: string; bg: string; border: string }> = {
                  init:  { dot: "bg-gray-400",   text: "text-gray-500",   bg: "bg-gray-50",    border: "border-gray-100"   },
                  nav:   { dot: "bg-indigo-400 animate-pulse", text: "text-indigo-600 font-medium", bg: "bg-indigo-50/50", border: "border-indigo-100" },
                  find:  { dot: "bg-green-400",   text: "text-gray-700",   bg: "bg-white",      border: "border-gray-100"   },
                  sub:   { dot: "bg-violet-400",  text: "text-violet-700 font-semibold", bg: "bg-violet-50/60", border: "border-violet-100" },
                  agent: { dot: "bg-amber-400",   text: "text-amber-700",  bg: "bg-amber-50/50",border: "border-amber-100"  },
                  done:  { dot: "bg-green-500",   text: "text-green-700 font-semibold", bg: "bg-green-50",   border: "border-green-100"  },
                  synth: { dot: "bg-violet-500 animate-pulse", text: "text-violet-700 font-medium", bg: "bg-violet-50", border: "border-violet-100" },
                };
                const c = cfg[log.type];
                return (
                  <div key={log.id} className={`flex items-start gap-2.5 px-3 py-2 rounded-xl border ${c.bg} ${c.border} animate-[fadeIn_0.25s_ease]`}>
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 mt-1.5 ${c.dot}`} />
                    <span className={`text-[10.5px] leading-snug flex-1 ${c.text}`}>{log.text}</span>
                    <span className="text-[9px] text-gray-300 font-mono shrink-0 mt-0.5">{log.ts}</span>
                  </div>
                );
              })}
              <div ref={obLogsEndRef} />
            </>
          )
        ) : (
          showPrompt && (
            <div className="rounded-2xl border border-gray-200 overflow-hidden shadow-sm animate-[fadeIn_0.4s_ease]">
              {/* Card header */}
              <div className="flex items-center gap-2.5 px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-amber-50/80 to-white">
                <div className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center shrink-0">
                  <FaRobot size={11} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[9px] font-bold text-amber-600 uppercase tracking-widest mb-0.5">AI Agent · Step 1</p>
                  <p className="text-xs font-semibold text-gray-900 leading-snug">
                    Verify Admin can create &amp; publish a video
                  </p>
                </div>
                {activePromptStep > 0 && <Loader2 size={14} className="text-amber-500 animate-spin shrink-0" />}
                {activePromptStep === 0 && donePromptSteps.length === 5 && <CheckCircle2 size={14} className="text-green-500 shrink-0" />}
              </div>
              {/* Animated prompt steps */}
              {showAgentStep && (
                <div className="px-4 py-3 space-y-1">
                  {activeSteps.map(({ n, label }) => {
                    const isDone   = donePromptSteps.includes(n);
                    const isActive = activePromptStep === n;
                    return (
                      <div key={n}>
                        <div className={`flex items-start gap-2.5 px-2.5 py-2 rounded-xl transition-all duration-300 ${isActive ? "bg-amber-50 border border-amber-100" : "border border-transparent"}`}>
                          <div className="shrink-0 mt-0.5">
                            {isDone   ? <CheckCircle2 size={13} className="text-green-500" />
                            : isActive ? <Loader2 size={13} className="text-amber-500 animate-spin" />
                            : <Circle size={13} className="text-gray-200" />}
                          </div>
                          <span className={`text-[11px] leading-snug flex-1 ${isDone ? "text-gray-400" : isActive ? "text-gray-800 font-medium" : "text-gray-300"}`}>
                            {label}
                          </span>
                        </div>
                        {isActive && promptStepLog && (
                          <div className="flex items-center gap-2 mx-2.5 px-2.5 py-1.5 mb-0.5 rounded-lg bg-gray-50 border border-gray-100 animate-[fadeIn_0.2s_ease]">
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${promptStepLog.includes("✓") ? "bg-green-400" : "bg-amber-400 animate-pulse"}`} />
                            <span className={`text-[10px] flex-1 ${promptStepLog.includes("✓") ? "text-green-600 font-medium" : "text-gray-500"}`}>{promptStepLog}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )
        )}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <IndigoSidebar
        onNew={() => setDrawerOpen(true)}
        onNavigate={navigate}
        onBilling={() => navigate("/settings?section=billing")}
        activeItem="edit"
      />

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/tests")} className="flex items-center gap-1.5 text-gray-500 hover:text-gray-800 transition-colors text-sm font-medium">
              <ChevronLeft size={16} />
              Test Cases
            </button>
            <span className="text-gray-300">/</span>
            <span className="text-sm font-semibold text-gray-900">
              {isOnboarding ? "Website Context Run" : testId}
            </span>
            {phase === "prep" ? (
              <span className="flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block animate-pulse" />
                Preparing
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 inline-block" />
                Live
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-sm text-gray-500 font-mono bg-gray-100 px-3 py-1.5 rounded-lg">
              <Clock size={14} />
              {elapsed}
            </div>
          </div>
        </header>

        {/* Body */}
        <div className="flex-1 overflow-hidden flex gap-5 p-5">
          {/* Left panel — fixed position, content fades on phase switch */}
          <div className="w-80 shrink-0 bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col">
            <div
              className="flex-1 overflow-hidden flex flex-col transition-opacity duration-300"
              style={{ opacity: panelFade ? 1 : 0 }}
            >
              {phase === "prep" ? PrepPanel : AgentPanel}
            </div>
          </div>

          {/* Right panel */}
          <div className="flex-1 overflow-hidden flex flex-col">

            {/* Prep phase — three-zone dark canvas */}
            {phase === "prep" && (
              <div
                className="flex-1 bg-gray-950 rounded-xl border border-gray-800 overflow-hidden flex flex-col transition-opacity duration-300"
                style={{ opacity: panelFade ? 1 : 0 }}
              >
                <style>{`
                  @keyframes cqa-slide-in { from{opacity:0;transform:translateX(-18px)} to{opacity:1;transform:translateX(0)} }
                  @keyframes cqa-blink { 0%,49%{opacity:1} 50%,100%{opacity:0} }
                  @keyframes cqa-metric-glow { 0%{box-shadow:0 0 0 0 rgba(99,102,241,0.5)} 40%{box-shadow:0 0 0 6px rgba(99,102,241,0)} 100%{box-shadow:none} }
                  @keyframes cqa-node-pulse { 0%,100%{opacity:1} 50%{opacity:0.6} }
                `}</style>

                {/* Header */}
                <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-800 shrink-0">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Preparing Execution Environment</p>
                  <span className="ml-auto text-[10px] font-mono text-gray-600">{prepLines.length > 0 ? `[${prepLines[prepLines.length - 1].ts}]` : ""}</span>
                </div>

                {/* Zone 1 — Neural graph */}
                <div className="shrink-0 border-b border-gray-800/60" style={{ flex: "0 0 42%" }}>
                  <svg viewBox="0 0 400 200" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
                    {/* Background hex-dot grid */}
                    <defs>
                      <pattern id="prep-dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
                        <circle cx="1" cy="1" r="0.8" fill="rgba(99,102,241,0.12)" />
                      </pattern>
                    </defs>
                    <rect width="400" height="200" fill="url(#prep-dots)" />

                    {/* Connection lines + particles */}
                    {GRAPH_NODES.map((node, i) => {
                      const status = stepStatuses[i];
                      const shown   = status !== "pending";
                      const running = status === "running";
                      const done    = status === "done";
                      const dx = node.cx - GRAPH_CENTER.cx;
                      const dy = node.cy - GRAPH_CENTER.cy;
                      const len = Math.sqrt(dx * dx + dy * dy);
                      return (
                        <g key={`conn-${i}`}>
                          {/* Faint base line always visible */}
                          <line
                            x1={GRAPH_CENTER.cx} y1={GRAPH_CENTER.cy}
                            x2={node.cx} y2={node.cy}
                            stroke="#1F2937" strokeWidth="1" strokeDasharray="4 4"
                            opacity="0.25"
                          />
                          {/* Draw-out animated line — solid draw over the dashed ghost */}
                          <line
                            x1={GRAPH_CENTER.cx} y1={GRAPH_CENTER.cy}
                            x2={node.cx} y2={node.cy}
                            stroke={done ? "#10B981" : "#F59E0B"}
                            strokeWidth={running ? 1.5 : 1}
                            strokeDasharray={`${len} ${len}`}
                            strokeDashoffset={shown ? 0 : len}
                            opacity={shown ? 1 : 0}
                            style={{ transition: shown ? "stroke-dashoffset 0.65s ease-out, opacity 0.3s" : "none" }}
                          />
                          {/* Particle travels from node toward center while running */}
                          {running && (
                            <circle r={2.5} fill="#F59E0B" opacity={0.9}>
                              <animateMotion
                                dur="1.4s"
                                repeatCount="indefinite"
                                path={`M ${node.cx},${node.cy} L ${GRAPH_CENTER.cx},${GRAPH_CENTER.cy}`}
                              />
                            </circle>
                          )}
                        </g>
                      );
                    })}

                    {/* Center hex node */}
                    <polygon
                      points="200,82 215,91 215,109 200,118 185,109 185,91"
                      fill="#4F46E5" stroke="#818CF8" strokeWidth="1.5"
                    />

                    {/* Satellite nodes */}
                    {GRAPH_NODES.map((node, i) => {
                      const status = stepStatuses[i];
                      const shown   = status !== "pending";
                      const running = status === "running";
                      const done    = status === "done";
                      return (
                        <g key={`node-${i}`}>
                          <circle
                            cx={node.cx} cy={node.cy} r={16}
                            fill={done ? "#059669" : running ? "#D97706" : "#111827"}
                            stroke={done ? "#34D399" : running ? "#FCD34D" : "#374151"}
                            strokeWidth={running ? 2 : 1}
                            opacity={shown ? 1 : 0}
                            style={{
                              transition: "all 0.45s ease",
                              filter: running
                                ? "drop-shadow(0 0 7px rgba(245,158,11,0.7))"
                                : done
                                ? "drop-shadow(0 0 5px rgba(16,185,129,0.5))"
                                : "none",
                              animation: running ? "cqa-node-pulse 1.4s ease-in-out infinite" : "none",
                            }}
                          />
                          <foreignObject
                            x={node.cx - 9} y={node.cy - 9}
                            width={18} height={18}
                            opacity={shown ? 1 : 0}
                            style={{ transition: "opacity 0.4s", overflow: "visible" }}
                          >
                            <div style={{ width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>
                              {done
                                ? <span style={{ color: "white", fontSize: 11, fontWeight: 700, lineHeight: 1 }}>✓</span>
                                : <i className={`fa-duotone solid fa-${node.icon}`} style={{ fontSize: 10, color: running ? "white" : "#6B7280", ["--fa-primary-color" as string]: running ? "white" : "#9CA3AF", ["--fa-secondary-color" as string]: running ? "#FDE68A" : "#D1D5DB" }} />
                              }
                            </div>
                          </foreignObject>
                        </g>
                      );
                    })}
                  </svg>
                </div>

                {/* Zone 3 — Enhanced terminal */}
                <div className="flex-1 overflow-y-auto px-4 py-3 font-mono" ref={(el) => { if (el) el.scrollTop = el.scrollHeight; }}>
                  {prepLines.map(({ text, ts }, i) => {
                    const isLast = i === prepLines.length - 1;
                    const isDone = text.includes("✓") || text.includes("ready") || text.includes("All");
                    return (
                      <div
                        key={i}
                        className="flex items-start gap-2.5 mb-1.5"
                        style={{ animation: "cqa-slide-in 0.25s ease forwards" }}
                      >
                        <span className="text-[10px] text-gray-600 tabular-nums shrink-0 mt-px">[{ts}]</span>
                        {isLast
                          ? <span className="text-amber-400 shrink-0 mt-px">›</span>
                          : isDone
                          ? <span className="text-green-400 shrink-0 mt-px">✓</span>
                          : <span className="text-gray-600 shrink-0 mt-px">·</span>
                        }
                        <span className={`text-[11px] leading-relaxed flex-1 ${
                          isLast  ? "text-gray-200" :
                          isDone  ? "text-green-400" :
                                    "text-gray-500"
                        }`}>
                          {text}
                          {isLast && (
                            <span
                              className="inline-block w-1.5 h-3 bg-amber-400 ml-1 align-text-bottom"
                              style={{ animation: "cqa-blink 1s step-start infinite" }}
                            />
                          )}
                        </span>
                      </div>
                    );
                  })}
                  {prepLines.length === 0 && (
                    <p className="text-[11px] text-gray-700 italic">Initialising…</p>
                  )}
                </div>
              </div>
            )}

            {/* Agent phase — fake browser UI */}
            {phase === "agent" && (
              <div className="flex-1 overflow-hidden animate-[fadeIn_0.4s_ease]">
                {isOnboarding
                  ? <OnboardingBrowser url={obUrl} cursorX={obCursorX} cursorY={obCursorY} clicking={obClicking} />
                  : <FakeBrowser activePromptStep={activePromptStep} donePromptSteps={donePromptSteps} />
                }
              </div>
            )}
          </div>
        </div>
      </div>
      <AddContextDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      {isOnboarding && obModalVisible && (
        <FirstJourneyModal
          onKeepCrawling={() => setObModalVisible(false)}
          onDashboard={() => navigate("/context")}
        />
      )}
    </div>
  );
}
