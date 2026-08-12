import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <strong className="brand">
            <span className="brand-mark" aria-hidden />
            Herd<span>Share</span>
          </strong>
          <p>Transparent livestock investment for Pakistan.</p>
        </div>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <Link href="/terms">Terms</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/marketplace">Marketplace</Link>
          <Link href="/register">Register</Link>
        </div>
        <p>
          © {new Date().getFullYear()} HerdShare. Independent legal & Shariah
          review recommended before production launch.
        </p>
      </div>
    </footer>
  );
}
