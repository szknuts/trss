"use client";

import { useEffect, useState } from "react";
import { getAllUsers, getUserById, updateUserBalance } from "@/lib/db/users";
import type { User } from "@/lib/db/database.type";
import { executeTransfer } from "@/lib/db/transfers";
import Section from "@/components/test.backend/section";
import {
  createPaymentRequest,
  getAllPaymentRequests,
} from "@/lib/db/paymentRequests";
import type { PaymentRequest } from "@/lib/db/database.type";

export default function TestBackendPage() {
  const [data, setData] = useState<User[]>([]);
  const [myData, setMyData] = useState<User | null>(null);
  const [myBalance, setMyBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);

  // データを取得
  useEffect(() => {
    async function fetchData() {
      try {
        const allUsers = await getAllUsers();
        const user = await getUserById("0001");
        const payments = await getAllPaymentRequests();

        setData(allUsers);
        setMyData(user);
        setMyBalance(user?.balance || 0);
        setPaymentRequests(payments);
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

  // 支払い依頼を作成する
  async function handleCreatePaymentRequest(
    requesterId: string,
    amount: number,
    message?: string,
  ) {
    try {
      await createPaymentRequest(requesterId, amount, message);

      // データを再取得して最新の状態を表示
      const updatedPaymentRequests = await getAllPaymentRequests();
      setPaymentRequests(updatedPaymentRequests);
    } catch (error) {
      console.error("支払い依頼作成エラー:", error);
      alert("支払い依頼の作成に失敗しました");
    }
  }

  if (isLoading) {
    return <div>読み込み中...</div>;
  }

  return (
    <div className="flex flex-col gap-2">
      {/* 全ユーザー情報 */}
      <Section title="全ユーザー情報">
        {data.map((user) => (
          <div key={user.id}>
            {user.id} : {user.name} <br />
          </div>
        ))}
      </Section>

      <Section title="ユーザー情報表示">
        {data.map((user) => (
          <div key={user.id}>
            {user.id} : {user.name} <br />
          </div>
        ))}
      </Section>

      {/* 自分の情報 */}
      <Section title="自分の情報">
        <div>名前：{myData?.name}</div>
        <div>残高：{myBalance}円</div>
      </Section>

      {/* 残高を更新する */}
      <Section title="残高を更新する">
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
      </Section>

      {/* 送金する */}
      <Section title="送金する">
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
      </Section>

      {/* 支払い依頼を作成する */}
      <Section title="支払い依頼を作成する">
        <div>鈴木から0002へ100円送金する</div>
        <div>
          {myData && (
            <button
              className="bg-stone-400 py-1 px1 border border-stone-600 rounded-md"
              onClick={() => handleCreatePaymentRequest("0001", 100, "うに丼")}
            >
              作成
            </button>
          )}
        </div>
      </Section>

      {/* 支払い依頼一覧 */}
      <Section title="支払い依頼一覧">
        {paymentRequests.map((paymentRequest) => (
          <div key={paymentRequest.id}>
            {paymentRequest.id} : {paymentRequest.amount} :{" "}
            {paymentRequest.message} <br />
          </div>
        ))}
      </Section>
    </div>
  );
}
