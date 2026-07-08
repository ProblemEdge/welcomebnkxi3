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

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { game_id } = body;

    if (typeof game_id !== "string" || !game_id) {
      return NextResponse.json(
        { error: "invalid game_id" },
        { status: 400, headers: corsHeaders }
      );
    }

    const result = await sql`
      UPDATE games
      SET p1_id = NULL,
          p2_id = NULL,
          p1_skipped = false,
          p2_skipped = false,
          status = 'waiting'
      WHERE game_id = ${game_id}
      RETURNING game_id;
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { error: "game not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { ok: true, game_id },
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