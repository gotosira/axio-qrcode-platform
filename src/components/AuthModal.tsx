"use client";
import { useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import Modal from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { toast } from "sonner";

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
      toast.success(mode === "signup" ? "Account created" : "Signed in");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
      toast.error(err.message || "Error");
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
      <Button size="sm" onClick={() => setOpen(true)}>Sign in</Button>
      <Modal open={open} onClose={() => setOpen(false)}>
          <div className="w-full p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">
                {mode === "login" ? "Sign in" : "Create account"}
              </h2>
              <button onClick={() => setOpen(false)}>✕</button>
            </div>
            <div className="flex gap-2 text-sm">
              <Button variant={mode === "login" ? "primary" : "secondary"} size="sm" onClick={() => setMode("login")}>Login</Button>
              <Button variant={mode === "signup" ? "primary" : "secondary"} size="sm" onClick={() => setMode("signup")}>Sign up</Button>
            </div>
            <form onSubmit={onSubmit} className="space-y-3">
              {mode === "signup" && (
                <Input placeholder="Name (optional)" value={name} onChange={(e) => setName(e.target.value)} name="name" autoComplete="name" />
              )}
              <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required name="email" autoComplete="email" />
              <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required name={mode === "login" ? "current-password" : "new-password"} autoComplete={mode === "login" ? "current-password" : "new-password"} />
              {error && <p className="text-sm text-red-600">{error}</p>}
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}
              </Button>
            </form>
          </div>
      </Modal>
    </div>
  );
}


