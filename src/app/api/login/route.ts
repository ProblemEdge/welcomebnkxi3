// app/api/login/route.ts
import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function POST() {
  // sql.query() は配列を直接返すため、rows は不要
  const rows = await sql.query(
    "INSERT INTO players (chips) VALUES (0) RETURNING *"
  );

  return NextResponse.json({
    player: rows[0],
  });
}