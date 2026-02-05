"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getTransfersBySenderId,
  getTransfersByReceiverId,
} from "@/lib/db/transfers";
import { getUserById } from "@/lib/db/users";
import { useUser } from "@/context/UserContext";
import type { Transfer, User } from "@/lib/db/database.type";

type TransferWithDirection = Transfer & {
  direction: "sent" | "received";
};

export default function HistoryPage() {
  const { userId } = useUser();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [transfers, setTransfers] = useState<TransferWithDirection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "sent" | "received">("all");

  useEffect(() => {
    if (!userId) {
      router.replace("/login");
      return;
    }

    async function fetchData() {
      try {
        const currentUser = await getUserById(userId!);
        setUser(currentUser);

        // 送金履歴と受取履歴を並行取得
        const [sentTransfers, receivedTransfers] = await Promise.all([
          getTransfersBySenderId(userId!),
          getTransfersByReceiverId(userId!),
        ]);

        // 方向情報
        const sentWithDirection: TransferWithDirection[] = sentTransfers.map(
          (t) => ({ ...t, direction: "sent" as const }),
        );
        const receivedWithDirection: TransferWithDirection[] =
          receivedTransfers.map((t) => ({
            ...t,
            direction: "received" as const,
          }));

        // 統合して日付順（新しい順）にソート
        const allTransfers = [...sentWithDirection, ...receivedWithDirection];
        allTransfers.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );

        setTransfers(allTransfers);
      } catch (error) {
        console.error("データ取得エラー:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [userId, router]);

  // フィルター適用
  const filteredTransfers = transfers.filter((t) => {
    if (filter === "all") return true;
    return t.direction === filter;
  });

  // ローディング中
  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#dcd9d3]">
        <div className="text-[#303030]">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#dcd9d3] px-4 py-10 font-sans text-[#1f1f1f]">
      <section className="flex h-[932px] w-[430px] max-w-full flex-col rounded-[40px] bg-[#f4f2ed] px-10 pb-16 pt-20">
        {/* ヘッダー */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-[#303030]">取引履歴</h1>
          <p className="mt-2 text-sm text-[#6b6b6b]">
            送金・受取の履歴を確認できます
          </p>
        </div>

        {/* フィルタータブ */}
        <div className="mb-6 flex justify-center gap-2">
          <FilterButton
            label="すべて"
            isActive={filter === "all"}
            onClick={() => setFilter("all")}
          />
          <FilterButton
            label="送金"
            isActive={filter === "sent"}
            onClick={() => setFilter("sent")}
          />
          <FilterButton
            label="受取"
            isActive={filter === "received"}
            onClick={() => setFilter("received")}
          />
        </div>

        {/* 履歴一覧 */}
        <div className="flex-1 overflow-y-auto">
          {filteredTransfers.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-[#a59f95]">履歴がありません</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTransfers.map((transfer) => (
                <TransferCard
                  key={`${transfer.direction}-${transfer.id}`}
                  transfer={transfer}
                  currentUserId={userId!}
                />
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

// フィルターボタンコンポーネント
function FilterButton({
  label,
  isActive,
  onClick,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm font-medium transition ${
        isActive
          ? "bg-[#303030] text-white"
          : "bg-white text-[#6b6b6b] hover:bg-[#e6e2dc]"
      }`}
    >
      {label}
    </button>
  );
}

// 取引カードコンポーネント
function TransferCard({
  transfer,
  currentUserId,
}: {
  transfer: TransferWithDirection;
  currentUserId: string;
}) {
  const [otherUser, setOtherUser] = useState<User | null>(null);

  useEffect(() => {
    // 相手ユーザーの情報を取得
    const otherUserId =
      transfer.direction === "sent" ? transfer.receiver_id : transfer.sender_id;

    getUserById(otherUserId)
      .then(setOtherUser)
      .catch((err) => console.error("ユーザー情報の取得エラー:", err));
  }, [transfer]);

  // 日付をフォーマット
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("ja-JP", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const isSent = transfer.direction === "sent";

  return (
    <div className="rounded-[16px] border border-[#e6e2dc] bg-white p-4">
      <div className="flex items-center gap-3">
        {/* 方向アイコン */}
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-full ${
            isSent ? "bg-red-50 text-red-500" : "bg-green-50 text-green-500"
          }`}
        >
          {isSent ? "↗" : "↙"}
        </div>

        {/* ユーザー情報 */}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            {otherUser?.icon_url ? (
              <img
                src={`/users/${otherUser.icon_url}`}
                alt={otherUser.name}
                className="h-6 w-6 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#ded8cf] text-xs font-semibold text-[#2f2b28]">
                {otherUser?.name?.charAt(0) || "?"}
              </div>
            )}
            <span className="text-sm font-semibold text-[#303030]">
              {isSent
                ? `${otherUser?.name || "---"}へ送金`
                : `${otherUser?.name || "---"}から受取`}
            </span>
          </div>
          {transfer.message && (
            <p className="mt-1 text-xs text-[#a59f95] line-clamp-1">
              {transfer.message}
            </p>
          )}
        </div>

        {/* 金額と日時 */}
        <div className="text-right">
          <p
            className={`text-lg font-semibold ${
              isSent ? "text-red-600" : "text-green-600"
            }`}
          >
            {isSent ? "-" : "+"}
            {transfer.amount.toLocaleString()}円
          </p>
          <p className="text-xs text-[#a59f95]">
            {formatDate(transfer.created_at)}
          </p>
        </div>
      </div>
    </div>
  );
}
