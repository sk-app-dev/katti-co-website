import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Disclaimer() {
  return (
    <>
      <Navbar />
      <section className="section legal-page">
        <div className="section-label">Legal</div>
        <h1 className="section-title">Disclaimer</h1>
        <div className="pp-scroll">
          <div className="pp-body">
            <p>This website is made available by Katti & Co. solely for the purpose of disseminating general information about the firm and its areas of practice, in compliance with the rules of the Bar Council of India. By accessing this website, you acknowledge and accept the following conditions:</p>
            <ul>
              <li>The contents of this website do not constitute, and are not intended to constitute, any form of advertisement, solicitation, or inducement for the purpose of obtaining legal work.</li>
              <li>You confirm that you are seeking information about Katti & Co. on your own initiative, and that there has been no form of solicitation or encouragement by the firm or its members.</li>
              <li>Your use of this website, including any communication through it, does not create a lawyer–client relationship between you and Katti & Co.</li>
              <li>The material provided on this website is for informational purposes only and should not be construed as legal advice or opinion. You are advised to seek independent legal counsel for any specific legal issue.</li>
              <li>Katti & Co. shall not be liable for any loss or consequence arising from reliance on the information contained on this website or from its use.</li>
              <li>Katti &amp; Co. is not responsible for consequences arising from information on this website.</li>
              <li>All content, including text, design, and materials on this website, is the exclusive intellectual property of Katti & Co. and is protected under applicable laws. Unauthorized use or reproduction is prohibited.</li>
            </ul>
          </div>
        </div>
        <Link href="/" className="legal-page-back">← Back Home</Link>
      </section>
      <Footer />
    </>
  );
}