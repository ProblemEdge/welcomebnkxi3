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

// GET関数の引数の型と、内部でのparamsの扱いを修正
export async function GET(
  request: Request,
  { params }: { params: Promise<{ gameId: string }> } // 1. Promise型にする
) {
  try {
    // 2. paramsをawaitしてから取り出す
    const { gameId } = await params;

    const result = await sql`
      SELECT game_id, p1_id, p2_id, status
      FROM games
      WHERE game_id = ${gameId}
    `;
    // ※ SQL修正：statusの後のカンマ「,」が不要だったので削除しました

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