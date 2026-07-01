import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// ブラウザからの検証アクセス (OPTIONS) を通すためのハンドラーを追加
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

export async function POST(req: Request) {
  const { game_id, player_id, preferred_slot } = await req.json();

  if (typeof game_id !== "string" || !game_id) {
    return NextResponse.json({ error: "invalid game_id" }, { status: 400, headers: CORS_HEADERS });
  }

  if (typeof player_id !== "number" || !Number.isFinite(player_id)) {
    return NextResponse.json({ error: "invalid player_id" }, { status: 400, headers: CORS_HEADERS });
  }

  const preferred = preferred_slot === "p2" ? "p2" : "p1";

  try {
    const game = await sql`
      SELECT game_id, p1_id, p2_id
      FROM games
      WHERE game_id = ${game_id}
      LIMIT 1;
    `;

    if (game.length === 0) {
      return NextResponse.json({ error: "game not found" }, { status: 404, headers: CORS_HEADERS });
    }

    const player = await sql`
      SELECT player_id
      FROM players
      WHERE player_id = ${player_id}
      LIMIT 1;
    `;

    if (player.length === 0) {
      return NextResponse.json({ error: "player not found" }, { status: 400, headers: CORS_HEADERS });
    }

    const duplicate = await sql`
      SELECT game_id
      FROM games
      WHERE game_id = ${game_id}
        AND (p1_id = ${player_id} OR p2_id = ${player_id})
      LIMIT 1;
    `;

    if (duplicate.length > 0) {
      return NextResponse.json({ error: "already joined" }, { status: 400, headers: CORS_HEADERS });
    }

    const firstSlot = preferred;
    const secondSlot = preferred === "p1" ? "p2" : "p1";

    const firstJoin = firstSlot === "p1"
      ? await sql`
          UPDATE games
          SET p1_id = ${player_id}
          WHERE game_id = ${game_id}
            AND p1_id IS NULL
          RETURNING game_id;
        `
      : await sql`
          UPDATE games
          SET p2_id = ${player_id}
          WHERE game_id = ${game_id}
            AND p2_id IS NULL
          RETURNING game_id;
        `;

    if (firstJoin.length > 0) {
      return NextResponse.json({ slot: firstSlot }, { headers: CORS_HEADERS });
    }

    const secondJoin = secondSlot === "p1"
      ? await sql`
          UPDATE games
          SET p1_id = ${player_id}
          WHERE game_id = ${game_id}
            AND p1_id IS NULL
          RETURNING game_id;
        `
      : await sql`
          UPDATE games
          SET p2_id = ${player_id}
          WHERE game_id = ${game_id}
            AND p2_id IS NULL
          RETURNING game_id;
        `;

    if (secondJoin.length > 0) {
      return NextResponse.json({ slot: secondSlot }, { headers: CORS_HEADERS });
    }

    // すでに埋まっている場合
    return NextResponse.json({ error: "full" }, { status: 400, headers: CORS_HEADERS });

  } catch (e) {
    return NextResponse.json({ error: "db error" }, { status: 500, headers: CORS_HEADERS });
  }
}