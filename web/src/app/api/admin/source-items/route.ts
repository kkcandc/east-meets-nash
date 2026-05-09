import { NextResponse } from "next/server";
import { getSourceItems } from "@/lib/content";

export async function GET() {
  return NextResponse.json({ sourceItems: getSourceItems() });
}
