"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { getAllUsers } from "@/lib/db/users";
import type { User } from "@/lib/db/database.type";

export default function UserList() {
  const { userId } = useUser();
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // ① 直叩き防止（ログインしてなければ /login）
  useEffect(() => {
    if (!userId) {
      router.replace("/login");
    }
  }, [userId, router]);

  // ② DBからユーザー取得
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getAllUsers();
        setUsers(data);
      } catch (e) {
        console.error("ユーザー取得失敗", e);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUsers();
    }
  }, [userId]);

  if (!userId || loading) return null;

  const myId = userId;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ヘッダー */}
      <div className="sticky top-0 bg-white border-b border-slate-200 px-4 py-3">
        <h1 className="text-lg font-bold text-slate-800 text-center">
          送金相手を選択
        </h1>
      </div>

      {/* ユーザーリスト */}
      <div className="px-4 py-2">
        {users
          .filter((u) => u.id !== myId) // 自分を除外
          .map((u) => {
            // ★ ここが「フロント側での補正」
            const iconSrc = u.icon_url
              ? `/users/${u.icon_url}`
              : "/users/human1.png";

            return (
              <Link
                key={u.id}
                href={`/transfer/${u.id}`}
                className="bg-white rounded-lg shadow-sm active:bg-slate-100 transition-colors p-3 flex items-center gap-3 border border-slate-200 mb-2"
              >
                <img
                  src={iconSrc}
                  alt={u.name}
                  className="w-11 h-11 rounded-full object-cover shrink-0"
                />
                <p className="font-medium text-slate-800 text-base">
                  {u.name}
                </p>
              </Link>
            );
          })}
      </div>
    </div>
  );
}
