"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { loadAuth } from "@/lib/auth";

type Arrangement = "FARM_PURCHASES" | "INVESTOR_PROVIDES";
type Confirmation = { status: string; arrangement: Arrangement };

export function InvestButton({
  animalId,
  animalSlug,
  animalType,
  farmName,
  disabled,
}: {
  animalId: string;
  animalSlug?: string;
  animalType: string;
  farmName: string;
  disabled?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [needsLogin, setNeedsLogin] = useState(false);
  const [done, setDone] = useState<Confirmation | null>(null);
  const [arrangement, setArrangement] = useState<Arrangement | "">("");
  const [acceptedPolicy, setAcceptedPolicy] = useState(false);

  const returnPath = animalSlug
    ? `/animals/${animalSlug}`
    : pathname || "/marketplace";

  useEffect(() => {
    if (!done) return;
    const t = setTimeout(() => router.push("/dashboard/investor"), 2400);
    return () => clearTimeout(t);
  }, [done, router]);

  async function invest() {
    setError("");
    setNeedsLogin(false);
    if (!arrangement) {
      setError("Select how the animal will be purchased.");
      return;
    }
    if (!acceptedPolicy) {
      setError("Please acknowledge the discussion and livestock policy.");
      return;
    }
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
        arrangement,
        acceptAgreement: acceptedPolicy,
      }),
    });
    setLoading(false);
    if (!res.success || !res.data) {
      setError(res.error?.message || "Investment failed. Please try again.");
      return;
    }
    setDone({ status: res.data.status, arrangement: res.data.arrangement });
  }

  const loginHref = `/login?next=${encodeURIComponent(returnPath)}&role=INVESTOR&msg=${encodeURIComponent(
    "Log in as an investor to invest in a share."
  )}`;

  return (
    <div className="investment-flow">
      <div className="investment-flow-head">
        <p className="eyebrow">Choose an arrangement</p>
        <h2>How will the {animalType.toLowerCase()} be purchased?</h2>
        <p className="meta">
          Select one option. You and {farmName} will discuss the details before
          any purchase is completed.
        </p>
      </div>

      <div className="arrangement-grid" role="radiogroup" aria-label="Purchase arrangement">
        <label className={`arrangement-card ${arrangement === "FARM_PURCHASES" ? "selected" : ""}`}>
          <input
            type="radio"
            name="arrangement"
            value="FARM_PURCHASES"
            checked={arrangement === "FARM_PURCHASES"}
            onChange={() => setArrangement("FARM_PURCHASES")}
          />
          <span className="arrangement-number">01</span>
          <strong>Farm buys for you</strong>
          <span>
            The farm sources the {animalType.toLowerCase()} after discussing
            breed, health, market price, care charges, profit sharing and risks
            with you.
          </span>
        </label>

        <label className={`arrangement-card ${arrangement === "INVESTOR_PROVIDES" ? "selected" : ""}`}>
          <input
            type="radio"
            name="arrangement"
            value="INVESTOR_PROVIDES"
            checked={arrangement === "INVESTOR_PROVIDES"}
            onChange={() => setArrangement("INVESTOR_PROVIDES")}
          />
          <span className="arrangement-number">02</span>
          <strong>You provide the animal</strong>
          <span>
            You purchase the animal yourself, then hand it over after the farm
            inspects and accepts its health, ownership records and care terms.
          </span>
        </label>
      </div>

      <div className="policy-box">
        <strong>Livestock discussion policy</strong>
        <p>
          HerdShare facilitates communication and record-keeping only. No
          purchase is final until the investor and farm agree on market price,
          animal health, ownership, care charges, profit sharing, risks and
          sale or exit terms. Livestock prices can change with the market.
        </p>
        <label className="policy-check">
          <input
            type="checkbox"
            checked={acceptedPolicy}
            onChange={(event) => setAcceptedPolicy(event.target.checked)}
          />
          <span>
            I understand that this sends a discussion request and is not an
            immediate animal purchase.
          </span>
        </label>
      </div>

      <button
        className="btn btn-primary"
        disabled={
          disabled ||
          loading ||
          Boolean(done) ||
          !arrangement ||
          !acceptedPolicy
        }
        onClick={invest}
      >
        {loading ? "Sending request…" : "Request discussion with farm"}
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
            Request sent to {farmName}. No payment has been taken. Discuss the
            terms with the farm before deciding whether to purchase.
          </p>
          <Link href="/dashboard/investor">View request in your portfolio</Link>
        </div>
      ) : null}
    </div>
  );
}
