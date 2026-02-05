"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useUser } from "@/context/UserContext";
import { getUserById } from "@/lib/db/users";
import { getPaymentRequest } from "@/lib/db/paymentRequests";
import type { User, PaymentRequest } from "@/lib/db/database.type";

export default function PayPage() {
  const { userId } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();

  const paymentId = searchParams.get("paymentId");

  const [me, setMe] = useState<User | null>(null);
  const [payment, setPayment] = useState<PaymentRequest | null>(null);
  const [loading, setLoading] = useState(true);

  // ログインチェック + データ取得
  useEffect(() => {
    if (!paymentId) {
      alert("請求IDが不正です");
      router.replace("/");
      return;
    }

    if (!userId) {
      const redirectTo = encodeURIComponent(
        window.location.pathname + window.location.search,
      );
      router.replace(`/login?redirect=${redirectTo}`);
      return;
    }

    const uid = userId;
    const pid = paymentId;

    async function fetchData() {
      try {
        const [user, request] = await Promise.all([
          getUserById(uid),
          getPaymentRequest(pid),
        ]);

        setMe(user);
        setPayment(request);
      } catch (e) {
        console.error(e);
        alert("請求情報の取得に失敗しました");
        router.replace("/");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [userId, paymentId, router]);

  console.log("Debug:", { loading, me, payment, userId, paymentId });

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        読み込み中...
      </div>
    );
  }

  if (!me || !payment) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        データの取得に失敗しました
      </div>
    );
  }

  // payer_idが設定されていて、かつ自分と違う場合はブロック
  // payer_idがnull = 誰でも支払える
  // if (payment.payer_id !== null && payment.payer_id !== userId) {
  //   alert("この請求はあなた宛てではありません");
  //   router.replace("/");
  //   return null;
  // }

  const canPay = payment.state === "pending" && me.balance >= payment.amount;

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#dcd9d3] px-4 py-10">
      <section className="flex h-[932px] w-[430px] flex-col items-center rounded-[40px] bg-[#f4f2ed] px-10 pt-20 text-center">
        <h1 className="text-xl font-semibold">お支払い内容の確認</h1>

        {/* 請求額 */}
        <div className="mt-10 w-full max-w-xs rounded-[26px] border bg-white px-6 py-8">
          <p className="text-sm tracking-widest text-[#a59f95]">AMOUNT</p>
          <p className="mt-4 text-4xl font-semibold">
            {payment.amount.toLocaleString()}円
          </p>
        </div>

        {/* メッセージ */}
        {payment.message && (
          <p className="mt-4 text-sm text-slate-600">{payment.message}</p>
        )}

        {/* 残高 */}
        <p className="mt-6 text-sm text-[#6b6b6b]">
          現在の残高：{me.balance.toLocaleString()}円
        </p>

        {/* 状態 */}
        {canPay ? (
          <p className="mt-4 text-green-600 text-sm">お支払い可能です</p>
        ) : (
          <p className="mt-4 text-red-600 text-sm">
            {payment.state === "paid"
              ? "この請求はすでに支払われています"
              : "残高が不足しています"}
          </p>
        )}

        {/* 支払い */}
        <Link
          href={canPay ? `/link_to_pay/complete?paymentId=${payment.id}` : "#"}
          className={`mt-10 w-full max-w-xs rounded-full py-4 text-center text-white transition
            ${
              canPay
                ? "bg-[#303030] hover:opacity-90"
                : "bg-[#aaa] pointer-events-none"
            }`}
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
