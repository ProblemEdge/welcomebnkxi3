import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

type SlotRow = {
  game_id: string;
  p1_id: number | null;
  p2_id: number | null;
  p1_skipped: boolean;
  p2_skipped: boolean;
};

export async function POST(req: Request) {
  const { game_id, player_id, preferred_slot, skip } = await req.json();

  if (typeof game_id !== "string" || !game_id) {
    return NextResponse.json({ error: "invalid game_id" }, { status: 400, headers: CORS_HEADERS });
  }

  const isSkip = skip === true;

  if (!isSkip && (typeof player_id !== "number" || !Number.isFinite(player_id))) {
    return NextResponse.json({ error: "invalid player_id" }, { status: 400, headers: CORS_HEADERS });
  }

  const preferred = preferred_slot === "p2" ? "p2" : "p1";
  // SYATEKIはp1のみで成立するゲーム。それ以外はp1・p2両方揃って初めて満員。
  const requiresBothSlots = game_id !== "SYATEKI";

  try {
    const game = (await sql`
      SELECT game_id, p1_id, p2_id, p1_skipped, p2_skipped, status
      FROM games
      WHERE game_id = ${game_id}
      LIMIT 1;
    `) as (SlotRow & { status: string })[];

    if (game.length === 0) {
      return NextResponse.json({ error: "game not found" }, { status: 404, headers: CORS_HEADERS });
    }

    if (game[0].status === "playing") {
      return NextResponse.json({ error: "full" }, { status: 400, headers: CORS_HEADERS });
    }

    if (!isSkip) {
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
    }

    // 指定スロットへの登録（またはスキップ記録）を試みる。
    // 「空いている」= p*_id が NULL かつ p*_skipped が false のときだけ書き込む。
    async function tryFillSlot(slot: "p1" | "p2"): Promise<SlotRow[]> {
      if (slot === "p1") {
        if (isSkip) {
          return (await sql`
            UPDATE games
            SET p1_skipped = true
            WHERE game_id = ${game_id} AND p1_id IS NULL AND p1_skipped = false
            RETURNING game_id, p1_id, p2_id, p1_skipped, p2_skipped;
          `) as SlotRow[];
        }
        return (await sql`
          UPDATE games
          SET p1_id = ${player_id}
          WHERE game_id = ${game_id} AND p1_id IS NULL AND p1_skipped = false
          RETURNING game_id, p1_id, p2_id, p1_skipped, p2_skipped;
        `) as SlotRow[];
      }

      if (isSkip) {
        return (await sql`
          UPDATE games
          SET p2_skipped = true
          WHERE game_id = ${game_id} AND p2_id IS NULL AND p2_skipped = false
          RETURNING game_id, p1_id, p2_id, p1_skipped, p2_skipped;
        `) as SlotRow[];
      }
      return (await sql`
        UPDATE games
        SET p2_id = ${player_id}
        WHERE game_id = ${game_id} AND p2_id IS NULL AND p2_skipped = false
        RETURNING game_id, p1_id, p2_id, p1_skipped, p2_skipped;
      `) as SlotRow[];
    }

    const firstSlot = preferred;
    const secondSlot = preferred === "p1" ? "p2" : "p1";

    let updatedRow: SlotRow | undefined;
    let assignedSlot: "p1" | "p2" = firstSlot;

    const firstJoin = await tryFillSlot(firstSlot);
    if (firstJoin.length > 0) {
      updatedRow = firstJoin[0];
    } else if (requiresBothSlots) {
      // SYATEKIはp2を使わないため、p1が失敗した時点でfullとする
      const secondJoin = await tryFillSlot(secondSlot);
      if (secondJoin.length > 0) {
        updatedRow = secondJoin[0];
        assignedSlot = secondSlot;
      }
    }

    if (!updatedRow) {
      return NextResponse.json({ error: "full" }, { status: 400, headers: CORS_HEADERS });
    }

    const p1Occupied = updatedRow.p1_id !== null || updatedRow.p1_skipped;
    const p2Occupied = updatedRow.p2_id !== null || updatedRow.p2_skipped;
    const isFull = requiresBothSlots ? (p1Occupied && p2Occupied) : p1Occupied;

    if (isFull) {
      await sql`
        UPDATE games
        SET status = 'playing'
        WHERE game_id = ${game_id};
      `;
    }

    return NextResponse.json(
      { slot: assignedSlot, skipped: isSkip, full: isFull },
      { headers: CORS_HEADERS }
    );

  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "db error" }, { status: 500, headers: CORS_HEADERS });
  }
}