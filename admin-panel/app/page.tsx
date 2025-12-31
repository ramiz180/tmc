"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    if (password === "admin123") {
      router.push("/dashboard");
    } else {
      alert("Invalid password");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-80 rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-6 text-center text-xl font-semibold">
          MakeConnect Admin
        </h1>

        <input
          type="password"
          placeholder="Admin password"
          className="mb-4 w-full rounded border p-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          className="w-full rounded bg-black py-2 text-white hover:bg-gray-900"
        >
          Login
        </button>
      </div>
    </div>
  );
}
