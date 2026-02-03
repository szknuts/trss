/**
 * @file src/lib/db/users.ts
 * @description ユーザーに関するデータベース操作
 */

import { supabase } from "@/lib/db/supabase";
import type { User } from "@/lib/db/database.type";

/**
 * @description すべてのユーザーを取得
 * @returns ユーザー情報配列
 */
export async function getAllUsers(): Promise<User[]> {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .order("id", { ascending: true });

  if (error) {
    console.error("Error fetching users:", error);
    throw error;
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
    .from("users")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching user:", error);
    return null;
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
  if (newBalance < 0) {
    throw new Error("残高をマイナスにすることはできません");
  }

  const { data, error } = await supabase
    .from("users")
    .update({ balance: newBalance })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating user balance:", error);
    throw error;
  }

  return data;
}
