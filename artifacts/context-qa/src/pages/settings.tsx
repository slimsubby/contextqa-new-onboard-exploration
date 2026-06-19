import React, { useState } from "react";
import avatarImg from "@assets/avatar_1777246076722.png";
import { useLocation, useSearch } from "wouter";
import { AddContextDrawer } from "../components/AddContextDrawer";
import { IndigoSidebar } from "../components/IndigoSidebar";
import { WorkspaceDropdown } from "../components/WorkspaceDropdown";
import { Check, X, ChevronRight, Search } from "lucide-react";


// ── Settings sections ─────────────────────────────────────────────────────────
const SECTIONS = [
  { id: "profile",       label: "Profile",        icon: "circle-user",        color: "text-indigo-500" },
  { id: "general",       label: "General",        icon: "sliders",            color: "text-gray-500" },
  { id: "team",          label: "Team",            icon: "users",              color: "text-indigo-500" },
  { id: "integrations",  label: "Integrations",   icon: "plug-circle-bolt",   color: "text-violet-500" },
  { id: "notifications", label: "Alerts",          icon: "bell",               color: "text-amber-500" },
  { id: "security",      label: "Security",        icon: "shield-halved",      color: "text-green-500" },
  { id: "billing",       label: "Billing",         icon: "credit-card",        color: "text-blue-500" },
  { id: "api",           label: "API Keys",        icon: "code",               color: "text-pink-500" },
  { id: "audit",         label: "Audit Log",       icon: "list-check",         color: "text-orange-500" },
];

// ── Integration cards ─────────────────────────────────────────────────────────
const INTEGRATIONS = [
  {
    id: "jira", name: "Jira", cat: "bug",
    fa: "fa-brands fa-jira", color: "#0052CC", bgColor: "#E8F0FE",
    desc: "Enable your team to stay connected to your favorite Atlassian Jira Product, to raise bugs, check status and rerun on closure.",
    enabled: true,
  },
  {
    id: "slack", name: "Slack", cat: "notifications",
    fa: "fa-brands fa-slack", color: "#611f69", bgColor: "#F5F0FF",
    desc: "Connect to Slack to get notifications for your test run instantly.",
    enabled: false,
  },
  {
    id: "github", name: "GitHub", cat: "cicd",
    fa: "fa-brands fa-github", color: "#24292F", bgColor: "#F0F0F0",
    desc: "Enable your team to report a bug on GitHub, track status and rerun on closure of bug without leaving ContextQA.",
    enabled: false,
  },
  {
    id: "azure", name: "Azure DevOps", cat: "bug",
    fa: "fa-brands fa-microsoft", color: "#0078D4", bgColor: "#E6F3FF",
    desc: "Enable your team to report a bug on Azure DevOps Boards, track status and rerun on closure of bug without leaving ContextQA.",
    enabled: false,
  },
  {
    id: "linear", name: "Linear", cat: "bug",
    fa: "fa-duotone solid fa-circle-half-stroke", color: "#5E6AD2", bgColor: "#EEF0FB",
    desc: "Enable your team to report a bug on Linear, track status and rerun on closure of bug without leaving ContextQA.",
    enabled: false,
  },
  {
    id: "figma", name: "Figma", cat: "design",
    fa: "fa-brands fa-figma", color: "#F24E1E", bgColor: "#FFF0ED",
    desc: "Enable your team to report a bug on Figma, track status and rerun on closure of bug without leaving ContextQA.",
    enabled: false,
  },
  {
    id: "jenkins", name: "Jenkins", cat: "cicd",
    fa: "fa-duotone solid fa-gears", color: "#D33833", bgColor: "#FFF0F0",
    desc: "Trigger test executions directly from Jenkins pipelines and get results back in your CI/CD workflow.",
    enabled: true,
  },
  {
    id: "aws", name: "AWS", cat: "cloud",
    fa: "fa-brands fa-aws", color: "#FF9900", bgColor: "#FFF7E6",
    desc: "Connect your AWS account to spin up isolated cloud environments for test execution at scale.",
    enabled: false,
  },
  {
    id: "teams", name: "MS Teams", cat: "notifications",
    fa: "fa-brands fa-microsoft", color: "#5059C9", bgColor: "#EEF0FB",
    desc: "Send test execution notifications and bug reports directly to your Microsoft Teams channels.",
    enabled: false,
  },
  {
    id: "pagerduty", name: "PagerDuty", cat: "notifications",
    fa: "fa-duotone solid fa-circle-exclamation", color: "#25C151", bgColor: "#EDFBF1",
    desc: "Trigger PagerDuty incidents automatically when critical test failures are detected in production.",
    enabled: false,
  },
  {
    id: "confluence", name: "Confluence", cat: "bug",
    fa: "fa-brands fa-confluence", color: "#0052CC", bgColor: "#E8F0FE",
    desc: "Export test results and reports directly to Confluence pages for easy team documentation.",
    enabled: false,
  },
  {
    id: "testrail", name: "TestRail", cat: "bug",
    fa: "fa-duotone solid fa-vials", color: "#65C179", bgColor: "#EDFBF1",
    desc: "Sync test cases and execution results with TestRail for comprehensive test management.",
    enabled: false,
  },
];

