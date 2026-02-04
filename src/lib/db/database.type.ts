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

/**
 * @description payment_requestsテーブルの状態
 * - pending: 待機中
 * - rejected: 却下
 * - paid: 支払い済み
 */
export type PaymentRequestState = "pending" | "rejected" | "paid";

/**
 * @description payment_requestsテーブルの型定義
 */
export interface PaymentRequest {
  id: string; // 請求ID
  requester_id: string; // 請求したユーザーID
  payer_id: string | null; // 支払うユーザーID（まだ誰も決まっていない場合はnull）
  amount: number; // 送金額
  message?: string; // メッセージ（オプショナル）
  created_at: string; // 作成日時
  due_date: string; // 期日
  state: PaymentRequestState; // 状態
}
