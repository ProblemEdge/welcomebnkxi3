import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const { gameId } = await params;

    const result = await sql`
      SELECT game_id, p1_id, p2_id, p1_skipped, p2_skipped, status
      FROM games
      WHERE game_id = ${gameId}
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { error: "game not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(result[0], {
      status: 200,
      headers: corsHeaders,
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "db error" },
      { status: 500, headers: corsHeaders }
    );
  }
}