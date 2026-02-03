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