const INT_TABS = [
  { id: "all",           label: "All Integrations" },
  { id: "bug",           label: "Bug Tracking"     },
  { id: "cicd",          label: "CI / CD"          },
  { id: "notifications", label: "Notifications"    },
  { id: "cloud",         label: "Cloud"            },
];

// ── Duotone icon helper ───────────────────────────────────────────────────────
function DuoIcon({ icon, className = "" }: { icon: string; className?: string }) {
  return <i className={`fa-duotone solid fa-${icon} ${className}`} />;
}

// ── General settings content ──────────────────────────────────────────────────
function GeneralContent() {
  return (
    <div className="w-full space-y-8">
      <div>
        <h2 className="cqa-h2 mb-1">Workspace</h2>
        <p className="text-sm text-gray-500 mb-5">Manage your workspace name, logo, and general preferences.</p>
        <div className="space-y-5 bg-white border border-gray-200 rounded-2xl p-6">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Workspace Name</label>
            <input
              defaultValue="Acme Corp QA"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Timezone</label>
            <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-400 bg-white">
              <option>UTC — Coordinated Universal Time</option>
              <option>America/New_York — Eastern Time</option>
              <option>America/Los_Angeles — Pacific Time</option>
              <option>Europe/London — London Time</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Default Browser</label>
            <div className="flex gap-2">
              {["Chromium", "Firefox", "WebKit"].map((b) => (
                <button key={b}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${b === "Chromium" ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300"}`}>
                  {b}
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-end pt-2 border-t border-gray-100">
            <button className="px-5 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-colors">
              Save Changes
            </button>
          </div>
        </div>
      </div>

      <div>
        <h2 className="cqa-h2 mb-1">Danger Zone</h2>
        <p className="text-sm text-gray-500 mb-5">Irreversible actions for your workspace.</p>
        <div className="bg-white border border-red-200 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="cqa-h3">Delete Workspace</p>
              <p className="text-xs text-gray-500 mt-0.5">Permanently delete this workspace and all its data.</p>
            </div>
            <button className="px-4 py-1.5 bg-red-50 text-red-600 text-xs font-bold rounded-lg border border-red-200 hover:bg-red-100 transition-colors">
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Integrations content ──────────────────────────────────────────────────────
function IntegrationsContent() {
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [enabled, setEnabled] = useState<Record<string, boolean>>(
    Object.fromEntries(INTEGRATIONS.map((i) => [i.id, i.enabled]))
  );

  const visible = INTEGRATIONS.filter((item) => {
    const matchesTab = activeTab === "all" || item.cat === activeTab;
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="flex flex-col h-full">
      {/* Sub-header with tabs */}
      <div className="flex items-center justify-between mb-5 shrink-0">
        <div className="flex gap-1 border-b border-gray-200 w-full">
          {INT_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
          <div className="flex-1 flex justify-end items-center pb-1 pl-4">
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search integrations…"
                className="pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-400 w-48"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Cards grid */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-3 gap-4">
          {visible.map((item) => (
            <div key={item.id} className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col gap-3 hover:border-indigo-200 hover:shadow-sm transition-all">
              {/* Card header */}
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-xl"
                  style={{ backgroundColor: item.bgColor, color: item.color }}
                >
                  <i className={item.fa} />
                </div>
                <span className="font-bold text-gray-900 text-sm">{item.name}</span>
              </div>
              {/* Description */}
              <p className="text-xs text-gray-500 leading-relaxed flex-1">{item.desc}</p>
              {/* Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <button className="text-xs text-indigo-600 font-medium hover:underline">
                  View Details
                </button>
                <button
                  onClick={() => setEnabled((p) => ({ ...p, [item.id]: !p[item.id] }))}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                    enabled[item.id]
                      ? "bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700"
                      : "bg-white text-gray-500 border-gray-200 hover:border-indigo-300 hover:text-indigo-600"
                  }`}
                >
                  {enabled[item.id] ? (
                    <><Check size={11} /> Enabled</>
                  ) : (
                    <><X size={11} /> Disabled</>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
        {visible.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <DuoIcon icon="plug-circle-xmark" className="text-4xl mb-3" />
            <p className="text-sm font-medium">No integrations found</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Team content ──────────────────────────────────────────────────────────────
type MemberStatus = "active" | "invited";
type MemberRole = "Admin" | "Member" | "Viewer";

interface TeamMember {
  name: string;
  email: string;
  role: MemberRole;
  avatar: string;
  color: string;
  lastAccessed: string;
  status: MemberStatus;
  isNew?: boolean;
}

const INITIAL_MEMBERS: TeamMember[] = [
  { name: "Alex Johnson",  email: "alex@acmecorp.com",   role: "Admin",  avatar: "AJ", color: "#6366F1", lastAccessed: "2 min ago",    status: "active" },
  { name: "Maria Silva",   email: "maria@acmecorp.com",  role: "Member", avatar: "MS", color: "#10B981", lastAccessed: "1 hour ago",   status: "active" },
  { name: "James Liu",     email: "james@acmecorp.com",  role: "Member", avatar: "JL", color: "#F59E0B", lastAccessed: "Yesterday",    status: "active" },
  { name: "Sarah Park",    email: "sarah@acmecorp.com",  role: "Viewer", avatar: "SP", color: "#EC4899", lastAccessed: "3 days ago",   status: "active" },
  { name: "Daniel Torres", email: "daniel@acmecorp.com", role: "Member", avatar: "DT", color: "#8B5CF6", lastAccessed: "1 week ago",   status: "active" },
];

const ROLE_COLORS: Record<MemberRole, string> = {
  Admin:  "bg-indigo-100 text-indigo-700",
  Member: "bg-gray-100 text-gray-600",
  Viewer: "bg-amber-50 text-amber-600",
};

function avatarInitials(email: string) {
  return email.slice(0, 2).toUpperCase();
}

function randomColor(email: string) {
  const palette = ["#6366F1","#10B981","#F59E0B","#EC4899","#8B5CF6","#0EA5E9","#EF4444","#14B8A6"];
  let h = 0;
  for (let i = 0; i < email.length; i++) h = (h * 31 + email.charCodeAt(i)) & 0xffffffff;
  return palette[Math.abs(h) % palette.length];
}

function TeamContent() {
  const [members, setMembers]         = useState<TeamMember[]>(INITIAL_MEMBERS);
  const [showInvite, setShowInvite]   = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole]   = useState<MemberRole>("Member");
  const [sending, setSending]         = useState(false);
  const [sent, setSent]               = useState(false);
  const [emailError, setEmailError]   = useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (showInvite) setTimeout(() => inputRef.current?.focus(), 80);
  }, [showInvite]);

  function handleSend() {
    if (!inviteEmail.trim()) { setEmailError("Enter an email address."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteEmail.trim())) { setEmailError("Enter a valid email address."); return; }
    if (members.some(m => m.email.toLowerCase() === inviteEmail.trim().toLowerCase())) {
      setEmailError("This person is already in the workspace.");
      return;
    }
    setEmailError("");
    setSending(true);
    setTimeout(() => {
      const email = inviteEmail.trim();
      setMembers(prev => [
        ...prev,
        {
          name: email.split("@")[0],
          email,
          role: inviteRole,
          avatar: avatarInitials(email),
          color: randomColor(email),
          lastAccessed: "—",
          status: "invited",
          isNew: true,
        },
      ]);
      setSending(false);
      setSent(true);
      setTimeout(() => {
        setSent(false);
        setShowInvite(false);
        setInviteEmail("");
        setInviteRole("Member");
      }, 1600);
    }, 900);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleSend();
    if (e.key === "Escape") { setShowInvite(false); setInviteEmail(""); setEmailError(""); }
  }

  const active  = members.filter(m => m.status === "active");
  const pending = members.filter(m => m.status === "invited");

  return (
    <div className="w-full space-y-5">
      <style>{`
        @keyframes cqa-row-in {
          from { opacity:0; transform:translateY(-8px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes cqa-invite-open {
          from { opacity:0; transform:translateY(-6px); max-height:0; }
          to   { opacity:1; transform:translateY(0); max-height:160px; }
        }
      `}</style>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="cqa-h2">Team Members</h2>
          <p className="text-sm text-gray-500 mt-0.5">Manage who has access to this workspace.</p>
        </div>
        <button
          onClick={() => { setShowInvite(v => !v); setEmailError(""); }}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
            showInvite
              ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
              : "bg-indigo-600 text-white hover:bg-indigo-700"
          }`}
        >
          <DuoIcon icon={showInvite ? "xmark" : "user-plus"} className="text-sm" />
          {showInvite ? "Cancel" : "Invite Member"}
        </button>
      </div>

      {/* ── Invite form ── */}
      {showInvite && (
        <div
          className="bg-indigo-50 border border-indigo-200 rounded-2xl p-5 overflow-hidden"
          style={{ animation: "cqa-invite-open 0.2s ease both" }}
        >
          <p className="text-xs font-bold text-indigo-700 mb-3 flex items-center gap-2">
            <DuoIcon icon="envelope" />
            Send an invitation
          </p>
          <div className="flex gap-3 items-start">
            <div className="flex-1 min-w-0">
              <input
                ref={inputRef}
                type="email"
                placeholder="colleague@company.com"
                value={inviteEmail}
                onChange={e => { setInviteEmail(e.target.value); setEmailError(""); }}
                onKeyDown={handleKeyDown}
                className={`w-full px-3.5 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 transition-all bg-white ${
                  emailError
                    ? "border-red-300 focus:ring-red-200"
                    : "border-indigo-200 focus:ring-indigo-300 focus:border-indigo-400"
                }`}
              />
              {emailError && (
                <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                  <X size={11} />
                  {emailError}
                </p>
              )}
            </div>
            <select
              value={inviteRole}
              onChange={e => setInviteRole(e.target.value as MemberRole)}
              className="px-3 py-2.5 text-sm border border-indigo-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 shrink-0"
            >
              <option>Member</option>
              <option>Viewer</option>
              <option>Admin</option>
            </select>
            <button
              onClick={handleSend}
              disabled={sending || sent}
              className={`flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-xl transition-all shrink-0 ${
                sent
                  ? "bg-green-500 text-white"
                  : sending
                  ? "bg-indigo-400 text-white cursor-not-allowed"
                  : "bg-indigo-600 text-white hover:bg-indigo-700"
              }`}
            >
              {sent ? (
                <><Check size={14} /> Sent!</>
              ) : sending ? (
                <><span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin inline-block" /> Sending…</>
              ) : (
                <><DuoIcon icon="paper-plane" className="text-sm" /> Send Invite</>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ── Active members table ── */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 px-5 py-2.5 border-b border-gray-100 bg-gray-50">
          <span className="w-9" />
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Member</span>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider w-20 text-center">Role</span>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider w-28 text-right">Last Accessed</span>
          <span className="w-5" />
        </div>
        {active.map((m, i) => (
          <div
            key={m.email}
            className={`grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 items-center px-5 py-3.5 transition-colors hover:bg-gray-50 ${
              i < active.length - 1 ? "border-b border-gray-100" : ""
            }`}
          >
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ backgroundColor: m.color }}>
              {m.avatar}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900">{m.name}</p>
              <p className="text-xs text-gray-400">{m.email}</p>
            </div>
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full w-20 text-center ${ROLE_COLORS[m.role]}`}>
              {m.role}
            </span>
            <span className="text-xs text-gray-400 w-28 text-right tabular-nums">{m.lastAccessed}</span>
            <button className="text-gray-300 hover:text-gray-500 transition-colors w-5">
              <ChevronRight size={15} />
            </button>
          </div>
        ))}
      </div>

      {/* ── Pending invites ── */}
      {pending.length > 0 && (
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">
            Pending Invites ({pending.length})
          </p>
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            {pending.map((m, i) => (
              <div
                key={m.email}
                className={`grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 items-center px-5 py-3.5 ${
                  i < pending.length - 1 ? "border-b border-gray-100" : ""
                } ${m.isNew ? "" : ""}`}
                style={m.isNew ? { animation: "cqa-row-in 0.3s ease both" } : undefined}
              >
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 opacity-60" style={{ backgroundColor: m.color }}>
                  {m.avatar}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-500">{m.email}</p>
                  <p className="text-xs text-gray-400">Invite sent · awaiting acceptance</p>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full w-20 text-center bg-amber-50 text-amber-600">
                  {m.role}
                </span>
                <span className="flex items-center gap-1.5 text-[10px] font-semibold text-amber-600 bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-full w-28 justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse inline-block" />
                  Pending
                </span>
                <button
                  onClick={() => setMembers(prev => prev.filter(x => x.email !== m.email))}
                  className="text-gray-300 hover:text-red-400 transition-colors w-5"
                  title="Revoke invite"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Profile content ───────────────────────────────────────────────────────────
function ProfileContent() {
  const [name, setName] = useState("Sean Carter");
  const [email, setEmail] = useState("sean@acmecorp.com");
  const [bio, setBio] = useState("QA Lead at Acme Corp. Building better software through better testing.");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="w-full space-y-7">
      {/* Avatar card */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 flex items-center gap-6">
        <div className="relative shrink-0">
          <img
            src={avatarImg}
            alt="Sean Carter"
            className="w-20 h-20 rounded-2xl object-cover object-top"
          />
          <button className="absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors">
            <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="cqa-h2">Sean Carter</h2>
          <p className="text-sm text-gray-400">sean@acmecorp.com</p>
          <span className="inline-block mt-2 text-[10px] font-bold px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-700">QA Lead</span>
        </div>
        <button className="shrink-0 px-4 py-2 text-xs font-semibold border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
          Change photo
        </button>
      </div>

      {/* Details form */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">
        <h3 className="cqa-h3">Personal Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Full Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Email Address</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-all"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-all resize-none"
          />
        </div>
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className={`px-5 py-2 text-xs font-bold rounded-xl transition-all ${
              saved
                ? "bg-green-500 text-white"
                : "bg-indigo-600 text-white hover:bg-indigo-700"
            }`}
          >
            {saved ? "✓ Saved" : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Password section */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
        <h3 className="cqa-h3">Password & Security</h3>
        <div className="space-y-3">
          {["Current Password", "New Password", "Confirm New Password"].map((lbl) => (
            <div key={lbl}>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">{lbl}</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-all"
              />
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-3">
            <div className="w-9 h-5 rounded-full bg-indigo-600 relative">
              <div className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-white shadow-sm" />
            </div>
            <span className="text-xs font-medium text-gray-700">Two-factor authentication enabled</span>
          </div>
          <button className="px-5 py-2 text-xs font-bold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-colors">
            Update Password
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Placeholder content ───────────────────────────────────────────────────────
function PlaceholderContent({ section }: { section: typeof SECTIONS[0] }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-4">
      <div className="w-20 h-20 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center">
        <DuoIcon icon={section.icon} className={`text-4xl ${section.color}`} />
      </div>
      <div className="text-center">
        <p className="cqa-h2">{section.label} Settings</p>
        <p className="text-sm text-gray-400 mt-1">This section is coming soon.</p>
      </div>
    </div>
  );
}

// ── Billing data ─────────────────────────────────────────────────────────────
const CREDITS_TOTAL = 5_000;
const CREDITS_REMAINING = 1_222;
const CREDITS_USED = CREDITS_TOTAL - CREDITS_REMAINING;

const USAGE_BREAKDOWN = [
  { label: "AI Test Generation",     icon: "robot",       credits: 1_876, bgColor: "bg-indigo-50", iconColor: "text-indigo-500", barColor: "bg-indigo-500" },
  { label: "Test Executions",        icon: "circle-play", credits: 1_234, bgColor: "bg-violet-50", iconColor: "text-violet-500", barColor: "bg-violet-500" },
  { label: "Step Group Suggestions", icon: "list-check",  credits: 432,   bgColor: "bg-blue-50",   iconColor: "text-blue-500",   barColor: "bg-blue-500"   },
  { label: "Scheduled Runs",         icon: "clock",       credits: 236,   bgColor: "bg-amber-50",  iconColor: "text-amber-500",  barColor: "bg-amber-500"  },
];

const PLANS_DATA = [
  { id: "free",       name: "Free",       price: "$0",     period: "",    credits: "500",       aiGenerations: "10/mo",       parallel: "1",         integrations: "2",   support: "Community", customEnvs: false, auditLog: false, sso: false, current: false },
  { id: "starter",    name: "Starter",    price: "$49",    period: "/mo", credits: "5,000",     aiGenerations: "100/mo",      parallel: "3",         integrations: "10",  support: "Email",     customEnvs: false, auditLog: true,  sso: false, current: true  },
  { id: "pro",        name: "Pro",        price: "$149",   period: "/mo", credits: "20,000",    aiGenerations: "Unlimited",   parallel: "10",        integrations: "All", support: "Priority",  customEnvs: true,  auditLog: true,  sso: false, current: false },
  { id: "enterprise", name: "Enterprise", price: "Custom", period: "",    credits: "Unlimited", aiGenerations: "Unlimited",   parallel: "Unlimited", integrations: "All", support: "Dedicated", customEnvs: true,  auditLog: true,  sso: true,  current: false },
];

const PLAN_FEATURE_ROWS = [
  { label: "Credits / month",       key: "credits"        },
  { label: "AI generations / month",key: "aiGenerations"  },
  { label: "Parallel executions",   key: "parallel"       },
  { label: "Integrations",          key: "integrations"   },
  { label: "Support",               key: "support"        },
  { label: "Custom environments",   key: "customEnvs"     },
  { label: "Audit log",             key: "auditLog"       },
  { label: "SSO / SAML",            key: "sso"            },
];

const CREDIT_ACTIONS = [
  { icon: "play",               iconColor: "text-indigo-500",  bgColor: "bg-indigo-50",  label: "Run Test Case",          cost: 10  },
  { icon: "wand-magic-sparkles",iconColor: "text-violet-500",  bgColor: "bg-violet-50",  label: "AI Test Generation",     cost: 48  },
  { icon: "robot",              iconColor: "text-blue-500",    bgColor: "bg-blue-50",    label: "AI Step Suggestions",    cost: 12  },
  { icon: "calendar-check",     iconColor: "text-amber-500",   bgColor: "bg-amber-50",   label: "Scheduled Suite Run",    cost: 20  },
  { icon: "plug-circle-bolt",   iconColor: "text-pink-500",    bgColor: "bg-pink-50",    label: "API Call via REST",      cost: 5   },
  { icon: "hard-drive",         iconColor: "text-green-500",   bgColor: "bg-green-50",   label: "Artifact Storage (GB)",  cost: 2   },
];

// ── Billing content ───────────────────────────────────────────────────────────
function BillingContent() {
  const usedPct = Math.round((CREDITS_USED / CREDITS_TOTAL) * 100);

  return (
    <div className="w-full space-y-7 pb-6">

      {/* ── Current plan card ── */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <div className="flex items-start justify-between mb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="cqa-h2">Starter Plan</h2>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-green-100 text-green-700">Active</span>
            </div>
            <p className="cqa-section-desc">Renews May 26, 2026 · $49/month</p>
          </div>
          <button className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200">
            Upgrade Plan
          </button>
        </div>

        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
          <div className="flex items-end justify-between mb-3">
            <div>
              <p className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wide mb-0.5">Credits Remaining</p>
              <p className="text-4xl font-black text-indigo-700 tabular-nums">{CREDITS_REMAINING.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wide mb-0.5">of {CREDITS_TOTAL.toLocaleString()} total</p>
              <p className="text-sm font-bold text-indigo-500">{usedPct}% used this month</p>
            </div>
          </div>

          {/* ── iPhone-style stacked bar ── */}
          <div className="w-full h-5 rounded-xl overflow-hidden flex">
            {USAGE_BREAKDOWN.map((cat) => (
              <div
                key={cat.label}
                className={`${cat.barColor} h-full flex-none`}
                style={{ width: `${(cat.credits / CREDITS_TOTAL) * 100}%` }}
              />
            ))}
            <div className="bg-indigo-200 h-full flex-1" />
          </div>

          {/* ── Legend ── */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 mt-3">
            {USAGE_BREAKDOWN.map((cat) => (
              <div key={cat.label} className="flex items-center gap-2 min-w-0">
                <span className={`w-2.5 h-2.5 rounded-sm flex-shrink-0 ${cat.barColor}`} />
                <span className="text-[11px] text-indigo-700 font-medium truncate">{cat.label}</span>
                <span className="text-[11px] text-indigo-500 font-bold tabular-nums ml-auto">{cat.credits.toLocaleString()}</span>
              </div>
            ))}
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0 bg-indigo-200" />
              <span className="text-[11px] text-indigo-700 font-medium">Available</span>
              <span className="text-[11px] text-indigo-500 font-bold tabular-nums ml-auto">{CREDITS_REMAINING.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Usage breakdown ── */}
      <div>
        <h2 className="cqa-h2 mb-1">Usage Breakdown</h2>
        <p className="cqa-section-desc mb-4">Credits consumed by feature this billing period.</p>
        <div className="grid grid-cols-2 gap-3">
          {USAGE_BREAKDOWN.map((cat) => {
            const pct = Math.round((cat.credits / CREDITS_USED) * 100);
            return (
              <div key={cat.label} className={`${cat.bgColor} border border-gray-100 rounded-2xl p-4`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`text-lg ${cat.iconColor} leading-none`}><DuoIcon icon={cat.icon} /></span>
                    <span className="text-xs font-semibold text-gray-700 leading-tight">{cat.label}</span>
                  </div>
                  <span className="cqa-caption">{pct}%</span>
                </div>
                <p className="text-2xl font-black text-gray-900 tabular-nums">{cat.credits.toLocaleString()}</p>
                <p className="cqa-caption mb-2.5">credits used</p>
                <div className="w-full bg-white/70 rounded-full h-1.5 overflow-hidden">
                  <div className={`${cat.barColor} h-1.5 rounded-full`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Plan comparison ── */}
      <div data-plans-section>
        <h2 className="cqa-h2 mb-1">Plans & Pricing</h2>
        <p className="cqa-section-desc mb-4">Compare plans and upgrade at any time.</p>
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          {/* Header row */}
          <div className="grid grid-cols-5 border-b border-gray-100">
            <div className="bg-gray-50 px-4 py-3.5">
              <p className="cqa-th">Features</p>
            </div>
            {PLANS_DATA.map((plan) => (
              <div key={plan.id} className={`px-4 py-3.5 text-center ${plan.current ? "bg-indigo-50" : "bg-gray-50"}`}>
                <p className={`text-sm font-bold ${plan.current ? "text-indigo-700" : "text-gray-700"}`}>{plan.name}</p>
                <p className={`text-xs mt-0.5 ${plan.current ? "text-indigo-500" : "text-gray-500"}`}>
                  <span className="text-base font-black">{plan.price}</span>{plan.period}
                </p>
                {plan.current && (
                  <span className="inline-block mt-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-indigo-600 text-white">Current</span>
                )}
              </div>
            ))}
          </div>

          {/* Feature rows */}
          {PLAN_FEATURE_ROWS.map((feature, fi) => (
            <div key={feature.key} className={`grid grid-cols-5 ${fi < PLAN_FEATURE_ROWS.length - 1 ? "border-b border-gray-50" : ""}`}>
              <div className="px-4 py-3 flex items-center border-r border-gray-50">
                <span className="text-xs font-medium text-gray-600">{feature.label}</span>
              </div>
              {PLANS_DATA.map((plan) => {
                const val = (plan as Record<string, unknown>)[feature.key];
                return (
                  <div key={plan.id} className={`px-4 py-3 flex items-center justify-center ${plan.current ? "bg-indigo-50/40" : ""}`}>
                    {typeof val === "boolean" ? (
                      val
                        ? <Check size={14} className="text-green-500" />
                        : <X size={14} className="text-gray-200" />
                    ) : (
                      <span className={`text-xs font-semibold ${plan.current ? "text-indigo-700" : "text-gray-600"}`}>{val as string}</span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}

          {/* CTA row */}
          <div className="grid grid-cols-5 border-t border-gray-100">
            <div className="px-4 py-4" />
            {PLANS_DATA.map((plan) => (
              <div key={plan.id} className={`px-3 py-4 flex items-center justify-center ${plan.current ? "bg-indigo-50/40" : ""}`}>
                {plan.current ? (
                  <span className="text-[10px] font-bold text-indigo-400">Current plan</span>
                ) : plan.id === "enterprise" ? (
                  <button className="w-full px-2 py-1.5 text-[10px] font-bold border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors">
                    Contact Sales
                  </button>
                ) : plan.id === "free" ? (
                  <button className="w-full px-2 py-1.5 text-[10px] font-bold border border-gray-200 text-gray-400 rounded-lg cursor-not-allowed" disabled>
                    Downgrade
                  </button>
                ) : (
                  <button className="w-full px-2 py-1.5 text-[10px] font-bold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                    Upgrade
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── What is a Credit? ── */}
      <div>
        <h2 className="cqa-h2 mb-1">What is a Credit?</h2>
        <p className="cqa-section-desc mb-4">
          Credits are the currency that powers ContextQA's AI and automation features. Every action you perform — from running a test to generating AI steps — draws from your monthly credit balance. Credits reset each billing cycle. You can get more credits by upgrading your plan or purchasing a top-up at any time.
        </p>
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          {CREDIT_ACTIONS.map((action, i) => (
            <div key={action.label} className={`flex items-center gap-4 px-5 py-3.5 ${i < CREDIT_ACTIONS.length - 1 ? "border-b border-gray-50" : ""}`}>
              <div className={`w-9 h-9 rounded-xl ${action.bgColor} flex items-center justify-center shrink-0`}>
                <span className={`text-sm leading-none ${action.iconColor}`}>
                  <DuoIcon icon={action.icon} />
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800">{action.label}</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-sm font-black text-indigo-700 tabular-nums">{action.cost}</span>
                <span className="text-xs font-medium text-gray-400">credits</span>
              </div>
            </div>
          ))}
        </div>

        {/* CTA row */}
        <div className="mt-4 flex items-center gap-3">
          <button className="px-5 py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200">
            Upgrade Plan
          </button>
          <a
            href="#plans"
            onClick={(e) => { e.preventDefault(); document.querySelector("[data-plans-section]")?.scrollIntoView({ behavior: "smooth" }); }}
            className="text-xs font-semibold text-indigo-500 hover:text-indigo-700 transition-colors"
          >
            View Plans ↑
          </a>
        </div>
      </div>
    </div>
  );
}

// ── Main settings page ────────────────────────────────────────────────────────
export default function SettingsPage() {
  const [, navigate] = useLocation();
  const searchStr = useSearch();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeSection, setActiveSection] = useState(() => {
    const params = new URLSearchParams(searchStr);
    return params.get("section") || "profile";
  });

  const currentSection = SECTIONS.find((s) => s.id === activeSection)!;

  function renderContent() {
    switch (activeSection) {
      case "profile":       return <ProfileContent />;
      case "general":       return <GeneralContent />;
      case "team":          return <TeamContent />;
      case "integrations":  return <IntegrationsContent />;
      case "billing":       return <BillingContent />;
      default:              return <PlaceholderContent section={currentSection} />;
    }
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">

      <IndigoSidebar
        onNew={() => setDrawerOpen(true)}
        onNavigate={navigate}
        onBilling={() => setActiveSection("billing")}
        activeItem="settings"
      />

      {/* ── Settings icon nav ─────────────────────────────────────────────── */}
      <aside className="w-[88px] bg-white border-r border-gray-200 flex flex-col py-5 shrink-0">
        <div className="px-3 mb-4 shrink-0">
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest text-center">Settings</p>
        </div>
        <nav className="flex flex-col items-center gap-1 flex-1 px-2 overflow-y-auto">
          {SECTIONS.map((sec) => {
            const isActive = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => setActiveSection(sec.id)}
                title={sec.label}
                className={`w-full flex flex-col items-center gap-1.5 px-2 py-2.5 rounded-xl transition-all ${
                  isActive
                    ? "bg-indigo-50 border border-indigo-100"
                    : "hover:bg-gray-50 border border-transparent"
                }`}
              >
                <span className={`text-xl leading-none transition-colors ${
                  isActive ? "text-indigo-600" : "text-gray-400"
                }`}>
                  <DuoIcon icon={sec.icon} />
                </span>
                <span className={`text-[9px] font-semibold leading-none text-center ${
                  isActive ? "text-indigo-600" : "text-gray-400"
                }`}>
                  {sec.label}
                </span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/dashboard")}
              className="text-xl font-bold text-gray-900 hover:opacity-80 transition-opacity"
            >
              <span className="text-gray-900">Context</span>
              <span className="text-indigo-600">QA</span>
            </button>
            <button
              onClick={() => setActiveSection("billing")}
              className="text-xs bg-amber-100 text-amber-700 font-medium px-2 py-0.5 rounded-full hover:bg-amber-200 transition-colors"
            >
              1,222 Credits Left
            </button>
          </div>
          <div className="flex items-center gap-3">
            <WorkspaceDropdown />
            <button className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </div>
        </header>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto p-7">
          {renderContent()}
        </div>
      </div>
      <AddContextDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  );
}
