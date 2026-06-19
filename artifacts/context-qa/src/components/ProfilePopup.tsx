import React, { useEffect, useRef } from "react";
import avatarImg from "@assets/avatar_1777246076722.png";

function DuoIcon({ icon, className = "" }: { icon: string; className?: string }) {
  return <i className={`fa-duotone solid fa-${icon} ${className}`} />;
}

const CREDITS_TOTAL = 5_000;
const CREDITS_REMAINING = 1_222;
const REMAINING_PCT = CREDITS_REMAINING / CREDITS_TOTAL;

const USAGE_SEGMENTS = [
  { label: "AI Test Gen",  credits: 1_876, color: "bg-indigo-400" },
  { label: "Test Runs",    credits: 1_234, color: "bg-violet-400" },
  { label: "Step Groups",  credits:   432, color: "bg-blue-400"  },
  { label: "Scheduled",    credits:   236, color: "bg-amber-400" },
];

interface ProfilePopupProps {
  open: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
  onBilling: () => void;
}

const MENU_GROUPS = [
  [
    { icon: "gear",               label: "Settings",       action: "settings" },
    { icon: "credit-card",        label: "Billing & Plan", action: "billing"  },
  ],
  [
    { icon: "right-from-bracket", label: "Sign Out",       action: "signout"  },
  ],
];

