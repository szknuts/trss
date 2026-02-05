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

const MAX_MESSAGE_LENGTH = 100;

export default function TransferPage() {
  const params = useParams();
  const router = useRouter();
  const { userId } = useUser();
  const recipientId = params.userId as string;

  const [isEditingAmount, setIsEditingAmount] = useState(false);
  const [amountError, setAmountError] = useState<string | null>(null);

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
    amount !== "" && !amountError && numAmount > 0;

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
    <div className="flex min-h-screen items-center justify-center bg-[#dcd9d3] px-4 py-10 font-sans text-[#1f1f1f]">
      <section className="flex h-[932px] w-[430px] max-w-full flex-col items-center rounded-[40px] bg-[#f4f2ed] px-10 pb-16 pt-20 text-center">
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
              type="text"
              inputMode="numeric"
              value={
                isEditingAmount
                  ? amount
                  : amount
                  ? Number(amount).toLocaleString()
                  : ""
              }
              placeholder="金額"
              onFocus={() => {
                setIsEditingAmount(true);
                setAmountError(null);
              }}
              onBlur={() => {
                setIsEditingAmount(false);

                const num = Number(amount);

                if (amount === "" || num === 0) {
                  setAmountError("1円以上を入力してください");
                } else if (num > me.balance) {
                  setAmountError("残高を超えています");
                }
              }}
              onChange={(e) => {
                const raw = e.target.value.replace(/[^0-9]/g, "");
                setAmount(raw);
                setAmountError(null);
              }}
              className={`flex-1 border rounded-lg px-4 py-3 text-lg focus:outline-none focus:ring-2
                ${
                  amountError
                    ? "border-red-400 focus:ring-red-300"
                    : "border-slate-300 focus:ring-slate-400"
                }`}
              style={{
                textAlign:
                  isEditingAmount || amount === "" || !!amountError
                    ? "left"
                    : "center",
              }}
            />

            <span className="text-slate-600">円</span>
          </div>


          {/* エラーメッセージ */}
          <div className="h-6 mb-4">
            {amountError && (
              <p className="text-red-500 text-sm">
                {amountError}
              </p>
            )}
          </div>

          {/* メッセージ入力 */}
          <p className="text-sm text-slate-500 mb-2">メッセージ (任意)</p>
          <textarea
            value={message}
            onChange={(e) =>
              setMessage(e.target.value.slice(0, MAX_MESSAGE_LENGTH))
            }
            maxLength={MAX_MESSAGE_LENGTH}
            placeholder="メッセージを入力 (最大100文字)"
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
      </section>
    </div>
  );
}
