"use client";

import { useState, useEffect } from "react";

export default function Home() {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/hello")
      .then((res) => res.json())
      .then((data) => setMessage(data.message));
  }, []);

  return (
    <main style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
      <h1 style={{ fontSize: "3rem" }}>{message ?? "Cargando..."}</h1>
    </main>
  );
}
