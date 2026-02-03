/**
 * @file src/lib/db/database.type.ts
 * @description データベースの型定義
 */

/**
 * @description usersテーブルの型定義
 */
export interface User {
  id: string;
  name: string;
  balance: number;
  icon_url: string | null;
  created_at: string;
}
