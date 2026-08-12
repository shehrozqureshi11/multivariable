"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/lib/auth";

export function SiteHeader() {
  const { auth, ready } = useAuth();
  const [open, setOpen] = useState(false);

  const dashboardHref =
    auth?.user.role === "ADMIN"
      ? "/dashboard/admin"
      : auth?.user.role === "FARM_OWNER"
        ? "/dashboard/farm"
        : "/dashboard/investor";

  const displayName = auth?.user.fullName?.trim().split(/\s+/)[0] || "Account";

  const links = (
    <>
      <Link href="/marketplace" onClick={() => setOpen(false)}>
        Marketplace
      </Link>
      <Link href="/farms" onClick={() => setOpen(false)}>
        Farms
      </Link>
      <Link href="/how-it-works" onClick={() => setOpen(false)}>
        How it works
      </Link>
      {!ready ? null : auth ? (
        <>
          <Link href={dashboardHref} onClick={() => setOpen(false)}>
            Dashboard
          </Link>
          <Link
            href={dashboardHref}
            className="btn btn-primary header-user"
            title={auth.user.fullName}
            onClick={() => setOpen(false)}
          >
            {displayName}
          </Link>
        </>
      ) : (
        <>
          <Link href="/login" onClick={() => setOpen(false)}>
            Log in
          </Link>
          <Link
            href="/register"
            className="btn btn-primary"
            onClick={() => setOpen(false)}
          >
            Register
          </Link>
        </>
      )}
    </>
  );

  return (
    <header className="site-header">
      <div className="container nav">
        <Link href="/" className="brand">
          <span className="brand-mark" aria-hidden />
          Herd<span>Share</span>
        </Link>
        <nav className="nav-links" aria-label="Primary">
          {links}
        </nav>
        <button
          type="button"
          className="nav-toggle"
          aria-label="Menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
      {open ? (
        <div className="mobile-nav container" role="dialog" aria-label="Mobile menu">
          {links}
        </div>
      ) : null}
    </header>
  );
}
