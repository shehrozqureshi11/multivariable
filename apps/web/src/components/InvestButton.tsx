"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { apiFetch, formatPkr } from "@/lib/api";
import { loadAuth } from "@/lib/auth";

type Confirmation = { shares: number; amountPkr: number };

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
  const [needsLogin, setNeedsLogin] = useState(false);
  const [done, setDone] = useState<Confirmation | null>(null);

  const returnPath = animalSlug
    ? `/animals/${animalSlug}`
    : pathname || "/marketplace";

  useEffect(() => {
    if (!done) return;
    const t = setTimeout(() => router.push("/dashboard/investor"), 1600);
    return () => clearTimeout(t);
  }, [done, router]);

  async function invest() {
    setError("");
    setNeedsLogin(false);
    const auth = loadAuth();
    if (!auth) {
      setNeedsLogin(true);
      setError("Please log in as an investor first to invest in a share.");
      return;
    }
    if (auth.user.role !== "INVESTOR") {
      setNeedsLogin(true);
      setError(
        "Only investor accounts can fund livestock shares. Log in with an investor account."
      );
      return;
    }
    setLoading(true);
    const res = await apiFetch<Confirmation>("/investments", {
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
    if (!res.success || !res.data) {
      setError(res.error?.message || "Investment failed. Please try again.");
      return;
    }
    setDone({ shares: res.data.shares, amountPkr: res.data.amountPkr });
  }

  const loginHref = `/login?next=${encodeURIComponent(returnPath)}&role=INVESTOR&msg=${encodeURIComponent(
    "Log in as an investor to invest in a share."
  )}`;

  return (
    <div style={{ marginTop: "1rem" }}>
      <button
        className="btn btn-primary"
        disabled={disabled || loading || Boolean(done)}
        onClick={invest}
      >
        {loading ? "Processing…" : "Invest 1 share"}
      </button>
      {error ? (
        <div className="error" style={{ marginTop: "0.75rem" }}>
          <p style={{ margin: "0 0 0.5rem" }}>{error}</p>
          {needsLogin ? (
            <Link href={loginHref} className="btn btn-accent">
              Log in as investor
            </Link>
          ) : null}
        </div>
      ) : null}
      {done ? (
        <div className="success" style={{ marginTop: "0.75rem" }}>
          <p style={{ margin: "0 0 0.5rem" }}>
            Investment confirmed — {done.shares} share for{" "}
            {formatPkr(done.amountPkr)}. Taking you to your portfolio…
          </p>
          <Link href="/dashboard/investor">View portfolio now</Link>
        </div>
      ) : null}
    </div>
  );
}
