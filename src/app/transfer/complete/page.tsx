import Link from "next/link";

export default function TransferCompletePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#dcd9d3] px-4 py-10 font-sans text-[#1f1f1f]">
      <section className="flex h-[932px] w-[430px] max-w-full flex-col items-center rounded-[40px] bg-[#f4f2ed] px-10 pb-16 pt-20 text-center">
      
        <div className="w-full max-w-sm text-center">
          {/* チェックマークアイコン */}
          <div className="w-24 h-24 mx-auto mb-6 rounded-full border-4 border-green-500 flex items-center justify-center">
            <svg
              className="w-12 h-12 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          {/* 完了メッセージ */}
          <p className="text-xl font-medium text-slate-800 mb-8">
            送金処理が完了しました
          </p>

          {/* トップ画面に戻るボタン */}
          <Link
            href="/"
            className="block w-full py-4 border border-slate-300 rounded-full text-slate-700 text-lg font-medium hover:bg-slate-100 transition"
          >
            トップ画面に戻る
          </Link>
        </div>
      </section>
    </div>
  );
}
