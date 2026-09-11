import type { Metadata } from "next";
import { Syne, Outfit, Source_Sans_3 } from "next/font/google";
import { Footer } from "@/components/footer";
import { AmbientBackground } from "@/components/shell/ambient-background";
import { ToastProvider } from "@/components/shell/toast-provider";
import "./globals.css";

// Syne — angular, distinctive display (not the usual AI-default grotesk).
const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

// Outfit — geometric UI chrome that still feels designed.
const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// Source Sans 3 — readable working-page body, campus-adjacent without Inter.
const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Hackathons @ Berkeley — Portal",
  description: "Apply, track, and review Hackathons @ Berkeley applications.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${syne.variable} ${outfit.variable} ${sourceSans.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <AmbientBackground />
        <ToastProvider>
          <div className="relative z-10 flex flex-1 flex-col">
            <div className="flex-1">{children}</div>
            <Footer />
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}
