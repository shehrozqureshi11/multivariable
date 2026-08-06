import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "How it works",
  description:
    "Learn how HerdShare connects investors with verified livestock farms through KYC, digital agreements, and profit sharing.",
  alternates: { canonical: "/how-it-works" },
};

export default function HowItWorksPage() {
  const steps = [
    {
      title: "1. Create your profile",
      body: "Register as an investor or farm owner. Complete KYC so the platform can verify identity.",
    },
    {
      title: "2. Farms get verified",
      body: "Farm owners submit farm details. Admins approve before animals can be listed.",
    },
    {
      title: "3. Fund a share",
      body: "Browse goats, sheep, or cows. Accept the digital agreement and pay via wallet (mock payments in MVP).",
    },
    {
      title: "4. Track & share profits",
      body: "Follow care updates and receive profit distributions when livestock cycles complete.",
    },
  ];

  return (
    <section className="section">
      <div className="container">
        <h1>How HerdShare works</h1>
        <p className="meta" style={{ maxWidth: "52ch" }}>
          Transparent livestock investment with verified farms, digital contracts,
          and dashboards for investors, farm owners, and admins.
        </p>
        <div className="grid grid-2" style={{ marginTop: "2rem" }}>
          {steps.map((s) => (
            <div key={s.title} className="panel">
              <h2 style={{ fontSize: "1.4rem" }}>{s.title}</h2>
              <p className="meta">{s.body}</p>
            </div>
          ))}
        </div>
        <div style={{ marginTop: "2rem" }}>
          <Link href="/register" className="btn btn-primary">
            Get started
          </Link>
        </div>
      </div>
    </section>
  );
}
