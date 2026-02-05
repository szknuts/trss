"use client";

import { useState } from "react";
import Link from "next/link";
import { createPaymentRequest } from "@/lib/db/paymentRequests";

export default function InvoicePage() {
  const [accountNumber, setAccountNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [isEditingAmount, setIsEditingAmount] = useState(false);

  const [createdLink, setCreatedLink] = useState<string | null>(null);

  const createdBy = "";
  const createdAt = new Date().toISOString();

  const requesterId = "0001";

  const isDisabled = !accountNumber || !amount || Number(amount) <= 0;

  const handleCreateLink = async () => {
    try {
      const paymentRequest = await createPaymentRequest(
        requesterId,
        accountNumber, 
        Number(amount),
        message
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

            {/* 口座番号 */}
            <label style={styles.label}>口座番号</label>
            <input
              type="text"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              style={styles.input}
            />

            {/* 請求金額 */}
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

            {/* メッセージ */}
            <label style={styles.label}>メッセージ（任意）</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              style={styles.textarea}
            />

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
};
