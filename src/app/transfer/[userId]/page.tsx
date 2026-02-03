"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { executeTransfer } from "@/lib/db/transfers";

export default function TransferPage() {
  const params = useParams();
  const router = useRouter();
  const recipientId = params.userId as string;

  // 仮のデータ（後でAPIから取得）
  const myId = "0001";
  const myBalance = 50000;
  const users: { [key: string]: { name: string; icon: string } } = {
    "0002": { name: "小菅 啓太", icon: "/users/human2.png" },
    "0003": { name: "栃下 藤之", icon: "/users/human3.png" },
    "0004": { name: "高村 優姫", icon: "/users/human4.png" },
    "0005": { name: "水口 尚哉", icon: "/users/human5.png" },
  };

  const recipient = users[recipientId] || { name: "不明", icon: "" };
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const numAmount = Number(amount);
  const isOverLimit = numAmount > myBalance;
  const isValidAmount = amount !== "" && numAmount > 0 && numAmount <= myBalance;

  const handleTransfer = async () => {
    if (!isValidAmount || isLoading) return;

    setIsLoading(true);
    try {
      await executeTransfer(myId, recipientId, numAmount);
      router.push("/transfer/complete");
    } catch (error) {
      console.error("送金処理エラー:", error);
      alert("送金処理に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center px-4 py-8">
      {/* 送金先 */}
      <div className="w-full max-w-sm">
        <p className="text-sm text-slate-500 mb-2">送金先</p>
        <div className="flex items-center gap-3 mb-6">
          <img
            src={recipient.icon}
            alt={recipient.name}
            className="w-12 h-12 rounded-full object-cover"
          />
          <p className="font-medium text-slate-800 text-lg">{recipient.name}</p>
        </div>

        {/* 送金上限額 */}
        <p className="text-sm text-slate-500 mb-1">送金上限額</p>
        <p className="text-2xl font-semibold text-slate-800 mb-6">
          {myBalance.toLocaleString()}円
        </p>

        {/* 送金金額入力 */}
        <p className="text-sm text-slate-500 mb-2">送金金額</p>
        <div className="flex items-center gap-2 mb-2">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="0"
            placeholder="金額"
            className={`flex-1 border rounded-lg px-4 py-3 text-lg focus:outline-none focus:ring-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
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
            <p className="text-red-500 text-sm">※送金上限額を超えています。</p>
          )}
        </div>

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
