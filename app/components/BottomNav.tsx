"use client";

type View = "today" | "inbox";

interface BottomNavProps {
  view: View;
  onSelect: (view: View) => void;
  /** Central accent action — opens the compose sheet to add a task. */
  onAdd: () => void;
}

/**
 * Superlist-style bottom bar: Inbox (left) · big accent Plus (center) · Today
 * (right). The Plus is the primary "add a task" action; the two flanking items
 * switch the task destination. Sits over the scrolling list with a fade so
 * content scrolls out of sight beneath it.
 */
export default function BottomNav({ view, onSelect, onAdd }: BottomNavProps) {
  return (
    <nav
      aria-label="Primary"
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        padding: "12px 30px 28px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "linear-gradient(to top, #f9f4ed 68%, rgba(249,244,237,0))",
      }}
    >
      <SideItem
        active={view === "inbox"}
        label="Inbox"
        onClick={() => onSelect("inbox")}
        icon={
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 12h-6l-2 3h-4l-2-3H2" />
            <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
          </svg>
        }
      />

      <button
        onClick={onAdd}
        aria-label="Add a task"
        style={{
          flex: "none",
          width: 62,
          height: 62,
          marginTop: -18,
          borderRadius: 999,
          border: "none",
          cursor: "pointer",
          display: "grid",
          placeItems: "center",
          background: "var(--app-accent)",
          color: "#fff",
          boxShadow: "0 10px 26px rgba(60,66,110,.42)",
        }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>

      <SideItem
        active={view === "today"}
        label="Today"
        onClick={() => onSelect("today")}
        icon={
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="3" />
            <line x1="3" y1="9" x2="21" y2="9" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="16" y1="2" x2="16" y2="6" />
          </svg>
        }
      />
    </nav>
  );
}

function SideItem({
  active,
  label,
  icon,
  onClick,
}: {
  active: boolean;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      style={{
        flex: 1,
        maxWidth: 96,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
        border: "none",
        background: "transparent",
        cursor: "pointer",
        padding: "4px 0",
        color: active
          ? "var(--app-accent-strong)"
          : "color-mix(in srgb, var(--color-text) 42%, transparent)",
        transition: "color .18s ease",
      }}
    >
      {icon}
      <span style={{ fontSize: 11.5, fontWeight: active ? 700 : 600, letterSpacing: ".02em" }}>
        {label}
      </span>
    </button>
  );
}
