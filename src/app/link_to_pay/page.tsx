"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useUser } from "@/context/UserContext";
import { getUserById } from "@/lib/db/users";
import type { User } from "@/lib/db/database.type";

export default function PayPage() {
  const { userId } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();

  // URLから請求情報を取得
  const amount = Number(searchParams.get("amount") ?? 0);
  const message = searchParams.get("message") ?? "";
  const createdBy = searchParams.get("createdBy") ?? "";

  const [me, setMe] = useState<User | null>(null);

  // ① ログインチェック + 残高取得
  useEffect(() => {
    if (!userId) {
      const redirectTo =
        encodeURIComponent(
          window.location.pathname + window.location.search
        );

      router.replace(`/login?redirect=${redirectTo}`);
      return;
    }

    getUserById(userId).then(setMe);
  }, [userId, router]);


  if (!userId || !me) return null;

  const canPay = me.balance >= amount && amount > 0;

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#dcd9d3] px-4 py-10">
      <section className="flex h-[932px] w-[430px] flex-col items-center rounded-[40px] bg-[#f4f2ed] px-10 pt-20 text-center">

        <h1 className="text-xl font-semibold">
          お支払い内容の確認
        </h1>

        {/* 請求額 */}
        <div className="mt-10 w-full max-w-xs rounded-[26px] border bg-white px-6 py-8">
          <p className="text-sm tracking-widest text-[#a59f95]">AMOUNT</p>
          <p className="mt-4 text-4xl font-semibold">
            {amount.toLocaleString()}円
          </p>
        </div>

        {/* メッセージ */}
        {message && (
          <p className="mt-4 text-sm text-slate-600">
            {message}
          </p>
        )}

        {/* 残高 */}
        <p className="mt-6 text-sm text-[#6b6b6b]">
          現在の残高：{me.balance.toLocaleString()}円
        </p>

        {/* 状態 */}
        {canPay ? (
          <p className="mt-4 text-green-600 text-sm">
            お支払い可能です
          </p>
        ) : (
          <p className="mt-4 text-red-600 text-sm">
            残高が不足しています
          </p>
        )}

        {/* 支払い */}
        {/* 支払いボタン（リンク版） */} 
        <Link
         href={canPay ? "/link_to_pay/complete" : "#"}
         className={`mt-10 w-full max-w-xs rounded-full py-4 text-center text-white transition 
         ${canPay
          ? "bg-[#303030] hover:opacity-90"
          : "bg-[#aaa] pointer-events-none"}`
        } 
        > 
         支払う 
        </Link>

        <Link href="/" className="mt-6 text-sm underline">
          トップへ戻る
        </Link>

      </section>
    </div>
  );
}
