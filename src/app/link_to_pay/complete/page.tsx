import Link from "next/link";

export default function CompletePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#dcd9d3] px-4 py-10 font-sans text-[#1f1f1f]">
      <section className="flex h-[932px] w-[430px] max-w-full flex-col items-center rounded-[40px] bg-[#f4f2ed] px-10 pb-16 pt-20 text-center">

        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#ded8cf] text-3xl font-semibold text-[#2f2b28]">
          ✓
        </div>

        <h1 className="mt-8 text-xl font-semibold tracking-wide">
          お支払いが完了しました
        </h1>

        <p className="mt-4 text-sm text-[#6b6b6b]">
          ご利用ありがとうございました
        </p>

        <Link
          href="/"
          className="mt-12 w-full max-w-xs rounded-full bg-[#303030] py-4 text-center text-white transition hover:opacity-90"
        >
          ホームへ戻る
        </Link>

      </section>
    </div>
  );
}
