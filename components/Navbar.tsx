"use client";
// components/Navbar.tsx

import { useState, useEffect } from "react";
import Link from "next/link";

const NAV_LINKS = [
  { label: "About",     href: "#about" },
  { label: "Practice",  href: "#practice" },
  { label: "Expertise", href: "#expertise" },
  { label: "Approach",  href: "#approach" },
  { label: "Gallery",   href: "#gallery" },
  { label: "Insights",  href: "/blog" },
  { label: "Contact",   href: "#contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled]   = useState(false);
  const [menuOpen, setMenuOpen]   = useState(false);

  // Navbar background on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".mob-menu") && !target.closest(".hamburger")) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [menuOpen]);

  // Smooth scroll for anchor links (navigates home first if the target
  // section doesn't exist on the current page)
  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("#")) {
      const id = href.slice(1);
      const el = document.getElementById(id);
      if (el) {
        e.preventDefault();
        window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 70, behavior: "smooth" });
      } else if (window.location.pathname !== "/") {
        e.preventDefault();
        window.location.href = `/${href}`;
      }
      setMenuOpen(false);
    } else {
      setMenuOpen(false);
    }
  };

  return (
    <>
      <nav className={`nav${scrolled ? " scrolled" : ""}`}>
        {/* Wordmark */}
        <a href="/" className="nav-wordmark" style={{ textDecoration: "none" }}>
          <div className="nav-name">
            KATTI <span>&amp;</span> Co.
          </div>
          <div className="nav-sub">Advocates, IP, Tech, &amp; Tax Attorneys</div>
        </a>

        {/* Desktop links */}
        <ul className="nav-links">
          {NAV_LINKS.map((link) => (
            <li key={link.label}>
              {link.href.startsWith("#") ? (
                <a href={link.href} onClick={(e) => handleAnchorClick(e, link.href)}>
                  {link.label}
                </a>
              ) : (
                <Link href={link.href}>{link.label}</Link>
              )}
            </li>
          ))}
        </ul>

        {/* CTA + hamburger */}
        <div style={{ display: "flex", gap: ".6rem", alignItems: "center" }}>
          <a
            href="#contact"
            className="nav-cta"
            onClick={(e) => handleAnchorClick(e, "#contact")}
          >
            Consult Us
          </a>
          <button
            className={`hamburger${menuOpen ? " open" : ""}`}
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            <span /><span /><span />
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div className={`mob-menu${menuOpen ? " open" : ""}`}>
        {NAV_LINKS.map((link) =>
          link.href.startsWith("#") ? (
            <a
              key={link.label}
              href={link.href}
              onClick={(e) => handleAnchorClick(e, link.href)}
            >
              {link.label}
            </a>
          ) : (
            <Link key={link.label} href={link.href} onClick={() => setMenuOpen(false)}>
              {link.label}
            </Link>
          )
        )}
      </div>
    </>
  );
}
