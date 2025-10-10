"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const res = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      router.push("/login");
    } else {
      const data = await res.json();
      setError(data.error || "Signup failed");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-4">Sign Up</h2>
        {error && <p className="text-red-600 mb-2">{error}</p>}
        <input name="name" placeholder="Name" value={form.name} onChange={handleChange} className="border p-2 w-full mb-2" />
        <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} className="border p-2 w-full mb-2" />
        <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} className="border p-2 w-full mb-4" />
        <button className="bg-indigo-600 text-white py-2 w-full rounded">Sign Up</button>
      </form>
    </div>
  );
}
