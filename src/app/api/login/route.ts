// app/api/login/route.ts
import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function POST() {
  const rows = await sql.query(
    `INSERT INTO players (player_id, chips)
     VALUES ((SELECT COALESCE(MAX(player_id), 0) + 1 FROM players), 0)
     RETURNING *`
  );

  return NextResponse.json({ player: rows[0] });
}