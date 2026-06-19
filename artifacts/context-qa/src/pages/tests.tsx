import React, { useState } from "react";
import { useLocation } from "wouter";
import { AddContextDrawer } from "../components/AddContextDrawer";
import { IndigoSidebar } from "../components/IndigoSidebar";
import { WorkspaceDropdown } from "../components/WorkspaceDropdown";
import {
  Search, Plus, ChevronDown, SlidersHorizontal, RefreshCw,
  CheckSquare, Square, X, ChevronRight, User, MoreHorizontal,
} from "lucide-react";

function DuoIcon({ icon, className = "" }: { icon: string; className?: string }) {
  return <i className={`fa-duotone solid fa-${icon} ${className}`} />;
}

type HierarchyTab = "step-groups" | "cases" | "suites" | "plans";
const HIERARCHY_NODES: { key: HierarchyTab; label: string; activeClass: string; inactiveClass: string }[] = [
  { key: "cases",       label: "Test Cases",  activeClass: "bg-indigo-600 text-white",     inactiveClass: "bg-indigo-100 text-indigo-400" },
  { key: "step-groups", label: "Step Groups", activeClass: "bg-violet-600 text-white",     inactiveClass: "bg-violet-100 text-violet-500" },
  { key: "suites",      label: "Suites",      activeClass: "bg-teal-600 text-white",       inactiveClass: "bg-teal-100 text-teal-500"    },
  { key: "plans",       label: "Plans",       activeClass: "bg-amber-500 text-white",      inactiveClass: "bg-amber-100 text-amber-500"  },
];
function HierarchyChain({ active }: { active: HierarchyTab }) {
  return (
    <div className="flex items-center gap-1 flex-shrink-0">
      {HIERARCHY_NODES.map((node, i) => (
        <React.Fragment key={node.key}>
          {i > 0 && <span className="text-gray-300 text-[10px] font-bold">→</span>}
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${node.key === active ? node.activeClass : node.inactiveClass}`}>
            {node.label}
          </span>
        </React.Fragment>
      ))}
    </div>
  );
}


const DEV_SECTIONS = [
  { id: "test-cases",          label: "Tests",        icon: "clipboard-list"  },
  { id: "test-data-profiles",  label: "Test Data",    icon: "database"        },
  { id: "uploads",             label: "Uploads",      icon: "cloud-arrow-up"  },
  { id: "ai-insights",         label: "AI Insights",  icon: "bolt"            },
];


const CREDITS_TOTAL = 5_000;
const CREDITS_REMAINING = 1_222;
const CREDITS_USED_PCT = Math.round(((CREDITS_TOTAL - CREDITS_REMAINING) / CREDITS_TOTAL) * 100);

const TEST_CASES = [
  {
    id: "C-623",
    title: "API Test Case From 2026-02-21",
    type: "API Testcase",
    typeIcon: "api",
    priority: "Critical",
    result: "Running",
    status: "Live",
    feature: "Core API",
    labels: "No labels",
    createdBy: "Sean",
    createdAt: "21 Feb 2026, 10:56",
    updatedAt: "13 Mar 2026, 13:14",
  },
  {
    id: "C-601",
    title: "Login flow — invalid credentials",
    type: "Web Testcase",
    typeIcon: "web",
    priority: "High",
    result: "Failed",
    status: "Draft",
    feature: "Authentication",
    labels: "Auth",
    createdBy: "Sean",
    createdAt: "14 Feb 2026, 09:31",
    updatedAt: "01 Mar 2026, 11:20",
  },
  {
    id: "C-589",
    title: "Checkout — payment gateway timeout",
    type: "Web Testcase",
    typeIcon: "web",
    priority: "Critical",
    result: "Passed",
    status: "Ready",
    feature: "Checkout",
    labels: "Payments",
    createdBy: "Sean",
    createdAt: "10 Feb 2026, 14:22",
    updatedAt: "28 Feb 2026, 16:45",
  },
  {
    id: "C-572",
    title: "SSO — SAML assertion validation",
    type: "API Testcase",
    typeIcon: "api",
    priority: "Critical",
    result: "Passed",
    status: "Ready",
    feature: "SSO",
    labels: "Auth, SSO",
    createdBy: "Sean",
    createdAt: "05 Feb 2026, 08:10",
    updatedAt: "22 Feb 2026, 09:55",
  },
  {
    id: "C-544",
    title: "Admin panel — bulk delete items",
    type: "Web Testcase",
    typeIcon: "web",
    priority: "Medium",
    result: "Pending",
    status: "Draft",
    feature: "Admin",
    labels: "Admin",
    createdBy: "Sean",
    createdAt: "28 Jan 2026, 11:05",
    updatedAt: "15 Feb 2026, 13:30",
  },
];

function PriorityBadge({ priority }: { priority: string }) {
  const map: Record<string, string> = {
    Critical: "text-red-600",
    High: "text-orange-500",
    Medium: "text-yellow-600",
    Low: "text-gray-400",
  };
  return (
    <span className={`flex items-center gap-1 text-xs font-semibold ${map[priority] ?? "text-gray-400"}`}>
      <span className="text-sm leading-none">!</span>
      {priority}
    </span>
  );
}

function ResultBadge({ result }: { result: string }) {
  if (result === "Running") {
    return (
      <span className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600" />
        </span>
        Running
      </span>
    );
  }
  const map: Record<string, { color: string; icon: string }> = {
    Passed:  { color: "text-green-600", icon: "✓" },
    Failed:  { color: "text-red-500",   icon: "✕" },
    Pending: { color: "text-gray-400",  icon: "○" },
  };
  const s = map[result] ?? map["Pending"];
  return (
    <span className={`flex items-center gap-1 text-xs font-medium ${s.color}`}>
      {s.icon} {result}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "Live") {
    return (
      <span className="flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200 animate-pulse">
        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 inline-block" />
        Live
      </span>
    );
  }
  const map: Record<string, string> = {
    Ready:  "bg-green-100 text-green-700 border border-green-200",
    Draft:  "bg-gray-100 text-gray-500 border border-gray-200",
    Review: "bg-yellow-100 text-yellow-700 border border-yellow-200",
  };
  return (
    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${map[status] ?? map["Draft"]}`}>
      {status}
    </span>
  );
}

function TypeBadge({ type, typeIcon }: { type: string; typeIcon: string }) {
  return (
    <span className="flex items-center gap-1.5 text-xs text-gray-600">
      {typeIcon === "api" ? (
        <span className="text-indigo-500 font-mono text-[10px] font-bold border border-indigo-200 rounded px-0.5">&lt;/&gt;</span>
      ) : (
        <svg className="w-3.5 h-3.5 text-blue-400 inline flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" strokeWidth="2"/>
          <path strokeWidth="2" d="M12 6v6l4 2"/>
        </svg>
      )}
      {type}
    </span>
  );
}

const FEATURE_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  "Authentication": { bg: "bg-blue-50",   text: "text-blue-700",   dot: "bg-blue-400"   },
  "Checkout":       { bg: "bg-green-50",  text: "text-green-700",  dot: "bg-green-500"  },
  "SSO":            { bg: "bg-purple-50", text: "text-purple-700", dot: "bg-purple-500" },
  "Admin":          { bg: "bg-orange-50", text: "text-orange-700", dot: "bg-orange-400" },
  "Core API":       { bg: "bg-indigo-50", text: "text-indigo-700", dot: "bg-indigo-500" },
  "Notifications":  { bg: "bg-pink-50",   text: "text-pink-700",   dot: "bg-pink-400"   },
  "Search":         { bg: "bg-cyan-50",   text: "text-cyan-700",   dot: "bg-cyan-500"   },
  "Dashboard":      { bg: "bg-teal-50",   text: "text-teal-700",   dot: "bg-teal-500"   },
  "Onboarding":     { bg: "bg-amber-50",  text: "text-amber-700",  dot: "bg-amber-400"  },
};

function FeatureChip({ feature }: { feature: string }) {
  const style = FEATURE_STYLES[feature] ?? { bg: "bg-gray-100", text: "text-gray-600", dot: "bg-gray-400" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap ${style.bg} ${style.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${style.dot}`} />
      {feature}
    </span>
  );
}

const SUITES = [
  {
    id: "S-01",
    name: "Authentication Suite",
    description: "Login, SSO, and session management flows",
    caseCount: 14,
    lastRun: "13 Mar 2026, 14:22",
    passRate: 92,
    status: "Ready",
  },
  {
    id: "S-02",
    name: "Checkout & Payments",
    description: "Payment gateway, cart, and order confirmation",
    caseCount: 9,
    lastRun: "10 Mar 2026, 09:45",
    passRate: 67,
    status: "Failing",
  },
  {
    id: "S-03",
    name: "Admin Panel Suite",
    description: "User management, bulk actions, role permissions",
    caseCount: 21,
    lastRun: "01 Mar 2026, 11:00",
    passRate: 100,
    status: "Passing",
  },
];

const PLANS = [
  {
    id: "P-01",
    name: "Sprint 12 Regression",
    description: "Full regression run before Sprint 12 release",
    suiteCount: 3,
    caseCount: 44,
    lastRun: "13 Mar 2026, 15:00",
    ciTag: "GitHub Actions",
    status: "Passed",
  },
  {
    id: "P-02",
    name: "Nightly Smoke Run",
    description: "Critical-path smoke tests executed every night at 02:00",
    suiteCount: 2,
    caseCount: 18,
    lastRun: "25 Apr 2026, 02:04",
    ciTag: "Jenkins",
    status: "Running",
  },
];

const STEP_GROUPS = [
  {
    id: "SG-01",
    name: "SG_Login_Admin",
    description: "Admin login flow with credential entry and dashboard verification",
    stepCount: 4,
    usedBy: 40,
    steps: [
      "Navigate to /login",
      "Type admin credentials",
      "Click Sign In",
      "Verify dashboard is visible",
    ],
    updatedAt: "20 Mar 2026",
  },
  {
    id: "SG-02",
    name: "SG_Login_Guest",
    description: "Guest login with minimal credential steps",
    stepCount: 3,
    usedBy: 12,
    steps: [
      "Navigate to /login",
      "Type guest credentials",
      "Click Sign In",
    ],
    updatedAt: "18 Mar 2026",
  },
  {
    id: "SG-03",
    name: "SG_Close_Cookie_Banner",
    description: "Dismisses cookie consent banner if present",
    stepCount: 1,
    usedBy: 27,
    steps: [
      "Click \"Accept All\" if cookie consent banner is visible",
    ],
    updatedAt: "05 Feb 2026",
  },
  {
    id: "SG-04",
    name: "SG_Checkout_Payment",
    description: "Fills payment form and submits",
    stepCount: 4,
    usedBy: 8,
    steps: [
      "Fill card number",
      "Fill expiry date",
      "Fill CVV",
      "Click Pay Now",
    ],
    updatedAt: "01 Apr 2026",
  },
];

const ELEMENTS = [
  { id: "E-01", name: "Login Button",           selector: "#login-btn",                          type: "ID",       page: "Login",       usedBy: 14, status: "Verified"   },
  { id: "E-02", name: "Email Input",             selector: "input[name='email']",                 type: "CSS",      page: "Login",       usedBy: 22, status: "Verified"   },
  { id: "E-03", name: "Password Input",          selector: "input[type='password']",              type: "CSS",      page: "Login",       usedBy: 20, status: "Verified"   },
  { id: "E-04", name: "Accept Cookie Banner",    selector: "//button[text()='Accept All']",       type: "XPath",    page: "Global",      usedBy: 27, status: "Verified"   },
  { id: "E-05", name: "Checkout Pay Now",        selector: "#pay-now-btn",                        type: "ID",       page: "Checkout",    usedBy: 8,  status: "Stale"      },
  { id: "E-06", name: "Admin Delete Selected",   selector: "[data-testid='bulk-delete']",         type: "data-*",   page: "Admin Panel", usedBy: 5,  status: "Verified"   },
  { id: "E-07", name: "Search Input",            selector: "[placeholder='Search…']",             type: "CSS",      page: "Dashboard",   usedBy: 9,  status: "Verified"   },
  { id: "E-08", name: "SSO Sign In Button",      selector: "//button[@data-provider='saml']",     type: "XPath",    page: "Login",       usedBy: 6,  status: "Unverified" },
];

const DATA_PROFILES = [
  { id: "DP-01", name: "Valid Admin User",           type: "User",    env: "Staging",  fields: 6, usedBy: 18, status: "Active"   },
  { id: "DP-02", name: "Guest User — No Auth",        type: "User",    env: "Staging",  fields: 3, usedBy: 7,  status: "Active"   },
  { id: "DP-03", name: "Stripe Test Card — Success",  type: "Payment", env: "Sandbox",  fields: 4, usedBy: 12, status: "Active"   },
  { id: "DP-04", name: "Stripe Test Card — Decline",  type: "Payment", env: "Sandbox",  fields: 4, usedBy: 5,  status: "Active"   },
  { id: "DP-05", name: "Large File Upload (49 MB)",   type: "File",    env: "Staging",  fields: 2, usedBy: 3,  status: "Inactive" },
  { id: "DP-06", name: "New Onboarding User",         type: "User",    env: "Staging",  fields: 5, usedBy: 9,  status: "Active"   },
];

const ENVIRONMENTS = [
  { id: "ENV-01", name: "Admin LMS",        type: "Development", baseUrl: "https://dev2.halightdev.com/tool/admin/",      params: 3, isDefault: false, createdAt: "Jan 16, 2026, 05:37 AM", updatedAt: "Jan 16, 2026, 05:37 AM" },
  { id: "ENV-02", name: "Dev2 Halight",     type: "Staging",     baseUrl: "https://dev2.halightdev.com",                  params: 5, isDefault: true,  createdAt: "Aug 07, 2025, 10:14 AM", updatedAt: "Mar 25, 2026, 07:01 AM" },
  { id: "ENV-03", name: "OrangeHRM Demo",   type: "QA",          baseUrl: "https://opensource-demo.orangehrmlive.com",    params: 2, isDefault: false, createdAt: "Dec 30, 2025, 11:13 PM", updatedAt: "Dec 30, 2025, 11:13 PM" },
  { id: "ENV-04", name: "Test1 Halight",    type: "Production",  baseUrl: "https://test1.halightdev.com",                 params: 6, isDefault: false, createdAt: "Jul 31, 2025, 12:23 PM", updatedAt: "Mar 26, 2026, 05:46 AM" },
];

export default function TestsPage() {
  const [, navigate] = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"cases" | "suites" | "plans" | "step-groups">("cases");
  const [activeDataTab, setActiveDataTab] = useState<"elements" | "profiles" | "environments">("elements");
  const [dismissedCards, setDismissedCards] = useState<Set<string>>(new Set());
  const dismissCard = (tab: string) => setDismissedCards(prev => new Set(prev).add(tab));
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSecNav, setActiveSecNav] = useState("test-cases");
  const [filterChips] = useState(["Mobile", "API Testcase"]);

  const toggleRow = (id: string) =>
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );

  const allSelected = selectedRows.length === TEST_CASES.length;
  const toggleAll = () =>
    setSelectedRows(allSelected ? [] : TEST_CASES.map((t) => t.id));

  const filtered = TEST_CASES.filter(
    (tc) =>
      tc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tc.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* ── Same indigo sidebar as dashboard ── */}
      <IndigoSidebar
        onNew={() => setDrawerOpen(true)}
        onNavigate={navigate}
        onBilling={() => navigate("/settings?section=billing")}
        activeItem="edit"
      />

      {/* ── Secondary nav ────────────────────────────────────────────────── */}
      <aside className="w-[88px] bg-white border-r border-gray-200 flex flex-col shrink-0">
        {/* Scrollable nav area */}
        <div className="flex-1 flex flex-col overflow-y-auto min-h-0 pt-5">
          <>
          <div className="px-3 mb-2 shrink-0">
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest text-center leading-tight">Test Design</p>
          </div>
          <nav className="flex flex-col items-center gap-0.5 px-2">
            {DEV_SECTIONS.map((sec) => {
              const isActive = sec.id === activeSecNav;
              return (
                <button
                  key={sec.id}
                  onClick={() => setActiveSecNav(sec.id)}
                  title={sec.label}
                  className={`w-full flex flex-col items-center gap-1.5 px-2 py-2.5 rounded-xl transition-all ${
                    isActive
                      ? "bg-indigo-50 border border-indigo-100"
                      : "hover:bg-gray-50 border border-transparent"
                  }`}
                >
                  <span className={`text-xl leading-none transition-colors ${isActive ? "text-indigo-600" : "text-gray-400"}`}>
                    <DuoIcon icon={sec.icon} />
                  </span>
                  <span className={`text-[9px] font-semibold leading-none text-center ${isActive ? "text-indigo-600" : "text-gray-400"}`}>
                    {sec.label}
                  </span>
                </button>
              );
            })}
          </nav>
          </>
        </div>

      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* ── Same top header as dashboard ── */}
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
              onClick={() => navigate("/settings?section=billing")}
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

        {/* ── Page title + tabs ── */}
        {activeSecNav === "test-cases" && (
        <div className="bg-white border-b border-gray-200 px-8 pt-5 pb-0 shrink-0">
          {/* Title row */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="cqa-h1">
                {activeTab === "cases"       && "Test Cases"}
                {activeTab === "suites"      && "Suites"}
                {activeTab === "plans"       && "Plans"}
                {activeTab === "step-groups" && "Step Groups"}
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                {activeTab === "cases"       && "Atomic tests built from natural language steps"}
                {activeTab === "suites"      && "Group Test Cases together for organised execution"}
                {activeTab === "plans"       && "Orchestrate Suites into a full run, wired to your CI/CD pipeline"}
                {activeTab === "step-groups" && "Reusable step sequences — update once, fix everywhere"}
              </p>
            </div>
            <button className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-white text-sm font-semibold active:scale-95 transition-all shadow-sm bg-indigo-600 hover:bg-indigo-700">
              <Plus size={14} />
              {activeTab === "cases"       && "New Test Case"}
              {activeTab === "suites"      && "New Suite"}
              {activeTab === "plans"       && "New Plan"}
              {activeTab === "step-groups" && "New Step Group"}
            </button>
          </div>
          {/* Tabs */}
          <div className="flex items-center -mb-px">
            {(["cases", "step-groups", "suites", "plans"] as const).map((tab) => {
              const labels = { cases: "Test Cases", "step-groups": "Step Groups", suites: "Suites", plans: "Plans" };
              const icons  = { cases: "clipboard-list", "step-groups": "layer-group", suites: "grid-2", plans: "circle-play" };
              return (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab
                      ? "border-indigo-600 text-indigo-600"
                      : "border-transparent text-gray-500 hover:text-gray-800"
                  }`}
                >
                  <DuoIcon icon={icons[tab]} />
                  {labels[tab]}
                </button>
              );
            })}
          </div>
        </div>
        )}

        {activeSecNav === "test-data-profiles" && (
        <div className="bg-white border-b border-gray-200 px-8 pt-5 pb-0 shrink-0">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="cqa-h1">
                {activeDataTab === "elements"     && "Elements"}
                {activeDataTab === "profiles"     && "Data Profiles"}
                {activeDataTab === "environments" && "Environments"}
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                {activeDataTab === "elements"     && "Named page elements shared across your test suite"}
                {activeDataTab === "profiles"     && "Reusable data sets injected into test cases at run time"}
                {activeDataTab === "environments" && "Named deployment targets — run the same tests against any URL"}
              </p>
            </div>
            <button className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-white text-sm font-semibold active:scale-95 transition-all shadow-sm bg-indigo-600 hover:bg-indigo-700 whitespace-nowrap shrink-0">
              <Plus size={14} />
              {activeDataTab === "elements"     && "New Element"}
              {activeDataTab === "profiles"     && "New Profile"}
              {activeDataTab === "environments" && "Create Environment"}
            </button>
          </div>
          <div className="flex items-center -mb-px">
            {(["elements", "profiles", "environments"] as const).map((tab) => {
              const labels = { elements: "Elements", profiles: "Data Profiles", environments: "Environments" };
              const icons  = { elements: "browser", profiles: "user-group", environments: "globe" };
              return (
                <button key={tab} onClick={() => setActiveDataTab(tab)}
                  className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                    activeDataTab === tab
                      ? "border-indigo-600 text-indigo-600"
                      : "border-transparent text-gray-500 hover:text-gray-800"
                  }`}
                >
                  <DuoIcon icon={icons[tab]} />
                  {labels[tab]}
                </button>
              );
            })}
          </div>
        </div>
        )}

        {/* ── Content area ── */}
        <div className="flex-1 overflow-auto px-8 py-5">

          {/* ══════════════════════════════════════════════
               TEST DATA SECTION
          ══════════════════════════════════════════════ */}
          {activeSecNav === "test-data-profiles" && (
            <div>
              {/* ── ELEMENTS TAB ── */}
              {activeDataTab === "elements" && (
                <div>
                  {!dismissedCards.has("elements") && (
                    <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl px-5 py-4 mb-5 flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 text-lg flex-shrink-0 mt-0.5">
                        <DuoIcon icon="browser" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-1.5">
                          <p className="text-sm font-bold text-indigo-900">Elements — your app's named, reusable locators</p>
                          <button onClick={() => dismissCard("elements")} className="w-5 h-5 flex items-center justify-center rounded text-indigo-300 hover:text-indigo-600 hover:bg-indigo-100 transition-colors flex-shrink-0">
                            <X size={12} />
                          </button>
                        </div>
                        <p className="text-xs text-indigo-700/70 leading-relaxed">Each Element is a <strong>named selector for a specific UI control</strong> — a button, input, or widget — identified during test creation. Name it once (<code className="bg-indigo-100 text-indigo-700 px-1 rounded font-mono text-[10px]">Login Button</code>), reference it everywhere. When the UI changes, update the selector here and every test inherits the fix.</p>
                      </div>
                    </div>
                  )}
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                      <div className="relative w-64">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="text" placeholder="Search elements…" className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white text-gray-600 hover:bg-gray-50">
                          All Pages <ChevronDown size={13} className="text-gray-400" />
                        </button>
                        <button className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50">
                          <RefreshCw size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-100 bg-gray-50/40">
                            <th className="px-4 py-3 text-left cqa-th">Name</th>
                            <th className="px-4 py-3 text-left cqa-th">Selector</th>
                            <th className="px-4 py-3 text-left cqa-th">Type</th>
                            <th className="px-4 py-3 text-left cqa-th">Page</th>
                            <th className="px-4 py-3 text-left cqa-th">Used by</th>
                            <th className="px-4 py-3 text-left cqa-th">Status</th>
                            <th className="w-16 px-4 py-3" />
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {ELEMENTS.map((el) => {
                            const typeColors: Record<string, string> = {
                              "CSS":    "bg-blue-50 text-blue-700 border-blue-100",
                              "XPath":  "bg-purple-50 text-purple-700 border-purple-100",
                              "ID":     "bg-green-50 text-green-700 border-green-100",
                              "data-*": "bg-orange-50 text-orange-700 border-orange-100",
                              "Name":   "bg-gray-100 text-gray-600 border-gray-200",
                            };
                            const statusCfg: Record<string, { cls: string; dot: string }> = {
                              Verified:   { cls: "text-green-600", dot: "bg-green-500" },
                              Stale:      { cls: "text-amber-600", dot: "bg-amber-400" },
                              Unverified: { cls: "text-gray-400",  dot: "bg-gray-300"  },
                            };
                            const sc = statusCfg[el.status] ?? statusCfg["Unverified"];
                            return (
                              <tr key={el.id} className="group hover:bg-indigo-50/20 transition-colors">
                                <td className="px-4 py-3.5">
                                  <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500 text-xs flex-shrink-0">
                                      <DuoIcon icon="browser" />
                                    </div>
                                    <div>
                                      <p className="text-xs font-semibold text-gray-800">{el.name}</p>
                                      <p className="text-[10px] text-gray-400 font-mono">{el.id}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 py-3.5">
                                  <code className="text-[11px] font-mono bg-gray-100 text-gray-700 px-2 py-0.5 rounded">{el.selector}</code>
                                </td>
                                <td className="px-4 py-3.5">
                                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${typeColors[el.type] ?? "bg-gray-100 text-gray-500 border-gray-200"}`}>{el.type}</span>
                                </td>
                                <td className="px-4 py-3.5">
                                  <FeatureChip feature={el.page === "Global" ? "Authentication" : el.page === "Checkout" ? "Checkout" : el.page === "Admin Panel" ? "Admin" : el.page === "Dashboard" ? "Dashboard" : "Authentication"} />
                                </td>
                                <td className="px-4 py-3.5">
                                  <span className="flex items-center gap-1 text-xs text-gray-500">
                                    <DuoIcon icon="clipboard-list" className="text-gray-400" />
                                    {el.usedBy} test{el.usedBy !== 1 ? "s" : ""}
                                  </span>
                                </td>
                                <td className="px-4 py-3.5">
                                  <span className={`flex items-center gap-1.5 text-xs font-semibold ${sc.cls}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${sc.dot}`} />
                                    {el.status}
                                  </span>
                                </td>
                                <td className="px-4 py-3.5">
                                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-indigo-50 hover:text-indigo-600 transition-colors border border-gray-200">
                                      <DuoIcon icon="pencil" className="text-xs" />
                                    </button>
                                    <button className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors border border-gray-200">
                                      <DuoIcon icon="trash" className="text-xs" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/40 text-xs text-gray-400">
                      {ELEMENTS.length} elements · {ELEMENTS.reduce((n, e) => n + e.usedBy, 0)} total usages across test cases
                    </div>
                  </div>
                </div>
              )}

              {/* ── PROFILES TAB ── */}
              {activeDataTab === "profiles" && (
                <div>
                  {!dismissedCards.has("profiles") && (
                    <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl px-5 py-4 mb-5 flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 text-lg flex-shrink-0 mt-0.5">
                        <DuoIcon icon="user-group" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-1.5">
                          <p className="text-sm font-bold text-indigo-900">Data Profiles — reusable data sets for every scenario</p>
                          <button onClick={() => dismissCard("profiles")} className="w-5 h-5 flex items-center justify-center rounded text-indigo-300 hover:text-indigo-600 hover:bg-indigo-100 transition-colors flex-shrink-0">
                            <X size={12} />
                          </button>
                        </div>
                        <p className="text-xs text-indigo-700/70 leading-relaxed">A Data Profile is a <strong>named set of field values</strong> injected into test cases at run time — a valid admin user, a declined payment card, a 49 MB file. Swap profiles to run the same test across different scenarios without duplicating a single step.</p>
                      </div>
                    </div>
                  )}
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                      <div className="relative w-64">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="text" placeholder="Search profiles…" className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white text-gray-600 hover:bg-gray-50">
                          All Types <ChevronDown size={13} className="text-gray-400" />
                        </button>
                        <button className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50">
                          <RefreshCw size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-100 bg-gray-50/40">
                            <th className="px-4 py-3 text-left cqa-th">Profile</th>
                            <th className="px-4 py-3 text-left cqa-th">Type</th>
                            <th className="px-4 py-3 text-left cqa-th">Environment</th>
                            <th className="px-4 py-3 text-left cqa-th">Fields</th>
                            <th className="px-4 py-3 text-left cqa-th">Used by</th>
                            <th className="px-4 py-3 text-left cqa-th">Status</th>
                            <th className="w-16 px-4 py-3" />
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {DATA_PROFILES.map((dp) => {
                            const typeIcons: Record<string, { icon: string; cls: string }> = {
                              User:    { icon: "user",          cls: "bg-blue-50 text-blue-500"   },
                              Payment: { icon: "credit-card",   cls: "bg-green-50 text-green-500" },
                              File:    { icon: "file-arrow-up", cls: "bg-orange-50 text-orange-500" },
                            };
                            const ti = typeIcons[dp.type] ?? typeIcons["User"];
                            const envCls = dp.env === "Sandbox" ? "bg-purple-50 text-purple-700 border-purple-100" : dp.env === "Production" ? "bg-red-50 text-red-700 border-red-100" : "bg-teal-50 text-teal-700 border-teal-100";
                            return (
                              <tr key={dp.id} onClick={() => navigate(`/tests/data-profile/${dp.id}`)} className="group hover:bg-indigo-50/20 transition-colors cursor-pointer">
                                <td className="px-4 py-3.5">
                                  <div className="flex items-center gap-2">
                                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0 ${ti.cls}`}>
                                      <DuoIcon icon={ti.icon} />
                                    </div>
                                    <div>
                                      <p className="text-xs font-semibold text-indigo-600 hover:underline">{dp.name}</p>
                                      <p className="text-[10px] text-gray-400 font-mono">{dp.id}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 py-3.5">
                                  <span className="text-xs text-gray-600 font-medium">{dp.type}</span>
                                </td>
                                <td className="px-4 py-3.5">
                                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${envCls}`}>{dp.env}</span>
                                </td>
                                <td className="px-4 py-3.5 text-xs text-gray-500">{dp.fields} fields</td>
                                <td className="px-4 py-3.5">
                                  <span className="flex items-center gap-1 text-xs text-gray-500">
                                    <DuoIcon icon="clipboard-list" className="text-gray-400" />
                                    {dp.usedBy} test{dp.usedBy !== 1 ? "s" : ""}
                                  </span>
                                </td>
                                <td className="px-4 py-3.5">
                                  {dp.status === "Active" ? (
                                    <span className="flex items-center gap-1.5 text-xs font-semibold text-green-600">
                                      <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Active
                                    </span>
                                  ) : (
                                    <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-400">
                                      <span className="w-1.5 h-1.5 rounded-full bg-gray-300" /> Inactive
                                    </span>
                                  )}
                                </td>
                                <td className="px-4 py-3.5">
                                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-indigo-50 hover:text-indigo-600 transition-colors border border-gray-200">
                                      <DuoIcon icon="pencil" className="text-xs" />
                                    </button>
                                    <button className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors border border-gray-200">
                                      <DuoIcon icon="trash" className="text-xs" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/40 text-xs text-gray-400">
                      {DATA_PROFILES.length} profiles · {DATA_PROFILES.filter(p => p.status === "Active").length} active
                    </div>
                  </div>
                </div>
              )}

              {/* ── ENVIRONMENTS TAB ── */}
              {activeDataTab === "environments" && (
                <div>
                  {!dismissedCards.has("environments") && (
                    <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl px-5 py-4 mb-5 flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 text-lg flex-shrink-0 mt-0.5">
                        <DuoIcon icon="globe" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-1.5">
                          <p className="text-sm font-bold text-indigo-900">Environments — run any test against any deployment</p>
                          <button onClick={() => dismissCard("environments")} className="w-5 h-5 flex items-center justify-center rounded text-indigo-300 hover:text-indigo-600 hover:bg-indigo-100 transition-colors flex-shrink-0">
                            <X size={12} />
                          </button>
                        </div>
                        <p className="text-xs text-indigo-700/70 leading-relaxed">An environment stores a <strong>base URL and key-value parameters</strong> for one deployment target — Staging, QA, Production. Reference values in test steps using <code className="bg-indigo-100 text-indigo-700 px-1 rounded font-mono text-[10px]">${"{ENV.KEY}"}</code>. Switch environments at execution time without touching a single test step.</p>
                      </div>
                    </div>
                  )}
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    {/* toolbar */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                      <div className="relative w-64">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="text" placeholder="Search environments…" className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50" title="Refresh">
                          <RefreshCw size={14} />
                        </button>
                      </div>
                    </div>

                    {/* table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-100 bg-gray-50/60">
                            <th className="w-10 px-4 py-3">
                              <button className="text-gray-400 hover:text-gray-600"><Square size={14} /></button>
                            </th>
                            <th className="px-4 py-3 text-left cqa-th">Name</th>
                            <th className="px-4 py-3 text-left cqa-th">Base URL</th>
                            <th className="px-4 py-3 text-left cqa-th">Type</th>
                            <th className="px-4 py-3 text-left cqa-th">Variables</th>
                            <th className="px-4 py-3 text-left cqa-th">Last Updated</th>
                            <th className="px-4 py-3 text-left cqa-th w-12"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {ENVIRONMENTS.map((env) => {
                            const typeColors: Record<string, string> = {
                              Production:  "bg-red-50   text-red-600   border-red-100",
                              Staging:     "bg-amber-50 text-amber-600 border-amber-100",
                              QA:          "bg-blue-50  text-blue-600  border-blue-100",
                              Development: "bg-gray-100 text-gray-600  border-gray-200",
                            };
                            return (
                              <tr key={env.id} className="group hover:bg-indigo-50/20 transition-colors">
                                <td className="px-4 py-3.5">
                                  <button className="text-gray-400 hover:text-gray-600"><Square size={14} /></button>
                                </td>
                                <td className="px-4 py-3.5">
                                  <div className="flex items-center gap-2">
                                    <button className="text-indigo-600 text-sm font-semibold hover:underline text-left">
                                      {env.name}
                                    </button>
                                    {env.isDefault && (
                                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600 border border-indigo-100">
                                        Default
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="px-4 py-3.5 max-w-[240px]">
                                  <span className="text-xs text-gray-500 font-mono truncate block" title={env.baseUrl}>
                                    {env.baseUrl}
                                  </span>
                                </td>
                                <td className="px-4 py-3.5">
                                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${typeColors[env.type] ?? "bg-gray-100 text-gray-500 border-gray-200"}`}>
                                    {env.type}
                                  </span>
                                </td>
                                <td className="px-4 py-3.5">
                                  <span className="inline-flex items-center gap-1 text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full font-medium">
                                    <DuoIcon icon="brackets-curly" className="text-[10px] text-gray-400" />
                                    {env.params}
                                  </span>
                                </td>
                                <td className="px-4 py-3.5 text-xs text-gray-400 whitespace-nowrap">{env.updatedAt}</td>
                                <td className="px-4 py-3.5">
                                  <button className="opacity-0 group-hover:opacity-100 w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all" title="More options">
                                    <MoreHorizontal size={15} />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* footer */}
                    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50/40">
                      <span className="text-xs text-gray-400">{ENVIRONMENTS.length} environments</span>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>Rows per page</span>
                        <button className="flex items-center gap-1 border border-gray-200 rounded px-2 py-0.5 bg-white hover:bg-gray-50">
                          10 <ChevronDown size={10} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════
               TESTS SECTION
          ══════════════════════════════════════════════ */}
          {activeSecNav === "test-cases" && <>
          {/* ── FEATURE CONTEXT CARDS ── */}
          {activeTab === "cases" && !dismissedCards.has("cases") && (
            <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl px-5 py-4 mb-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 text-lg flex-shrink-0 mt-0.5">
                <DuoIcon icon="clipboard-list" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-1.5">
                  <p className="text-sm font-bold text-indigo-900">Test Cases — the atomic unit of quality</p>
                  <button onClick={() => dismissCard("cases")} className="w-5 h-5 flex items-center justify-center rounded text-indigo-300 hover:text-indigo-600 hover:bg-indigo-100 transition-colors flex-shrink-0" title="Dismiss">
                    <X size={12} />
                  </button>
                </div>
                <p className="text-xs text-indigo-700/70 leading-relaxed">Each Test Case validates a <strong>single, specific behaviour</strong> end-to-end using natural language steps. Build from scratch, or embed Step Groups to keep repeated flows DRY. A test case answers one question: <em>"Does this scenario work?"</em></p>
              </div>
            </div>
          )}

          {activeTab === "step-groups" && !dismissedCards.has("step-groups") && (
            <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl px-5 py-4 mb-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 text-lg flex-shrink-0 mt-0.5">
                <DuoIcon icon="layer-group" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-1.5">
                  <p className="text-sm font-bold text-indigo-900">Step Groups — reusable steps, like a function call</p>
                  <button onClick={() => dismissCard("step-groups")} className="w-5 h-5 flex items-center justify-center rounded text-indigo-300 hover:text-indigo-600 hover:bg-indigo-100 transition-colors flex-shrink-0" title="Dismiss">
                    <X size={12} />
                  </button>
                </div>
                <p className="text-xs text-indigo-700/70 leading-relaxed">A Step Group is a <strong>named, reusable sequence of steps</strong> shared across many Test Cases. Define <code className="bg-indigo-100 text-indigo-700 px-1 rounded font-mono text-[10px]">SG_Login_Admin</code> once, call it from 40 cases. Fix the group — every case using it inherits the fix instantly.</p>
              </div>
            </div>
          )}

          {/* ── STEP GROUPS TAB ── */}
          {activeTab === "step-groups" && (
            <div>
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {/* Toolbar */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                  <div className="relative w-64">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search step groups…"
                      className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400"
                    />
                  </div>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white text-gray-600 hover:bg-gray-50 transition-colors">
                    <RefreshCw size={13} />
                  </button>
                </div>

                {/* Table */}
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/40">
                      <th className="px-4 py-3 text-left cqa-th">Name</th>
                      <th className="px-4 py-3 text-left cqa-th">Steps</th>
                      <th className="px-4 py-3 text-left cqa-th">Used by</th>
                      <th className="px-4 py-3 text-left cqa-th">Preview</th>
                      <th className="px-4 py-3 text-left cqa-th">Updated</th>
                      <th className="w-16 px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {STEP_GROUPS.map((sg) => (
                      <tr key={sg.id} className="group hover:bg-indigo-50/20 transition-colors">
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500 text-xs flex-shrink-0">
                              <DuoIcon icon="layer-group" />
                            </div>
                            <div>
                              <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">
                                {sg.name}
                              </span>
                              <p className="text-[11px] text-gray-400 mt-0.5 max-w-[220px] truncate">{sg.description}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="text-xs font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded-full">
                            {sg.stepCount} step{sg.stepCount !== 1 ? "s" : ""}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="flex items-center gap-1 text-xs text-gray-500">
                            <DuoIcon icon="clipboard-list" className="text-gray-400" />
                            {sg.usedBy} test case{sg.usedBy !== 1 ? "s" : ""}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <ol className="text-[11px] text-gray-400 space-y-0.5 list-decimal list-inside">
                            {sg.steps.slice(0, 2).map((step, i) => (
                              <li key={i} className="truncate max-w-[220px]">{step}</li>
                            ))}
                            {sg.steps.length > 2 && (
                              <li className="text-indigo-400 font-medium">+{sg.steps.length - 2} more…</li>
                            )}
                          </ol>
                        </td>
                        <td className="px-4 py-3.5 text-xs text-gray-400 whitespace-nowrap">{sg.updatedAt}</td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-indigo-50 hover:text-indigo-600 transition-colors border border-gray-200" title="Edit">
                              <DuoIcon icon="pencil" className="text-xs" />
                            </button>
                            <button className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors border border-gray-200" title="Delete">
                              <DuoIcon icon="trash" className="text-xs" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Footer */}
                <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/40 text-xs text-gray-400">
                  {STEP_GROUPS.length} step groups · {STEP_GROUPS.reduce((n, sg) => n + sg.usedBy, 0)} total usages across test cases
                </div>
              </div>
            </div>
          )}

          {/* ── SUITES TAB ── */}
          {activeTab === "suites" && (
            <div>
              {!dismissedCards.has("suites") && (
                <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl px-5 py-4 mb-5 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 text-lg flex-shrink-0 mt-0.5">
                    <DuoIcon icon="grid-2" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-1.5">
                      <p className="text-sm font-bold text-indigo-900">Suites — curated collections per product area</p>
                      <button onClick={() => dismissCard("suites")} className="w-5 h-5 flex items-center justify-center rounded text-indigo-300 hover:text-indigo-600 hover:bg-indigo-100 transition-colors flex-shrink-0" title="Dismiss">
                        <X size={12} />
                      </button>
                    </div>
                    <p className="text-xs text-indigo-700/70 leading-relaxed">A Suite <strong>groups related Test Cases</strong> that belong to the same feature or product area — Auth, Checkout, Search. Run a Suite to validate one area in a single click, and get a focused pass/fail view for that area only.</p>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-3 gap-4">
                {SUITES.map((suite) => {
                  const passColor = suite.passRate >= 80 ? "bg-green-100 text-green-700" : suite.passRate >= 60 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-600";
                  return (
                    <div key={suite.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow group">
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500 text-lg flex-shrink-0">
                          <DuoIcon icon="grid-2" />
                        </div>
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${passColor}`}>
                          {suite.passRate}% pass
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-gray-900 mb-1">{suite.name}</h3>
                      <p className="text-xs text-gray-400 mb-4 leading-relaxed">{suite.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <DuoIcon icon="clipboard-list" />
                            {suite.caseCount} cases
                          </span>
                        </div>
                        <button className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-indigo-50 hover:text-indigo-600 transition-colors border border-gray-200" title="Edit suite">
                          <DuoIcon icon="pencil" className="text-xs" />
                        </button>
                      </div>
                      <p className="text-[10px] text-gray-300 mt-2">Last run {suite.lastRun}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── PLANS TAB ── */}
          {activeTab === "plans" && (
            <div>
              {!dismissedCards.has("plans") && (
                <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl px-5 py-4 mb-5 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 text-lg flex-shrink-0 mt-0.5">
                    <DuoIcon icon="circle-play" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-1.5">
                      <p className="text-sm font-bold text-indigo-900">Plans — your execution blueprint, wired to CI/CD</p>
                      <button onClick={() => dismissCard("plans")} className="w-5 h-5 flex items-center justify-center rounded text-indigo-300 hover:text-indigo-600 hover:bg-indigo-100 transition-colors flex-shrink-0" title="Dismiss">
                        <X size={12} />
                      </button>
                    </div>
                    <p className="text-xs text-indigo-700/70 leading-relaxed">A Plan <strong>orchestrates one or more Suites</strong> into a scheduled, full test run. Attach it to your GitHub Actions pipeline so every deployment is gated by a real pass/fail signal — not a guess.</p>
                  </div>
                </div>
              )}
              <div className="flex flex-col gap-4">
                {PLANS.map((plan) => {
                  const isRunning = plan.status === "Running";
                  return (
                    <div key={plan.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow flex items-center gap-5">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${isRunning ? "bg-indigo-50 text-indigo-500" : "bg-green-50 text-green-500"}`}>
                        <DuoIcon icon="circle-play" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-bold text-gray-900">{plan.name}</h3>
                          {isRunning ? (
                            <span className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200 animate-pulse">
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 inline-block" />
                              Running
                            </span>
                          ) : (
                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                              {plan.status}
                            </span>
                          )}
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 border border-gray-200">
                            {plan.ciTag}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mb-2">{plan.description}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-400">
                          <span className="flex items-center gap-1"><DuoIcon icon="grid-2" /> {plan.suiteCount} suites</span>
                          <span className="flex items-center gap-1"><DuoIcon icon="clipboard-list" /> {plan.caseCount} cases</span>
                          <span>Last run {plan.lastRun}</span>
                        </div>
                      </div>
                      <button className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all flex-shrink-0 ${
                        isRunning
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 shadow-sm"
                      }`}>
                        <DuoIcon icon={isRunning ? "spinner" : "circle-play"} className={isRunning ? "animate-spin" : ""} />
                        {isRunning ? "Running…" : "Run Plan"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── CASES TAB ── */}
          {activeSecNav === "test-cases" && activeTab === "cases" && <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <div className="relative w-64">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by ID or Title"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400"
                />
              </div>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white text-gray-600 hover:bg-gray-50 transition-colors">
                  All Test Cases <ChevronDown size={13} className="text-gray-400" />
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white text-gray-600 hover:bg-gray-50 transition-colors">
                  <Plus size={13} /> Filter
                </button>
                <button className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors">
                  <SlidersHorizontal size={14} />
                </button>
                <button className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors">
                  <RefreshCw size={14} />
                </button>
              </div>
            </div>

            {/* Filter chips */}
            <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-100 bg-gray-50/60">
              <span className="text-xs text-gray-500 font-medium">Test Type:</span>
              {filterChips.map((chip) => (
                <span key={chip} className="flex items-center gap-1 text-xs bg-white border border-gray-200 rounded px-2 py-0.5 text-gray-700 font-medium">
                  {chip}
                  <button className="text-gray-400 hover:text-gray-600 ml-0.5"><X size={10} /></button>
                </span>
              ))}
              <button className="text-xs text-indigo-600 hover:underline font-medium ml-1">Clear All</button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/40">
                    <th className="w-10 px-4 py-3 text-left">
                      <button onClick={toggleAll} className="text-gray-400 hover:text-gray-600">
                        {allSelected ? <CheckSquare size={15} className="text-indigo-600" /> : <Square size={15} />}
                      </button>
                    </th>
                    {["Test Cases","Feature","Type","Priority","Result","Status","Labels","Created By","Created At","Updated At"].map((col) => (
                      <th key={col} className="px-3 py-3 text-left cqa-th">{col}</th>
                    ))}
                    <th className="w-8 px-2 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((tc) => (
                    <tr
                      key={tc.id}
                      onClick={() => tc.status === "Live" && navigate(`/execution/${tc.id}`)}
                      className={`group transition-colors ${
                        tc.status === "Live"
                          ? "bg-indigo-50/40 border-l-2 border-indigo-400 cursor-pointer hover:bg-indigo-100/50"
                          : selectedRows.includes(tc.id)
                          ? "bg-indigo-50/20 hover:bg-indigo-50/30"
                          : "hover:bg-indigo-50/30"
                      }`}
                    >
                      <td className="px-4 py-3.5">
                        <button onClick={() => toggleRow(tc.id)} className="text-gray-400 hover:text-gray-600">
                          {selectedRows.includes(tc.id) ? <CheckSquare size={15} className="text-indigo-600" /> : <Square size={15} />}
                        </button>
                      </td>
                      <td className="px-3 py-3.5">
                        <button className="text-indigo-600 font-semibold text-xs hover:underline block">{tc.id}</button>
                        <p className="text-xs text-gray-500 mt-0.5 max-w-[200px] truncate">{tc.title}</p>
                      </td>
                      <td className="px-3 py-3.5"><FeatureChip feature={tc.feature} /></td>
                      <td className="px-3 py-3.5"><TypeBadge type={tc.type} typeIcon={tc.typeIcon} /></td>
                      <td className="px-3 py-3.5"><PriorityBadge priority={tc.priority} /></td>
                      <td className="px-3 py-3.5"><ResultBadge result={tc.result} /></td>
                      <td className="px-3 py-3.5"><StatusBadge status={tc.status} /></td>
                      <td className="px-3 py-3.5 text-xs text-gray-400">{tc.labels}</td>
                      <td className="px-3 py-3.5">
                        <div className="flex items-center gap-1.5 text-xs text-gray-600">
                          <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                            <User size={10} className="text-indigo-600" />
                          </div>
                          {tc.createdBy}
                        </div>
                      </td>
                      <td className="px-3 py-3.5 text-xs text-gray-500 whitespace-nowrap">{tc.createdAt}</td>
                      <td className="px-3 py-3.5 text-xs text-gray-500 whitespace-nowrap">{tc.updatedAt}</td>
                      <td className="px-2 py-3.5">
                        <button className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 transition-opacity">
                          <ChevronRight size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50/40">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>Rows per page</span>
                <button className="flex items-center gap-1 border border-gray-200 rounded px-2 py-0.5 bg-white hover:bg-gray-50">
                  10 <ChevronDown size={10} />
                </button>
              </div>
              <div className="text-xs text-gray-400">1–{filtered.length} of {filtered.length}</div>
            </div>
          </div>}
          </>}
        </div>
      </div>
      <AddContextDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  );
}
