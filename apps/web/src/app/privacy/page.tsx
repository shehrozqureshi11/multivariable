import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 720 }}>
        <h1>Privacy Policy</h1>
        <p>
          We collect account details, KYC documents, farm and animal data,
          investment and payment records to operate the platform. Data is stored
          in Supabase PostgreSQL and protected with access controls, hashing, and
          audit logs.
        </p>
        <p>
          We do not sell personal data. Contact the platform admin to request
          access or deletion subject to legal retention requirements.
        </p>
      </div>
    </section>
  );
}
