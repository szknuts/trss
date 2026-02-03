"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { getUserById } from "@/lib/db/users";

export default function LoginPage() {
  const router = useRouter();
  const { setUserId } = useUser();

  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");
    const user = await getUserById(id);

    if (!user) {
      setError("ユーザーが見つかりません");
      return;
    }

    if (user.name !== name) {
      setError("名前が一致しません");
      return;
    }

    // ログイン成功 → グローバルにIDを保存
    setUserId(user.id);
    router.replace("/");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#dcd9d3] px-4 py-10 font-sans text-[#1f1f1f]">
      <section className="flex h-[600px] w-[430px] max-w-full flex-col items-center rounded-[40px] bg-[#f4f2ed] px-10 py-20 text-center">
        <h1 className="text-2xl font-semibold text-[#1f1f1f]">ログイン</h1>

        <div className="mt-10 flex w-full max-w-xs flex-col gap-6">
          <input
            type="text"
            placeholder="社員番号"
            value={id}
            onChange={(e) => setId(e.target.value)}
            className="w-full rounded-[12px] border border-[#e6e2dc] bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#303030]"
          />
          <input
            type="text"
            placeholder="名前"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-[12px] border border-[#e6e2dc] bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#303030]"
          />
        </div>

        {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

        <button
          onClick={handleLogin}
          className="mt-8 w-full max-w-xs rounded-full bg-[#303030] py-4 text-white transition hover:opacity-90"
        >
          ログイン
        </button>
      </section>
    </div>
  );
}
