import { NextResponse } from "next/server";
import { getStats } from "../../../datastore";

export async function GET() {
  const stats = getStats()
  return NextResponse.json({
    data: stats,
  });
}
