"use client";

import { useEffect, useState } from "react";
import { getAllUsers, getUserById, updateUserBalance } from "@/lib/db/users";
import type { User } from "@/lib/db/database.type";
import { executeTransfer } from "@/lib/db/transfers";

export default function TestBackendPage() {
  const [data, setData] = useState<User[]>([]);
  const [myData, setMyData] = useState<User | null>(null);
  const [myBalance, setMyBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  // データを取得
  useEffect(() => {
    async function fetchData() {
      try {
        const allUsers = await getAllUsers();
        const user = await getUserById("0001");

        setData(allUsers);
        setMyData(user);
        setMyBalance(user?.balance || 0);
      } catch (error) {
        console.error("データ取得エラー:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  // 残高を更新する
  async function handleUpdateBalance() {
    try {
      const newBalance = myBalance + 100;
      await updateUserBalance("0001", newBalance);

      // 状態を更新（UIに即座に反映）
      setMyBalance(newBalance);

      // データを再取得して最新の状態を確認
      const updatedUser = await getUserById("0001");
      if (updatedUser) {
        setMyData(updatedUser);
        setMyBalance(updatedUser.balance);
      }
    } catch (error) {
      console.error("残高更新エラー:", error);
      alert("残高の更新に失敗しました");
    }
  }

  async function sendTransfer(
    senderId: string,
    receiverId: string,
    amount: number,
    message?: string,
  ) {
    try {
      await executeTransfer(senderId, receiverId, amount, message);
    } catch (error) {
      console.error("送金エラー:", error);
      alert("送金に失敗しました");
    }
  }

  if (isLoading) {
    return <div>読み込み中...</div>;
  }

  return (
    <div className="flex flex-col gap-2">
      {/* 全ユーザー情報 */}
      <div className="border-b border-stone-400 pb-2 ">
        {JSON.stringify(data)}
      </div>

      <div className="border-b border-stone-400  pb-2">
        {data.map((user) => (
          <div key={user.id}>
            {user.id} : {user.name} <br />
          </div>
        ))}
      </div>

      {/* 自分の情報 */}
      <div className="border-b border-stone-400 pb-2">
        <div>名前：{myData?.name}</div>
        <div>残高：{myBalance}円</div>
      </div>

      {/* 残高を更新する */}
      <div className="border-b border-stone-400 pb-2">
        <div>鈴木の残高を100円増やす</div>
        <div>
          {myData && (
            <button
              className="bg-stone-400 py-1 px1 border border-stone-600 rounded-md"
              onClick={handleUpdateBalance}
            >
              送金
            </button>
          )}
        </div>
      </div>

      {/* 送金する */}
      <div className="border-b border-stone-400 pb-2">
        <div>鈴木から0002へ100円送金する</div>
        <div>
          {myData && (
            <button
              className="bg-stone-400 py-1 px1 border border-stone-600 rounded-md"
              onClick={() => sendTransfer("0001", "0002", 100)}
            >
              送金
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
