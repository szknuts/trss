/**
 * @file src/lib/db/users.ts
 * @description ユーザーに関するデータベース操作
 */

import { supabase } from "@/lib/db/supabase";
import type { User } from "@/lib/db/database.type";

const TABLE_NAME = "users";
const MIN_BALANCE = 0;

/**
 * @description すべてのユーザーを取得
 * @returns ユーザー情報配列
 */
export async function getAllUsers(): Promise<User[]> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select("*")
    .order("id", { ascending: true });

  if (error) {
    console.error("Error fetching users:", error);
    throw new Error(`ユーザー一覧の取得に失敗しました: ${error.message}`);
  }

  return data || [];
}

/**
 * @description IDでユーザーを1件取得
 * @param id - ユーザーID
 * @returns ユーザー情報
 */
export async function getUserById(id: string): Promise<User | null> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching user:", error);
    throw new Error(`ユーザーの取得に失敗しました: ${error.message}`);
  }

  return data;
}

/**
 * @description ユーザーの残高を更新
 * @param id - ユーザーID
 * @param newBalance - 新しい残高
 * @returns 更新されたユーザー情報
 *
 * 送金者、受金者両方で使う(改良予定)
 */
export async function updateUserBalance(
  id: string,
  newBalance: number,
): Promise<User | null> {
  if (!Number.isFinite(newBalance))
    throw new Error("残高は有効な数値である必要があります");

  if (newBalance < MIN_BALANCE)
    throw new Error("残高をマイナスにすることはできません");

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .update({ balance: newBalance })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating user balance:", error);
    throw new Error(`残高の更新に失敗しました: ${error.message}`);
  }

  return data;
}
