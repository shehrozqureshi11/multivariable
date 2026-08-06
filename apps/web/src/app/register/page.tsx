"use client";

import { Suspense } from "react";
import RegisterForm from "./RegisterForm";

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="container auth-shell">Loading…</div>}>
      <RegisterForm />
    </Suspense>
  );
}
