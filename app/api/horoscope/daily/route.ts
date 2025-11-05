import { NextRequest, NextResponse } from "next/server";
import { getDailyPrediction } from "@/lib/prokerala";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sign = searchParams.get("sign");
    const datetime = searchParams.get("datetime");

    if (!sign || !datetime) {
      return NextResponse.json(
        { error: "Missing required query params: sign, datetime" },
        { status: 400 }
      );
    }

    const data = await getDailyPrediction({ sign, datetime });
    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    console.error('Error fetching daily prediction:', err);
    return NextResponse.json(
      { error: "Failed to fetch daily prediction" },
      { status: 500 }
    );
  }
}


