"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";
import { clearAuth, useAuth } from "@/lib/auth";

export function DashboardShell({
  role,
  children,
}: {
  role: "INVESTOR" | "FARM_OWNER" | "ADMIN";
  children: ReactNode;
}) {
  const { auth, ready } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!ready) return;
    if (!auth) {
      router.replace(`/login?next=${encodeURIComponent(pathname || "/dashboard")}`);
      return;
    }
    if (auth.user.role !== role) {
      if (auth.user.role === "ADMIN") router.replace("/dashboard/admin");
      else if (auth.user.role === "FARM_OWNER") router.replace("/dashboard/farm");
      else router.replace("/dashboard/investor");
    }
  }, [auth, ready, role, router, pathname]);

  if (!ready || !auth || auth.user.role !== role) {
    return <div className="container dash-shell">Loading dashboard…</div>;
  }

  const links =
    role === "INVESTOR"
      ? [
          { href: "/dashboard/investor", label: "Portfolio" },
          { href: "/marketplace", label: "Marketplace" },
        ]
      : role === "FARM_OWNER"
        ? [
            { href: "/dashboard/farm", label: "My farm" },
            { href: "/marketplace", label: "Marketplace" },
          ]
        : [
            { href: "/dashboard/admin", label: "Overview" },
            { href: "/marketplace", label: "Marketplace" },
          ];

  return (
    <div className="container dash-shell">
      <div className="dash-layout">
        <aside className="dash-nav">
          <p style={{ fontWeight: 700, margin: "0 0 0.75rem" }}>{auth.user.fullName}</p>
          <p className="meta" style={{ marginTop: 0 }}>
            {auth.user.role.replace("_", " ")}
          </p>
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={pathname === l.href ? "active" : undefined}
            >
              {l.label}
            </Link>
          ))}
          <button
            className="btn btn-secondary"
            style={{ marginTop: "1rem", width: "100%" }}
            onClick={() => {
              clearAuth();
              router.push("/");
            }}
          >
            Log out
          </button>
        </aside>
        <div>{children}</div>
      </div>
    </div>
  );
}
