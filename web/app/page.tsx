'use client';
import { useEffect, useState } from 'react';

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

      const token = localStorage.getItem('token');
      if (token) {
        const response = await fetch('http://localhost:4000/api/saveCitation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            url,
            style,
            method,
            inText: j.inText,
            fullReference: j.reference
          })
        });

        const saveResult = await response.json();
        console.log("📦 Save response:", saveResult);
      } else {
        console.log("⚠️ No token found. User might not be logged in.");
      }

    } catch (err) {
      setOut({
        inText: '❌ Failed to fetch citation.',
        reference: 'Please check the URL.'
      });
    } finally {
      setLoading(false);
    }
  }

  const handlePaste = async () => {
    const text = await navigator.clipboard.readText();
    setUrl(text);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-100 to-white p-8">
      <div className="max-w-6xl mx-auto bg-white shadow-2xl rounded-3xl p-10">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">
          Auto Citation Generator
        </h1>

        {/* Input + Paste */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <input
            type="text"
            placeholder="Paste article URL..."
            className="flex-1 p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:outline-none text-gray-800"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <button
            onClick={handlePaste}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-700 font-semibold transition"
          >
            📋 Paste
          </button>
        </div>

        {/* Style & Method */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
            className={`w-full transition-all px-6 py-3 rounded-lg text-white font-semibold ${loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 active:scale-95'
              }`}
          >
            {loading ? 'Generating...' : 'Generate Citation'}
          </button>
        </div>

        {/* Output */}
        {out !== null && (
          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* In-text */}
            <div className="bg-white border border-gray-200 shadow-md rounded-xl p-6">
              <h3 className="text-xl font-semibold text-gray-700 mb-3">In-text Citation</h3>
              <p className="bg-gray-100 p-4 rounded-md font-mono text-gray-800 break-words whitespace-pre-wrap">
                {out.inText}
              </p>
              <button
                onClick={() => navigator.clipboard.writeText(out.inText)}
                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-lg font-medium transition"
              >
                📋 Copy In-text
              </button>
            </div>

            {/* Reference */}
            <div className="bg-white border border-gray-200 shadow-md rounded-xl p-6">
              <h3 className="text-xl font-semibold text-gray-700 mb-3">Full Reference</h3>
              {out.reference && (
                <>
                  <div
                    className="bg-gray-100 p-4 rounded-md font-mono text-gray-800 break-words whitespace-pre-wrap min-h-[150px]"
                    dangerouslySetInnerHTML={{
                      __html: out.reference
                        ?.replace(/^\s*<[^>]*>\s*/g, '')
                        ?.replace(/^\s+|\s+$/g, '')
                        ?.replace(/(\r\n|\n|\r){2,}/g, '\n')
                    }}
                  />
                  <button
                    onClick={() =>
                      navigator.clipboard.writeText(out.reference?.replace(/<[^>]+>/g, '') || '')
                    }
                    className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-lg font-medium transition"
                  >
                    📋 Copy Reference
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
