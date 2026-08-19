import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { client, SITE_SETTINGS_QUERY } from "@/lib/sanity";

const FALLBACK_EMAIL = "aprameya.katti@kattiandco.com";

export default async function PrivacyPolicy() {
  const settings: { email?: string } | null = await client
    .fetch(SITE_SETTINGS_QUERY)
    .catch(() => null);
  const email = settings?.email || FALLBACK_EMAIL;

  return (
    <>
      <Navbar />
      <section className="section legal-page">
        <div className="section-label">Legal</div>
        <h1 className="section-title">Privacy Policy</h1>
        <div className="pp-eff">Effective Date: 22 September 2025</div>
        <div className="pp-scroll">
          <div className="pp-body">
            <p>At Katti &amp; Co., we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your personal information when you visit our website.</p>
            <h3>1. Information We Collect</h3>
            <p>We collect only such personal information as is necessary and voluntarily provided by you. This may include your email address and any details you choose to share when contacting us through our website or other communication channels. We do not engage in the collection of personal data beyond what is reasonably required.</p>
            <h3>2. Purpose of Use</h3>
            <p>The information provided by you is used strictly for professional purposes—primarily to respond to your queries, communicate with you, and, where applicable, facilitate consultations. Your data is not used for unsolicited communications, and we do not sell, trade, or otherwise transfer your information to third parties.</p>
            <h3>3. Consent</h3>
            <p>By voluntarily providing your information, you signify your consent to its collection and use in accordance with this Policy. Such consent is not irrevocable—you retain the right to withdraw it at any time by contacting us, upon which we shall take appropriate steps to cease further use, subject to legal or professional obligations.</p>
            <h3>4. Data Protection and Security</h3>
            <p>We adopt reasonable and appropriate safeguards to protect your information against unauthorised access, disclosure, alteration, or destruction. While no system can claim absolute security, we remain committed to maintaining the confidentiality and integrity of your data.</p>
            <h3>5. Your Rights</h3>
            <p>You retain the right to access, review, correct, or request deletion of your personal information held by us. Any such request may be addressed to: <a href={`mailto:${email}`} style={{ color: "var(--gold)" }}>{email}</a> and we shall endeavour to respond within a reasonable timeframe, in accordance with applicable laws.</p>
            <h3>6. Updates to this Policy</h3>
            <p>This Privacy Policy may be revised periodically to reflect changes in legal, regulatory, or operational requirements. Any updates will be published on this page with the revised effective date, and your continued engagement with us shall constitute acceptance of such changes</p>
          </div>
        </div>
        <Link href="/" className="legal-page-back">← Back Home</Link>
      </section>
      <Footer />
    </>
  );
}