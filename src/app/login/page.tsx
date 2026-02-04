"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { getUserById, getAllUsers } from "@/lib/db/users";
import type { User } from "@/lib/db/database.type";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");

  const { setUserId } = useUser();

  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // ユーザー一覧取得
  useEffect(() => {
    async function fetchUsers() {
      try {
        const allUsers = await getAllUsers();
        setUsers(allUsers);
      } catch (error) {
        console.error("ユーザー取得エラー:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchUsers();
  }, []);

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

    // ログイン成功
    setUserId(user.id);

    if (redirect) {
      router.replace(decodeURIComponent(redirect));
    } else {
      router.replace("/");
    }
  };

  const handleSelectUser = (userId: string, userName: string) => {
    setId(userId);
    setName(userName);
    setError("");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#dcd9d3] px-4 py-10">
      <section className="flex w-[430px] flex-col items-center rounded-[40px] bg-[#f4f2ed] px-10 py-10 text-center">

        <h1 className="text-2xl font-semibold">ログイン</h1>

        {/* ユーザー一覧 */}
        <div className="mt-6 w-full max-w-xs">
          <p className="mb-3 text-sm text-[#6b6b6b]">
            ユーザーを選択してください
          </p>

          <div className="max-h-[300px] space-y-2 overflow-y-auto">
            {isLoading ? (
              <p className="text-sm text-[#a59f95]">
                読み込み中...
              </p>
            ) : (
              users.map((user) => (
                <button
                  key={user.id}
                  onClick={() =>
                    handleSelectUser(user.id, user.name)
                  }
                  className={`w-full rounded-[12px] border px-4 py-3 text-left ${
                    id === user.id
                      ? "border-[#303030] bg-[#e6e2dc]"
                      : "border-[#e6e2dc] bg-white"
                  }`}
                >
                  <p className="text-sm font-semibold">
                    {user.name}
                  </p>
                  <p className="text-xs text-[#a59f95]">
                    口座番号: {user.id}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* 手動入力 */}
        <div className="mt-6 w-full max-w-xs space-y-3">
          <input
            placeholder="口座番号"
            value={id}
            onChange={(e) => setId(e.target.value)}
            className="w-full rounded-[12px] border px-4 py-3"
          />
          <input
            placeholder="名前"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-[12px] border px-4 py-3"
          />
        </div>

        {error && (
          <p className="mt-4 text-sm text-red-500">
            {error}
          </p>
        )}

        <button
          onClick={handleLogin}
          className="mt-6 w-full max-w-xs rounded-full bg-[#303030] py-4 text-white"
        >
          ログイン
        </button>

      </section>
    </div>
  );
}
