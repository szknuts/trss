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
  const [showUserList, setShowUserList] = useState(false); // 一覧表示フラグ
  const [clickCount, setClickCount] = useState(0); // クリック回数

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

  // クリック回数をリセットするタイマー
  useEffect(() => {
    if (clickCount > 0) {
      const timer = setTimeout(() => setClickCount(0), 2000);
      return () => clearTimeout(timer);
    }
  }, [clickCount]);

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

  // コマンド: タイトルを10回クリック
  const handleTitleClick = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);

    if (newCount >= 10) {
      setShowUserList(!showUserList);
      setClickCount(0);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#dcd9d3] px-4 py-10 font-sans text-[#1f1f1f]">
      <section className="flex w-[430px] max-w-full flex-col items-center rounded-[40px] bg-[#f4f2ed] px-10 py-10 text-center">
        <h1
          className="cursor-pointer text-2xl font-semibold text-[#1f1f1f] select-none"
          onClick={handleTitleClick}
        >
          ログイン
        </h1>

        {/* ユーザー一覧 */}
        {showUserList && (
          <div className="mt-6 w-full max-w-xs">
            <p className="mb-3 text-sm text-[#6b6b6b]">
              ユーザーを選択してください
            </p>
            <div className="max-h-[300px] space-y-2 overflow-y-auto">
              {isLoading ? (
                <p className="text-center text-sm text-[#a59f95]">
                  読み込み中...
                </p>
              ) : users.length === 0 ? (
                <p className="text-center text-sm text-[#a59f95]">
                  ユーザーが見つかりません
                </p>
              ) : (
                users.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => handleSelectUser(user.id, user.name)}
                    className={`w-full rounded-[12px] border px-4 py-3 text-left transition hover:bg-[#e6e2dc] ${
                      id === user.id
                        ? "border-[#303030] bg-[#e6e2dc]"
                        : "border-[#e6e2dc] bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-[#303030]">
                        {user.name}
                      </p>
                      <p className="text-xs text-[#a59f95]">
                        口座番号: {user.id}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {/* または手動入力 */}
        <div className="mt-6 w-full max-w-xs">
          <div className="flex flex-col gap-3">
            <input
              type="text"
              placeholder="口座番号"
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
