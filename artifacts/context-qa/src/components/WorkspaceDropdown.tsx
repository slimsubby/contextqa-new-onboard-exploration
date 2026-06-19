import { useState, useRef, useEffect } from "react";
import { CreateWorkspaceModal } from "./CreateWorkspaceModal";

const SAMPLE_WORKSPACES = [
  { id: "ws-1", name: "Web workspace", badge: "Live", badgeClass: "bg-indigo-100 text-indigo-700" },
  { id: "ws-2", name: "Workspace 2 - CoachonCue", badge: null, badgeClass: "" },
  { id: "ws-3", name: "Transistor Replit App", badge: null, badgeClass: "" },
  { id: "ws-4", name: "test-sean", badge: null, badgeClass: "" },
];

interface WorkspaceDropdownProps {
  className?: string;
}

export function WorkspaceDropdown({ className = "" }: WorkspaceDropdownProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(SAMPLE_WORKSPACES[0]);
  const [showModal, setShowModal] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  useEffect(() => {
    if (open) {
      setTimeout(() => searchRef.current?.focus(), 50);
    } else {
      setSearch("");
    }
  }, [open]);

  const filtered = SAMPLE_WORKSPACES.filter((ws) =>
    ws.name.toLowerCase().includes(search.toLowerCase())
  );

  function handleSelect(ws: typeof SAMPLE_WORKSPACES[number]) {
    setSelected(ws);
    setOpen(false);
    setSearch("");
  }

  function handleCreateClick() {
    setOpen(false);
    setSearch("");
    setShowModal(true);
  }

  return (
    <>
      <div ref={containerRef} className={`relative ${className}`}>
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-1.5 text-sm text-gray-700 cursor-pointer hover:bg-gray-200 transition-colors"
        >
          <span>
            {selected.name}
            {selected.badge && (
              <span className={`ml-1.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${selected.badgeClass}`}>
                {selected.badge}
              </span>
            )}
          </span>
          <svg
            className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {open && (
          <div
            className="absolute right-0 top-full mt-1.5 z-50 w-64 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden flex flex-col"
            style={{ maxHeight: 280, animation: "cqa-dropdown-in 0.12s cubic-bezier(0.34,1.56,0.64,1) both" }}
          >
            <style>{`
              @keyframes cqa-dropdown-in {
                from { opacity:0; transform:scale(0.95) translateY(-4px); }
                to   { opacity:1; transform:scale(1) translateY(0); }
              }
            `}</style>

            <div className="px-3 pt-2.5 pb-2 shrink-0">
              <div className="relative">
                <svg className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  ref={searchRef}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search workspaces…"
                  className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto min-h-0">
              {filtered.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-4 px-3">No workspaces found</p>
              ) : (
                <ul>
                  {filtered.map((ws) => {
                    const isActive = ws.id === selected.id;
                    return (
                      <li key={ws.id}>
                        <button
                          onClick={() => handleSelect(ws)}
                          className={`w-full text-left flex items-center justify-between gap-2 px-3 py-2.5 text-sm transition-colors ${
                            isActive
                              ? "bg-indigo-50 text-indigo-700"
                              : "text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          <span className="truncate font-medium">{ws.name}</span>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {ws.badge && (
                              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${ws.badgeClass}`}>
                                {ws.badge}
                              </span>
                            )}
                            {isActive && (
                              <svg className="w-3.5 h-3.5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="shrink-0 border-t border-gray-100 p-2">
              <button
                onClick={handleCreateClick}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-indigo-600 hover:bg-indigo-50 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Workspace
              </button>
            </div>
          </div>
        )}
      </div>

      <CreateWorkspaceModal open={showModal} onClose={() => setShowModal(false)} />
    </>
  );
}
