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
    case "phone":
      return (
        <svg {...common}>
          <path d="M6.5 3H4.5A1.5 1.5 0 0 0 3 4.6C3.4 12.5 11.5 20.6 19.4 21a1.5 1.5 0 0 0 1.6-1.5v-2a1.5 1.5 0 0 0-1.2-1.5l-2.6-.5a1.5 1.5 0 0 0-1.4.6l-.6.9a12 12 0 0 1-5.7-5.7l.9-.6a1.5 1.5 0 0 0 .6-1.4l-.5-2.6A1.5 1.5 0 0 0 6.5 3z" />
        </svg>
      );
    case "cart":
      return (
        <svg {...common}>
          <circle cx="9" cy="20" r="1.4" />
          <circle cx="18" cy="20" r="1.4" />
          <path d="M2 3h2.2l2.3 12.2a1.6 1.6 0 0 0 1.6 1.3h8.8a1.6 1.6 0 0 0 1.6-1.3L20 7H5.2" />
        </svg>
      );
    case "heart":
      return (
        <svg {...common}>
          <path d="M12 20.5 4.3 12.8a4.9 4.9 0 0 1 7-6.9l.7.7.7-.7a4.9 4.9 0 0 1 7 6.9z" />
        </svg>
      );
    case "activity":
      return (
        <svg {...common}>
          <path d="M3 12h4l3 8 4-16 3 8h4" />
        </svg>
      );
    case "book":
      return (
        <svg {...common}>
          <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v16H6.5A2.5 2.5 0 0 0 4 20.5z" />
          <path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H20v3H6.5A2.5 2.5 0 0 1 4 20.5z" />
        </svg>
      );
    case "plane":
      return (
        <svg {...common}>
          <path d="M10.2 3.2a1.5 1.5 0 0 1 2.6 0l.3 6 6.4 3.7a1 1 0 0 1 .5.9v1.1l-6.5-1.6-.2 3.6 2 1.4v1.5L12 20l-3.3 1.3v-1.5l2-1.4-.2-3.6L4 16.9v-1.1a1 1 0 0 1 .5-.9L11 11.2l.3-6z" />
        </svg>
      );
    case "food":
      return (
        <svg {...common}>
          <path d="M5 2v7a2 2 0 0 0 4 0V2" />
          <path d="M7 11v11" />
          <path d="M17 2c-1.7 0-3 2-3 5s1.3 4 3 4" />
          <path d="M17 2v20" />
        </svg>
      );
    case "doc":
      return (
        <svg {...common}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <path d="M14 2v6h6" />
          <path d="M8.5 13h7M8.5 17h7" />
        </svg>
      );
    case "pen":
      return (
        <svg {...common}>
          <path d="M12 20h9" />
          <path d="M16.4 3.4a2 2 0 0 1 2.8 2.8L7.5 18 3 19l1-4.5z" />
        </svg>
      );
    case "gift":
      return (
        <svg {...common}>
          <path d="M20 12v8a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-8" />
          <path d="M3 8h18v3a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z" />
          <path d="M12 8v13" />
          <path d="M12 8H7.5a2.5 2.5 0 1 1 0-5C11 3 12 8 12 8z" />
          <path d="M12 8h4.5a2.5 2.5 0 1 0 0-5C13 3 12 8 12 8z" />
        </svg>
      );
    case "calendar":
      return (
        <svg {...common}>
          <rect x="3" y="4.5" width="18" height="16.5" rx="2" />
          <path d="M3 9.5h18" />
          <path d="M8 2.5v4M16 2.5v4" />
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
