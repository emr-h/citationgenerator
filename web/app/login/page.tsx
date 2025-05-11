'use client'; // ✅ Must be the first line

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode'; // ✅ Import the decoder

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    const res = await fetch('http://localhost:4000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (res.ok && data.token) {
      localStorage.setItem('token', data.token); // ✅ Save token

      // ✅ Decode token and save username (if included)
      const decoded = jwtDecode<{ userId: number; username?: string }>(data.token);
      if (decoded.username) {
        localStorage.setItem('username', decoded.username);
      } else {
        localStorage.setItem('username', username); // fallback
      }

      router.push('/history'); // ✅ Redirect
    } else {
      setError(data.error || 'Login failed');
    }
  };

  return (
    <main className="max-w-md mx-auto mt-20 bg-white p-8 rounded-xl shadow">
      <h1 className="text-2xl font-bold mb-4">Login</h1>

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

      {error && <p className="text-red-500 mb-2">{error}</p>}

      <button
        onClick={handleLogin}
        className="bg-blue-600 text-white px-4 py-2 rounded w-full"
      >
        Login
      </button>
    </main>
  );
}
