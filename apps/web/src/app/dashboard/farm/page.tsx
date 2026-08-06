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
  province?: string;
  description?: string | null;
  imageUrl?: string | null;
  animals: {
    id: string;
    name: string;
    species: string;
    availableShares: number;
    pricePkr: string | number;
    status: string;
    imageUrl?: string | null;
  }[];
  expenses: { id: string; category: string; amountPkr: string | number; note?: string }[];
};

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read image"));
    reader.readAsDataURL(file);
  });
}

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
  const [farmPreview, setFarmPreview] = useState("");
  const [animalPreview, setAnimalPreview] = useState("");

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
    const file = fd.get("imageFile") as File | null;
    let imageUrl = String(fd.get("imageUrl") || "");
    if (file && file.size > 0) {
      imageUrl = await fileToDataUrl(file);
    }
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
        imageUrl: imageUrl || undefined,
      }),
    });
    if (!res.success) {
      setError(res.error?.message || "Could not create farm");
      return;
    }
    setMessage("Farm submitted for admin verification.");
    load();
  }

  async function addAnimal(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const auth = loadAuth();
    if (!auth || !farm) return;
    const form = e.currentTarget;
    const fd = new FormData(form);
    const price = Number(fd.get("pricePkr"));
    const shares = Number(fd.get("totalShares") || 1);
    const file = fd.get("imageFile") as File | null;
    let imageUrl = String(fd.get("imageUrl") || "");
    if (file && file.size > 0) {
      imageUrl = await fileToDataUrl(file);
    }
    const res = await apiFetch("/animals", {
      method: "POST",
      token: auth.accessToken,
      revalidate: false,
      body: JSON.stringify({
        farmId: farm.id,
        name: fd.get("name"),
        species: fd.get("species"),
        breed: fd.get("breed") || undefined,
        ageMonths: Number(fd.get("ageMonths")),
        weightKg: fd.get("weightKg") ? Number(fd.get("weightKg")) : undefined,
        pricePkr: price,
        sharePricePkr: Number(fd.get("sharePricePkr") || price / shares),
        totalShares: shares,
        expectedRoiPercent: Number(fd.get("expectedRoiPercent") || 15),
        description: fd.get("description"),
        imageUrl: imageUrl || undefined,
      }),
    });
    if (!res.success) {
      setError(res.error?.message || "Could not list animal");
      return;
    }
    setMessage("Animal listed on the marketplace.");
    setAnimalPreview("");
    form.reset();
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
    (e.target as HTMLFormElement).reset();
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
      <p className="meta">
        Register your farm, upload photos, list goats/sheep/cows with price and
        description, then post care updates for investors.
      </p>
      {message ? <p className="success">{message}</p> : null}
      {error ? <p className="error">{error}</p> : null}

      {!farm ? (
        <div className="panel">
          <h2 style={{ marginTop: 0 }}>Register farm profile</h2>
          <form className="form" onSubmit={createFarm}>
            <label>
              Farm name
              <input name="name" required placeholder="Green Pastures Farm" />
            </label>
            <label>
              Description
              <textarea
                name="description"
                rows={3}
                placeholder="Tell investors about verification, care standards, and location."
              />
            </label>
            <label>
              Location / address
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
              Capacity (animals)
              <input name="capacity" type="number" defaultValue={50} />
            </label>
            <label>
              Cover image URL (optional)
              <input name="imageUrl" type="url" placeholder="https://…" />
            </label>
            <label>
              Or upload cover image
              <input
                name="imageFile"
                type="file"
                accept="image/*"
                onChange={async (ev) => {
                  const f = ev.target.files?.[0];
                  if (f) setFarmPreview(await fileToDataUrl(f));
                }}
              />
            </label>
            {farmPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={farmPreview}
                alt="Farm preview"
                style={{ width: "100%", maxHeight: 220, objectFit: "cover", borderRadius: 12 }}
              />
            ) : null}
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
            <div className="grid grid-2" style={{ alignItems: "center", gap: "1rem" }}>
              {farm.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={farm.imageUrl}
                  alt={farm.name}
                  style={{ width: "100%", height: 180, objectFit: "cover", borderRadius: 12 }}
                />
              ) : (
                <div className="card-media" style={{ minHeight: 180 }} />
              )}
              <div>
                <h2 style={{ marginTop: 0, fontSize: "1.25rem" }}>{farm.name}</h2>
                <p className="meta">
                  {farm.city}
                  {farm.province ? `, ${farm.province}` : ""}
                </p>
                <p>{farm.description}</p>
              </div>
            </div>
            <table className="table" style={{ marginTop: "1rem" }}>
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
                      <button
                        className="btn btn-secondary"
                        type="button"
                        onClick={() => postUpdate(a.id)}
                      >
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
                    <input name="name" required placeholder="Beetal Buck — Noor" />
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
                    Breed
                    <input name="breed" placeholder="Beetal / Kajli / Sahiwal" />
                  </label>
                  <label>
                    Age (months)
                    <input name="ageMonths" type="number" required defaultValue={12} />
                  </label>
                  <label>
                    Weight (kg)
                    <input name="weightKg" type="number" step="0.1" />
                  </label>
                  <label>
                    Total price (PKR)
                    <input name="pricePkr" type="number" required />
                  </label>
                  <label>
                    Share price (PKR)
                    <input name="sharePricePkr" type="number" placeholder="Defaults from price ÷ shares" />
                  </label>
                  <label>
                    Total shares
                    <input name="totalShares" type="number" defaultValue={1} min={1} />
                  </label>
                  <label>
                    Expected ROI %
                    <input name="expectedRoiPercent" type="number" defaultValue={18} />
                  </label>
                  <label>
                    Description
                    <textarea name="description" rows={3} required />
                  </label>
                  <label>
                    Image URL (optional)
                    <input name="imageUrl" type="url" placeholder="https://…" />
                  </label>
                  <label>
                    Or upload animal image
                    <input
                      name="imageFile"
                      type="file"
                      accept="image/*"
                      onChange={async (ev) => {
                        const f = ev.target.files?.[0];
                        if (f) setAnimalPreview(await fileToDataUrl(f));
                      }}
                    />
                  </label>
                  {animalPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={animalPreview}
                      alt="Animal preview"
                      style={{
                        width: "100%",
                        maxHeight: 200,
                        objectFit: "cover",
                        borderRadius: 12,
                      }}
                    />
                  ) : null}
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
                      {ex.category}: {formatPkr(ex.amountPkr)}{" "}
                      {ex.note ? `— ${ex.note}` : ""}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <p className="meta">
              Your farm is awaiting admin verification before you can list animals.
              Ask admin@herdshare.pk to approve it.
            </p>
          )}
        </>
      )}
    </DashboardShell>
  );
}
