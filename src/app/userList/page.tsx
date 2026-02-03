import Link from "next/link";

export default function UserList() {
  const myId = "0001";
  const users = [
    { id: "0001", name: "鈴木 啓心", icon: "/users/human1.png" },
    { id: "0002", name: "小菅 啓太", icon: "/users/human2.png" },
    { id: "0003", name: "栃下 藤之", icon: "/users/human3.png" },
    { id: "0004", name: "高村 優姫", icon: "/users/human4.png" },
    { id: "0005", name: "水口 尚哉", icon: "/users/human5.png" },
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
        {users.map((u) =>
          u.id === myId ? null : (
            <Link
              key={u.id}
              href={`/transfer/${u.id}`}
              className="bg-white rounded-lg shadow-sm active:bg-slate-100 transition-colors p-3 flex items-center gap-3 border border-slate-200 mb-2"
            >
              <img
                src={u.icon}
                alt={u.name}
                className="w-11 h-11 rounded-full object-cover shrink-0"
              />
              <p className="font-medium text-slate-800 text-base">{u.name}</p>
            </Link>
          ),
        )}
      </div>
    </div>
  );
}
