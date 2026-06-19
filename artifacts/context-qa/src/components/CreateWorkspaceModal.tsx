import { useState, useRef, useEffect } from "react";

const WORKSPACE_TYPES = [
  "Web Application",
  "Mobile Application",
  "API / Backend",
  "Desktop Application",
  "Other",
];

const SAMPLE_USERS = [
  { id: "u1", name: "Alex Johnson", email: "alex@acmecorp.com", initials: "AJ", color: "#6366F1" },
  { id: "u2", name: "Maria Silva", email: "maria@acmecorp.com", initials: "MS", color: "#10B981" },
  { id: "u3", name: "James Liu", email: "james@acmecorp.com", initials: "JL", color: "#F59E0B" },
  { id: "u4", name: "Sarah Park", email: "sarah@acmecorp.com", initials: "SP", color: "#EC4899" },
  { id: "u5", name: "Daniel Torres", email: "daniel@acmecorp.com", initials: "DT", color: "#8B5CF6" },
];

interface CreateWorkspaceModalProps {
  open: boolean;
  onClose: () => void;
}

export function CreateWorkspaceModal({ open, onClose }: CreateWorkspaceModalProps) {
  const [name, setName] = useState("");
  const [descOpen, setDescOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [workspaceType, setWorkspaceType] = useState("Web Application");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [nameError, setNameError] = useState("");
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setName("");
      setDescription("");
      setDescOpen(false);
      setWorkspaceType("Web Application");
      setSelectedUsers([]);
      setNameError("");
      setTimeout(() => nameRef.current?.focus(), 80);
    }
  }, [open]);

  function toggleUser(id: string) {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((u) => u !== id) : [...prev, id]
    );
  }

  function handleCreate() {
    if (!name.trim()) {
      setNameError("Workspace name is required.");
      nameRef.current?.focus();
      return;
    }
    onClose();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") onClose();
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onKeyDown={handleKeyDown}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
        style={{ animation: "cqa-modal-in 0.18s cubic-bezier(0.34,1.56,0.64,1) both" }}
        onClick={(e) => e.stopPropagation()}
      >
        <style>{`
          @keyframes cqa-modal-in {
            from { opacity:0; transform:scale(0.92) translateY(12px); }
            to   { opacity:1; transform:scale(1) translateY(0); }
          }
        `}</style>

        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-7 py-5">
          <p className="text-indigo-200 text-xs font-semibold uppercase tracking-wide mb-0.5">
            New workspace
          </p>
          <h2 className="text-white text-xl font-bold leading-tight">
            Create Workspace
          </h2>
          <p className="text-indigo-200 text-sm mt-1">
            Set up a new isolated workspace for your project.
          </p>
        </div>

        <div className="px-7 py-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Workspace Name <span className="text-red-500">*</span>
            </label>
            <input
              ref={nameRef}
              value={name}
              onChange={(e) => { setName(e.target.value); setNameError(""); }}
              placeholder="e.g. Production QA, Mobile v2…"
              className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-all ${
                nameError
                  ? "border-red-300 focus:ring-red-200"
                  : "border-gray-200 focus:border-indigo-400 focus:ring-indigo-100"
              }`}
            />
            {nameError && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                {nameError}
              </p>
            )}
          </div>

          <div>
            <button
              onClick={() => setDescOpen((v) => !v)}
              className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-700 transition-colors"
            >
              <svg
                className={`w-3.5 h-3.5 transition-transform duration-200 ${descOpen ? "rotate-90" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              Description
              <span className="text-gray-400 font-normal">(optional)</span>
            </button>
            <div
              className="overflow-hidden transition-all duration-300"
              style={{ maxHeight: descOpen ? "120px" : "0px" }}
            >
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is this workspace for?"
                rows={3}
                className="w-full mt-2 px-3 py-2.5 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 placeholder-gray-300 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Workspace Type
            </label>
            <div className="relative">
              <select
                value={workspaceType}
                onChange={(e) => setWorkspaceType(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white appearance-none pr-8"
              >
                {WORKSPACE_TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
              <svg className="w-4 h-4 absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              Select Users
            </label>
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {SAMPLE_USERS.map((user) => {
                const isSelected = selectedUsers.includes(user.id);
                return (
                  <button
                    key={user.id}
                    onClick={() => toggleUser(user.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg border text-left transition-all ${
                      isSelected
                        ? "border-indigo-300 bg-indigo-50"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                      style={{ backgroundColor: user.color }}
                    >
                      {user.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-900 truncate">{user.name}</p>
                      <p className="text-[10px] text-gray-400 truncate">{user.email}</p>
                    </div>
                    {isSelected && (
                      <svg className="w-3.5 h-3.5 text-indigo-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="px-7 pb-6 flex gap-3 pt-2 border-t border-gray-100">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm"
          >
            Create Workspace
          </button>
        </div>
      </div>
    </div>
  );
}
