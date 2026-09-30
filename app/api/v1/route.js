import { NextResponse } from "next/server";
import { init } from "../datastore";

init();

export async function GET() {
  return NextResponse.json({
    message: "ok",
  });
}
