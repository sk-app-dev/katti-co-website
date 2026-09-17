// app/page.tsx
// Homepage — imports existing components

import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import About from "../components/About";
import Practice from "../components/Practice";
import { Expertise, Approach, BlogTeaser } from "../components/Sections";
import Gallery from "../components/Gallery";
import Contact from "../components/Contact";
import Footer from "../components/Footer";
import MitraChat from "../components/MitraChat";
import type { Metadata } from "next";
import { BRAND, SITE_URL } from "@/lib/brand";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

// Structured data for search engines: the firm's name, office, contact and
// profiles, so Google can match the site to the business listing. Particulars
// only (Bar Council Rule 36) — no ratings, reviews or claims.
const FIRM_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "LegalService",
  "@id": `${SITE_URL}/#firm`,
  name: BRAND.name,
  alternateName: "Katti and Co.",
  description: BRAND.description,
  url: SITE_URL,
  logo: `${SITE_URL}/apple-icon`,
  image: `${SITE_URL}/opengraph-image`,
  telephone: "+91-78993-01767",
  email: "aprameya.katti@kattiandco.com",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Unit No. 105, Ground Floor, Prestige Centre Point, Cunningham Road",
    addressLocality: "Bengaluru",
    addressRegion: "Karnataka",
    postalCode: "560001",
    addressCountry: "IN",
  },
  areaServed: "IN",
  founder: { "@type": "Person", name: "Aprameya N. Katti", jobTitle: "Managing Partner" },
  sameAs: [
    "https://www.linkedin.com/company/katti-co/",
    "https://www.linkedin.com/in/adv-aprameya-n-katti-640974119/",
  ],
};

export default async function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FIRM_JSON_LD).replace(/</g, "\\u003c") }}
      />
      <Navbar />
      <Hero />
      <About />
      <Practice />
      <Expertise />
      <Approach />
      <BlogTeaser />
      <Gallery />
      <Contact />
      <Footer />
      <MitraChat />
    </>
  );
}
