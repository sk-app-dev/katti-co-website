// app/api/profile/[id]/route.ts
// GET /api/profile/<sanity-document-id>  → one person's profile as a PDF
// GET /api/profile/all                   → founder + every team member, one PDF

import { NextRequest } from "next/server";
import { buildProfilePdf, loadProfiles, profileFilename } from "@/lib/profile-pdf";

// Sanity document IDs here are UUIDs. Anything else — including a "drafts."
// prefix — is rejected before it reaches a query.
const DOCUMENT_ID = /^[A-Za-z0-9-]{1,64}$/;

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (id !== "all" && !DOCUMENT_ID.test(id)) {
    return new Response("Profile not found.", { status: 404 });
  }

  try {
    const people = await loadProfiles(id);
    if (people.length === 0) {
      return new Response("Profile not found.", { status: 404 });
    }

    const bytes = await buildProfilePdf(people);
    const filename = profileFilename(people);
    const body = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;

    return new Response(body, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        // Profiles change rarely. Caching at the edge means repeat downloads
        // don't regenerate the PDF, and Sanity edits show within ten minutes.
        "Cache-Control": "public, s-maxage=600, stale-while-revalidate=86400",
      },
    });
  } catch (err) {
    console.error("[profile pdf] generation failed:", err instanceof Error ? err.message : err);
    return new Response("The profile could not be generated. Please try again shortly.", {
      status: 500,
    });
  }
}
