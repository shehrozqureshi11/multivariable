"use client";

import { FormEvent, useEffect, useState } from "react";
import { DashboardShell } from "@/components/DashboardShell";
import { apiFetch, formatPkr } from "@/lib/api";
import { loadAuth } from "@/lib/auth";

type Farm = {
  id: string;
  name: string;
  status: string;
  city: string;
  animals: {
    id: string;
    name: string;
    species: string;
    availableShares: number;
    pricePkr: string | number;
    status: string;
  }[];
  expenses: { id: string; category: string; amountPkr: string | number; note?: string }[];
};

export default function FarmDashboard() {
  const [farm, setFarm] = useState<Farm | null>(null);
  const [stats, setStats] = useState<{
    animals: number;
    fundedVolume: number;
    activeInvestments: number;
    expenses: number;
  } | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function load() {
    const auth = loadAuth();
    if (!auth) return;
    const token = auth.accessToken;
    const [f, s] = await Promise.all([
      apiFetch<Farm | null>("/farms/me/mine", { token, revalidate: false }),
      apiFetch<{
        animals: number;
        fundedVolume: number;
        activeInvestments: number;
        expenses: number;
      }>("/reports/farm", { token, revalidate: false }),
    ]);
    if (f.success) setFarm(f.data || null);
    if (s.success) setStats(s.data || null);
  }

  useEffect(() => {
    load();
  }, []);

  async function createFarm(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const auth = loadAuth();
    if (!auth) return;
    const fd = new FormData(e.currentTarget);
    const res = await apiFetch("/farms", {
      method: "POST",
      token: auth.accessToken,
      revalidate: false,
      body: JSON.stringify({
        name: fd.get("name"),
        description: fd.get("description"),
        location: fd.get("location"),
        city: fd.get("city"),
        province: fd.get("province"),
        capacity: Number(fd.get("capacity") || 50),
      }),
    });
    if (!res.success) {
      setError(res.error?.message || "Could not create farm");
      return;
    }
    setMessage("Farm submitted for verification.");
    load();
  }

  async function addAnimal(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const auth = loadAuth();
    if (!auth || !farm) return;
    const fd = new FormData(e.currentTarget);
    const price = Number(fd.get("pricePkr"));
    const res = await apiFetch("/animals", {
      method: "POST",
      token: auth.accessToken,
      revalidate: false,
      body: JSON.stringify({
        farmId: farm.id,
        name: fd.get("name"),
        species: fd.get("species"),
        ageMonths: Number(fd.get("ageMonths")),
        pricePkr: price,
        sharePricePkr: price,
        totalShares: 1,
        expectedRoiPercent: Number(fd.get("expectedRoiPercent") || 15),
        description: fd.get("description"),
        imageUrl: fd.get("imageUrl") || undefined,
      }),
    });
    if (!res.success) {
      setError(res.error?.message || "Could not list animal");
      return;
    }
    setMessage("Animal listed.");
    (e.target as HTMLFormElement).reset();
    load();
  }

  async function addExpense(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const auth = loadAuth();
    if (!auth) return;
    const fd = new FormData(e.currentTarget);
    const res = await apiFetch("/reports/expenses", {
      method: "POST",
      token: auth.accessToken,
      revalidate: false,
      body: JSON.stringify({
        category: fd.get("category"),
        amountPkr: Number(fd.get("amountPkr")),
        note: fd.get("note"),
      }),
    });
    if (!res.success) {
      setError(res.error?.message || "Expense failed");
      return;
    }
    setMessage("Expense logged.");
    load();
  }

  async function postUpdate(animalId: string) {
    const auth = loadAuth();
    if (!auth) return;
    const title = prompt("Update title");
    const body = prompt("Update details");
    if (!title || !body) return;
    const res = await apiFetch(`/animals/${animalId}/updates`, {
      method: "POST",
      token: auth.accessToken,
      revalidate: false,
      body: JSON.stringify({ title, body }),
    });
    setMessage(res.success ? "Update posted." : res.error?.message || "Failed");
  }

  return (
    <DashboardShell role="FARM_OWNER">
      <h1>Farm dashboard</h1>
      {message ? <p className="success">{message}</p> : null}
      {error ? <p className="error">{error}</p> : null}

      {!farm ? (
        <div className="panel">
          <h2 style={{ marginTop: 0 }}>Register your farm</h2>
          <form className="form" onSubmit={createFarm}>
            <label>
              Farm name
              <input name="name" required />
            </label>
            <label>
              Description
              <textarea name="description" rows={3} />
            </label>
            <label>
              Location
              <input name="location" required />
            </label>
            <label>
              City
              <input name="city" required />
            </label>
            <label>
              Province
              <input name="province" required defaultValue="Punjab" />
            </label>
            <label>
              Capacity
              <input name="capacity" type="number" defaultValue={50} />
            </label>
            <button className="btn btn-primary">Submit for verification</button>
          </form>
        </div>
      ) : (
        <>
          <div className="stat-grid">
            <div className="stat">
              <span className="meta">Status</span>
              <strong style={{ fontSize: "1.1rem" }}>{farm.status}</strong>
            </div>
            <div className="stat">
              <span className="meta">Animals</span>
              <strong>{stats?.animals ?? farm.animals.length}</strong>
            </div>
            <div className="stat">
              <span className="meta">Funded volume</span>
              <strong>{formatPkr(stats?.fundedVolume || 0)}</strong>
            </div>
            <div className="stat">
              <span className="meta">Expenses</span>
              <strong>{formatPkr(stats?.expenses || 0)}</strong>
            </div>
          </div>

          <div className="panel" style={{ marginBottom: "1rem" }}>
            <h2 style={{ marginTop: 0, fontSize: "1.25rem" }}>{farm.name}</h2>
            <p className="meta">{farm.city}</p>
            <table className="table">
              <thead>
                <tr>
                  <th>Animal</th>
                  <th>Species</th>
                  <th>Shares left</th>
                  <th>Price</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {farm.animals.map((a) => (
                  <tr key={a.id}>
                    <td>{a.name}</td>
                    <td>{a.species}</td>
                    <td>{a.availableShares}</td>
                    <td>{formatPkr(a.pricePkr)}</td>
                    <td>
                      <button className="btn btn-secondary" onClick={() => postUpdate(a.id)}>
                        Post update
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {farm.status === "APPROVED" ? (
            <div className="grid grid-2">
              <div className="panel">
                <h2 style={{ marginTop: 0, fontSize: "1.25rem" }}>List animal</h2>
                <form className="form" onSubmit={addAnimal}>
                  <label>
                    Name
                    <input name="name" required />
                  </label>
                  <label>
                    Species
                    <select name="species" defaultValue="GOAT">
                      <option value="GOAT">Goat</option>
                      <option value="SHEEP">Sheep</option>
                      <option value="COW">Cow</option>
                    </select>
                  </label>
                  <label>
                    Age (months)
                    <input name="ageMonths" type="number" required defaultValue={12} />
                  </label>
                  <label>
                    Price (PKR)
                    <input name="pricePkr" type="number" required />
                  </label>
                  <label>
                    Expected ROI %
                    <input name="expectedRoiPercent" type="number" defaultValue={18} />
                  </label>
                  <label>
                    Image URL
                    <input name="imageUrl" type="url" />
                  </label>
                  <label>
                    Description
                    <textarea name="description" rows={2} />
                  </label>
                  <button className="btn btn-primary">Publish listing</button>
                </form>
              </div>
              <div className="panel">
                <h2 style={{ marginTop: 0, fontSize: "1.25rem" }}>Log expense</h2>
                <form className="form" onSubmit={addExpense}>
                  <label>
                    Category
                    <input name="category" required placeholder="Feed / Vet / Transport" />
                  </label>
                  <label>
                    Amount (PKR)
                    <input name="amountPkr" type="number" required />
                  </label>
                  <label>
                    Note
                    <input name="note" />
                  </label>
                  <button className="btn btn-secondary">Save expense</button>
                </form>
                <ul>
                  {(farm.expenses || []).map((ex) => (
                    <li key={ex.id}>
                      {ex.category}: {formatPkr(ex.amountPkr)} {ex.note ? `— ${ex.note}` : ""}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <p className="meta">Your farm is awaiting admin verification before you can list animals.</p>
          )}
        </>
      )}
    </DashboardShell>
  );
}
