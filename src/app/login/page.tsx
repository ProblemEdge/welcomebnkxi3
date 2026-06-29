// app/login/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

useEffect(() => {
  const login = async () => {
    // 既にIDがあればそのまま使う
    const existing = localStorage.getItem("player_id");
    if (existing) {
      router.push("/game"); // 既存ユーザーはそのままリダイレクト
      return;
    }

    // 初回だけ新規作成
    const res = await fetch("/api/login", { method: "POST" });
    const data = await res.json();
    localStorage.setItem("player_id", String(data.player.player_id));

    router.push("/game");
  };

  login();
}, []);

  return <div>ログイン中...</div>;
}