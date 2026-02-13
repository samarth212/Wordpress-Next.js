import Image from "next/image";

export default function Home() {
  return (
    <main style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1>Next app is mounted under /app</h1>
      <p>If you can see this at https://yourdomain.com/app, it worked.</p>
    </main>
  );
}
