import cqaLogo from "@assets/cqa-logo.aa54dd71ef9f47a3_1776180238345.png";
import { SidebarProfile } from "./ProfilePopup";

function DuoIcon({ icon, className = "" }: { icon: string; className?: string }) {
  return <i className={`fa-duotone solid fa-${icon} ${className}`} />;
}

const NAV_ITEMS = [
  { icon: "plus",   label: "New"     },
  { icon: "pencil", label: "Edit"    },
  { icon: "books",  label: "Context" },
];

export type ActiveSidebarItem = "edit" | "settings" | "context";

interface IndigoSidebarProps {
  onNew: () => void;
  onNavigate: (path: string) => void;
  onBilling: () => void;
  activeItem?: ActiveSidebarItem;
  onContextClick?: () => void;
}

export function IndigoSidebar({
  onNew,
  onNavigate,
  onBilling,
  activeItem,
  onContextClick,
}: IndigoSidebarProps) {
  return (
    <aside className="w-16 bg-indigo-700 flex flex-col items-center py-4 shrink-0">
      <button onClick={() => onNavigate("/dashboard")} className="mb-3 shrink-0">
        <img src={cqaLogo} alt="ContextQA" className="w-10 h-10 object-contain" />
      </button>

      <div className="flex flex-col items-center gap-1">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.label === "Context" ? activeItem === "context" :
            item.label === "Edit"    ? activeItem === "edit"    : false;

          const handleClick =
            item.label === "New"     ? onNew :
            item.label === "Edit"    ? () => onNavigate("/tests") :
            item.label === "Context" ? (onContextClick ?? (() => onNavigate("/context"))) :
            undefined;

          return (
            <button
              key={item.label}
              onClick={handleClick}
              title={item.label}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors text-base ${
                isActive
                  ? "bg-white/20 text-white"
                  : item.label === "New"
                  ? "text-white hover:bg-white/10"
                  : "text-white/60 hover:bg-white/10 hover:text-white"
              }`}
            >
              <DuoIcon icon={item.icon} />
            </button>
          );
        })}
      </div>

      <div className="flex-1" />
      <div className="flex flex-col items-center gap-1 pb-1">
        <SidebarProfile onNavigate={onNavigate} onBilling={onBilling} />
        <button
          onClick={() => onNavigate("/settings")}
          title="Settings"
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors text-base ${
            activeItem === "settings"
              ? "bg-white/20 text-white"
              : "text-white/60 hover:bg-white/10 hover:text-white"
          }`}
        >
          <DuoIcon icon="gear" />
        </button>
      </div>
    </aside>
  );
}
