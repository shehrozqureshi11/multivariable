import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  robots: { index: true, follow: true },
};

export default function TermsPage() {
  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 720 }}>
        <h1>Terms of Service</h1>
        <p>
          HerdShare is a technology platform connecting investors with livestock
          farm owners. Livestock investments carry market and mortality risk.
          This MVP is for demonstration; production launch requires independent
          legal and Shariah review and local regulatory compliance.
        </p>
        <p>
          Digital agreements accepted on the platform record consent to share
          terms presented at the time of investment. Payment providers and
          insurance options may be integrated in future releases.
        </p>
      </div>
    </section>
  );
}
