"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";

export function SiteHeader() {
  const { auth, ready } = useAuth();

  const dashboardHref = !auth
    ? "/login"
    : auth.user.role === "ADMIN"
      ? "/dashboard/admin"
      : auth.user.role === "FARM_OWNER"
        ? "/dashboard/farm"
        : "/dashboard/investor";

  return (
    <header className="site-header">
      <div className="container nav">
        <Link href="/" className="brand">
          HerdShare
        </Link>
        <nav className="nav-links" aria-label="Primary">
          <Link href="/marketplace">Marketplace</Link>
          <Link href="/farms">Farms</Link>
          <Link href="/how-it-works">How it works</Link>
          <Link href="/register?role=FARM_OWNER" className="btn btn-secondary">
            Register farm
          </Link>
          {ready && auth ? (
            <>
              <Link href={dashboardHref}>Dashboard</Link>
              <Link href="/login" className="btn btn-primary">
                {auth.user.fullName.split(" ")[0]}
              </Link>
            </>
          ) : (
            <>
              <Link href="/login">Log in</Link>
              <Link href="/register?role=INVESTOR" className="btn btn-primary">
                Start investing
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
