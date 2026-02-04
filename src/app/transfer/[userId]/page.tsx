"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { getUserById } from "@/lib/db/users";
import { executeTransfer } from "@/lib/db/transfers";
import type { User } from "@/lib/db/database.type";

const resolveIconUrl = (iconUrl: string | null) => {
  if (!iconUrl) return "/users/human1.png";
  if (iconUrl.startsWith("/")) return iconUrl;
  return `/users/${iconUrl}`;
};

export default function TransferPage() {
  const params = useParams();
  const router = useRouter();
  const { userId } = useUser();
  const recipientId = params.userId as string;

  const [me, setMe] = useState<User | null>(null);
  const [recipient, setRecipient] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // 直叩き防止
  useEffect(() => {
    if (!userId) router.replace("/login");
  }, [userId, router]);

  // DBからユーザー取得
  useEffect(() => {
    const fetchUsers = async () => {
      if (!userId) return;

      const [meData, recipientData] = await Promise.all([
        getUserById(userId),
        getUserById(recipientId),
      ]);

      if (!meData || !recipientData) {
        router.replace("/");
        return;
      }

      setMe(meData);
      setRecipient(recipientData);
      setLoading(false);
    };

    fetchUsers();
  }, [userId, recipientId, router]);

  if (!userId || loading || !me || !recipient) return null;

  const numAmount = Number(amount);
  const isOverLimit = numAmount > me.balance;
  const isValidAmount =
    amount !== "" && numAmount > 0 && numAmount <= me.balance;

  const handleTransfer = async () => {
    if (!isValidAmount || isLoading) return;

    setIsLoading(true);
    try {
      await executeTransfer(
        me.id,
        recipient.id,
        numAmount,
        message.trim() || undefined
      );
      router.push("/transfer/complete");
    } catch (e) {
      alert("送金に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center px-4 py-8">
      <div className="w-full max-w-sm">
        {/* 送金先 */}
        <p className="text-sm text-slate-500 mb-2">送金先</p>
        <div className="flex items-center gap-3 mb-6">
          <img
            src={resolveIconUrl(recipient.icon_url)}
            alt={recipient.name}
            className="w-12 h-12 rounded-full object-cover"
          />
          <p className="font-medium text-slate-800 text-lg">
            {recipient.name}
          </p>
        </div>

        {/* 残高 */}
        <p className="text-sm text-slate-500 mb-1">残高</p>
        <p className="text-2xl font-semibold text-slate-800 mb-6">
          {me.balance.toLocaleString()}円
        </p>

        {/* ===== ここから指定UIを結合 ===== */}

        {/* 送金金額入力 */}
        <p className="text-sm text-slate-500 mb-2">送金金額</p>
        <div className="flex items-center gap-2 mb-2">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="0"
            placeholder="金額"
            className={`flex-1 border rounded-lg px-4 py-3 text-lg focus:outline-none focus:ring-2
              [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none
              [&::-webkit-inner-spin-button]:appearance-none
              ${
                isOverLimit
                  ? "border-red-400 focus:ring-red-300"
                  : "border-slate-300 focus:ring-slate-400"
              }`}
          />
          <span className="text-slate-600">円</span>
        </div>

        {/* エラーメッセージ */}
        <div className="h-6 mb-4">
          {isOverLimit && (
            <p className="text-red-500 text-sm">
              ※送金上限額を超えています。
            </p>
          )}
        </div>

        {/* メッセージ入力 */}
        <p className="text-sm text-slate-500 mb-2">メッセージ (任意)</p>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={120}
          placeholder="メッセージを入力 (最大120文字)"
          className="w-full border border-slate-300 rounded-lg px-4 py-3 text-base resize-none focus:outline-none focus:ring-2 focus:ring-slate-400 min-h-[96px] mb-6"
        />

        {/* 送金ボタン */}
        <button
          onClick={handleTransfer}
          disabled={!isValidAmount || isLoading}
          className={`w-full py-4 rounded-full text-lg font-medium transition ${
            isValidAmount && !isLoading
              ? "bg-red-400 text-white hover:opacity-90"
              : "bg-slate-300 text-slate-500 cursor-not-allowed"
          }`}
        >
          {isLoading ? "処理中..." : "送金"}
        </button>
      </div>
    </div>
  );
}
