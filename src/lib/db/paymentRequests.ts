/**
 * @file src/lib/db/paymentRequests.ts
 * @description 請求に関するデータベース操作
 */

import { supabase } from "@/lib/db/supabase";
import type { PaymentRequest, User } from "@/lib/db/database.type";
import { executeTransfer } from "./transfers";

const TABLE_NAME = "payment_requests";
const MIN_AMOUNT = 1;

// 請求の作成に関する関数
////////////////////////////////////////////////////////////////////////////////

/**
 * @description 請求を作成 (支払ユーザ指定対応)
 * @param requesterId - 請求したユーザーID
 * @param payerId - 支払うユーザーID（まだ誰も決まっていない場合はnull）
 * @param amount - 金額
 * @param message - メッセージ (null可)
 * @returns 作成された請求
 */
export async function createPaymentRequest(
  requesterId: PaymentRequest["requester_id"],
  payerId: PaymentRequest["payer_id"] | null,
  amount: number,
  message?: string,
): Promise<PaymentRequest> {
  if (!Number.isFinite(amount))
    throw new Error("金額は有効な数値である必要があります");

  if (amount < MIN_AMOUNT)
    throw new Error("金額は正の数値である必要があります");

  if (!requesterId) throw new Error("請求したユーザーIDは必須です");

  if (requesterId === payerId)
    throw new Error("請求したユーザーと支払うユーザーは異なります");

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert({
      requester_id: requesterId,
      payer_id: payerId,
      amount,
      message,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating payment request:", error);
    throw new Error(`請求の作成に失敗しました: ${error.message}`);
  }
  return data;
}

// 請求の取得に関する関数
////////////////////////////////////////////////////////////////////////////////

/**
 * @description すべての請求を取得
 * @returns 請求配列
 */
export async function getAllPaymentRequests(): Promise<PaymentRequest[]> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching payment requests:", error);
    throw new Error(`請求の取得に失敗しました: ${error.message}`);
  }
  return data || [];
}

/**
 * @description IDから請求を取得
 * @param id - 請求ID
 * @returns 請求
 */
export async function getPaymentRequest(id: string): Promise<PaymentRequest> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching payment request:", error);
    throw new Error(`請求の取得に失敗しました: ${error.message}`);
  }

  return data;
}

/**
 * @description 請求したユーザーIDから請求を取得
 * @param userId - 請求ユーザーID
 * @returns 請求配列
 */
export async function getPaymentRequestsByRequesterId(
  userId: PaymentRequest["requester_id"],
): Promise<PaymentRequest[]> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select("*")
    .eq("requester_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching payment requests:", error);
    throw new Error(`請求の取得に失敗しました: ${error.message}`);
  }
  return data || [];
}

/**
 * @description 支払うユーザーIDから請求を取得
 * @param userId - 支払いユーザーID
 * @returns 請求配列
 */
export async function getPaymentRequestsByPayerId(
  userId: PaymentRequest["payer_id"],
): Promise<PaymentRequest[]> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select("*")
    .eq("payer_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching payment requests:", error);
    throw new Error(`請求の取得に失敗しました: ${error.message}`);
  }

  return data || [];
}

// 請求の支払いに関する関数
////////////////////////////////////////////////////////////////////////////////

/**
 * @description 請求を支払う (支払うユーザーが指定されている場合にも対応)
 * @param id - 請求ID
 * @param payerId - 支払うユーザーID
 * @returns 支払われた請求
 */
export async function payPaymentRequest(
  id: PaymentRequest["id"],
  payerId: PaymentRequest["payer_id"],
): Promise<PaymentRequest> {
  const paymentRequest = await getPaymentRequest(id);

  if (!paymentRequest) throw new Error("請求が存在しません");

  if (!payerId) throw new Error("支払うユーザーを指定してください");

  if (paymentRequest.payer_id === null) {
    await setPayer(id, payerId);
  } else if (paymentRequest.payer_id !== payerId) {
    throw new Error("支払うユーザーが異なります");
  }

  if (paymentRequest.state === "paid")
    throw new Error("請求は既に支払われています");

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .update({ state: "paid" })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error paying payment request:", error);
    throw new Error(`請求の支払いに失敗しました: ${error.message}`);
  }

  await executeTransfer(payerId, data.requester_id, data.amount);

  return data;
}

// その他の関数
////////////////////////////////////////////////////////////////////////////////

/**
 * @description 期限をスキャンして期限切れ処理(stateをoverdueに変更)
 * @param paymentRequests - 請求配列
 * @returns 更新後の最新の請求配列
 *
 * pending状態かつdue_dateが現在時刻より前の請求をoverdueに更新
 * 請求をリスト表示する前に実行する
 */
export async function scanPaymentRequests(
  paymentRequests: PaymentRequest[],
): Promise<PaymentRequest[]> {
  const now = new Date();
  const updatedRequests = [...paymentRequests]; // コピーを作成

  for (let i = 0; i < updatedRequests.length; i++) {
    const request = updatedRequests[i];

    // pending状態かつ期限切れの場合のみ更新
    if (request.state === "pending") {
      const dueDate = new Date(request.due_date);

      if (dueDate < now) {
        try {
          const { data, error } = await supabase
            .from(TABLE_NAME)
            .update({ state: "overdue" })
            .eq("id", request.id)
            .select()
            .single();

          if (error) {
            console.error(
              `Error updating payment request ${request.id}:`,
              error,
            );
          } else if (data) {
            // 更新されたデータで置き換え
            updatedRequests[i] = data;
          }
        } catch (error) {
          console.error(
            `Failed to update payment request ${request.id}:`,
            error,
          );
        }
      }
    }
  }

  return updatedRequests;
}

/**
 * @description 請求を削除
 * @param id - 請求ID
 * @returns 削除された請求
 */
export async function deletePaymentRequest(
  id: string,
): Promise<PaymentRequest> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .delete()
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error deleting payment request:", error);
    throw new Error(`請求の削除に失敗しました: ${error.message}`);
  }

  return data;
}

/**
 * @description 請求の支払うユーザーを設定
 * @param id - 請求ID
 * @param payerId - 支払うユーザーID
 * @returns 設定された請求
 */
async function setPayer(id: string, payerId: string): Promise<PaymentRequest> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .update({ payer_id: payerId })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error setting payer:", error);
    throw new Error(
      `請求の支払うユーザーの設定に失敗しました: ${error.message}`,
    );
  }

  return data;
}
