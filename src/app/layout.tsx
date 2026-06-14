import type { Metadata, Viewport } from "next";
import { Uncial_Antiqua, Cormorant_Garamond, EB_Garamond, Caveat } from "next/font/google";
import "./globals.css";
import { AmbianceProvider } from "@/components/ambiance/ambiance-context";
import Atmosphere from "@/components/atmosphere/Atmosphere";
import AmbianceControls from "@/components/ambiance/AmbianceControls";
import GladeRain from "@/components/ambiance/GladeRain";
import MusicPlayer from "@/components/ambiance/MusicPlayer";
import RainToggle from "@/components/ambiance/RainToggle";

const uncial = Uncial_Antiqua({ weight: "400", subsets: ["latin"], variable: "--font-uncial", display: "swap" });
const cormorant = Cormorant_Garamond({ weight: ["500", "600", "700"], subsets: ["latin"], variable: "--font-cormorant", display: "swap" });
const garamond = EB_Garamond({ subsets: ["latin"], variable: "--font-garamond", display: "swap" });
const caveat = Caveat({ weight: ["400", "600", "700"], subsets: ["latin"], variable: "--font-caveat", display: "swap" });

export const metadata: Metadata = {
  title: "Acorn & Ink — an enchanted library in the heart of the wood",
  description:
    "A cozy, goblincore library where you tend your shelves of novels, manga and comics by candlelight — track what you read, rate by mushrooms, and wander a public library of the world's books.",
};

export const viewport: Viewport = {
  themeColor: "#0b100c",
  colorScheme: "dark",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      data-atmosphere="on"
      className={`${uncial.variable} ${cormorant.variable} ${garamond.variable} ${caveat.variable} h-full`}
    >
      <body className="min-h-full">
        <AmbianceProvider>
          <Atmosphere />
          <GladeRain />
          <div className="relative z-10 min-h-screen flex flex-col">{children}</div>
          <RainToggle />
          <AmbianceControls />
          <MusicPlayer />
        </AmbianceProvider>
      </body>
    </html>
  );
}
