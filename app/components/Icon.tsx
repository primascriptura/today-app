import type { IconKey } from "@/lib/types";

interface IconProps {
  name: IconKey;
  color?: string;
  size?: number;
}

// The task / slot glyph set, ported verbatim from Today.dc.html's icon().
export default function Icon({ name, color = "currentColor", size = 20 }: IconProps) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color,
    strokeWidth: 2.2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (name) {
    case "brief":
      return (
        <svg {...common}>
          <rect x="3" y="8" width="18" height="12" rx="2" />
          <path d="M9 8V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
        </svg>
      );
    case "mail":
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="M3 7l9 6 9-6" />
        </svg>
      );
    case "users":
      return (
        <svg {...common}>
          <circle cx="9" cy="9" r="3" />
          <path d="M4 20a5 5 0 0 1 10 0" />
          <path d="M16 7a3 3 0 0 1 0 6" />
        </svg>
      );
    case "card":
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      );
    case "home":
      return (
        <svg {...common}>
          <path d="M4 11l8-6 8 6" />
          <path d="M6 10v9h12v-9" />
        </svg>
      );
    case "sunrise":
      return (
        <svg {...common}>
          <path d="M12 3v5" />
          <path d="M5.6 10.6l1.4 1.4M17 12l1.4-1.4" />
          <path d="M4 18h16" />
          <path d="M8 14a4 4 0 0 1 8 0" />
        </svg>
      );
    case "sun":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.5 1.5M17.5 17.5L19 19M19 5l-1.5 1.5M6.5 17.5L5 19" />
        </svg>
      );
    case "moon":
      return (
        <svg {...common}>
          <path d="M20 14a8 8 0 0 1-10-10 8 8 0 1 0 10 10z" />
        </svg>
      );
    case "clock":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8" />
          <path d="M12 8v4l3 2" />
        </svg>
      );
    case "dot":
    default:
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3.5" />
        </svg>
      );
  }
}
