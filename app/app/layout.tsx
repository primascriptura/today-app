import type { Metadata, Viewport } from "next";
import { Caprasimo, Figtree } from "next/font/google";
import "./globals.css";

// "Organic" design-system typefaces: Caprasimo for headings, Figtree for body.
const heading = Caprasimo({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

const body = Figtree({
  weight: ["400", "600", "700"],
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Today — voice-first day planner",
  description:
    "Capture tasks in a second. A voice-first day planner. (AI parsing not wired up yet — this is the UI skeleton.)",
  applicationName: "Today",
  appleWebApp: { capable: true, title: "Today", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: "#f9f4ed",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${heading.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}
