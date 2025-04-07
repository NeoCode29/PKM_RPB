import { headers } from "next/headers";

export default async function AdminDahsboard() {
    const header = await headers();
    const userRole = header.get('pkm-user-role');

    return (
    <h1> Halaman Admin {userRole}</h1>
  );
}
