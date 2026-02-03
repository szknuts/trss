/**
 * @file src/lib/db/paymentRequests.ts
 * @description 支払い依頼に関するデータベース操作
 */

import { supabase } from "@/lib/db/supabase";
import type { PaymentRequest } from "@/lib/db/database.type";

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
