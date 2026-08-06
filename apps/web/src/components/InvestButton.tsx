"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { loadAuth } from "@/lib/auth";

export function InvestButton({
  animalId,
  disabled,
}: {
  animalId: string;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function invest() {
    setError("");
    const auth = loadAuth();
    if (!auth) {
      router.push("/login?next=/marketplace");
      return;
    }
    if (auth.user.role !== "INVESTOR") {
      setError("Only investor accounts can fund livestock shares.");
      return;
    }
    setLoading(true);
    const res = await apiFetch("/investments", {
      method: "POST",
      token: auth.accessToken,
      revalidate: false,
      body: JSON.stringify({
        animalId,
        shares: 1,
        acceptAgreement: true,
      }),
    });
    setLoading(false);
    if (!res.success) {
      setError(res.error?.message || "Investment failed");
      return;
    }
    setDone(true);
    router.push("/dashboard/investor");
  }

  return (
    <div style={{ marginTop: "1rem" }}>
      <button
        className="btn btn-primary"
        disabled={disabled || loading}
        onClick={invest}
      >
        {loading ? "Processing…" : "Invest 1 share"}
      </button>
      {error ? <p className="error" style={{ marginTop: "0.75rem" }}>{error}</p> : null}
      {done ? <p className="success" style={{ marginTop: "0.75rem" }}>Investment confirmed.</p> : null}
    </div>
  );
}
