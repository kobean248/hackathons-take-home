import type { Metadata } from "next";
import {
  Space_Grotesk,
  IBM_Plex_Sans,
  Bricolage_Grotesque,
} from "next/font/google";
import { Footer } from "@/components/footer";
import { AmbientBackground } from "@/components/shell/ambient-background";
import { ToastProvider } from "@/components/shell/toast-provider";
import "./globals.css";

// Characterful display face for hero headlines / section titles —
// Space Grotesk stays on UI chrome (nav, buttons, labels).
const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-ibm-plex-sans",
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
      className={`${bricolage.variable} ${spaceGrotesk.variable} ${ibmPlexSans.variable} h-full antialiased`}
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
