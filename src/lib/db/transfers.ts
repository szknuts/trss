/**
 * @file src/lib/db/transfers.ts
 * @description 送金履歴に関するデータベース操作
 */

import { supabase } from "@/lib/db/supabase";
import type { Transfer } from "@/lib/db/database.type";
import { getUserById, updateUserBalance } from "./users";

/**
 * @description 送金履歴を作成
 * @param fromUserId - 送金元ユーザーID
 * @param toUserId - 送金先ユーザーID
 * @param amount - 送金金額
 * @param message - メッセージ
 * @returns 作成された送金履歴
 */
export async function createTransfer(
  fromUserId: string,
  toUserId: string,
  amount: number,
  message?: string,
): Promise<Transfer> {
  const { data, error } = await supabase
    .from("transfers")
    .insert({
      sender_id: fromUserId,
      receiver_id: toUserId,
      amount: amount,
      message: message,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating transfer:", error);
    throw error;
  }

  return data;
}

/**
 * @description 特定ユーザーの送金履歴を取得（送金元）
 * @param userId - 送金元ユーザーID
 * @returns 送金履歴配列
 */
export async function getTransfersBySenderId(
  userId: string,
): Promise<Transfer[]> {
  const { data, error } = await supabase
    .from("transfers")
    .select("*")
    .eq("sender_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching transfers:", error);
    throw error;
  }

  return data || [];
}

/**
 * @description 特定ユーザーの送金履歴を取得（送金先）
 * @param userId - 送金先ユーザーID
 * @returns 送金履歴配列
 */
export async function getTransfersByReceiverId(
  userId: string,
): Promise<Transfer[]> {
  const { data, error } = await supabase
    .from("transfers")
    .select("*")
    .eq("receiver_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching transfers:", error);
    throw error;
  }

  return data || [];
}

/**
 * @description 送金を実行する
 * @param fromUserId - 送金元ユーザーID
 * @param toUserId - 送金先ユーザーID
 * @param amount - 送金金額
 * @param message - メッセージ
 * @returns 作成された送金履歴
 * @throws {Error} ユーザーが見つからない、残高不足、送金金額が不正な場合
 *
 * エラーチェックは行っているが、フロント側でも書いてください
 *
 * 機能
 * - エラーチェック
 * - 送金元の残高を減らす
 * - 送金先の残高を増やす
 * - 送金履歴を作成
 */
export async function executeTransfer(
  fromUserId: string,
  toUserId: string,
  amount: number,
  message?: string,
): Promise<Transfer> {
  if (amount <= 0) {
    throw new Error("送金金額は0より大きい値を指定してください");
  }

  if (fromUserId === toUserId) {
    throw new Error("自分自身には送金できません");
  }

  const fromUser = await getUserById(fromUserId);
  if (!fromUser) {
    throw new Error("送金元ユーザーが見つかりません");
  }

  const toUser = await getUserById(toUserId);
  if (!toUser) {
    throw new Error("送金先ユーザーが見つかりません");
  }

  if (fromUser.balance < amount) {
    throw new Error(
      `残高が不足しています（現在の残高: ${fromUser.balance}円、送金額: ${amount}円）`,
    );
  }

  try {
    // 送金元の残高を減らす
    await updateUserBalance(fromUserId, fromUser.balance - amount);
    // 送金先の残高を増やす
    await updateUserBalance(toUserId, toUser.balance + amount);

    // 送金履歴を作成
    const transfer = await createTransfer(
      fromUserId,
      toUserId,
      amount,
      message,
    );

    return transfer;
  } catch (error) {
    console.error("送金処理でエラーが発生しました:", error);
    throw new Error("送金処理に失敗しました");
  }
}
