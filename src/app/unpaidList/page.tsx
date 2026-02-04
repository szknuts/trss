"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getPaymentRequestsByPayerId } from "@/lib/db/paymentRequests";
import { getUserById } from "@/lib/db/users";
import { useUser } from "@/context/UserContext";
import type { PaymentRequest, User } from "@/lib/db/database.type";

export default function UnpaidListPage() {
  const { userId } = useUser();
  const router = useRouter();
  const [unpaidRequests, setUnpaidRequests] = useState<PaymentRequest[]>([]);
  const [requesterMap, setRequesterMap] = useState<Record<string, User>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      router.replace("/login");
      return;
    }

    async function fetchData() {
      try {
        const requests = await getPaymentRequestsByPayerId(userId!);
        const unpaid = requests.filter((req) => req.state !== "paid");
        setUnpaidRequests(unpaid);

        // 請求者の情報を取得
        const requesterIds = [
          ...new Set(unpaid.map((req) => req.requester_id)),
        ];
        const map: Record<string, User> = {};
        await Promise.all(
          requesterIds.map(async (id) => {
            const u = await getUserById(id);
            if (u) map[id] = u;
          }),
        );
        setRequesterMap(map);
      } catch (error) {
        console.error("データ取得エラー:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [userId, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#dcd9d3]">
        <div className="text-[#303030]">読み込み中...</div>
      </div>
    );
  }

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

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#dcd9d3] px-4 py-10 font-sans text-[#1f1f1f]">
      <section className="flex h-[932px] w-[430px] max-w-full flex-col rounded-[40px] bg-[#f4f2ed] px-10 pb-16 pt-20">
        {/* ヘッダー */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-[#303030]">
            未払い請求一覧
          </h1>
          <p className="mt-2 text-sm text-[#6b6b6b]">
            あなた宛ての未払い請求 ({unpaidRequests.length}件)
          </p>
        </div>

        {/* 請求一覧 */}
        <div className="flex-1 overflow-y-auto">
          {unpaidRequests.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-[#a59f95]">未払いの請求はありません</p>
            </div>
          ) : (
            <div className="space-y-4">
              {unpaidRequests.map((req) => {
                const requester = requesterMap[req.requester_id];
                return (
                  <UnpaidCard
                    key={req.id}
                    request={req}
                    requester={requester}
                    formatDate={formatDate}
                  />
                );
              })}
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

function UnpaidCard({
  request,
  requester,
  formatDate,
}: {
  request: PaymentRequest;
  requester: User | undefined;
  formatDate: (dateString: string) => string;
}) {
  const [isMessageExpanded, setIsMessageExpanded] = useState(false);

  return (
    <div className="rounded-[20px] border border-[#e6e2dc] bg-white p-4">
      {/* 請求者情報と金額 */}
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {requester?.icon_url ? (
            <img
              src={`/users/${requester.icon_url}`}
              alt={requester.name}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ded8cf] text-sm font-semibold text-[#2f2b28]">
              {requester?.name?.charAt(0) ?? "?"}
            </div>
          )}
          <div className="text-left">
            <p className="text-sm font-semibold text-[#303030]">
              {requester?.name ?? "不明"}
            </p>
            <p className="text-xs text-[#a59f95]">
              {formatDate(request.created_at)}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1">
          <span className="text-xl font-semibold text-red-600">
            {request.amount}円
          </span>
          <span className="inline-block rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-semibold text-yellow-700">
            {request.state === "rejected" ? "却下" : "待機中"}
          </span>
        </div>
      </div>

      {/* メッセージ */}
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
            <p className="mt-1 cursor-pointer text-xs text-[#a59f95] hover:underline">
              {isMessageExpanded ? "▲ 閉じる" : "▼ もっと見る"}
            </p>
          )}
        </div>
      )}

      {/* 支払うボタン */}
      <Link
        href={`/link_to_pay?paymentId=${request.id}`}
        className="mt-2 block w-full rounded-full bg-red-500 py-3 text-center text-sm font-semibold text-white transition hover:bg-red-600"
      >
        支払う
      </Link>
    </div>
  );
}
