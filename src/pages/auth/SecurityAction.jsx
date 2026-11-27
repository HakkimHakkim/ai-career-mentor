import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

const API = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export default function SecurityAction({ reset = false }) {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (reset || !token) return;
    let active = true;
    fetch(`${API}/api/v1/auth/verify-email/${encodeURIComponent(token)}`, { method: 'POST' })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data?.detail || 'This verification link is invalid or expired.');
        if (active) setMessage('Your email is verified. You can sign in now.');
      })
      .catch((err) => { if (active) setError(err.message); });
    return () => { active = false; };
  }, [reset, token]);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const response = await fetch(`${API}/api/v1/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.detail || 'This reset link is invalid or expired.');
      setMessage('Your password has been changed. You can sign in now.');
    } catch (err) {
      setError(err.message || 'Unable to reset your password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#173B32] px-5 text-[#173B32]">
      <section className="w-full max-w-md rounded-2xl bg-[#FFFDF8] p-8 shadow-xl">
        <h1 className="text-2xl font-bold">{reset ? 'Choose a new password' : 'Email verification'}</h1>
        <p className="mt-2 text-sm text-[#66736B]">{reset ? 'Use at least 8 characters, including an uppercase letter and a number.' : 'We are checking your verification link.'}</p>
        {reset && <form onSubmit={submit} className="mt-6 space-y-4">
          <input type="password" autoComplete="new-password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="New password" className="h-12 w-full rounded-lg border border-[#DED8CC] bg-white px-4" />
          <button disabled={loading || !token} className="w-full rounded-lg bg-[#D66A4A] px-4 py-3 font-semibold text-white disabled:opacity-50">{loading ? 'Updating…' : 'Reset password'}</button>
        </form>}
        {message && <p role="status" className="mt-5 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">{message}</p>}
        {error && <p role="alert" className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}
        <Link to="/login" className="mt-6 inline-block text-sm font-semibold text-[#D66A4A]">Back to sign in</Link>
      </section>
    </main>
  );
}
