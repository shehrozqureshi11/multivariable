"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { saveAuth } from "@/lib/auth";

export default function LoginClient() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const res = await apiFetch<{
      user: { id: string; email: string; fullName: string; role: string };
      accessToken: string;
      refreshToken: string;
    }>("/auth/login", {
      method: "POST",
      revalidate: false,
      body: JSON.stringify({
        email: fd.get("email"),
        password: fd.get("password"),
      }),
    });
    setLoading(false);
    if (!res.success || !res.data) {
      setError(res.error?.message || "Login failed");
      return;
    }
    saveAuth(res.data);
    const next = params.get("next");
    const role = res.data.user.role;
    if (next) router.push(next);
    else if (role === "ADMIN") router.push("/dashboard/admin");
    else if (role === "FARM_OWNER") router.push("/dashboard/farm");
    else router.push("/dashboard/investor");
  }

  return (
    <div className="auth-shell container">
      <div className="auth-card">
        <h1>Log in</h1>
        <p className="meta">Demo: investor@herdshare.pk / Password123!</p>
        <form className="form" onSubmit={onSubmit}>
          <label>
            Email
            <input name="email" type="email" required defaultValue="investor@herdshare.pk" />
          </label>
          <label>
            Password
            <input name="password" type="password" required defaultValue="Password123!" />
          </label>
          {error ? <div className="error">{error}</div> : null}
          <button className="btn btn-primary" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <p className="meta" style={{ marginTop: "1rem" }}>
          No account? <Link href="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}
