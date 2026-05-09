import { NextResponse } from "next/server";
import { getConnectionTokenFromHeaders } from "@/lib/atxp";

export async function POST(request: Request) {
  const token = getConnectionTokenFromHeaders(request.headers);
  const body = (await request.json().catch(() => ({}))) as { amount?: number };
  const amount = Number(body.amount || 10);

  if (!token) {
    return NextResponse.json({
      mode: "mock",
      amount,
      url: `https://accounts.atxp.ai/mock-checkout?product=east_meets_nash&amount=${amount}`,
      note: "No ATXP connection_token present. This is the placeholder path.",
    });
  }

  return NextResponse.json({
    mode: "live-ready",
    amount,
    note: "Wire this to Accounts /api/funding/payment-link once product attribution and return URLs are confirmed.",
  });
}
