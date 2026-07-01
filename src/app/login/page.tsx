"use client";

import { useEffect } from "react";

export default function LoginPage() {

  useEffect(() => {

    const login = async () => {

      // 既にIDがある
      const existing = localStorage.getItem("player_id");

      if (existing) {
        window.location.href = `https://userinfo-ten.vercel.app/?player_id=${existing}`;
        return;
      }

      // 初回ログイン
      const res = await fetch("/api/login", {
        method: "POST",
      });

      const data = await res.json();

      const playerId = String(data.player.player_id);

      localStorage.setItem("player_id", playerId);

      // userinfoへ移動
      window.location.href = `https://userinfo-ten.vercel.app/?player_id=${playerId}`;
    };

    login();

  }, []);

  return <div>ログイン中...</div>;
}