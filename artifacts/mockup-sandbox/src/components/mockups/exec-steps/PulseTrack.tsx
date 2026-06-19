import { useState, useEffect } from "react";
import { CheckCircle2, Circle, Loader2, ChevronDown, Link2, Repeat } from "lucide-react";

const TIMING = {
  s1Start: 500,   s1L1: 900,  s1L2: 1700, s1L3: 2500, s1Done: 3200,
  s2Start: 3400,  s2Done: 5100,
  s3Start: 5300,  s3Done: 6600,
  prereqDone: 6800, promptShow: 7200, agentStart: 7600,
  LOOP: 10000,
};

type Phase = "idle" | "running" | "done";

export function PulseTrack() {
  const [active, setActive]       = useState<0|1|2|3>(0);
  const [done, setDone]           = useState<number[]>([]);
  const [logs, setLogs]           = useState<{ text: string; ms: string }[]>([]);
  const [prereqDone, setPrereqDone] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [agentRunning, setAgentRunning] = useState(false);

  useEffect(() => {
    let timers: ReturnType<typeof setTimeout>[] = [];
    function schedule(ms: number, fn: () => void) { timers.push(setTimeout(fn, ms)); }

    function start() {
      setActive(0); setDone([]); setLogs([]); setPrereqDone(false); setShowPrompt(false); setAgentRunning(false);
      schedule(TIMING.s1Start, () => setActive(1));
      schedule(TIMING.s1L1,   () => setLogs([{ text: "Started executing step", ms: "0ms" }]));
      schedule(TIMING.s1L2,   () => setLogs(p => [...p, { text: "Searching for element on screen", ms: "311ms" }]));
      schedule(TIMING.s1L3,   () => setLogs(p => [...p, { text: "Element found on screen ✓", ms: "22ms" }]));
      schedule(TIMING.s1Done, () => { setActive(0); setDone(p => [...p, 1]); });
      schedule(TIMING.s2Start,() => setActive(2));
      schedule(TIMING.s2Done, () => { setActive(0); setDone(p => [...p, 2]); });
      schedule(TIMING.s3Start,() => setActive(3));
      schedule(TIMING.s3Done, () => { setActive(0); setDone(p => [...p, 3]); });
      schedule(TIMING.prereqDone, () => setPrereqDone(true));
      schedule(TIMING.promptShow, () => setShowPrompt(true));
      schedule(TIMING.agentStart, () => setAgentRunning(true));
    }

    start();
    const loop = setInterval(() => { timers.forEach(clearTimeout); timers = []; start(); }, TIMING.LOOP);
    return () => { timers.forEach(clearTimeout); clearInterval(loop); };
  }, []);

  const sub = [
    { n: 1, label: <>Enter <code className="text-indigo-600 text-[10px] bg-indigo-50 px-1 rounded">@|username|</code> in the <b className="text-gray-700">Email/Username</b> field</> },
    { n: 2, label: <>Enter <code className="text-indigo-600 text-[10px] bg-indigo-50 px-1 rounded">@|password|</code> in the <b className="text-gray-700">Password</b> field</> },
    { n: 3, label: <>Click on <b className="text-gray-700">Login</b></> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center p-4">
      <div className="w-80 space-y-2.5">

        {/* Tabs */}
        <div className="flex items-center bg-white rounded-xl border border-gray-200 px-4 pt-1">
          {["Steps","Console","Network"].map(t => (
            <button key={t} className={`py-2.5 mr-4 text-xs font-semibold border-b-2 ${t === "Steps" ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-400"}`}>{t}</button>
          ))}
        </div>

        {/* Prerequisite card */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 border-b border-gray-100">
            <ChevronDown size={13} className="text-gray-400" />
            <Link2 size={12} className="text-gray-500" />
            <span className="text-xs font-semibold text-gray-800 flex-1">Prerequisite: Login as Super Admin user</span>
            <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold flex items-center justify-center">1</span>
          </div>

          <div className="px-3 py-2.5 space-y-2">
            {/* Row: test1_user_credentials */}
            <div className="flex items-center gap-2">
              {prereqDone
                ? <CheckCircle2 size={13} className="text-green-500 shrink-0" />
                : active > 0
                ? <Loader2 size={13} className="text-indigo-500 animate-spin shrink-0" />
                : <Circle size={13} className="text-gray-300 shrink-0" />}
              <span className="text-[11px] font-semibold text-gray-700">1. test1_user_credentials</span>
              <span className="text-[9px] font-bold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">LOOP</span>
              <span className="text-[9px] font-bold bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">FOR</span>
            </div>
            <div className="flex items-center gap-2 pl-4 text-[10px] text-gray-400">
              <span className="font-medium">Iteration:</span>
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />Iter 1</span>
              <span className="text-gray-300">|</span>
              <span>Default: last Iteration</span>
            </div>

            {/* Sub-steps with inline log */}
            <div className="pl-4 space-y-1.5 mt-1">
              {sub.map(({ n, label }) => {
                const isDone   = done.includes(n);
                const isActive = active === n;
                return (
                  <div key={n}>
                    <div className={`flex items-start gap-1.5 px-2 py-1.5 rounded-lg transition-colors ${isActive ? "bg-indigo-50" : "bg-transparent"}`}>
                      {isDone   ? <CheckCircle2 size={11} className="text-green-500 shrink-0 mt-0.5" />
                      : isActive ? <Loader2 size={11} className="text-indigo-400 animate-spin shrink-0 mt-0.5" />
                      : <Circle size={11} className="text-gray-300 shrink-0 mt-0.5" />}
                      <span className={`text-[11px] leading-snug ${isDone ? "text-gray-600" : isActive ? "text-indigo-800 font-medium" : "text-gray-400"}`}>
                        1.{n}. {label}
                      </span>
                    </div>
                    {n === 1 && logs.length > 0 && (
                      <div className="pl-6 mt-1 space-y-0.5">
                        {logs.map((log, i) => (
                          <div key={i} className="flex items-center gap-2 text-[10px] text-gray-400">
                            {log.text.includes("✓")
                              ? <span className="w-3 h-3 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0 text-[8px]">✓</span>
                              : <Circle size={6} className="text-gray-300 shrink-0" />}
                            <span>{log.text}</span>
                            <span className="ml-auto text-gray-300 font-mono">{log.ms}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Prompt card */}
        {showPrompt && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm" style={{ animation: "fadeIn .4s ease" }}>
            <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 border-b border-gray-100">
              <ChevronDown size={13} className="text-gray-400" />
              <span className="text-xs font-semibold text-gray-800 flex-1">Verify Admin can create, design, and publish a new video content item</span>
              <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold flex items-center justify-center">1</span>
            </div>
            {agentRunning && (
              <div className="px-3 py-2.5">
                <div className="flex items-center gap-2 mb-2">
                  <Loader2 size={13} className="text-indigo-500 animate-spin shrink-0" />
                  <span className="text-[11px] font-semibold text-gray-700">1. AI Agent</span>
                  <span className="text-[9px] font-bold bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded">AI Agent</span>
                  <span className="ml-auto text-[10px] text-gray-400">0ms</span>
                </div>
                <div className="ml-4 rounded-lg border border-amber-200 bg-amber-50/60 px-3 py-2.5">
                  <p className="text-[9px] font-bold text-amber-700 uppercase tracking-wider mb-1.5">Prompt</p>
                  <div className="text-[10px] text-gray-600 space-y-1 leading-relaxed">
                    <p>1. Navigate to the Admin content browse page at <span className="text-indigo-600">$(contentbrowseurl)</span>.</p>
                    <p>2. Click the '+ Create' button in the top right corner.</p>
                    <p>3. Select <span className="text-indigo-600">$(contenttype)</span> from the Type dropdown.</p>
                    <p>4. Enter <span className="text-indigo-600">$(contenttitle)</span> into the Title field.</p>
                    <p>5. Click 'Publish' and verify the item appears in the list.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }`}</style>
    </div>
  );
}
