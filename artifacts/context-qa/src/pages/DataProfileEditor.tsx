import { useState } from "react";
import { useLocation, useParams } from "wouter";
import { IndigoSidebar } from "../components/IndigoSidebar";
import { WorkspaceDropdown } from "../components/WorkspaceDropdown";
import { Plus, X, ChevronDown, Eye, EyeOff, ArrowLeft, Upload, Download, Save, Info } from "lucide-react";

function DuoIcon({ icon, className = "" }: { icon: string; className?: string }) {
  return <i className={`fa-duotone solid fa-${icon} ${className}`} />;
}

type ColumnType = "text" | "password" | "boolean" | "number";

interface ProfileRow {
  id: string;
  setName: string;
  expectedToFail: boolean;
  values: Record<string, string>;
}

interface Column {
  key: string;
  label: string;
  type: ColumnType;
}

interface ProfileData {
  id: string;
  name: string;
  env: string;
  description: string;
  columns: Column[];
  rows: ProfileRow[];
  usedBy: { id: string; title: string }[];
  createdAt: string;
  updatedAt: string;
}

const PROFILES: Record<string, ProfileData> = {
  "DP-01": {
    id: "DP-01",
    name: "Valid Admin User",
    env: "Staging",
    description: "Credentials and role expectations for admin-level login scenarios",
    columns: [
      { key: "username", label: "username", type: "text" },
      { key: "password", label: "password", type: "password" },
      { key: "role",     label: "role",     type: "text" },
      { key: "expected_dashboard", label: "expected_dashboard", type: "text" },
    ],
    rows: [
      { id: "r1", setName: "admin_full",     expectedToFail: false, values: { username: "admin@test.io",    password: "Admin123!",   role: "Administrator", expected_dashboard: "Admin Dashboard"   } },
      { id: "r2", setName: "super_admin",    expectedToFail: false, values: { username: "super@test.io",    password: "Super456!",   role: "Super Admin",   expected_dashboard: "Admin Dashboard"   } },
      { id: "r3", setName: "admin_read",     expectedToFail: false, values: { username: "readonly@test.io", password: "Read789!",    role: "Read Only",     expected_dashboard: "Reports Dashboard" } },
    ],
    usedBy: [
      { id: "C-601", title: "Login flow — invalid credentials" },
      { id: "C-572", title: "SSO — SAML assertion validation" },
    ],
    createdAt: "14 Feb 2026",
    updatedAt: "01 Mar 2026",
  },
  "DP-02": {
    id: "DP-02",
    name: "Guest User — No Auth",
    env: "Staging",
    description: "Unauthenticated guest access flows",
    columns: [
      { key: "username", label: "username", type: "text" },
      { key: "password", label: "password", type: "password" },
      { key: "expected_redirect", label: "expected_redirect", type: "text" },
    ],
    rows: [
      { id: "r1", setName: "guest_01", expectedToFail: false, values: { username: "guest@test.io",  password: "Guest123!", expected_redirect: "/login" } },
      { id: "r2", setName: "guest_02", expectedToFail: true,  values: { username: "expired@test.io", password: "Old000!",  expected_redirect: "/expired" } },
    ],
    usedBy: [{ id: "C-544", title: "Admin panel — bulk delete items" }],
    createdAt: "14 Feb 2026",
    updatedAt: "12 Feb 2026",
  },
  "DP-03": {
    id: "DP-03",
    name: "Stripe Test Card — Success",
    env: "Sandbox",
    description: "Payment card data sets for successful checkout scenarios",
    columns: [
      { key: "card_number",   label: "card_number",   type: "text"     },
      { key: "expiry",        label: "expiry",        type: "text"     },
      { key: "cvv",           label: "cvv",           type: "password" },
      { key: "card_type",     label: "card_type",     type: "text"     },
      { key: "expected_result", label: "expected_result", type: "text" },
    ],
    rows: [
      { id: "r1", setName: "visa_success",   expectedToFail: false, values: { card_number: "4242 4242 4242 4242", expiry: "12/26", cvv: "123", card_type: "Visa",       expected_result: "Payment confirmed" } },
      { id: "r2", setName: "mc_success",     expectedToFail: false, values: { card_number: "5555 5555 5555 4444", expiry: "08/27", cvv: "456", card_type: "Mastercard", expected_result: "Payment confirmed" } },
      { id: "r3", setName: "amex_success",   expectedToFail: false, values: { card_number: "3714 496353 98431",   expiry: "01/25", cvv: "7890", card_type: "Amex",      expected_result: "Payment confirmed" } },
      { id: "r4", setName: "debit_success",  expectedToFail: false, values: { card_number: "4000 0566 5566 5556", expiry: "03/26", cvv: "321", card_type: "Debit Visa", expected_result: "Payment confirmed" } },
    ],
    usedBy: [
      { id: "C-589", title: "Checkout — payment gateway timeout" },
    ],
    createdAt: "10 Feb 2026",
    updatedAt: "28 Feb 2026",
  },
  "DP-04": {
    id: "DP-04",
    name: "Stripe Test Card — Decline",
    env: "Sandbox",
    description: "Payment card data sets for declined / error scenarios",
    columns: [
      { key: "card_number",   label: "card_number",   type: "text"     },
      { key: "expiry",        label: "expiry",        type: "text"     },
      { key: "cvv",           label: "cvv",           type: "password" },
      { key: "decline_code",  label: "decline_code",  type: "text"     },
      { key: "expected_error", label: "expected_error", type: "text"  },
    ],
    rows: [
      { id: "r1", setName: "generic_decline",    expectedToFail: true, values: { card_number: "4000 0000 0000 0002", expiry: "12/26", cvv: "123", decline_code: "card_declined",             expected_error: "Your card was declined." } },
      { id: "r2", setName: "insufficient_funds", expectedToFail: true, values: { card_number: "4000 0000 0000 9995", expiry: "08/27", cvv: "456", decline_code: "insufficient_funds",        expected_error: "Insufficient funds." } },
      { id: "r3", setName: "expired_card",       expectedToFail: true, values: { card_number: "4000 0000 0000 0069", expiry: "01/20", cvv: "789", decline_code: "expired_card",              expected_error: "Your card has expired." } },
      { id: "r4", setName: "incorrect_cvc",      expectedToFail: true, values: { card_number: "4000 0000 0000 0127", expiry: "03/26", cvv: "999", decline_code: "incorrect_cvc",             expected_error: "Your security code is incorrect." } },
      { id: "r5", setName: "lost_card",          expectedToFail: true, values: { card_number: "4000 0000 0000 9987", expiry: "06/25", cvv: "321", decline_code: "lost_card",                 expected_error: "Your card has been declined." } },
    ],
    usedBy: [
      { id: "C-589", title: "Checkout — payment gateway timeout" },
    ],
    createdAt: "10 Feb 2026",
    updatedAt: "28 Feb 2026",
  },
  "DP-05": {
    id: "DP-05",
    name: "Large File Upload (49 MB)",
    env: "Staging",
    description: "Edge-case file upload scenarios testing size limits",
    columns: [
      { key: "file_name",   label: "file_name",   type: "text"   },
      { key: "file_size",   label: "file_size_mb", type: "number" },
      { key: "mime_type",   label: "mime_type",   type: "text"   },
      { key: "expected_result", label: "expected_result", type: "text" },
    ],
    rows: [
      { id: "r1", setName: "pdf_large",    expectedToFail: false, values: { file_name: "report_large.pdf",   file_size: "49",  mime_type: "application/pdf",      expected_result: "Upload successful" } },
      { id: "r2", setName: "csv_large",    expectedToFail: false, values: { file_name: "export_large.csv",   file_size: "45",  mime_type: "text/csv",             expected_result: "Upload successful" } },
      { id: "r3", setName: "over_limit",   expectedToFail: true,  values: { file_name: "too_big.xlsx",       file_size: "51",  mime_type: "application/vnd.ms-excel", expected_result: "File exceeds 50 MB limit" } },
    ],
    usedBy: [],
    createdAt: "28 Jan 2026",
    updatedAt: "15 Feb 2026",
  },
  "DP-06": {
    id: "DP-06",
    name: "New Onboarding User",
    env: "Staging",
    description: "Fresh user registration flows for different plan tiers",
    columns: [
      { key: "email",        label: "email",       type: "text"     },
      { key: "password",     label: "password",    type: "password" },
      { key: "plan",         label: "plan",        type: "text"     },
      { key: "company_name", label: "company_name", type: "text"   },
      { key: "expected_welcome_msg", label: "expected_welcome_msg", type: "text" },
    ],
    rows: [
      { id: "r1", setName: "free_plan",    expectedToFail: false, values: { email: "free@newco.io",    password: "Free111!",  plan: "Free",       company_name: "NewCo Free",    expected_welcome_msg: "Welcome to ContextQA Free" } },
      { id: "r2", setName: "pro_plan",     expectedToFail: false, values: { email: "pro@newco.io",     password: "Pro222!",   plan: "Pro",        company_name: "NewCo Pro",     expected_welcome_msg: "Welcome to ContextQA Pro"  } },
      { id: "r3", setName: "team_plan",    expectedToFail: false, values: { email: "team@newco.io",    password: "Team333!",  plan: "Team",       company_name: "NewCo Team",    expected_welcome_msg: "Welcome to ContextQA Team" } },
      { id: "r4", setName: "enterprise",   expectedToFail: false, values: { email: "ent@enterprise.io", password: "Ent444!", plan: "Enterprise", company_name: "Enterprise Inc", expected_welcome_msg: "Welcome to ContextQA Enterprise" } },
    ],
    usedBy: [{ id: "C-544", title: "Admin panel — bulk delete items" }],
    createdAt: "28 Jan 2026",
    updatedAt: "10 Mar 2026",
  },
};

