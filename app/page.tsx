import Link from "next/link";

export default function Home() {
  return (
    <main style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1>SeedMoney App mounted at /app</h1>
      <p>
        Smoke test: verify the root and a deep link refresh both work under the
        base path.
      </p>
      <p>
        <Link href="/health">Go to /app/health</Link>
      </p>
    </main>
  );
}
