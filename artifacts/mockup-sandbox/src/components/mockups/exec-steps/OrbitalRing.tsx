import { useState, useEffect } from "react";

const TIMING = {
  s1Start: 500,   s1L1: 900,  s1L2: 1700, s1L3: 2500, s1Done: 3200,
  s2Start: 3400,  s2Done: 5100,
  s3Start: 5300,  s3Done: 6600,
  prereqDone: 6800, promptShow: 7200, agentStart: 7600,
  LOOP: 10000,
};

export function OrbitalRing() {
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
    { n: 1, main: "Enter @|username| in Email/Username field" },
    { n: 2, main: "Enter @|password| in Password field"       },
    { n: 3, main: "Click on Login"                            },
  ];

  return (
    <div className="min-h-screen bg-white flex items-start justify-center p-4">
      <div className="w-80">

        {/* Tabs with underline indicator */}
        <div className="flex items-center border-b-2 border-gray-100 mb-3">
          {["Steps","Console","Network"].map(t => (
            <button key={t} className={`py-2.5 px-3 text-xs font-bold tracking-wide border-b-2 -mb-0.5 transition-colors ${t === "Steps" ? "border-indigo-500 text-indigo-600" : "border-transparent text-gray-400"}`}>{t}</button>
          ))}
        </div>

        {/* Prerequisite — timeline style */}
        <div className="mb-3">
          {/* Section label */}
          <div className="flex items-center gap-2 mb-2.5">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-100">
              <svg className="w-3 h-3 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
              <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-widest">Prerequisite</span>
            </div>
            <span className="text-xs font-semibold text-gray-700 flex-1 truncate">Login as Super Admin user</span>
            {prereqDone
              ? <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Complete</span>
              : active > 0
              ? <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full animate-pulse">Running</span>
              : <span className="text-[10px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">Pending</span>}
          </div>

          {/* test1_user_credentials context */}
          <div className="flex items-center gap-2 px-3 py-1.5 mb-2 bg-gray-50 rounded-lg text-[10px] text-gray-500">
            <span className="font-bold text-gray-600">1. test1_user_credentials</span>
            <span className="bg-blue-100 text-blue-600 font-bold px-1.5 py-0.5 rounded text-[9px]">LOOP</span>
            <span className="bg-gray-200 text-gray-600 font-bold px-1.5 py-0.5 rounded text-[9px]">FOR</span>
            <span className="ml-auto flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-400" />Iter 1</span>
          </div>

          {/* Timeline steps */}
          <div className="relative pl-4">
            {/* Vertical guide */}
            <div className="absolute left-4 top-3 bottom-3 w-px bg-gray-100" />

            {sub.map(({ n, main }) => {
              const isDone   = done.includes(n);
              const isActive = active === n;
              return (
                <div key={n} className="relative mb-1 last:mb-0">
                  {/* Step row */}
                  <div className={`relative flex items-start gap-3 pl-5 pr-3 py-2.5 rounded-xl transition-all duration-300 ${isActive ? "bg-indigo-50 shadow-[0_0_0_1px_rgba(99,102,241,0.25)]" : "bg-transparent"}`}>
                    {/* Node on the timeline */}
                    <div className="absolute left-2.5 top-3 -translate-x-1/2 z-10">
                      {isDone ? (
                        <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center shadow-sm">
                          <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        </div>
                      ) : isActive ? (
                        <div className="relative">
                          <span className="absolute inset-0 w-4 h-4 rounded-full bg-indigo-400/40 animate-ping" />
                          <div className="relative w-4 h-4 rounded-full bg-indigo-600 flex items-center justify-center shadow-md">
                            <svg className="w-2 h-2 text-white animate-spin" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z"/></svg>
                          </div>
                        </div>
                      ) : (
                        <div className="w-4 h-4 rounded-full bg-white border-2 border-gray-200" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-[11px] leading-snug ${isDone ? "text-gray-600" : isActive ? "text-indigo-800 font-semibold" : "text-gray-300"}`}>
                        1.{n}. {main.split(/(@\|[^|]+\|)/g).map((p, i) =>
                          p.startsWith("@|")
                            ? <span key={i} className={`font-mono ${isDone ? "text-gray-500" : isActive ? "text-indigo-600" : "text-gray-300"}`}>{p}</span>
                            : p
                        )}
                      </p>

                      {/* Inline logs for step 1 */}
                      {n === 1 && logs.length > 0 && (
                        <div className="mt-1.5 space-y-0.5 border-l-2 border-indigo-200 pl-2">
                          {logs.map((log, i) => (
                            <div key={i} className="flex items-center gap-1.5 text-[10px]">
                              <span className={`shrink-0 ${log.text.includes("✓") ? "text-emerald-500" : "text-gray-400"}`}>
                                {log.text.includes("✓") ? "✓" : "·"}
                              </span>
                              <span className={log.text.includes("✓") ? "text-emerald-600" : "text-gray-500"}>{log.text}</span>
                              <span className="ml-auto text-gray-400 font-mono">{log.ms}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {isDone && <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full shrink-0 mt-0.5">Done</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Prompt section — card with amber accent */}
        {showPrompt && (
          <div style={{ animation: "fadeIn .4s ease" }}>
            <div className="flex items-center gap-2 mb-2.5">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200">
                <svg className="w-3 h-3 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                <span className="text-[10px] font-bold text-amber-700 uppercase tracking-widest">AI Agent</span>
              </div>
              <span className="text-xs font-semibold text-gray-700 flex-1 leading-snug">Verify Admin can create, design, and publish a new video content item</span>
            </div>

            {agentRunning && (
              <div className="rounded-xl border border-amber-200 bg-amber-50/60 overflow-hidden">
                <div className="flex items-center gap-2 px-3 py-2 border-b border-amber-200/60">
                  <svg className="w-3.5 h-3.5 text-amber-600 animate-spin" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z"/></svg>
                  <span className="text-[11px] font-bold text-amber-800">1. AI Agent</span>
                  <span className="text-[9px] font-bold bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded ml-1">AI Agent</span>
                  <span className="ml-auto text-[10px] text-amber-600 font-mono">0ms</span>
                </div>
                <div className="px-3 py-2.5 text-[10px] text-gray-600 space-y-1.5 leading-relaxed">
                  <p>1. Navigate to the Admin content browse page at <span className="text-indigo-600 font-semibold">$(contentbrowseurl)</span>.</p>
                  <p>2. Click the '+ Create' button in the top right corner.</p>
                  <p>3. Select <span className="text-indigo-600 font-semibold">$(contenttype)</span> from the Type dropdown.</p>
                  <p>4. Enter <span className="text-indigo-600 font-semibold">$(contenttitle)</span> into the Title field.</p>
                  <p>5. Click 'Publish' and verify the item appears in the list.</p>
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
