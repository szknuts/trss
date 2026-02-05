"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createPaymentRequest } from "@/lib/db/paymentRequests";
import { getAllUsers } from "@/lib/db/users";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import type { User } from "@/lib/db/database.type";

export default function InvoicePage() {
  const { userId } = useUser();
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [isEditingAmount, setIsEditingAmount] = useState(false);
  const router = useRouter();
  const [createdLink, setCreatedLink] = useState<string | null>(null);

  // ユーザー一覧関連
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isSelecting, setIsSelecting] = useState(true); // デフォルトで一覧表示

  const requesterId = userId;

  const isDisabled = !amount || Number(amount) <= 0;

  useEffect(() => {
    if (!userId) {
      router.replace("/login");
      return;
    }
  }, [userId]);

  // ユーザー一覧を取得
  useEffect(() => {
    async function fetchUsers() {
      try {
        const allUsers = await getAllUsers();
        // 自分自身を除外
        const otherUsers = allUsers.filter((u) => u.id !== userId);
        setUsers(otherUsers);
      } catch (error) {
        console.error("ユーザー取得エラー:", error);
      } finally {
        setIsLoading(false);
      }
    }

    if (userId) {
      fetchUsers();
    }
  }, [userId]);

  // ユーザーを選択
  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    setIsSelecting(false);
  };

  // 選択しないを選択
  const handleSelectNone = () => {
    setSelectedUser(null);
    setIsSelecting(false);
  };

  // 選択を変更（一覧を表示）
  const handleChangeSelection = () => {
    setIsSelecting(true);
  };

  const handleCreateLink = async () => {
    try {
      const paymentRequest = await createPaymentRequest(
        requesterId!,
        selectedUser?.id || null,
        Number(amount),
        message,
      );

      const link = `${window.location.origin}/link_to_pay?paymentId=${paymentRequest.id}`;
      setCreatedLink(link);
    } catch (e) {
      console.error(e);
      alert("請求リンクの作成に失敗しました");
    }
  };

  const handleCopy = async () => {
    if (!createdLink) return;
    await navigator.clipboard.writeText(createdLink);
    alert("リンクをコピーしました");
  };

  return (
    <div style={styles.outer}>
      <div style={styles.phone}>
        <div style={styles.screen}>
          <main style={styles.container}>
            <h1 style={styles.title}>請求リンクの作成</h1>

            {/* 宛先指定 */}
            <label style={styles.label}>宛先を指定する</label>

            {/* ユーザー一覧 */}
            <div style={styles.userListContainer}>
              {isLoading ? (
                <p style={styles.loadingText}>読み込み中...</p>
              ) : isSelecting ? (
                <>
                  {/* 選択しないボタン */}
                  <button
                    onClick={handleSelectNone}
                    style={{
                      ...styles.userCard,
                      border: "1px solid #e6e2dc",
                      backgroundColor: "#fff",
                    }}
                  >
                    <div style={styles.userCardContent}>
                      <p style={styles.userName}>選択しない</p>
                      <p style={styles.userId}>宛先を指定せずにリンク作成</p>
                    </div>
                  </button>

                  {/* ユーザー一覧 */}
                  {users.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => handleSelectUser(user)}
                      style={{
                        ...styles.userCard,
                        border: "1px solid #e6e2dc",
                        backgroundColor: "#fff",
                      }}
                    >
                      {user.icon_url ? (
                        <img
                          src={`/users/${user.icon_url}`}
                          alt={user.name}
                          style={styles.userIcon}
                        />
                      ) : (
                        <div style={styles.userIconPlaceholder}>
                          {user.name.charAt(0)}
                        </div>
                      )}
                      <div style={styles.userCardContent}>
                        <p style={styles.userName}>{user.name}</p>
                        <p style={styles.userId}>口座番号: {user.id}</p>
                      </div>
                    </button>
                  ))}
                </>
              ) : (
                <>
                  {/* 選択された項目のみ表示 */}
                  {selectedUser ? (
                    <div
                      style={{
                        ...styles.userCard,
                        border: "1px solid #303030",
                        backgroundColor: "#e6e2dc",
                        cursor: "default",
                      }}
                    >
                      {selectedUser.icon_url ? (
                        <img
                          src={`/users/${selectedUser.icon_url}`}
                          alt={selectedUser.name}
                          style={styles.userIcon}
                        />
                      ) : (
                        <div style={styles.userIconPlaceholder}>
                          {selectedUser.name.charAt(0)}
                        </div>
                      )}
                      <div style={styles.userCardContent}>
                        <p style={styles.userName}>{selectedUser.name}</p>
                        <p style={styles.userId}>口座番号: {selectedUser.id}</p>
                      </div>
                    </div>
                  ) : (
                    <div
                      style={{
                        ...styles.userCard,
                        border: "1px solid #303030",
                        backgroundColor: "#e6e2dc",
                        cursor: "default",
                      }}
                    >
                      <div style={styles.userCardContent}>
                        <p style={styles.userName}>選択しない</p>
                        <p style={styles.userId}>宛先を指定せずにリンク作成</p>
                      </div>
                    </div>
                  )}
                  {/* 選択を変更ボタン */}
                  <button
                    onClick={handleChangeSelection}
                    style={styles.changeButton}
                  >
                    選択を変更
                  </button>
                </>
              )}
            </div>

            {/* 請求金額 */}
            <div>
              <label style={styles.label}>請求金額</label>
              <div style={styles.amountWrapper}>
                <input
                  type="text"
                  inputMode="numeric"
                  value={amount}
                  onFocus={() => setIsEditingAmount(true)}
                  onBlur={() => setIsEditingAmount(false)}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, "");
                    setAmount(value);
                  }}
                  style={{
                    ...styles.amountInput,
                    textAlign:
                      isEditingAmount || amount === "" ? "left" : "center",
                  }}
                />
                <span style={styles.yen}>円</span>
              </div>
            </div>

            {/* メッセージ */}
            <div>
              <label style={styles.label}>メッセージ（任意）</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                style={styles.textarea}
              />
            </div>

            {createdLink && (
              <>
                <p style={styles.createdTitle}>請求リンクが作成されました</p>

                <div style={styles.linkBox}>{createdLink}</div>

                <button style={styles.copyButton} onClick={handleCopy}>
                  リンクをコピー
                </button>
              </>
            )}
          </main>

          <div style={styles.footer}>
            {!createdLink && (
              <button
                onClick={handleCreateLink}
                disabled={isDisabled}
                style={{
                  ...styles.button,
                  opacity: isDisabled ? 0.4 : 1,
                }}
              >
                リンク作成
              </button>
            )}

            <Link href="/" style={styles.backButton}>
              トップ画面に戻る
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  outer: {
    minHeight: "100vh",
    backgroundColor: "#e7e2db",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  phone: {
    width: 430,
    height: 932,
    backgroundColor: "#faf7f2",
    borderRadius: 32,
    boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
    overflow: "hidden",
  },
  screen: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
  },
  container: {
    flex: 1,
    padding: "56px 32px 0",
  },
  title: {
    fontSize: 28,
    textAlign: "center",
    marginBottom: 40,
  },
  label: {
    fontSize: 18,
    marginBottom: 10,
    display: "block",
  },

  // ★ 追加した部分（宛先・口座番号用）
  input: {
    width: "100%",
    padding: 18,
    marginBottom: 24,
    borderRadius: 14,
    backgroundColor: "#fff",
    fontSize: 18,
    border: "none",
  },

  amountWrapper: {
    position: "relative",
    marginBottom: 24,
  },
  amountInput: {
    width: "100%",
    padding: "18px 52px 18px 18px",
    borderRadius: 14,
    backgroundColor: "#fff",
    fontSize: 18,
  },
  yen: {
    position: "absolute",
    right: 18,
    top: "50%",
    transform: "translateY(-50%)",
    fontSize: 18,
  },
  textarea: {
    width: "100%",
    padding: 18,
    borderRadius: 14,
    backgroundColor: "#fff",
    minHeight: 120,
    fontSize: 18,
  },
  createdTitle: {
    marginTop: 32,
    fontSize: 18,
    fontWeight: 600,
    textAlign: "center",
  },
  linkBox: {
    marginTop: 24,
    borderRadius: 20,
    border: "1px solid #e6e2dc",
    backgroundColor: "#fff",
    padding: 16,
    fontSize: 14,
    wordBreak: "break-all",
  },
  copyButton: {
    marginTop: 24,
    width: "100%",
    borderRadius: 9999,
    backgroundColor: "#303030",
    padding: 16,
    color: "#fff",
    fontSize: 16,
    border: "none",
  },
  footer: {
    padding: 28,
    borderTop: "1px solid #eee",
  },
  button: {
    width: "100%",
    padding: 20,
    backgroundColor: "#303030",
    color: "#fff",
    borderRadius: 9999,
    fontSize: 18,
    border: "none",
  },
  backButton: {
    display: "block",
    marginTop: 16,
    textAlign: "center",
    color: "#303030",
    textDecoration: "underline",
    fontSize: 16,
  },

  // ユーザー選択UI
  userListContainer: {
    maxHeight: 200,
    overflowY: "auto",
    marginBottom: 24,
  },
  userCard: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "12px 16px",
    marginBottom: 8,
    borderRadius: 12,
    border: "1px solid #e6e2dc",
    backgroundColor: "#fff",
    cursor: "pointer",
    transition: "background-color 0.2s",
    textAlign: "left",
  },
  userIcon: {
    width: 40,
    height: 40,
    borderRadius: "50%",
    objectFit: "cover",
    flexShrink: 0,
  },
  userIconPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: "50%",
    backgroundColor: "#ded8cf",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 16,
    fontWeight: 600,
    color: "#2f2b28",
    flexShrink: 0,
  },
  userCardContent: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: 600,
    color: "#303030",
    margin: 0,
  },
  userId: {
    fontSize: 12,
    color: "#a59f95",
    margin: 0,
  },
  selectedUserContainer: {
    marginBottom: 24,
  },
  selectedUserCard: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 12,
    border: "1px solid #303030",
    backgroundColor: "#e6e2dc",
  },
  selectedUserInfo: {
    flex: 1,
  },
  selectedUserName: {
    fontSize: 14,
    fontWeight: 600,
    color: "#303030",
    margin: 0,
  },
  selectedUserId: {
    fontSize: 12,
    color: "#a59f95",
    margin: 0,
  },
  clearButton: {
    marginTop: 8,
    fontSize: 14,
    color: "#a59f95",
    backgroundColor: "transparent",
    border: "none",
    cursor: "pointer",
    textDecoration: "underline",
  },
  loadingText: {
    textAlign: "center",
    fontSize: 14,
    color: "#a59f95",
  },
  emptyText: {
    textAlign: "center",
    fontSize: 14,
    color: "#a59f95",
  },
  changeButton: {
    marginTop: 4,
    fontSize: 13,
    color: "#a59f95",
    backgroundColor: "transparent",
    border: "none",
    cursor: "pointer",
    textDecoration: "underline",
    textAlign: "left",
    padding: 0,
  },
};
