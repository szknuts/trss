"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAllPaymentRequests } from "@/lib/db/paymentRequests";
import { getUserById } from "@/lib/db/users";
import { useUser } from "@/context/UserContext";
import type { PaymentRequest, User } from "@/lib/db/database.type";

export default function InvoiceListPage() {
  const { userId } = useUser();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      router.replace("/login");
      return;
    }

    async function fetchData() {
      try {
        const currentUser = await getUserById(userId!);
        setUser(currentUser);

        // すべての請求を取得して、自分が請求者のものをフィルタ
        const allRequests = await getAllPaymentRequests();
        const myRequests = allRequests.filter(
          (req) => req.requester_id === userId,
        );
        setPaymentRequests(myRequests);
      } catch (error) {
        console.error("データ取得エラー:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [userId, router]);

  // ローディング中
  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#dcd9d3]">
        <div className="text-[#303030]">読み込み中...</div>
      </div>
    );
  }

  // 支払済みの請求を取得
  const paidRequests = paymentRequests.filter((req) => req.state === "paid");

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#dcd9d3] px-4 py-10 font-sans text-[#1f1f1f]">
      <section className="flex h-[932px] w-[430px] max-w-full flex-col rounded-[40px] bg-[#f4f2ed] px-10 pb-16 pt-20">
        {/* ヘッダー */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-[#303030]">請求状況</h1>
          <p className="mt-2 text-sm text-[#6b6b6b]">
            {user.name}さんの請求一覧
          </p>
        </div>

        {/* 請求一覧 */}
        <div className="flex-1 overflow-y-auto">
          {paymentRequests.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-[#a59f95]">請求はありません</p>
            </div>
          ) : (
            <div className="space-y-4">
              {paymentRequests.map((request) => (
                <InvoiceCard key={request.id} request={request} />
              ))}
            </div>
          )}
        </div>

        {/* 戻るボタン */}
        <Link
          href="/"
          className="mt-6 w-full rounded-full bg-[#303030] py-4 text-center text-white transition hover:opacity-90"
        >
          ホームに戻る
        </Link>
      </section>
    </div>
  );
}

// 請求カードコンポーネント
function InvoiceCard({ request }: { request: PaymentRequest }) {
  const [payerUser, setPayerUser] = useState<User | null>(null);
  const [isMessageExpanded, setIsMessageExpanded] = useState(false);

  useEffect(() => {
    // 支払済みの場合、支払者の情報を取得
    if (request.state === "paid" && request.payer_id) {
      getUserById(request.payer_id)
        .then(setPayerUser)
        .catch((err) => console.error("支払者情報の取得エラー:", err));
    }
  }, [request.state, request.payer_id]);

  // 日付をフォーマット
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // 状態に応じた色とラベル
  const getStatusInfo = () => {
    switch (request.state) {
      case "paid":
        return { label: "支払済み", color: "bg-green-100 text-green-700" };
      case "rejected":
        return { label: "却下", color: "bg-red-100 text-red-700" };
      default:
        return { label: "待機中", color: "bg-yellow-100 text-yellow-700" };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="rounded-[20px] border border-[#e6e2dc] bg-white p-4">
      {/* ヘッダー: 請求金額とステータス */}
      <div className="mb-2 flex items-center justify-between">
        {/* 金額を横並び */}
        <div className="flex items-baseline gap-2">
          <span className="text-xs uppercase tracking-wider text-[#a59f95]">
            請求金額
          </span>
          <span className="text-xl font-semibold text-[#303030]">
            {request.amount}円
          </span>
        </div>

        <div className="flex flex-col items-end gap-1">
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusInfo.color}`}
          >
            {statusInfo.label}
          </span>
          <span className="text-xs text-[#a59f95]">
            {formatDate(request.created_at)}
          </span>
        </div>
      </div>

      {/* メッセージ（アコーディオン） */}
      {request.message && (
        <div className="mb-2">
          <button
            onClick={() => setIsMessageExpanded(!isMessageExpanded)}
            className="w-full text-left"
          >
            <p className="text-xs uppercase tracking-wider text-[#a59f95]">
              メッセージ
            </p>
            <p
              className={`mt-0.5 text-sm text-[#303030] ${
                !isMessageExpanded ? "line-clamp-1" : ""
              }`}
            >
              {request.message}
            </p>
          </button>
          {request.message.length > 20 && (
            <p className="mt-1 text-xs text-[#a59f95] cursor-pointer hover:underline">
              {isMessageExpanded ? "▲ 閉じる" : "▼ もっと見る"}
            </p>
          )}
        </div>
      )}

      {/* 支払済みの場合、支払者情報を右寄せで横並び */}
      {request.state === "paid" && payerUser && (
        <div className="mt-3 flex items-center justify-between border-t border-[#e6e2dc] pt-3">
          <span className="text-xs uppercase tracking-wider text-[#a59f95]">
            支払者
          </span>

          <div className="flex items-center gap-2">
            {/* ユーザー画像（アイコン） */}
            {payerUser.icon_url ? (
              <img
                src={`/users/${payerUser.icon_url}`}
                alt={payerUser.name}
                className="h-6 w-6 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#ded8cf] text-xs font-semibold text-[#2f2b28]">
                {payerUser.name.charAt(0)}
              </div>
            )}
            <span className="text-sm font-semibold text-[#303030]">
              {payerUser.name}
            </span>
            <span className="text-xs text-[#a59f95]">({payerUser.id})</span>
          </div>
        </div>
      )}
    </div>
  );
}
