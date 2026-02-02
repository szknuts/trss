import Image from "next/image";

export default function UserList() {
  const users = [
    { id: 1, name: "鈴木 啓心" },
    { id: 2, name: "小菅 啓太" },
    { id: 3, name: "a" },
    { id: 4, name: "b" },
    { id: 5, name: "c" },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ヘッダー */}
      <div className="sticky top-0 bg-white border-b border-slate-200 px-4 py-3">
        <h1 className="text-lg font-bold text-slate-800 text-center">
          送金相手を選択
        </h1>
      </div>

      {/* ユーザーリスト */}
      <div className="px-4 py-2">
        {users.map((u) => (
          <div
            key={u.id}
            className="bg-white rounded-lg shadow-sm active:bg-slate-100 transition-colors p-3 flex items-center gap-3 border border-slate-200 mb-2"
          >
            <img
              src={`/users/human${u.id}.png`}
              alt={u.name}
              className="w-11 h-11 rounded-full object-cover shrink-0"
            />
            <p className="font-medium text-slate-800 text-base">{u.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