export function ProfilePopup({ open, onClose, onNavigate, onBilling }: ProfilePopupProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, onClose]);

  if (!open) return null;

  const r = 10;
  const circ = 2 * Math.PI * r;
  const used = (1 - REMAINING_PCT) * circ;

  function handleAction(action: string) {
    onClose();
    if (action === "settings") onNavigate("/settings");
    else if (action === "billing") onBilling();
    else if (action === "signout") onNavigate("/");
  }

  return (
    <div
      ref={ref}
      className="absolute left-full bottom-0 ml-2 z-50 w-[260px] bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden"
      style={{ animation: "cqa-popup-in 0.15s cubic-bezier(0.34,1.56,0.64,1) both" }}
    >
      <style>{`
        @keyframes cqa-popup-in {
          from { opacity:0; transform: scale(0.92) translateY(8px); }
          to   { opacity:1; transform: scale(1)    translateY(0);   }
        }
      `}</style>

      {/* ── User header ── */}
      <div className="px-4 pt-4 pb-3 flex items-center gap-3">
        <img
          src={avatarImg}
          alt="Sean Carter"
          className="w-10 h-10 rounded-full object-cover object-top shrink-0 ring-2 ring-gray-100"
        />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">Sean Carter</p>
          <p className="text-[11px] text-gray-400 truncate">sean@acmecorp.com</p>
        </div>
      </div>

      <div className="h-px bg-gray-100 mx-3" />

      {/* ── Balance section ── */}
      <div className="px-4 pt-3 pb-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <svg width="22" height="22" viewBox="0 0 24 24" className="shrink-0">
              <circle cx="12" cy="12" r={r} fill="none" stroke="#e0e7ff" strokeWidth="2.5" />
              <circle
                cx="12" cy="12" r={r} fill="none"
                stroke="#6366f1" strokeWidth="2.5"
                strokeDasharray={circ}
                strokeDashoffset={used}
                strokeLinecap="round"
                transform="rotate(-90 12 12)"
              />
            </svg>
            <span className="text-sm font-semibold text-gray-900">Balance</span>
          </div>
          <button
            onClick={() => handleAction("billing")}
            className="text-[11px] font-semibold px-3 py-1 rounded-lg border border-indigo-200 text-indigo-600 hover:bg-indigo-50 transition-colors"
          >
            Upgrade
          </button>
        </div>

        {/* Stacked usage bar */}
        <div className="w-full h-2.5 rounded-full overflow-hidden flex bg-gray-100">
          {USAGE_SEGMENTS.map((seg) => (
            <div
              key={seg.label}
              className={`${seg.color} h-full flex-none`}
              style={{ width: `${(seg.credits / CREDITS_TOTAL) * 100}%` }}
            />
          ))}
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 mt-2.5">
          {USAGE_SEGMENTS.map((seg) => (
            <div key={seg.label} className="flex items-center gap-1.5 min-w-0">
              <span className={`w-2 h-2 rounded-sm flex-shrink-0 ${seg.color}`} />
              <span className="text-[10px] text-gray-500 truncate">{seg.label}</span>
              <span className="text-[10px] font-semibold text-gray-700 tabular-nums ml-auto">{seg.credits.toLocaleString()}</span>
            </div>
          ))}
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="w-2 h-2 rounded-sm flex-shrink-0 bg-gray-200" />
            <span className="text-[10px] text-gray-500">Available</span>
            <span className="text-[10px] font-semibold text-indigo-600 tabular-nums ml-auto">{CREDITS_REMAINING.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="h-px bg-gray-100 mx-3" />

      {/* ── Current workspace ── */}
      <div className="px-4 py-3">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">Current workspace</p>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-900 leading-tight">Web Workspace</p>
            <p className="text-[11px] text-gray-400 mt-0.5">Free plan</p>
          </div>
          <button className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors">
            <DuoIcon icon="arrows-rotate" className="text-xs" />
          </button>
        </div>
      </div>

      <div className="h-px bg-gray-100 mx-3" />

      {/* ── Menu items ── */}
      {MENU_GROUPS.map((group, gi) => (
        <React.Fragment key={gi}>
          <div className="py-1.5 px-2">
            {group.map((item) => (
              <button
                key={item.action}
                onClick={() => handleAction(item.action)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors text-left ${
                  item.action === "signout"
                    ? "text-red-500 hover:bg-red-50"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <span className={`text-base ${item.action === "signout" ? "text-red-400" : "text-gray-400"}`}>
                  <DuoIcon icon={item.icon} />
                </span>
                {item.label}
              </button>
            ))}
          </div>
          {gi < MENU_GROUPS.length - 1 && <div className="h-px bg-gray-100 mx-3" />}
        </React.Fragment>
      ))}

      <div className="h-2" />
    </div>
  );
}

/* ── Sidebar credits arc + profile button ─────────────────────────────────── */
interface SidebarProfileProps {
  onNavigate: (path: string) => void;
  onBilling: () => void;
}

export function SidebarProfile({ onNavigate, onBilling }: SidebarProfileProps) {
  const [open, setOpen] = React.useState(false);

  const r = 14;
  const circ = 2 * Math.PI * r;
  const remaining = REMAINING_PCT * circ;
  const used = circ - remaining;

  return (
    <div className="relative w-full flex flex-col items-center gap-1 pb-1">
      <button
        onClick={() => setOpen((v) => !v)}
        title="Profile & Credits"
        className="relative w-10 h-10 flex items-center justify-center"
      >
        <svg width="40" height="40" viewBox="0 0 40 40" className="absolute inset-0">
          <circle cx="20" cy="20" r={r} fill="none" stroke="rgba(74,222,128,0.22)" strokeWidth="3.5" />
          <circle
            cx="20" cy="20" r={r} fill="none"
            stroke={REMAINING_PCT < 0.10 ? "#F59E0B" : "#22C55E"}
            strokeWidth="3.5"
            strokeDasharray={circ}
            strokeDashoffset={used}
            strokeLinecap="round"
            transform="rotate(-90 20 20)"
            style={{ transition: "stroke-dashoffset 0.6s ease" }}
          />
        </svg>
        <img
          src={avatarImg}
          alt="Profile"
          className="relative z-10 w-5 h-5 rounded-full object-cover object-top"
        />
      </button>

      <ProfilePopup
        open={open}
        onClose={() => setOpen(false)}
        onNavigate={onNavigate}
        onBilling={onBilling}
      />
    </div>
  );
}
