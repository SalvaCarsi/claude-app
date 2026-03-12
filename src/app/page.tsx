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
    <main className="flex justify-center items-center min-h-screen">
      <h1 className="text-5xl">{message ?? "Cargando..."}</h1>
    </main>
  );
}
