import type { Metadata } from "next";
import { Cinzel, Jost } from "next/font/google";
import "../globals.css";

const cinzel = Cinzel({ subsets: ["latin"], variable: "--font-cinzel" });
const jost = Jost({ subsets: ["latin"], variable: "--font-jost" });

export const metadata: Metadata = {
  title: "Katti & Co. — Patent & IP Law",
  description: "Intellectual property law firm specializing in patents, trademarks, and litigation",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cinzel.variable} ${jost.variable}`}>
      <body>{children}</body>
    </html>
  );
}
