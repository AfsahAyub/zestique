
"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(data.error || "Invalid username or password.");
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("Login nahi ho saka. Dobara try karein.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#102B23] px-5 py-12">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#315444_0%,_#102B23_65%)]" />

      <div className="relative w-full max-w-md rounded-2xl border border-[#C6A46A]/40 bg-[#F6F0E6] px-7 py-10 shadow-2xl sm:px-12">
        <div className="text-center">
          <h1 className="font-serif text-5xl font-semibold tracking-wide text-[#18382F]">
            Zestique<span className="text-[#C6A46A]">.</span>
          </h1>

          <p className="mt-3 text-xs font-semibold tracking-[0.3em] text-[#A47D45]">
            WHERE FLAVOR MEETS ELEGANCE
          </p>

          <div className="mx-auto my-7 h-px w-16 bg-[#C6A46A]" />

          <h2 className="font-serif text-3xl text-[#49362C]">
            Welcome Back
          </h2>

          <p className="mt-2 text-sm text-[#756D62]">
            Please login to continue
          </p>
        </div>

        <form onSubmit={handleLogin} className="mt-9 space-y-6">
          <div>
            <label className="mb-2 block text-sm font-semibold text-[#49362C]">
              Username
            </label>

            <input
              type="text"
              value={username}
              onChange={(e) =>
                setUsername(
                  (e.target as unknown as { value: string }).value
                )
              }
              placeholder="Enter your username"
              autoComplete="username"
              required
              className="w-full rounded-lg border border-[#D8CBB9] bg-white px-4 py-4 text-sm text-[#18382F] outline-none transition focus:border-[#A47D45] focus:ring-2 focus:ring-[#C6A46A]/20"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-[#49362C]">
              Password
            </label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) =>
                  setPassword(
                    (e.target as unknown as { value: string }).value
                  )
                }
                placeholder="Enter your password"
                autoComplete="current-password"
                required
                className="w-full rounded-lg border border-[#D8CBB9] bg-white px-4 py-4 pr-12 text-sm text-[#18382F] outline-none transition focus:border-[#A47D45] focus:ring-2 focus:ring-[#C6A46A]/20"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#756D62] hover:text-[#18382F]"
              >
                {showPassword ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-5 w-5">
                    <path d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8M9.9 5.2A10.8 10.8 0 0112 5c5 0 9 5 9 7a9.7 9.7 0 01-2.1 3.1M6.2 6.2C3.5 7.8 2 10.5 2 12c0 2 4 7 10 7a10 10 0 003.3-.6" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-5 w-5">
                    <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {error && (
            <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#18382F] py-4 text-sm font-bold tracking-[0.2em] text-[#F6F0E6] transition hover:bg-[#285043] disabled:opacity-60"
          >
            {loading ? "PLEASE WAIT..." : "LOGIN"}
          </button>
        </form>

        <p className="mt-8 text-center text-xs tracking-wider text-[#A47D45]">
          © 2026 ZESTIQUE. ALL RIGHTS RESERVED.
        </p>
      </div>
    </main>
  );
}
