"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import SiteLogo from "@/components/SiteLogo";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (data.success) router.push("/admin/dashboard");
    else setError(data.error || "Login failed");
  }

  return (
    <>
      <link rel="stylesheet" href="/css/admin.css" />
      <div className="login-shell">
        <form className="login-box" onSubmit={onSubmit}>
          <div className="brand">
            <SiteLogo />
          </div>
          <h1>Admin Login</h1>
          <div className="form-row">
            <label>Username</label>
            <input value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>
          <div className="form-row">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {error ? <p style={{ color: "#d1483a", fontSize: 13 }}>{error}</p> : null}
          <button className="btn btn-primary" type="submit">
            Log in
          </button>
        </form>
      </div>
    </>
  );
}
