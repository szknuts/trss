import { getAllUsers, getUserById } from "@/lib/db/users";

export default async function TestBackendPage() {
  const data = await getAllUsers();
  const myData = await getUserById("0001");
  return (
    <div>
      <div>{JSON.stringify(data)}</div>

      <div className="flex flex-col bg-stone-200">
        {data.map((user) => (
          <div key={user.id}>
            {user.id} : {user.name}
          </div>
        ))}
      </div>

      <div>
        <div>名前：{myData?.name}</div>
        <div>残高：{myData?.balance}</div>
      </div>
    </div>
  );
}
