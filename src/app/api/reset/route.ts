import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function POST() {
  try {
    await sql`
      UPDATE games
      SET p1_id = NULL,
          p2_id = NULL,
          status = 'waiting',
    `;

    return NextResponse.json(
      { ok: true },
      { headers: corsHeaders }
    );

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "reset failed" },
      { status: 500, headers: corsHeaders }
    );
  }
}