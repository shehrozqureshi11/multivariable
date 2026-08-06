"use client";

import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/DashboardShell";
import { apiFetch, formatPkr } from "@/lib/api";
import { loadAuth } from "@/lib/auth";

export default function AdminDashboard() {
  const [stats, setStats] = useState<{
    users: number;
    farmsPending: number;
    farmsApproved: number;
    animals: number;
    investments: number;
    volumePkr: number;
    openDisputes: number;
  } | null>(null);
  const [pendingFarms, setPendingFarms] = useState<
    { id: string; name: string; city: string; owner: { fullName: string; email: string } }[]
  >([]);
  const [logs, setLogs] = useState<
    { id: string; action: string; entityType: string; createdAt: string; actor?: { fullName: string } | null }[]
  >([]);
  const [disputes, setDisputes] = useState<
    { id: string; subject: string; status: string; opener: { fullName: string } }[]
  >([]);
  const [msg, setMsg] = useState("");

  async function load() {
    const auth = loadAuth();
    if (!auth) return;
    const token = auth.accessToken;
    const [s, f, a, d] = await Promise.all([
      apiFetch<typeof stats>("/admin/stats", { token, revalidate: false }),
      apiFetch<typeof pendingFarms>("/admin/farms/pending", { token, revalidate: false }),
      apiFetch<typeof logs>("/admin/audit-logs?limit=30", { token, revalidate: false }),
      apiFetch<typeof disputes>("/admin/disputes", { token, revalidate: false }),
    ]);
    if (s.success) setStats(s.data || null);
    if (f.success) setPendingFarms(f.data || []);
    if (a.success) setLogs(a.data || []);
    if (d.success) setDisputes(d.data || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function verify(id: string, status: "APPROVED" | "REJECTED") {
    const auth = loadAuth();
    if (!auth) return;
    const res = await apiFetch(`/admin/farms/${id}/verify`, {
      method: "POST",
      token: auth.accessToken,
      revalidate: false,
      body: JSON.stringify({ status }),
    });
    setMsg(res.success ? `Farm ${status.toLowerCase()}.` : res.error?.message || "Failed");
    load();
  }

  return (
    <DashboardShell role="ADMIN">
      <h1>Admin console</h1>
      {msg ? <p className="success">{msg}</p> : null}
      <div className="stat-grid">
        <div className="stat">
          <span className="meta">Users</span>
          <strong>{stats?.users ?? 0}</strong>
        </div>
        <div className="stat">
          <span className="meta">Pending farms</span>
          <strong>{stats?.farmsPending ?? 0}</strong>
        </div>
        <div className="stat">
          <span className="meta">Active investments</span>
          <strong>{stats?.investments ?? 0}</strong>
        </div>
        <div className="stat">
          <span className="meta">Volume</span>
          <strong>{formatPkr(stats?.volumePkr || 0)}</strong>
        </div>
      </div>

      <div className="panel" style={{ marginBottom: "1rem" }}>
        <h2 style={{ marginTop: 0, fontSize: "1.25rem" }}>Farm verification</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Farm</th>
              <th>Owner</th>
              <th>City</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {pendingFarms.map((f) => (
              <tr key={f.id}>
                <td>{f.name}</td>
                <td>
                  {f.owner.fullName}
                  <br />
                  <span className="meta">{f.owner.email}</span>
                </td>
                <td>{f.city}</td>
                <td style={{ display: "flex", gap: "0.5rem" }}>
                  <button className="btn btn-primary" onClick={() => verify(f.id, "APPROVED")}>
                    Approve
                  </button>
                  <button className="btn btn-secondary" onClick={() => verify(f.id, "REJECTED")}>
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!pendingFarms.length ? <p className="meta">No farms awaiting review.</p> : null}
      </div>

      <div className="grid grid-2">
        <div className="panel">
          <h2 style={{ marginTop: 0, fontSize: "1.25rem" }}>Disputes</h2>
          <ul>
            {disputes.map((d) => (
              <li key={d.id}>
                <strong>{d.subject}</strong> — {d.opener.fullName}{" "}
                <span className="badge">{d.status}</span>
              </li>
            ))}
          </ul>
          {!disputes.length ? <p className="meta">No disputes.</p> : null}
        </div>
        <div className="panel">
          <h2 style={{ marginTop: 0, fontSize: "1.25rem" }}>Audit log</h2>
          <table className="table">
            <thead>
              <tr>
                <th>Action</th>
                <th>Entity</th>
                <th>Actor</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id}>
                  <td>{l.action}</td>
                  <td>{l.entityType}</td>
                  <td>{l.actor?.fullName || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardShell>
  );
}
