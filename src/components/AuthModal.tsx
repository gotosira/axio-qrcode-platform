"use client";
import { useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";

export default function AuthModal() {
  // Guard against missing provider during certain prerendered routes
  const sessionApi = typeof useSession === "function" ? useSession() : undefined;
  const session = sessionApi?.data as any;
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === "signup") {
        const res = await fetch("/api/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, name }),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || "Signup failed");
        }
      }
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (res?.error) throw new Error(res.error);
      setOpen(false);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (session?.user) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm">{session.user.email}</span>
        <button
          className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-sm"
          onClick={() => signOut()}
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div>
      <button
        className="px-3 py-1 rounded bg-black text-white text-sm"
        onClick={() => setOpen(true)}
      >
        Sign in
      </button>
      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-md w-full max-w-sm p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">
                {mode === "login" ? "Sign in" : "Create account"}
              </h2>
              <button onClick={() => setOpen(false)}>✕</button>
            </div>
            <div className="flex gap-2 text-sm">
              <button
                className={`px-2 py-1 rounded ${mode === "login" ? "bg-gray-900 text-white" : "bg-gray-100"}`}
                onClick={() => setMode("login")}
              >
                Login
              </button>
              <button
                className={`px-2 py-1 rounded ${mode === "signup" ? "bg-gray-900 text-white" : "bg-gray-100"}`}
                onClick={() => setMode("signup")}
              >
                Sign up
              </button>
            </div>
            <form onSubmit={onSubmit} className="space-y-3">
              {mode === "signup" && (
                <input
                  placeholder="Name (optional)"
                  className="w-full border rounded px-3 py-2"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  name="name"
                  autoComplete="name"
                />
              )}
              <input
                type="email"
                placeholder="Email"
                className="w-full border rounded px-3 py-2"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                name="email"
                autoComplete="email"
              />
              <input
                type="password"
                placeholder="Password"
                className="w-full border rounded px-3 py-2"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                name={mode === "login" ? "current-password" : "new-password"}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
              />
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white rounded py-2"
              >
                {loading ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


