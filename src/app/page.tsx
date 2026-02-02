import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#dcd9d3] px-4 py-10 font-sans text-[#1f1f1f]">
      <section className="flex h-[932px] w-[430px] max-w-full flex-col items-center rounded-[40px] bg-[#f4f2ed] px-10 pb-16 pt-20 text-center">
        <div className="flex flex-1 flex-col items-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#ded8cf] text-3xl font-semibold text-[#2f2b28]">
            <span>A</span>
          </div>
          <p className="mt-6 text-xl font-semibold tracking-wide text-[#1f1f1f]">
            サンプル 氏名
          </p>

          <div className="mt-6 flex w-full max-w-xs flex-col gap-1 text-left text-sm text-[#6b6b6b]">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <span className="h-4 w-4 rounded-[4px] border border-[#cfcac2] bg-white" />
                <span>社員番号 : 0000000</span>
              </label>
              <span>貯金残高</span>
            </div>
          </div>

          <div className="mt-10 w-full max-w-xs rounded-[26px] border border-[#e6e2dc] bg-white px-6 py-8 text-center">
            <p className="text-sm uppercase tracking-[0.4em] text-[#a59f95]">BALANCE</p>
            <p className="mt-4 text-4xl font-semibold text-[#303030]">50,000円</p>
          </div>

          <Link
            href="/soukinatesakigamen"
            className="mt-8 w-full max-w-xs rounded-full bg-[#303030] py-4 text-center text-white transition hover:opacity-90"
          >
            送金へ進む
          </Link>

        </div>
        
      </section>
    </div>
  );
}
