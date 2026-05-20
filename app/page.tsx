"use client";

import { useState } from "react";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function generateImage() {
    setLoading(true);
    setError("");
    setImageBase64(null);

    try {
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Fehler bei der Bildgenerierung.");
      }

      setImageBase64(data.imageBase64);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unbekannter Fehler.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Mission GCC Image Agent</h1>
          <p className="mt-2 text-zinc-400">
            Gemini/Imagen-basierter Bild-Agent, deployed über GitHub und Vercel .
          </p>
        </div>

        <textarea
          className="w-full rounded-xl border border-zinc-700 bg-zinc-900 p-4 text-white outline-none"
          rows={5}
          placeholder="Beschreibe das Bild, das der Agent erzeugen soll..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />

        <button
          onClick={generateImage}
          disabled={loading || !prompt.trim()}
          className="rounded-xl bg-white px-5 py-3 font-medium text-black disabled:opacity-50"
        >
          {loading ? "Generiere..." : "Bild generieren"}
        </button>

        {error && (
          <div className="rounded-xl border border-red-800 bg-red-950 p-4 text-red-200">
            {error}
          </div>
        )}

        {imageBase64 && (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
            <img
              src={`data:image/png;base64,${imageBase64}`}
              alt="Generiertes Bild"
              className="w-full rounded-xl"
            />
          </div>
        )}
      </div>
    </main>
  );
}