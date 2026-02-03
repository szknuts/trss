import Link from "next/link";
import { getUserById } from "@/lib/db/users";

export default  async function Home() {
  const user = await getUserById("0001");

  if (!user) {
    return <div>ユーザーが見つかりません</div>;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#dcd9d3] px-4 py-10 font-sans text-[#1f1f1f]">
      <section className="flex h-[932px] w-[430px] max-w-full flex-col items-center rounded-[40px] bg-[#f4f2ed] px-10 pb-16 pt-20 text-center">
        <div className="flex flex-1 flex-col items-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#ded8cf] text-3xl font-semibold text-[#2f2b28]">
            <span>{user.name.charAt(0)}</span>
          </div>
          <p className="mt-6 text-xl font-semibold tracking-wide text-[#1f1f1f]">
            {user.name}
          </p>

          <div className="mt-6 flex w-full max-w-xs flex-col gap-1 text-left text-sm text-[#6b6b6b]">
            <div className="flex items-center justify-between">
              <div className="mt-6 flex w-full max-w-xs justify-center text-sm text-[#6b6b6b]">
                <span>社員番号 : {user.id}</span>
              </div>
              {/*<span>{user.balance}円</span>*/}
            </div>
          </div>

          <div className="mt-10 w-full max-w-xs rounded-[26px] border border-[#e6e2dc] bg-white px-6 py-8 text-center">
            <p className="text-sm uppercase tracking-[0.4em] text-[#a59f95]">残高 BALANCE</p>
            <p className="mt-4 text-4xl font-semibold text-[#303030]">{user.balance}円</p>
          </div>

          <Link
            href="/userList"
            className="mt-8 w-full max-w-xs rounded-full bg-[#303030] py-4 text-center text-white transition hover:opacity-90"
          >
            送金へ進む
          </Link>

        </div>
        
      </section>
    </div>
  );
}
