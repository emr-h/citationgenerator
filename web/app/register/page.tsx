'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleRegister = async () => {
    const res = await fetch('http://localhost:4000/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();
    if (res.ok) router.push('/login');
    else setError(data.error);
  };

  return (
    <main className="max-w-md mx-auto mt-20 bg-white p-8 rounded-xl shadow">
      <h1 className="text-2xl font-bold mb-4">Register</h1>
      <input
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="mb-3 p-2 w-full border rounded"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="mb-3 p-2 w-full border rounded"
      />
      {error && <p className="text-red-500">{error}</p>}
      <button onClick={handleRegister} className="bg-blue-600 text-white px-4 py-2 rounded w-full">
        Register
      </button>
    </main>
  );
}
