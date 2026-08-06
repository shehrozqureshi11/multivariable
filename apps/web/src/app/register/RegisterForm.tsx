"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { saveAuth } from "@/lib/auth";

export default function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const defaultRole =
    params.get("role") === "FARM_OWNER" ? "FARM_OWNER" : "INVESTOR";
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
    }>("/auth/register", {
      method: "POST",
      revalidate: false,
      body: JSON.stringify({
        fullName: fd.get("fullName"),
        email: fd.get("email"),
        phone: fd.get("phone") || undefined,
        password: fd.get("password"),
        role: fd.get("role"),
      }),
    });
    setLoading(false);
    if (!res.success || !res.data) {
      setError(res.error?.message || "Registration failed");
      return;
    }
    saveAuth(res.data);
    if (res.data.user.role === "FARM_OWNER") router.push("/dashboard/farm");
    else router.push("/dashboard/investor");
  }

  return (
    <div className="auth-shell container">
      <div className="auth-card">
        <h1>
          {defaultRole === "FARM_OWNER" ? "Register your farm" : "Create account"}
        </h1>
        <p className="meta">
          {defaultRole === "FARM_OWNER"
            ? "Create a farm owner account, then complete your farm profile and list livestock."
            : "Investors can fund verified goats, sheep, and cows."}
        </p>
        <form className="form" onSubmit={onSubmit}>
          <label>
            Full name
            <input name="fullName" required />
          </label>
          <label>
            Email
            <input name="email" type="email" required />
          </label>
          <label>
            Phone
            <input name="phone" placeholder="+92…" />
          </label>
          <label>
            I am a
            <select name="role" defaultValue={defaultRole}>
              <option value="INVESTOR">Investor</option>
              <option value="FARM_OWNER">Farm owner</option>
            </select>
          </label>
          <label>
            Password
            <input name="password" type="password" minLength={8} required />
          </label>
          {error ? <div className="error">{error}</div> : null}
          <button className="btn btn-primary" disabled={loading}>
            {loading
              ? "Creating…"
              : defaultRole === "FARM_OWNER"
                ? "Continue to farm dashboard"
                : "Create account"}
          </button>
        </form>
        <p className="meta" style={{ marginTop: "1rem" }}>
          Already registered? <Link href="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}
