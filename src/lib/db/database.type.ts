/**
 * @file src/lib/db/database.type.ts
 * @description データベースの型定義
 */

/**
 * @description usersテーブルの型定義
 */
export interface User {
  id: string; // ユーザーID
  name: string; // ユーザー名
  balance: number; // 残高
  icon_url: string | null; // アイコンURL
  created_at: string; // 作成日時
}

/**
 * @description transfersテーブルの型定義
 */
export interface Transfer {
  id: string; // 送金履歴ID
  sender_id: string; // 送金元ユーザーID
  receiver_id: string; // 送金先ユーザーID
  amount: number; // 送金額
  message?: string; // メッセージ（オプショナル）
  created_at: string; // 作成日時
}
