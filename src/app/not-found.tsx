import Link from "next/link";

export default function NotFound() {
  return <main className="not-found">
    <p className="eyebrow">The Color Book · 404</p>
    <h1>A page beyond the collection.</h1>
    <p>There are 348 combinations in this book.<br />A new one is waiting for you today.</p>
    <Link href="/">Open today’s page →</Link>
  </main>;
}
