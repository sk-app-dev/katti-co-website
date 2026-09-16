// app/blog/layout.tsx
// The blog listing page is a client component and cannot export metadata,
// so its title and description live here.

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Insights",
  description: "Articles from Katti & Co. on intellectual property, technology law, tax and disputes.",
  alternates: { canonical: "/blog" },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
