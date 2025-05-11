// ✅ GLOBAL NAVBAR + STYLING IMPROVEMENTS (Tailwind CSS required)

'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [username, setUsername] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem('username');
    if (stored) {
      setUsername(stored);
    } else {
      const current = window.location.pathname;
      if (current !== '/' && !current.startsWith('/login') && !current.startsWith('/register')) {
        router.push('/login');
      }
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setUsername(null);
    router.push('/login');
  };

  return (
    <>
      {/* ✅ Modern NavBar */}
      <header className="bg-gradient-to-r from-blue-800 to-indigo-800 text-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold tracking-wide">📚 Citation Generator</Link>
          <nav className="flex items-center gap-6 text-sm">
            {username && (
              <>
                <span className="text-gray-200">Logged in as <strong>{username}</strong></span>
                <button
                  onClick={handleLogout}
                  className="text-red-300 hover:text-white font-medium transition"
                >
                  Logout
                </button>
              </>
            )}
            {!username && (
              <>
                <Link href="/login" className="hover:text-yellow-300 transition">Login</Link>
                <Link href="/register" className="hover:text-yellow-300 transition">Register</Link>
              </>
            )}
            <Link href="/" className="hover:text-yellow-300 transition">Home</Link>
            <Link href="/history" className="hover:text-yellow-300 transition">History</Link>
          </nav>
        </div>
      </header>

      {/* ✅ Page Content */}
      <main className="max-w-6xl mx-auto px-4 py-8 text-gray-800">
        {children}
      </main>
    </>
  );
}
