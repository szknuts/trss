import Link from "next/link";

export default function PayPage() {
  // ダミー値（後でAPI差し替え）
  const amount = 5000;
  const balance = 7000;

  const canPay = balance >= amount;

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#dcd9d3] px-4 py-10 font-sans text-[#1f1f1f]">
      <section className="flex h-[932px] w-[430px] max-w-full flex-col items-center rounded-[40px] bg-[#f4f2ed] px-10 pb-16 pt-20 text-center">

        {/* タイトル */}
        <h1 className="text-xl font-semibold tracking-wide">
          お支払い内容の確認
        </h1>

        {/* 請求額 */}
        <div className="mt-10 w-full max-w-xs rounded-[26px] border border-[#e6e2dc] bg-white px-6 py-8">
          <p className="text-sm uppercase tracking-[0.4em] text-[#a59f95]">
            AMOUNT
          </p>
          <p className="mt-4 text-4xl font-semibold text-[#303030]">
            {amount.toLocaleString()}円
          </p>
        </div>

        {/* 残高 */}
        <p className="mt-6 text-sm text-[#6b6b6b]">
          現在の残高：{balance.toLocaleString()}円
        </p>

        {/* 状態メッセージ */}
        {canPay ? (
          <p className="mt-4 text-sm text-green-600">
            お支払い可能です
          </p>
        ) : (
          <p className="mt-4 text-sm text-red-600">
            残高が不足しています
          </p>
        )}

        {/* 支払いボタン（リンク版） */}
        <Link
          href={canPay ? "/link_to_pay/complete" : "#"}
          className={`mt-10 w-full max-w-xs rounded-full py-4 text-center text-white transition
            ${canPay
              ? "bg-[#303030] hover:opacity-90"
              : "bg-[#aaa] pointer-events-none"}
          `}
        >
          支払う
        </Link>

      </section>
    </div>
  );
}
