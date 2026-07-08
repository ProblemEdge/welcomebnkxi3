import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET(request: Request) {
  try {
    // 全プレイヤーの player_id と chips を取得
    // ORDER BY chips DESC をつけることで、データベース側でチップが多い順に並び替えてから返します。
    const players = await sql`
      SELECT player_id, chips
      FROM players
      ORDER BY chips DESC
    `;

    // 取得した全データを配列のまま返す
    return NextResponse.json(players, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  } catch (error) {
    console.error("Database error in /api/players:", error);

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

// 念のためOPTIONSリクエスト（CORSの事前確認）にも対応させておく（必要に応じて）
export async function OPTIONS(request: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}