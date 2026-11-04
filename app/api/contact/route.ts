// app/api/contact/route.ts
// Contact form endpoint using Resend email service

import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";

const resend = new Resend(process.env.RESEND_API_KEY);

const ContactSchema = z.object({
  firstName: z.string().trim().min(1).max(100),
  lastName:  z.string().trim().max(100).optional().default(""),
  email:     z.string().trim().email().max(200),
  phone:     z.string().trim().max(40).optional().default(""),
  org:       z.string().trim().max(200).optional().default(""),
  matter:    z.string().trim().max(200).optional().default(""),
  message:   z.string().trim().min(1).max(5000),
});

function escapeHtml(raw: string): string {
  return raw
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ── Rate limiter (in-memory, per Next.js process) ─────────
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();
let lastSweep = Date.now();
const SWEEP_INTERVAL_MS = 5 * 60_000;
const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 5;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  if (now - lastSweep >= SWEEP_INTERVAL_MS) {
    lastSweep = now;
    for (const [key, entry] of rateLimitStore) {
      if (now > entry.resetAt) rateLimitStore.delete(key);
    }
  }

  const entry = rateLimitStore.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (entry.count >= MAX_REQUESTS_PER_WINDOW) return false;
  entry.count++;
  return true;
}

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again in a minute." },
      { status: 429 }
    );
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = ContactSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please check the form fields and try again." },
      { status: 422 }
    );
  }

  const { firstName, lastName, email, phone, org, matter, message } = parsed.data;

  // Email only. Enquiries are deliberately NOT stored in Sanity: the dataset
  // is public, so anything saved there is readable by anyone on the internet.
  try {
    const result = await resend.emails.send({
        from: process.env.CONTACT_SENDER_EMAIL || "noreply@kattiandco.com",
        to: process.env.CONTACT_RECIPIENT_EMAIL || "aprameya.katti@kattiandco.com",
        replyTo: email,
        // Plain text, not HTML: strip line breaks instead of HTML-escaping.
        subject: `New Enquiry from ${(firstName || email).replace(/[\r\n]+/g, " ")}`,
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${escapeHtml(firstName)} ${escapeHtml(lastName)}</p>
          <p><strong>Email:</strong> ${escapeHtml(email)}</p>
          <p><strong>Phone:</strong> ${escapeHtml(phone) || "Not provided"}</p>
          <p><strong>Organisation:</strong> ${escapeHtml(org) || "Not provided"}</p>
          <p><strong>Matter Type:</strong> ${escapeHtml(matter) || "Not provided"}</p>
          <p><strong>Message:</strong></p>
          <p>${escapeHtml(message).replace(/\n/g, "<br>")}</p>
        `,
    });

    if (result.error) {
      console.error("Resend error:", result.error);
      return NextResponse.json({ error: "Failed to send email." }, { status: 500 });
    }

    return NextResponse.json({ message: "Email sent successfully" }, { status: 200 });
  } catch (error) {
    console.error("Contact API error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
