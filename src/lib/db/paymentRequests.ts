/**
 * @file src/lib/db/paymentRequests.ts
 * @description 請求に関するデータベース操作
 */

import { supabase } from "@/lib/db/supabase";
import type { PaymentRequest } from "@/lib/db/database.type";
import { executeTransfer } from "./transfers";

// 請求の作成に関する関数
////////////////////////////////////////////////////////////////////////////////

/**
 * @description 請求を作成
 * @param requesterId - 請求したユーザーID
 * @param amount - 金額
 * @param message - メッセージ
 * @returns 作成された請求
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
 * @description 請求を作成(支払うユーザーを指定)
 * @param requesterId - 請求したユーザーID
 * @param payerId - 支払うユーザーID
 * @param amount - 金額
 * @param message - メッセージ
 * @returns 作成された請求
 */
export async function createPaymentRequestWithPayer(
  requesterId: string,
  payerId: string,
  amount: number,
  message?: string,
): Promise<PaymentRequest> {
  const { data, error } = await supabase
    .from("payment_requests")
    .insert({
      requester_id: requesterId,
      payer_id: payerId,
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

// 請求の取得に関する関数
////////////////////////////////////////////////////////////////////////////////

/**
 * @description すべての請求を取得
 * @returns 請求配列
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
 * @description IDから請求を取得
 * @param id - 請求ID
 * @returns 請求
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
 * @description 請求したユーザーIDから請求を取得
 * @param userId - ユーザーID
 * @returns 請求配列
 */
export async function getPaymentRequestsByRequesterId(
  userId: string,
): Promise<PaymentRequest[]> {
  const { data, error } = await supabase
    .from("payment_requests")
    .select("*")
    .eq("requester_id", userId)
    .order("id", { ascending: true });

  if (error) {
    console.error("Error fetching payment requests:", error);
    throw error;
  }

  return data || [];
}

/**
 * @description 支払うユーザーIDから請求を取得
 * @param userId - ユーザーID
 * @returns 請求配列
 */
export async function getPaymentRequestsByPayerId(
  userId: string,
): Promise<PaymentRequest[]> {
  const { data, error } = await supabase
    .from("payment_requests")
    .select("*")
    .eq("payer_id", userId)
    .order("id", { ascending: true });

  if (error) {
    console.error("Error fetching payment requests:", error);
    throw error;
  }

  return data || [];
}

// 請求の支払いに関する関数
////////////////////////////////////////////////////////////////////////////////

/**
 * @description 請求を支払う
 * @param id - 請求ID
 * @param payerId - 支払うユーザーID
 * @returns 支払われた請求
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
 * @description 請求を支払う（支払うユーザーが指定されている場合）
 * @param id - 請求ID
 * @param payerId - 支払うユーザーID
 * @returns 支払われた請求
 */
export async function payPaymentRequestWithPayer(
  id: string,
  payerId: string,
): Promise<PaymentRequest> {
  if ((await getPaymentRequest(id)).payer_id !== payerId)
    throw new Error("支払うユーザーが異なります");

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

// その他の関数
////////////////////////////////////////////////////////////////////////////////

/**
 * @description 請求を削除
 * @param id - 請求ID
 * @returns 削除された請求
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
 * @description 請求の支払うユーザーを設定
 * @param id - 請求ID
 * @param payerId - 支払うユーザーID
 * @returns 設定された請求
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
