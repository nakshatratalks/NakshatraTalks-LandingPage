import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";

type ContactPayload = {
  name?: string;
  email?: string;
  message?: string;
  language?: string;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let payload: ContactPayload | null = null;

  try {
    payload = (await request.json()) as ContactPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!payload) {
    return NextResponse.json({ error: "Request body is required" }, { status: 400 });
  }

  const name = typeof payload.name === "string" ? payload.name.trim() : "";
  const email = typeof payload.email === "string" ? payload.email.trim() : "";
  const message = typeof payload.message === "string" ? payload.message.trim() : "";
  const language = payload.language === "ta" ? "ta" : "en";

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  if (!EMAIL_REGEX.test(email)) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }

  const supabase = getSupabaseAdminClient();

  const { error } = await supabase.from("contact_submissions").insert({
    full_name: name || null,
    email,
    message: message || null,
    language,
  });

  if (error) {
    console.error("Failed to store contact submission", error);
    return NextResponse.json({ error: "Failed to submit contact form" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

