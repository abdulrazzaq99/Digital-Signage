import type { Metadata, Viewport } from "next";
import { Schibsted_Grotesk } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

// Schibsted Grotesk: a Nordic grotesk (Schibsted media group), readable at dashboard sizes.
const grotesk = Schibsted_Grotesk({ variable: "--font-grotesk", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DSP Admin · Digital Signage Platform",
  description: "Manage, schedule, and control your digital displays from one place.",
};

/** viewport-fit=cover lets the layout pad for the notch and home bar via env(safe-area-inset-*). */
export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#13213c" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${grotesk.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900"><Providers>{children}</Providers></body>
    </html>
  );
}
