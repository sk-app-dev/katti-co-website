// app/api/chat/route.ts
// Chat endpoint using Google Gemini API
// Gemini API key is server-side only — never exposed to browser

import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Rate limiting: 20 requests per hour per IP
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const limit = rateLimitMap.get(ip);

  if (!limit || now > limit.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + 3600000 });
    return true;
  }

  if (limit.count >= 20) {
    return false;
  }

  limit.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "unknown";

    // Rate limiting
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Rate limit exceeded" },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Invalid messages" },
        { status: 400 }
      );
    }

    // Check if API key exists
    if (!process.env.GEMINI_API_KEY) {
      console.error("❌ GEMINI_API_KEY not set in environment");
      return NextResponse.json(
        { error: "Chat service not configured" },
        { status: 500 }
      );
    }

    console.log("✅ GEMINI_API_KEY found, initializing Gemini...");

    // Build conversation history for Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Get the last user message
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role !== "user") {
      return NextResponse.json(
        { error: "Last message must be from user" },
        { status: 400 }
      );
    }

    console.log("📤 Sending to Gemini:", lastMessage.content.slice(0, 50));

    // Generate response using simple text prompt with timeout
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Gemini API timeout")), 25000)
    );

    const result = await Promise.race([
      model.generateContent({
        contents: [
          {
            role: "user",
            parts: [{ text: lastMessage.content }],
          },
        ],
        generationConfig: {
          maxOutputTokens: 512,
          temperature: 0.7,
        },
      }),
      timeoutPromise,
    ]);

    const reply =
      (result as any).response?.text() || "I'm sorry, I could not generate a response.";

    console.log("✅ Gemini response received");
    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error("❌ Chat error:", error?.message || error);

    if (error.message?.includes("API key") || error.message?.includes("authentication")) {
      return NextResponse.json(
        { error: "API authentication error. Check your Gemini API key configuration." },
        { status: 500 }
      );
    }

    if (error.message?.includes("timeout")) {
      return NextResponse.json(
        { error: "Chat service is taking too long. Please try again." },
        { status: 504 }
      );
    }

    if (error.message?.includes("fetch") || error.message?.includes("network")) {
      return NextResponse.json(
        { error: "Network error. Please try again." },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: "Chat service temporarily unavailable" },
      { status: 500 }
    );
  }
}
