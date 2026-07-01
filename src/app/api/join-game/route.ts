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
  const { game_id, player_id } = await req.json();

  try {
    // まずp1を試す
    const p1 = await sql`
      UPDATE games
      SET p1_id = ${player_id}
      WHERE game_id = ${game_id}
        AND p1_id IS NULL
      RETURNING *;
    `;

    if (p1.length > 0) {
      // CORSヘッダーを付与して返却
      return NextResponse.json({ slot: "p1" }, { headers: CORS_HEADERS });
    }

    // p1ダメならp2
    const p2 = await sql`
      UPDATE games
      SET p2_id = ${player_id}
      WHERE game_id = ${game_id}
        AND p2_id IS NULL
      RETURNING *;
    `;

    if (p2.length > 0) {
      // CORSヘッダーを付与して返却
      return NextResponse.json({ slot: "p2" }, { headers: CORS_HEADERS });
    }

    // すでに埋まっている場合
    return NextResponse.json({ error: "full" }, { status: 400, headers: CORS_HEADERS });

  } catch (e) {
    return NextResponse.json({ error: "db error" }, { status: 500, headers: CORS_HEADERS });
  }
}