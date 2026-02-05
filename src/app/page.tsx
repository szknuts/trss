"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUserById } from "@/lib/db/users";
import { getPaymentRequestsByPayerId } from "@/lib/db/paymentRequests";
import { useUser } from "@/context/UserContext";
import type { User } from "@/lib/db/database.type";

export default function Home() {
  const { userId, setUserId } = useUser();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [unpaidCount, setUnpaidCount] = useState(0);
  const [showUserList, setShowUserList] = useState(false);
  const [clickCount, setClickCount] = useState(0);

  useEffect(() => {
    // ★ ログインしていなければ login へ
    if (!userId) {
      router.replace("/login");
      return;
    }
    if (clickCount > 0) {
      const timer = setTimeout(() => setClickCount(0), 2000);
      return () => clearTimeout(timer);
    }
    getUserById(userId).then(setUser);

    // 自分宛ての未払い請求の件数を取得（paidを除外）
    getPaymentRequestsByPayerId(userId).then((requests) => {
      const count = requests.filter((req) => req.state !== "paid").length;
      setUnpaidCount(count);
    });
  }, [userId, router, clickCount]);

  if (!userId || !user) {
    return null; // 画面チラつき防止
  }

  // コマンド: 顔写真を10回クリック
  const handleFaceClick = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);

    if (newCount >= 10) {
      setShowUserList(!showUserList);
      setClickCount(0);
    }
  };

  // ログアウト処理
  const handleLogout = () => {
    setUserId(null);
    router.replace("/login");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#dcd9d3] px-4 py-10 font-sans text-[#1f1f1f]">
      <section className="relative flex h-[932px] w-[430px] max-w-full flex-col items-center rounded-[40px] bg-[#f4f2ed] px-10 pb-16 pt-20 text-center">
        {/* ログアウトボタン */}
        <button
          onClick={handleLogout}
          className="absolute left-6 top-6 text-xs text-[#a59f95] hover:text-[#6b6b6b] transition"
        >
          ログアウト
        </button>
      <section className="flex h-[932px] w-[430px] max-w-full flex-col items-center rounded-[40px] bg-[#f4f2ed] px-10 pb-16 pt-20 text-center">
        {/* 未払い請求通知バー → 別ページへ遷移 */}
        {unpaidCount > 0 && (
          <Link
            href="/unpaidList"
            className="mb-4 flex w-full max-w-xs items-center justify-between rounded-full border border-red-200 bg-red-50 px-5 py-3 transition hover:bg-red-100"
          >
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                {unpaidCount}
              </span>
              <span className="text-sm font-semibold text-red-700">
                未払いの請求があります
              </span>
            </div>
            <span className="text-xs text-red-400">表示 →</span>
          </Link>
        )}

        <div className="flex flex-1 flex-col items-center">
          <div
            className="flex h-24 w-24 items-center rounded-full bg-[#ded8cf] text-3xl text-[#2f2b28]"
            onClick={handleFaceClick}
          >
            <img
              src={`/users/${user.icon_url}`}
              alt="icon"
              width={96}
              height={96}
            />
          </div>

          <p className="mt-6 text-xl font-semibold tracking-wide text-[#1f1f1f]">
            {user.name}
          </p>

          <div className="mt-6 flex w-full max-w-xs justify-center text-sm text-[#6b6b6b]">
            <span>口座番号 : {user.id}</span>
          </div>

          <div className="mt-10 w-full max-w-xs rounded-[26px] border border-[#e6e2dc] bg-white px-6 py-8 text-center">
            <p className="text-sm uppercase tracking-[0.4em] text-[#a59f95]">
              残高 BALANCE
            </p>
            <p className="mt-4 text-4xl font-semibold text-[#303030]">
              {user.balance}円
            </p>
          </div>

          <Link
            href="/userList"
            className="mt-8 w-full max-w-xs rounded-full bg-[#303030] py-4 text-center text-white transition hover:opacity-90"
          >
            送金へ進む
          </Link>
          <Link
            href="/invoice"
            className="mt-2 w-full max-w-xs rounded-full bg-[#303030] py-4 text-center text-white transition hover:opacity-90"
          >
            請求へ進む
          </Link>
          <Link
            href="/invoiceList"
            className="mt-2 w-full max-w-xs rounded-full bg-[#303030] py-4 text-center text-white transition hover:opacity-90"
          >
            請求一覧へ
          </Link>
          {showUserList && (
            <Link
              href="/test.backend"
              className="mt-2 w-full max-w-xs rounded-full bg-[#303030] py-4 text-center text-white transition hover:opacity-90"
            >
              テスト画面へ
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}
