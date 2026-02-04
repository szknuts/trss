/**
 * @file src/lib/db/paymentRequests.ts
 * @description 請求に関するデータベース操作
 */

import { supabase } from "@/lib/db/supabase";
import type { PaymentRequest } from "@/lib/db/database.type";
import { executeTransfer } from "./transfers";

/**
 * @description 支払い依頼を作成
 * @param requesterId - 請求したユーザーID
 * @param amount - 金額
 * @param message - メッセージ
 * @returns 作成された支払い依頼
 */
export async function createPaymentRequest(
  requesterId: string,
  amount: number,
  message?: string,
): Promise<PaymentRequest> {
  const { data, error } = await supabase
    .from("payment_requests")
    .insert({
      requester_id: requesterId,
      amount: amount,
      message: message,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating payment request:", error);
    throw error;
  }

  return data;
}

/**
 * @description すべての支払い依頼を取得
 * @returns 支払い依頼配列
 */
export async function getAllPaymentRequests(): Promise<PaymentRequest[]> {
  const { data, error } = await supabase
    .from("payment_requests")
    .select("*")
    .order("id", { ascending: true });

  if (error) {
    console.error("Error fetching payment requests:", error);
    throw error;
  }

  return data || [];
}

/**
 * @description 支払い依頼を取得
 * @param id - 支払い依頼ID
 * @returns 支払い依頼
 */
export async function getPaymentRequest(id: string): Promise<PaymentRequest> {
  const { data, error } = await supabase
    .from("payment_requests")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching payment request:", error);
    throw error;
  }

  return data;
}

/**
 * @description 支払い依頼を削除
 * @param id - 支払い依頼ID
 * @returns 削除された支払い依頼
 */
export async function deletePaymentRequest(
  id: string,
): Promise<PaymentRequest> {
  const { data, error } = await supabase
    .from("payment_requests")
    .delete()
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error deleting payment request:", error);
    throw error;
  }

  return data;
}

/**
 * @description 支払い依頼を支払う
 * @param id - 支払い依頼ID
 * @param payerId - 支払うユーザーID
 * @returns 支払われた支払い依頼
 */
export async function payPaymentRequest(
  id: string,
  payerId: string,
): Promise<PaymentRequest> {
  await setPayer(id, payerId);

  const { data, error } = await supabase
    .from("payment_requests")
    .update({ state: "paid" })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error paying payment request:", error);
    throw error;
  }

  await executeTransfer(payerId, data.requester_id, data.amount);

  return data;
}

/**
 * @description 支払い依頼の支払うユーザーを設定
 * @param id - 支払い依頼ID
 * @param payerId - 支払うユーザーID
 * @returns 設定された支払い依頼
 */
export async function setPayer(
  id: string,
  payerId: string,
): Promise<PaymentRequest> {
  const { data, error } = await supabase
    .from("payment_requests")
    .update({ payer_id: payerId })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error setting payer:", error);
    throw error;
  }

  return data;
}
