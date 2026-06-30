import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ playerId: string }> }
) {
  const { playerId } = await params;

  try {
    const players = await sql`
      SELECT player_id, chips
      FROM players
      WHERE player_id = ${Number(playerId)}
    `;

    if (players.length === 0) {
      return NextResponse.json(
        { error: "Player not found" },
        {
          status: 404,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
          },
        }
      );
    }

    return NextResponse.json(players[0], {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Database error" },
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      }
    );
  }
}
