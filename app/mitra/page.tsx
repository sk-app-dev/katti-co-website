import type { Metadata } from "next";
import MitraChatPage from "@/components/MitraChatPage";

export const metadata: Metadata = {
  title: "Mitra — Legal Information Assistant",
  description: "Mitra explains Indian law in plain language. General information only, not legal advice.",
  alternates: { canonical: "/mitra" },
};

export default function MitraPage() {
  return <MitraChatPage />;
}
