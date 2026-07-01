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

export async function POST(request: Request) {
  try {
    const { playerId, delta } = await request.json();

    const result = await sql`
      UPDATE players
      SET chips = chips + ${delta}
      WHERE player_id = ${playerId}
      RETURNING player_id, chips;
    `;

    return NextResponse.json(
      {
        player_id: Number(result[0].player_id),
        chips: Number(result[0].chips),
      },
      { headers: corsHeaders }
    );

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Database error" },
      { status: 500, headers: corsHeaders }
    );
  }
}