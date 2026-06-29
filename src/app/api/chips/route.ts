import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { playerId, delta } = await request.json();

    const result = await sql`
      UPDATE players
      SET chips = chips + ${delta}
      WHERE player_id = ${playerId}
      RETURNING player_id, chips;
    `;

    return NextResponse.json({
    player_id: Number(result[0].player_id),
    chips: Number(result[0].chips)
});

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Database error" },
      { status: 500 }
    );
  }
}