'use client';
import { useEffect, useState } from 'react';

// ✅ Add this type to tell TypeScript what each citation looks like
type Citation = {
  in_text: string;
  full_reference: string;
};

export default function HistoryPage() {
  // ✅ Use the type for your state array
  const [history, setHistory] = useState<Citation[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');

    fetch('http://localhost:4000/api/history', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("📥 History API response:", data);  // ✅ log response
        setHistory(Array.isArray(data) ? data : []);
      })
      .catch(() => setError('Failed to fetch history'));
  }, []);

  return (
    <main className="max-w-4xl mx-auto mt-10 p-6">
      <h1 className="text-3xl font-bold mb-4">Your Citation History</h1>
      {error && <p className="text-red-600">{error}</p>}
      <ul className="space-y-4">
        {history.map((item, i) => (
          <li key={i} className="bg-gray-100 p-4 rounded-lg shadow">
            <p className="font-mono break-words">{item.in_text}</p>
            <div
              dangerouslySetInnerHTML={{ __html: item.full_reference }}
              className="prose prose-sm mt-2"
            />
          </li>
        ))}
      </ul>
    </main>
  );
}
