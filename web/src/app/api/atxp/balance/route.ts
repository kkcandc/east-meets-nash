import { NextResponse } from "next/server";
import { getBalance, getConnectionTokenFromHeaders } from "@/lib/atxp";

export async function GET(request: Request) {
  const token = getConnectionTokenFromHeaders(request.headers);
  const balance = await getBalance(token);
  return NextResponse.json({ balance });
}
