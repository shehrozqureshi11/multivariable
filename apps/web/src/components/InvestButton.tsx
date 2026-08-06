"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { loadAuth } from "@/lib/auth";

export function InvestButton({
  animalId,
  animalSlug,
  disabled,
}: {
  animalId: string;
  animalSlug?: string;
  disabled?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const returnPath = animalSlug
    ? `/animals/${animalSlug}`
    : pathname || "/marketplace";

  async function invest() {
    setError("");
    const auth = loadAuth();
    if (!auth) {
      setError("Please log in as an investor first to invest in a share.");
      return;
    }
    if (auth.user.role !== "INVESTOR") {
      setError(
        "Only investor accounts can fund livestock shares. Log in with an investor account."
      );
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

  const loginHref = `/login?next=${encodeURIComponent(returnPath)}&role=INVESTOR&msg=${encodeURIComponent(
    "Log in as an investor to invest in a share."
  )}`;

  return (
    <div style={{ marginTop: "1rem" }}>
      <button
        className="btn btn-primary"
        disabled={disabled || loading}
        onClick={invest}
      >
        {loading ? "Processing…" : "Invest 1 share"}
      </button>
      {error ? (
        <div className="error" style={{ marginTop: "0.75rem" }}>
          <p style={{ margin: "0 0 0.5rem" }}>{error}</p>
          {!loadAuth() || loadAuth()?.user.role !== "INVESTOR" ? (
            <Link href={loginHref} className="btn btn-accent">
              Log in as investor
            </Link>
          ) : null}
        </div>
      ) : null}
      {done ? (
        <p className="success" style={{ marginTop: "0.75rem" }}>
          Investment confirmed.
        </p>
      ) : null}
    </div>
  );
}
