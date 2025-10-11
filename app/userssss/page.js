"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const ADMIN_EMAILS = ["hary123@gmail.com","aman@gmail.com"]

export default function UsersPage() {
  const { data: session, status } = useSession();
  const [users, setUsers] = useState([]);
  const router = useRouter();

  useEffect(() => {
    // Redirect non-admins immediately
    if (
      status === "authenticated" &&
      (!session?.user || 
       session.user.role !== "admin" || 
       !ADMIN_EMAILS.includes(session.user.email))
    ) {
      router.replace("/login"); // redirect unauthorized users
    }
  }, [status, session]);

  useEffect(() => {
    async function fetchUsers() {
      if (status !== "authenticated") return; // wait until session loads
      if (session.user.role !== "admin") return;

      try {
        const res = await fetch("/api/users");
        if (!res.ok) throw new Error("Failed to fetch users");
        const data = await res.json();
        setUsers(data);
      } catch (err) {
        console.error(err);
      }
    }
    fetchUsers();
  }, [status, session]);

  if (status === "loading") return <p>Loading...</p>;
  if (!session || session.user.role !== "admin")
    return <p>Access denied. Admins only.</p>;

  return (
    <main>
      <h1 className="text-xl font-bold">Users List (Admins Only)</h1>
      <ul>
        {users.map((user) => (
          <li key={user._id}>
            {user.name} - {user.email} - Role: {user.role}
          </li>
        ))}
      </ul>
    </main>
  );
}
