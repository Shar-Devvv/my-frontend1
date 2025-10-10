"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const res = await signIn("credentials", {
      redirect: false,
      email: form.email,
      password: form.password,
    });

    if (res.ok) {
      router.push("/");
    } else {
      setError(res.error || "Invalid credentials");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <Link href={"/"}><button className="bg-gray-400 rounded-lg px-1 relative bottom-[15rem] right-[25rem] hover:cursor-pointer">Home</button></Link>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-4 hover:cursor-pointer">Login</h2>
        {error && <p className="text-red-600 mb-2">{error}</p>}
        <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} className="border p-2 w-full mb-2 hover:cursor-pointer" />
        <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} className="border p-2 w-full mb-4" />
        <button className="bg-indigo-600 text-white py-2 w-full rounded hover:cursor-pointer">Login</button>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => signIn("google")}
            className="bg-red-500 text-white py-2 w-full rounded mt-2 hover:cursor-pointer"
          >
            Sign in with Google
          </button>
        </div>
      </form>
    </div>
  );
}
