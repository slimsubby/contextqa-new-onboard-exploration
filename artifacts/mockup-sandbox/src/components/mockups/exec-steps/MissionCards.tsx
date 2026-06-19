import { useState, useEffect } from "react";

const TIMING = {
  s1Start: 500,   s1L1: 900,  s1L2: 1700, s1L3: 2500, s1Done: 3200,
  s2Start: 3400,  s2Done: 5100,
  s3Start: 5300,  s3Done: 6600,
  prereqDone: 6800, promptShow: 7200, agentStart: 7600,
  LOOP: 10000,
};

export function MissionCards() {
  const [active, setActive]         = useState<0|1|2|3>(0);
  const [done, setDone]             = useState<number[]>([]);
  const [logs, setLogs]             = useState<{ text: string; ms: string }[]>([]);
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
      schedule(TIMING.prereqDone,  () => setPrereqDone(true));
      schedule(TIMING.promptShow,  () => setShowPrompt(true));
      schedule(TIMING.agentStart,  () => setAgentRunning(true));
    }
    start();
    const loop = setInterval(() => { timers.forEach(clearTimeout); timers = []; start(); }, TIMING.LOOP);
    return () => { timers.forEach(clearTimeout); clearInterval(loop); };
  }, []);

  const sub = [
    { n: 1, label: "Enter @|username| in Email/Username field", param: "@|username|" },
    { n: 2, label: "Enter @|password| in Password field",       param: "@|password|" },
    { n: 3, label: "Click on Login",                            param: null          },
  ];

  function StatusDot({ n }: { n: number }) {
    const isDone   = done.includes(n);
    const isActive = active === n;
    return (
      <div className="relative flex items-center justify-center w-5 h-5 shrink-0">
        {isActive && <span className="absolute w-5 h-5 rounded-full bg-violet-400/30 animate-ping" />}
        <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center transition-all duration-300 ${
          isDone   ? "bg-emerald-500"
          : isActive ? "bg-violet-500 scale-110"
          : "bg-gray-200"
        }`}>
          {isDone && <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
          {isActive && <svg className="w-2 h-2 text-white animate-spin" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z"/></svg>}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-start justify-center p-4 font-mono">
      <div className="w-80 space-y-2">

        {/* Tabs — dark */}
        <div className="flex items-center border-b border-slate-700 px-1">
          {["Steps","Console","Network"].map(t => (
            <button key={t} className={`py-2 mr-4 text-[11px] font-bold tracking-wide border-b-2 transition-colors ${t === "Steps" ? "border-violet-500 text-violet-400" : "border-transparent text-slate-500 hover:text-slate-300"}`}>{t}</button>
          ))}
        </div>

        {/* Prerequisite card — dark */}
        <div className="rounded-xl border border-slate-700 overflow-hidden bg-slate-900">
          {/* Header */}
          <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-800 border-b border-slate-700">
            <svg className="w-3 h-3 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            <svg className="w-3 h-3 text-slate-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
            <span className="text-[11px] font-bold text-slate-200 flex-1">Prerequisite: Login as Super Admin user</span>
            <span className="w-5 h-5 rounded-full bg-violet-900 text-violet-300 text-[10px] font-bold flex items-center justify-center">1</span>
          </div>

          <div className="px-3 py-3 space-y-2">
            {/* test1_user_credentials header */}
            <div className="flex items-center gap-2">
              {prereqDone
                ? <span className="text-emerald-400 text-xs">✓</span>
                : active > 0
                ? <svg className="w-3 h-3 text-violet-400 animate-spin shrink-0" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z"/></svg>
                : <span className="w-2 h-2 rounded-full bg-slate-600 inline-block" />}
              <span className="text-[11px] font-bold text-slate-300">1. test1_user_credentials</span>
              <span className="text-[9px] font-bold bg-blue-900/60 text-blue-400 border border-blue-800 px-1.5 py-0.5 rounded">LOOP</span>
              <span className="text-[9px] font-bold bg-slate-700 text-slate-400 border border-slate-600 px-1.5 py-0.5 rounded">FOR</span>
            </div>
            <div className="flex items-center gap-2 pl-4 text-[10px] text-slate-500">
              <span className="font-medium text-slate-400">Iteration:</span>
              <span className="flex items-center gap-1 text-emerald-500"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />Iter 1</span>
              <span className="text-slate-700">|</span>
              <span>Default: last Iteration</span>
            </div>

            {/* Sub-steps */}
            <div className="pl-4 space-y-1 mt-1">
              {sub.map(({ n, label }) => {
                const isDone   = done.includes(n);
                const isActive = active === n;
                return (
                  <div key={n}>
                    <div className={`flex items-start gap-2 px-2 py-1.5 rounded-lg transition-colors ${isActive ? "bg-violet-950/60 border border-violet-800/60" : "border border-transparent"}`}>
                      <StatusDot n={n} />
                      <div className="flex-1 min-w-0">
                        <span className={`text-[11px] leading-snug ${isDone ? "text-slate-400" : isActive ? "text-violet-200 font-semibold" : "text-slate-600"}`}>
                          1.{n}. {label.split(/([@|][^|]+[|]|Login)/).map((part, i) =>
                            /[@|]/.test(part) || part === "Login"
                              ? <span key={i} className={isDone ? "text-slate-400" : isActive ? "text-violet-300" : "text-slate-600"}>{part}</span>
                              : part
                          )}
                        </span>
                        {isActive && (
                          <div className="flex items-center gap-1 mt-0.5">
                            {[0,1,2].map(j => <span key={j} className="w-1 h-1 rounded-full bg-violet-500 animate-bounce" style={{ animationDelay: `${j*0.12}s` }} />)}
                          </div>
                        )}
                      </div>
                      {isDone && <span className="text-[9px] text-emerald-500 font-bold shrink-0 mt-0.5">done</span>}
                    </div>
                    {n === 1 && logs.length > 0 && (
                      <div className="pl-6 mt-0.5 space-y-0.5 bg-slate-950/40 rounded-lg p-1.5 mx-1">
                        {logs.map((log, i) => (
                          <div key={i} className="flex items-center gap-2 text-[10px]">
                            <span className={log.text.includes("✓") ? "text-emerald-500" : "text-slate-500"}>›</span>
                            <span className={log.text.includes("✓") ? "text-emerald-400" : "text-slate-500"}>{log.text}</span>
                            <span className="ml-auto text-slate-700 font-mono">{log.ms}</span>
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

        {/* Prompt card — dark */}
        {showPrompt && (
          <div className="rounded-xl border border-slate-700 overflow-hidden bg-slate-900" style={{ animation: "fadeIn .4s ease" }}>
            <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-800 border-b border-slate-700">
              <svg className="w-3 h-3 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              <span className="text-[11px] font-bold text-slate-200 flex-1 font-sans">Verify Admin can create, design, and publish a new video content item</span>
              <span className="w-5 h-5 rounded-full bg-violet-900 text-violet-300 text-[10px] font-bold flex items-center justify-center">1</span>
            </div>
            {agentRunning && (
              <div className="px-3 py-2.5">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-3.5 h-3.5 text-violet-400 animate-spin shrink-0" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z"/></svg>
                  <span className="text-[11px] font-bold text-slate-300 font-sans">1. AI Agent</span>
                  <span className="text-[9px] font-bold bg-violet-900/60 text-violet-300 border border-violet-800 px-1.5 py-0.5 rounded font-sans">AI Agent</span>
                  <span className="ml-auto text-[10px] text-slate-500">0ms</span>
                </div>
                <div className="ml-4 rounded-lg border border-amber-900/60 bg-amber-950/30 px-3 py-2.5">
                  <p className="text-[9px] font-bold text-amber-500 uppercase tracking-wider mb-1.5 font-sans">Prompt</p>
                  <div className="text-[10px] text-slate-400 space-y-1 leading-relaxed font-sans">
                    <p>1. Navigate to the Admin content browse page at <span className="text-violet-400">$(contentbrowseurl)</span>.</p>
                    <p>2. Click the '+ Create' button in the top right corner.</p>
                    <p>3. Select <span className="text-violet-400">$(contenttype)</span> from the Type dropdown.</p>
                    <p>4. Enter <span className="text-violet-400">$(contenttitle)</span> into the Title field.</p>
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
