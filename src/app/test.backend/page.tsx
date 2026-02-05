"use client";

import { useEffect, useState } from "react";
import { getAllUsers, getUserById, updateUserBalance } from "@/lib/db/users";
import type { User } from "@/lib/db/database.type";
import { executeTransfer } from "@/lib/db/transfers";
import { supabase } from "@/lib/db/supabase";
import Section from "@/components/test.backend/section";
import {
  createPaymentRequest,
  deletePaymentRequest,
  getAllPaymentRequests,
  payPaymentRequest,
} from "@/lib/db/paymentRequests";
import type { PaymentRequest } from "@/lib/db/database.type";

export default function TestBackendPage() {
  const [data, setData] = useState<User[]>([]);
  const [myData, setMyData] = useState<User | null>(null);
  const [myBalance, setMyBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);
  const [deleteId, setDeleteId] = useState<string>("");
  const [payerId, setPayerId] = useState<string>("");
  const [paymentId, setPaymentId] = useState<string>("");

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

      // 状態を更新
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

  // 送金する
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

  // 請求を作成する
  async function handleCreatePaymentRequest(
    requesterId: string,
    payerId: string | null,
    amount: number,
    message?: string,
  ) {
    try {
      await createPaymentRequest(requesterId, payerId, amount, message);

      // データを再取得して最新の状態を表示
      const updatedPaymentRequests = await getAllPaymentRequests();
      setPaymentRequests(updatedPaymentRequests);
    } catch (error) {
      console.error("支払い依頼作成エラー:", error);
      alert("支払い依頼の作成に失敗しました");
    }
  }

  // 請求を削除する
  async function handleDeletePaymentRequest() {
    if (!deleteId.trim()) {
      alert("削除するIDを入力してください");
      return;
    }

    try {
      await deletePaymentRequest(deleteId);

      // データを再取得して最新の状態を表示
      const updatedPaymentRequests = await getAllPaymentRequests();
      setPaymentRequests(updatedPaymentRequests);

      // 入力フィールドをクリア
      setDeleteId("");

      alert("支払い依頼を削除しました");
    } catch (error) {
      console.error("支払い依頼削除エラー:", error);
      alert("支払い依頼の削除に失敗しました");
    }
  }

  // 請求を支払う
  async function handlePayPaymentRequest() {
    if (!payerId.trim()) {
      alert("支払い元のユーザーIDを入力してください");
      return;
    }

    if (!paymentId.trim()) {
      alert("支払い依頼IDを入力してください");
      return;
    }

    try {
      // 請求を取得して確認
      const { data: paymentRequest, error: fetchError } = await supabase
        .from("payment_requests")
        .select("*")
        .eq("id", paymentId)
        .single();

      if (fetchError) {
        console.error("請求の取得エラー:", fetchError);
        throw new Error(`請求が見つかりません: ${fetchError.message}`);
      }

      if (!paymentRequest) {
        throw new Error("請求が見つかりません");
      }

      // 支払いを実行
      await payPaymentRequest(paymentId, payerId);

      // データを再取得して最新の状態を表示
      const updatedPaymentRequests = await getAllPaymentRequests();
      setPaymentRequests(updatedPaymentRequests);

      // 入力フィールドをクリア
      setPayerId("");
      setPaymentId("");

      alert("請求を支払いました");
    } catch (error) {
      console.error("請求支払いエラー:", error);
      alert("請求の支払いに失敗しました: " + (error as Error).message);
    }
  }

  if (isLoading) {
    return <div>読み込み中...</div>;
  }

  return (
    <div className="flex flex-col gap-2">
      {/* 全ユーザー情報 */}
      <Section title="全ユーザー情報">{JSON.stringify(data)}</Section>

      <Section title="ユーザー情報表示">
        {data.map((user) => (
          <div key={user.id}>
            {user.id} : {user.name} : {user.balance}円<br />
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
      <Section title="請求を作成する">
        <div>鈴木が200円の請求を作成する</div>
        <div>
          {myData && (
            <button
              className="bg-stone-400 py-1 px1 border border-stone-600 rounded-md"
              onClick={() =>
                handleCreatePaymentRequest("0001", null, 100, "うに丼")
              }
            >
              作成
            </button>
          )}
        </div>
      </Section>

      {/* 請求一覧 */}
      <Section title="請求一覧">
        {paymentRequests.map((paymentRequest) => (
          <div key={paymentRequest.id}>
            {paymentRequest.id}
            <br />
            {paymentRequest.amount} | {paymentRequest.message} |{" "}
            {paymentRequest.state}
            <br />
          </div>
        ))}
      </Section>

      {/* 請求を削除する */}
      <Section title="請求を削除する">
        <div>削除する請求のIDを入力してください</div>
        <div className="flex gap-2 items-center mt-2">
          <input
            type="text"
            value={deleteId}
            onChange={(e) => setDeleteId(e.target.value)}
            placeholder="支払い依頼ID"
            className="border border-stone-400 px-2 py-1 rounded-md"
          />
          <button
            className="bg-stone-400 py-1 px1 border border-stone-600 rounded-md"
            onClick={handleDeletePaymentRequest}
          >
            削除
          </button>
        </div>
      </Section>

      {/* 請求を支払う */}
      <Section title="請求を支払う">
        <div>支払い元のユーザーIDと請求IDを入力してください</div>
        <div className="flex flex-col gap-2 mt-2">
          <input
            type="text"
            value={payerId}
            onChange={(e) => setPayerId(e.target.value)}
            placeholder="支払うユーザーID"
            className="border border-stone-400 px-2 py-1 rounded-md"
          />
          <input
            type="text"
            value={paymentId}
            onChange={(e) => setPaymentId(e.target.value)}
            placeholder="請求ID"
            className="border border-stone-400 px-2 py-1 rounded-md"
          />
          <button
            className="bg-stone-400 py-1 px1 border border-stone-600 rounded-md"
            onClick={handlePayPaymentRequest}
          >
            支払いを実行
          </button>
        </div>
      </Section>

      {/* 請求されたユーザーIDから請求を取得 */}
      <Section title="請求されたユーザーID(0002)から請求を取得">
        {paymentRequests.map((paymentRequest) => (
          <div key={paymentRequest.id}>
            {paymentRequest.payer_id == "0002" && (
              <div>
                {paymentRequest.id}
                <br />
                {paymentRequest.amount} | {paymentRequest.message} |{" "}
                {paymentRequest.state}
                <br />
                被請求者: {paymentRequest.payer_id}
              </div>
            )}
          </div>
        ))}
      </Section>
    </div>
  );
}
