"use client";

import { useState } from "react";
import { useParams } from "next/navigation";

export default function TransferPage() {
  const params = useParams();
  const userId = params.userId as string;

  // 仮のデータ（後でAPIから取得）
  const myBalance = 50000;
  const users: { [key: string]: { name: string; icon: string } } = {
    "2": { name: "小菅 啓太", icon: "/users/human2.png" },
    "3": { name: "栃下 藤之", icon: "/users/human3.png" },
    "4": { name: "高村 優姫", icon: "/users/human4.png" },
    "5": { name: "水口 尚哉", icon: "/users/human5.png" },
  };

  const recipient = users[userId] || { name: "不明", icon: "" };
  const [amount, setAmount] = useState("");

  const handleTransfer = () => {
    const numAmount = Number(amount);
    if (numAmount <= 0 || numAmount > myBalance) {
      alert("無効な金額です");
      return;
    }
    // TODO: 送金処理を実装
    alert(`${recipient.name}に${numAmount.toLocaleString()}円を送金しました`);
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
        <div className="flex items-center gap-2 mb-8">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="0"
            placeholder="金額"
            className="flex-1 border border-slate-300 rounded-lg px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-slate-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <span className="text-slate-600">円</span>
        </div>

        {/* 送金ボタン */}
        <button
          onClick={handleTransfer}
          disabled={!amount}
          className={`w-full py-4 rounded-full text-lg font-medium transition ${
            amount
              ? "bg-[#303030] text-white hover:opacity-90"
              : "bg-slate-300 text-slate-500 cursor-not-allowed"
          }`}
        >
          送金
        </button>
      </div>
    </div>
  );
}
