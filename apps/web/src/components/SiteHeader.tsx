import Link from "next/link";

export function SiteHeader() {
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
          <Link href="/login">Log in</Link>
          <Link href="/register" className="btn btn-primary">
            Start investing
          </Link>
        </nav>
      </div>
    </header>
  );
}
