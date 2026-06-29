// app/login/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    const login = async () => {
      const res = await fetch("/api/login", {
        method: "POST",
      });

      const data = await res.json();
      localStorage.setItem("player_id", String(data.player.player_id));

      // ログイン後のリダイレクト例
      // router.push("/game");
    };

    login();
  }, []);

  return <div>ログイン中...</div>;
}