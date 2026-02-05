/**
 * @file src/lib/db/transfers.ts
 * @description 送金履歴に関するデータベース操作
 */

import { supabase } from "@/lib/db/supabase";
import type { Transfer } from "@/lib/db/database.type";
import { getUserById, updateUserBalance } from "./users";

const MIN_TRANSFER_AMOUNT = 1 as const;
const TABLE_NAME = "transfers";

// 送金実行に関する関数
////////////////////////////////////////////////////////////////////////////////

/**
 * @description 送金履歴を作成
 * @param senderId - 送金元ユーザーID
 * @param receiverId - 送金先ユーザーID
 * @param amount - 送金金額
 * @param message - メッセージ (null可)
 * @returns 作成された送金履歴
 */
export async function createTransfer(
  senderId: Transfer["sender_id"],
  receiverId: Transfer["receiver_id"],
  amount: number,
  message?: string,
): Promise<Transfer> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert({
      sender_id: senderId,
      receiver_id: receiverId,
      amount,
      message,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating transfer:", error);
    throw new Error(`送金履歴の作成に失敗しました: ${error.message}`);
  }

  return data;
}

/**
 * @description 送金を実行する
 * @param senderId - 送金元ユーザーID
 * @param receiverId - 送金先ユーザーID
 * @param amount - 送金金額
 * @param message - メッセージ (null可)
 * @returns 作成された送金履歴
 *
 * 機能
 * - エラーチェック
 * - 送金元の残高を減らす
 * - 送金先の残高を増やす
 * - 送金履歴を作成
 */
export async function executeTransfer(
  senderId: Transfer["sender_id"],
  receiverId: Transfer["receiver_id"],
  amount: number,
  message?: string,
): Promise<Transfer> {
  if (!Number.isFinite(amount))
    throw new Error("金額は有効な数値である必要があります");

  if (amount < MIN_TRANSFER_AMOUNT)
    throw new Error(`送金金額は${MIN_TRANSFER_AMOUNT}円以上を指定してください`);

  if (!senderId || !receiverId)
    throw new Error("送金元ユーザーIDと送金先ユーザーIDは必須です");

  if (senderId === receiverId) throw new Error("自分自身には送金できません");

  const fromUser = await getUserById(senderId);
  if (!fromUser) throw new Error("送金元ユーザーが見つかりません");

  const toUser = await getUserById(receiverId);
  if (!toUser) throw new Error("送金先ユーザーが見つかりません");

  if (fromUser.balance < amount)
    throw new Error(
      `残高が不足しています（現在の残高: ${fromUser.balance}円、送金額: ${amount}円）`,
    );

  try {
    // 送金元の残高を減らす
    await updateUserBalance(senderId, fromUser.balance - amount);
    // 送金先の残高を増やす
    await updateUserBalance(receiverId, toUser.balance + amount);

    // 送金履歴を作成
    const transfer = await createTransfer(
      senderId,
      receiverId,
      amount,
      message,
    );

    return transfer;
  } catch (error) {
    console.error("送金処理でエラーが発生しました:", error);
    if (error instanceof Error)
      throw new Error(`送金処理に失敗しました: ${error.message}`);
    throw error;
  }
}

// 取得に関する関数
////////////////////////////////////////////////////////////////////////////////

/**
 * @description 特定ユーザーの送金履歴を取得（送金元）
 * @param senderId - 送金元ユーザーID
 * @returns 送金履歴配列
 */
export async function getTransfersBySenderId(
  senderId: Transfer["sender_id"],
): Promise<Transfer[]> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select("*")
    .eq("sender_id", senderId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching transfers:", error);
    throw new Error(`送金履歴の取得に失敗しました: ${error.message}`);
  }

  return data || [];
}

/**
 * @description 特定ユーザーの送金履歴を取得（送金先）
 * @param receiverId - 送金先ユーザーID
 * @returns 送金履歴配列
 */
export async function getTransfersByReceiverId(
  receiverId: Transfer["receiver_id"],
): Promise<Transfer[]> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select("*")
    .eq("receiver_id", receiverId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching transfers:", error);
    throw new Error(`送金履歴の取得に失敗しました: ${error.message}`);
  }

  return data || [];
}
