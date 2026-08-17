"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DashboardShell } from "@/components/DashboardShell";
import { apiFetch, formatPkr } from "@/lib/api";
import { loadAuth } from "@/lib/auth";

type Investment = {
  id: string;
  shares: number;
  amountPkr: string | number;
  status: string;
  arrangement: "FARM_PURCHASES" | "INVESTOR_PROVIDES";
  animal: { name: string; slug: string; farm: { name: string } };
};

type Wallet = {
  balancePkr: string | number;
  txns: { id: string; type: string; amountPkr: string | number; note?: string; createdAt: string }[];
};

export default function InvestorDashboard() {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [stats, setStats] = useState<{
    activeInvestments: number;
    totalInvested: number;
    totalProfit: number;
  } | null>(null);
  const [notifications, setNotifications] = useState<
    { id: string; title: string; body: string; isRead: boolean }[]
  >([]);
  const [msg, setMsg] = useState("");

  async function load() {
    const auth = loadAuth();
    if (!auth) return;
    const token = auth.accessToken;
    const [inv, wal, rep, notes] = await Promise.all([
      apiFetch<Investment[]>("/investments/mine", { token, revalidate: false }),
      apiFetch<Wallet>("/wallet", { token, revalidate: false }),
      apiFetch<{
        activeInvestments: number;
        totalInvested: number;
        totalProfit: number;
      }>("/reports/investor", { token, revalidate: false }),
      apiFetch<{ id: string; title: string; body: string; isRead: boolean }[]>(
        "/notifications",
        { token, revalidate: false }
      ),
    ]);
    if (inv.success) setInvestments(inv.data || []);
    if (wal.success) setWallet(wal.data || null);
    if (rep.success) setStats(rep.data || null);
    if (notes.success) setNotifications(notes.data || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function deposit() {
    const auth = loadAuth();
    if (!auth) return;
    const res = await apiFetch("/wallet/deposit", {
      method: "POST",
      token: auth.accessToken,
      revalidate: false,
      body: JSON.stringify({ amountPkr: 100000 }),
    });
    setMsg(res.success ? "Deposited PKR 100,000 (mock)." : res.error?.message || "Failed");
    load();
  }

  return (
    <DashboardShell role="INVESTOR">
      <h1>Investor portfolio</h1>
      <div className="stat-grid">
        <div className="stat">
          <span className="meta">Active</span>
          <strong>{stats?.activeInvestments ?? 0}</strong>
        </div>
        <div className="stat">
          <span className="meta">Invested</span>
          <strong>{formatPkr(stats?.totalInvested || 0)}</strong>
        </div>
        <div className="stat">
          <span className="meta">Projected profit</span>
          <strong>{formatPkr(stats?.totalProfit || 0)}</strong>
        </div>
        <div className="stat">
          <span className="meta">Wallet</span>
          <strong>{formatPkr(wallet?.balancePkr || 0)}</strong>
        </div>
      </div>

      <div className="panel" style={{ marginBottom: "1rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
          <h2 style={{ margin: 0, fontSize: "1.25rem" }}>Wallet</h2>
          <button className="btn btn-secondary" onClick={deposit}>
            Mock deposit 100k
          </button>
        </div>
        {msg ? <p className="success">{msg}</p> : null}
        <table className="table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Amount</th>
              <th>Note</th>
            </tr>
          </thead>
          <tbody>
            {(wallet?.txns || []).slice(0, 8).map((t) => (
              <tr key={t.id}>
                <td>{t.type}</td>
                <td>{formatPkr(t.amountPkr)}</td>
                <td>{t.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="panel" style={{ marginBottom: "1rem" }}>
        <h2 style={{ marginTop: 0, fontSize: "1.25rem" }}>Investments</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Animal</th>
              <th>Farm</th>
              <th>Arrangement</th>
              <th>Shares</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {investments.map((i) => (
              <tr key={i.id}>
                <td>
                  <Link href={`/animals/${i.animal.slug}`}>{i.animal.name}</Link>
                </td>
                <td>{i.animal.farm.name}</td>
                <td>
                  {i.arrangement === "INVESTOR_PROVIDES"
                    ? "Investor provides animal"
                    : "Farm purchases animal"}
                </td>
                <td>{i.shares}</td>
                <td>{formatPkr(i.amountPkr)}</td>
                <td>
                  <span className="badge badge-green">{i.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!investments.length ? (
          <p className="meta">
            No investments yet. <Link href="/marketplace">Browse marketplace</Link>
          </p>
        ) : null}
      </div>

      <div className="panel">
        <h2 style={{ marginTop: 0, fontSize: "1.25rem" }}>Notifications</h2>
        <ul>
          {notifications.map((n) => (
            <li key={n.id}>
              <strong>{n.title}</strong> — {n.body}
            </li>
          ))}
        </ul>
      </div>
    </DashboardShell>
  );
}
