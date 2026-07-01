import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { randomInt } from "crypto";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// 9桁ID生成（重複回避つき）
async function generatePlayerId() {
  while (true) {
    const id = randomInt(100000000, 1000000000); // 100,000,000〜999,999,999

    const exists = await sql.query(
      "SELECT 1 FROM players WHERE player_id = $1",
      [id]
    );

    if (exists.length === 0) {
      return id;
    }
  }
}

export async function POST() {
  const playerId = await generatePlayerId();

  const rows = await sql.query(
    `INSERT INTO players (player_id, chips)
     VALUES ($1, 0)
     RETURNING *`,
    [playerId]
  );

  return NextResponse.json({
    player: rows[0],
  });
}