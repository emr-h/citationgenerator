'use client';
import { useState } from 'react';

export default function Home() {
  const [url, setUrl] = useState('');
  const [style, setStyle] = useState('harvard-cite-them-right');
  const [out, setOut] = useState<{ inText: string; reference: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState("auto");


  async function handleGo() {
    if (!url) return;
    setLoading(true);
    setOut(null);

    try {
      const r = await fetch(
        `http://localhost:4000/api/cite?url=${encodeURIComponent(url)}&style=${style}&method=${method}`
      );
      const j = await r.json();
      setOut(j);
    } catch (err) {
      setOut({
        inText: '❌ Failed to fetch citation.',
        reference: 'Please check the URL.'
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-100 to-white p-6">
      <div className="max-w-2xl mx-auto mt-20 bg-white shadow-xl rounded-2xl p-8">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-6">
          Auto Citation Generator
        </h1>

        <div className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Paste article URL..."
            className="p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:outline-none text-gray-800"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />

          <select
            className="p-3 rounded-lg border border-gray-300 bg-white text-gray-800 focus:ring-2 focus:ring-blue-400 focus:outline-none"
            value={style}
            onChange={(e) => setStyle(e.target.value)}
          >
            <option value="harvard-cite-them-right">Harvard</option>
            <option value="apa">APA 7</option>
            <option value="mla">MLA 9</option>
            <option value="chicago-author-date">Chicago Author-Date</option>
          </select>

          <select
            className="p-3 rounded-lg border border-gray-300 bg-white text-gray-800 focus:ring-2 focus:ring-blue-400 focus:outline-none"
            value={method}
            onChange={(e) => setMethod(e.target.value)}
          >
            <option value="auto">Auto (Recommended)</option>
            <option value="citation-js">Citation-JS</option>
            <option value="scrape">Scrape Metadata</option>
            <option value="ai">AI (Groq)</option>
          </select>

          <button
            onClick={handleGo}
            disabled={loading}
            className={`transition-all px-6 py-3 rounded-lg text-white font-semibold ${loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 active:scale-95'
              }`}
          >
            {loading ? 'Generating...' : 'Generate Citation'}
          </button>
        </div>

        {out !== null && (
          <div className="mt-8 bg-gray-100 border border-gray-300 rounded-lg p-5">
            <h2 className="text-lg font-semibold mb-2 text-gray-700">Generated Citation</h2>

            <p className="text-sm text-gray-700 mb-2">
              <span className="font-semibold">In-text:</span> {out.inText}
            </p>

            <div className="text-sm text-gray-900 prose prose-sm">
              <span className="font-semibold">Full Reference:</span>
              <div
                dangerouslySetInnerHTML={{ __html: out.reference }}
                className="mt-1"
              />
            </div>

            <button
              onClick={() =>
                navigator.clipboard.writeText(`${out.inText} - ${out.reference.replace(/<[^>]+>/g, '')}`)
              }
              className="mt-3 text-sm text-blue-600 hover:underline"
            >
              Copy Both
            </button>
          </div>
        )}

      </div>
    </main>
  );
}
