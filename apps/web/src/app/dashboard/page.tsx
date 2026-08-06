"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

/** Routes each role to the correct dashboard. */
export default function DashboardIndex() {
  const { auth, ready } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;
    if (!auth) {
      router.replace("/login?next=/dashboard");
      return;
    }
    if (auth.user.role === "ADMIN") router.replace("/dashboard/admin");
    else if (auth.user.role === "FARM_OWNER") router.replace("/dashboard/farm");
    else router.replace("/dashboard/investor");
  }, [auth, ready, router]);

  return <div className="container dash-shell">Opening your dashboard…</div>;
}
