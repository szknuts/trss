export default function UserList() {
  const users = [
    { id: 1, name: "鈴木 啓心" },
    { id: 2, name: "小菅 啓太" },
    { id: 3, name: "a" },
    { id: 4, name: "b" },
    { id: 5, name: "c" },
    { id: 6, name: "d" },
  ];
  return (
    <div>
      <h1>User List</h1>
      <div className="gap-2 py-2 px-4">
        {users.map((u) => (
          <div
            key={u.id}
            className="flex gap-2 border border-gray-300 p-2 rounded mb-2"
          >
            <img src={`/public/users/human${u.id}.png`} alt="" />
            <p>{u.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
