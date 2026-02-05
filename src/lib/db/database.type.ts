/**
 * @file src/lib/db/database.type.ts
 * @description データベースの型定義
 */

/**
 * @description usersテーブルの型定義
 */
export interface User {
  id: string; // ユーザーID (口座番号)
  name: string; // ユーザー名
  balance: number; // 残高
  icon_url: string; // アイコンURL
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
  message: string | null; // メッセージ（NULL許可）
  created_at: string; // 作成日時
}

/**
 * @description payment_requestsテーブルの状態
 * - pending: 待機中
 * - rejected: 却下
 * - paid: 支払い済み
 * - overdue: 支払い期限切れ
 */
export type PaymentRequestState = "pending" | "rejected" | "paid" | "overdue";

/**
 * @description payment_requestsテーブルの型定義
 */
export interface PaymentRequest {
  id: string; // 請求ID
  requester_id: string; // 請求したユーザーID
  payer_id: string | null; // 支払うユーザーID（NULL許可）
  amount: number; // 送金額
  message: string | null; // メッセージ（NULL許可）
  created_at: string; // 作成日時（自動生成）
  due_date: string; // 期日（自動生成）
  state: PaymentRequestState; // 状態
}
