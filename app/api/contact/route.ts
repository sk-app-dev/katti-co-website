// app/api/contact/route.ts
// Contact form endpoint using Resend email service

import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, phone, organisation, matterType, description } = body;

    // Validation
    if (!email || !description) {
      return NextResponse.json(
        { error: "Email and description are required" },
        { status: 400 }
      );
    }

    // Send email via Resend
    const result = await resend.emails.send({
      from: process.env.CONTACT_SENDER_EMAIL || "noreply@kattiandco.in",
      to: process.env.CONTACT_RECIPIENT_EMAIL || "aprameya.katti@kattiandco.com",
      subject: `New Enquiry from ${email}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || "Not provided"}</p>
        <p><strong>Organisation:</strong> ${organisation || "Not provided"}</p>
        <p><strong>Matter Type:</strong> ${matterType || "Not provided"}</p>
        <p><strong>Description:</strong></p>
        <p>${description.replace(/\n/g, "<br>")}</p>
      `,
    });

    if (result.error) {
      console.error("Resend error:", result.error);
      return NextResponse.json(
        { error: "Failed to send email" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Email sent successfully", data: result.data },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Contact API error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
