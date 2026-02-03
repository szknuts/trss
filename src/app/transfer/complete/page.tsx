import Link from "next/link";

export default function TransferCompletePage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4">
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
    </div>
  );
}
