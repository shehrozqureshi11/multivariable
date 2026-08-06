import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <strong className="brand">HerdShare</strong>
          <p>Transparent livestock investment for Pakistan.</p>
        </div>
        <div>
          <Link href="/terms">Terms</Link>
          {" · "}
          <Link href="/privacy">Privacy</Link>
          {" · "}
          <Link href="/marketplace">Marketplace</Link>
        </div>
        <p>© {new Date().getFullYear()} HerdShare. Independent legal & Shariah review recommended before production launch.</p>
      </div>
    </footer>
  );
}