const DEFAULT_PROFILE: ProfileData = PROFILES["DP-01"];

const ENV_COLORS: Record<string, string> = {
  Staging:    "bg-teal-50 text-teal-700 border-teal-100",
  Sandbox:    "bg-purple-50 text-purple-700 border-purple-100",
  Production: "bg-red-50 text-red-700 border-red-100",
};

function CellInput({
  value,
  masked,
  onChange,
  placeholder = "",
  isBoolean = false,
  boolValue = false,
  onToggle,
}: {
  value?: string;
  masked?: boolean;
  onChange?: (v: string) => void;
  placeholder?: string;
  isBoolean?: boolean;
  boolValue?: boolean;
  onToggle?: () => void;
}) {
  const [revealed, setRevealed] = useState(false);

  if (isBoolean) {
    return (
      <div className="flex justify-center">
        <button
          onClick={onToggle}
          className={`relative w-9 h-5 rounded-full transition-colors duration-200 ${boolValue ? "bg-indigo-600" : "bg-gray-200"}`}
        >
          <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${boolValue ? "translate-x-4" : "translate-x-0.5"}`} />
        </button>
      </div>
    );
  }

  if (masked) {
    return (
      <div className="flex items-center gap-1 min-w-0">
        <input
          type={revealed ? "text" : "password"}
          value={value ?? ""}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-xs text-gray-700 placeholder-gray-300 outline-none min-w-0 font-mono"
        />
        <button
          onClick={() => setRevealed((r) => !r)}
          className="flex-shrink-0 text-gray-300 hover:text-gray-500 transition-colors"
        >
          {revealed ? <EyeOff size={11} /> : <Eye size={11} />}
        </button>
      </div>
    );
  }

  return (
    <input
      type="text"
      value={value ?? ""}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-transparent text-xs text-gray-700 placeholder-gray-300 outline-none"
    />
  );
}

export default function DataProfileEditor() {
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();

  const initial = PROFILES[params.id ?? ""] ?? DEFAULT_PROFILE;
  const [profile, setProfile] = useState<ProfileData>(initial);
  const [addColName, setAddColName] = useState("");
  const [addColType, setAddColType] = useState<ColumnType>("text");
  const [showAddCol, setShowAddCol] = useState(false);
  const [saved, setSaved] = useState(false);

  const updateCell = (rowId: string, colKey: string, val: string) => {
    setProfile((p) => ({
      ...p,
      rows: p.rows.map((r) => r.id === rowId ? { ...r, values: { ...r.values, [colKey]: val } } : r),
    }));
  };

  const updateSetName = (rowId: string, val: string) => {
    setProfile((p) => ({
      ...p,
      rows: p.rows.map((r) => r.id === rowId ? { ...r, setName: val } : r),
    }));
  };

  const toggleExpectedToFail = (rowId: string) => {
    setProfile((p) => ({
      ...p,
      rows: p.rows.map((r) => r.id === rowId ? { ...r, expectedToFail: !r.expectedToFail } : r),
    }));
  };

  const addRow = () => {
    const newRow: ProfileRow = {
      id: `r${Date.now()}`,
      setName: `set_${profile.rows.length + 1}`,
      expectedToFail: false,
      values: Object.fromEntries(profile.columns.map((c) => [c.key, ""])),
    };
    setProfile((p) => ({ ...p, rows: [...p.rows, newRow] }));
  };

  const deleteRow = (rowId: string) => {
    setProfile((p) => ({ ...p, rows: p.rows.filter((r) => r.id !== rowId) }));
  };

  const addColumn = () => {
    if (!addColName.trim()) return;
    const key = addColName.trim().toLowerCase().replace(/\s+/g, "_");
    setProfile((p) => ({
      ...p,
      columns: [...p.columns, { key, label: key, type: addColType }],
      rows: p.rows.map((r) => ({ ...r, values: { ...r.values, [key]: "" } })),
    }));
    setAddColName("");
    setAddColType("text");
    setShowAddCol(false);
  };

  const deleteColumn = (colKey: string) => {
    setProfile((p) => ({
      ...p,
      columns: p.columns.filter((c) => c.key !== colKey),
      rows: p.rows.map((r) => {
        const vals = { ...r.values };
        delete vals[colKey];
        return { ...r, values: vals };
      }),
    }));
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const typeIcon = (t: ColumnType) => {
    if (t === "password") return <DuoIcon icon="lock" className="text-amber-400 text-[10px]" />;
    if (t === "boolean") return <DuoIcon icon="toggle-on" className="text-indigo-400 text-[10px]" />;
    if (t === "number") return <DuoIcon icon="hashtag" className="text-blue-400 text-[10px]" />;
    return <DuoIcon icon="text" className="text-gray-300 text-[10px]" />;
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <IndigoSidebar
        onNew={() => {}}
        onNavigate={navigate}
        onBilling={() => navigate("/settings?section=billing")}
        activeItem="edit"
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* ── Top bar ── */}
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
          </div>
        </header>

        {/* ── Sub-header: breadcrumb + actions ── */}
        <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-sm">
            <button
              onClick={() => navigate("/tests")}
              className="flex items-center gap-1.5 text-gray-500 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft size={14} />
              <span className="font-medium">Data Profiles</span>
            </button>
            <span className="text-gray-300">/</span>
            <span className="font-semibold text-gray-900">{profile.name}</span>
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${ENV_COLORS[profile.env] ?? ENV_COLORS["Staging"]}`}>
              {profile.env}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer">
              <Upload size={13} />
              Import CSV
              <input type="file" accept=".csv,.xlsx" className="hidden" />
            </label>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white text-gray-600 hover:bg-gray-50 transition-colors">
              <Download size={13} />
              Export
            </button>
            <button
              onClick={handleSave}
              className={`flex items-center gap-1.5 px-4 py-1.5 text-sm font-semibold rounded-lg transition-all shadow-sm ${
                saved
                  ? "bg-green-500 text-white"
                  : "bg-indigo-600 hover:bg-indigo-700 text-white"
              }`}
            >
              <Save size={13} />
              {saved ? "Saved!" : "Save Changes"}
            </button>
          </div>
        </div>

        {/* ── Main content ── */}
        <div className="flex-1 overflow-auto px-8 py-6 space-y-5">

          {/* Profile meta card */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-start gap-6">
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide block mb-1">Profile Name</label>
                  <input
                    value={profile.name}
                    onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                    className="text-sm font-semibold text-gray-900 border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 w-64"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide block mb-1">Environment</label>
                  <div className="relative">
                    <select
                      value={profile.env}
                      onChange={(e) => setProfile((p) => ({ ...p, env: e.target.value }))}
                      className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 pr-7 focus:outline-none focus:ring-2 focus:ring-indigo-300 appearance-none bg-white text-gray-700"
                    >
                      <option>Staging</option>
                      <option>Sandbox</option>
                      <option>Production</option>
                    </select>
                    <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide block mb-1">Description</label>
                <input
                  value={profile.description}
                  onChange={(e) => setProfile((p) => ({ ...p, description: e.target.value }))}
                  placeholder="What is this profile for?"
                  className="text-sm text-gray-700 border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 w-full max-w-lg"
                />
              </div>
            </div>
            <div className="flex flex-col gap-3 shrink-0 text-right">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-0.5">Data Sets</p>
                <p className="text-2xl font-bold text-gray-900">{profile.rows.length}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-0.5">Variables</p>
                <p className="text-2xl font-bold text-gray-900">{profile.columns.length}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-0.5">Used by</p>
                <p className="text-2xl font-bold text-gray-900">{profile.usedBy.length} test{profile.usedBy.length !== 1 ? "s" : ""}</p>
              </div>
            </div>
          </div>

          {/* Callout */}
          <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl px-5 py-3.5 flex items-center gap-3">
            <Info size={16} className="text-indigo-400 flex-shrink-0" />
            <p className="text-xs text-indigo-700/80 leading-relaxed">
              Each row is one complete test run. Reference column values in test steps using <code className="bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-mono text-[10px]">{"${username}"}</code>. When attached to a test plan, the test case runs once per row — each with its own screenshots and result record.
            </p>
          </div>

          {/* ── Spreadsheet ── */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            {/* Spreadsheet toolbar */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 bg-gray-50/60">
              <p className="text-xs font-semibold text-gray-500">
                {profile.rows.length} data set{profile.rows.length !== 1 ? "s" : ""} · {profile.columns.length} variable{profile.columns.length !== 1 ? "s" : ""}
              </p>
              <button
                onClick={addRow}
                className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors"
              >
                <Plus size={11} /> Add Row
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    {/* # */}
                    <th className="w-10 px-3 py-2.5 text-left">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">#</span>
                    </th>
                    {/* Set Name */}
                    <th className="px-3 py-2.5 text-left min-w-[140px]">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Set Name</span>
                    </th>
                    {/* Fail toggle */}
                    <th className="px-3 py-2.5 text-center w-[120px]">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide whitespace-nowrap">Expected to Fail</span>
                    </th>
                    {/* Dynamic columns */}
                    {profile.columns.map((col) => (
                      <th key={col.key} className="px-3 py-2.5 text-left min-w-[160px] group/col">
                        <div className="flex items-center gap-1.5">
                          {typeIcon(col.type)}
                          <code className="text-[11px] font-mono font-bold text-gray-600">{col.label}</code>
                          <button
                            onClick={() => deleteColumn(col.key)}
                            className="opacity-0 group-hover/col:opacity-100 transition-opacity w-4 h-4 flex items-center justify-center rounded text-gray-300 hover:text-red-400 hover:bg-red-50 ml-auto"
                          >
                            <X size={10} />
                          </button>
                        </div>
                      </th>
                    ))}
                    {/* Add column */}
                    <th className="px-3 py-2.5 w-10">
                      {showAddCol ? (
                        <div className="flex items-center gap-1 min-w-[260px]">
                          <input
                            autoFocus
                            value={addColName}
                            onChange={(e) => setAddColName(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter") addColumn(); if (e.key === "Escape") setShowAddCol(false); }}
                            placeholder="variable_name"
                            className="flex-1 text-xs border border-indigo-300 rounded px-2 py-1 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-400"
                          />
                          <select
                            value={addColType}
                            onChange={(e) => setAddColType(e.target.value as ColumnType)}
                            className="text-xs border border-gray-200 rounded px-1 py-1 focus:outline-none bg-white"
                          >
                            <option value="text">text</option>
                            <option value="password">password</option>
                            <option value="boolean">boolean</option>
                            <option value="number">number</option>
                          </select>
                          <button onClick={addColumn} className="text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-2 py-1 rounded transition-colors">
                            Add
                          </button>
                          <button onClick={() => setShowAddCol(false)} className="text-gray-400 hover:text-gray-600">
                            <X size={12} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setShowAddCol(true)}
                          className="flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-600 transition-colors whitespace-nowrap"
                          title="Add column"
                        >
                          <Plus size={12} /> Add Column
                        </button>
                      )}
                    </th>
                    {/* Delete col */}
                    <th className="w-8" />
                  </tr>
                </thead>
                <tbody>
                  {profile.rows.map((row, idx) => (
                    <tr
                      key={row.id}
                      className={`group/row border-b border-gray-50 hover:bg-indigo-50/20 transition-colors ${row.expectedToFail ? "bg-red-50/30" : ""}`}
                    >
                      {/* # */}
                      <td className="px-3 py-2.5 text-center">
                        <span className="text-xs text-gray-400 font-mono w-5 h-5 rounded flex items-center justify-center">{String(idx + 1).padStart(2, "0")}</span>
                      </td>
                      {/* Set Name */}
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-indigo-300 flex-shrink-0" />
                          <input
                            value={row.setName}
                            onChange={(e) => updateSetName(row.id, e.target.value)}
                            className="text-xs font-mono font-semibold text-gray-700 bg-transparent outline-none w-full"
                          />
                        </div>
                      </td>
                      {/* Expected to Fail */}
                      <td className="px-3 py-2.5">
                        <CellInput
                          isBoolean
                          boolValue={row.expectedToFail}
                          onToggle={() => toggleExpectedToFail(row.id)}
                        />
                      </td>
                      {/* Dynamic cells */}
                      {profile.columns.map((col) => (
                        <td key={col.key} className="px-3 py-2.5 border-l border-gray-50">
                          <div className={`rounded px-2 py-1 ${col.type === "password" ? "bg-gray-50" : ""}`}>
                            <CellInput
                              value={row.values[col.key] ?? ""}
                              masked={col.type === "password"}
                              onChange={(v) => updateCell(row.id, col.key, v)}
                              placeholder={col.type === "password" ? "••••••••" : `${col.label}…`}
                            />
                          </div>
                        </td>
                      ))}
                      {/* Add col spacer */}
                      <td />
                      {/* Delete row */}
                      <td className="pr-3">
                        <button
                          onClick={() => deleteRow(row.id)}
                          className="opacity-0 group-hover/row:opacity-100 transition-opacity w-6 h-6 flex items-center justify-center rounded text-gray-300 hover:text-red-400 hover:bg-red-50"
                        >
                          <X size={12} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {/* Empty state */}
                  {profile.rows.length === 0 && (
                    <tr>
                      <td colSpan={profile.columns.length + 5} className="px-4 py-10 text-center">
                        <p className="text-sm text-gray-400">No data sets yet.</p>
                        <button onClick={addRow} className="mt-2 text-xs text-indigo-600 hover:underline font-medium">
                          + Add first row
                        </button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/40 flex items-center justify-between">
              <button
                onClick={addRow}
                className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                <Plus size={12} /> Add Row
              </button>
              <p className="text-xs text-gray-400">
                {profile.rows.filter((r) => r.expectedToFail).length > 0 && (
                  <span className="text-red-400 font-medium mr-3">
                    {profile.rows.filter((r) => r.expectedToFail).length} expected to fail
                  </span>
                )}
                {profile.rows.length} run{profile.rows.length !== 1 ? "s" : ""} when executed
              </p>
            </div>
          </div>

          {/* ── Used by test cases ── */}
          {profile.usedBy.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                <DuoIcon icon="clipboard-list" className="text-indigo-400" />
                Test cases using this profile
              </h3>
              <div className="space-y-2">
                {profile.usedBy.map((tc) => (
                  <div key={tc.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-gray-100 bg-gray-50/60 hover:border-indigo-100 hover:bg-indigo-50/20 transition-colors group cursor-pointer">
                    <div className="w-6 h-6 rounded bg-indigo-50 flex items-center justify-center flex-shrink-0">
                      <DuoIcon icon="clipboard-list" className="text-indigo-400 text-xs" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-semibold text-indigo-600">{tc.id}</span>
                      <span className="text-xs text-gray-600 ml-2">{tc.title}</span>
                    </div>
                    <span className="text-[10px] text-gray-400 group-hover:text-indigo-400 transition-colors">View →</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bottom spacer */}
          <div className="h-6" />
        </div>
      </div>
    </div>
  );
}
