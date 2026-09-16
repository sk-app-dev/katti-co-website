import type { Metadata, Viewport } from "next";
import { Arimo, Jost } from "next/font/google";
import { BRAND, SITE_TITLE, SITE_URL } from "@/lib/brand";
import "../globals.css";

// Arimo is metrically identical to Arial, the face the business-card logo is
// set in. It carries the wordmark and every small-caps label on the site.
const arimo = Arimo({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-brand" });
const jost = Jost({ subsets: ["latin"], variable: "--font-jost" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_TITLE, template: `%s | ${BRAND.name}` },
  description: BRAND.description,
  applicationName: BRAND.name,
  openGraph: {
    type: "website",
    siteName: BRAND.name,
    locale: "en_IN",
    title: SITE_TITLE,
    description: BRAND.description,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: BRAND.description,
  },
};

export const viewport: Viewport = {
  themeColor: "#07080d",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${arimo.variable} ${jost.variable}`}>
      <body>{children}</body>
    </html>
  );
}
