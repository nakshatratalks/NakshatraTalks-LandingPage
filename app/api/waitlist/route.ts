import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";

type WaitlistPayload = {
  email?: string;
  language?: string;
  source?: string;
  metadata?: Record<string, unknown> | null;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let payload: WaitlistPayload | null = null;

  try {
    payload = (await request.json()) as WaitlistPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!payload) {
    return NextResponse.json({ error: "Request body is required" }, { status: 400 });
  }

  const email = typeof payload.email === "string" ? payload.email.trim() : "";
  const language = payload.language === "ta" ? "ta" : "en";
  const source = typeof payload.source === "string" && payload.source.trim() ? payload.source.trim() : "chatbot";

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  if (!EMAIL_REGEX.test(email)) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }

  const normalizedEmail = email.toLowerCase();
  const requestMetadata = {
    ...(payload.metadata ?? {}),
    userAgent: request.headers.get("user-agent"),
    referrer: request.headers.get("referer"),
  };

  const supabase = getSupabaseAdminClient();

  const { error } = await supabase.from("waitlist_subscriptions").insert({
    email: normalizedEmail,
    language,
    source,
    metadata: requestMetadata,
  });

  if (error) {
    // Ignore duplicate violations and return success for idempotency
    if (error.code === "23505") {
      return NextResponse.json({ success: true, duplicate: true });
    }

    console.error("Failed to store waitlist submission", error);
    return NextResponse.json({ error: "Failed to join waitlist" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

