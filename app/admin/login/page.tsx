"use client";

import { useState, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const from         = searchParams.get("from") ?? "/admin";

  const [step,    setStep]    = useState<"credentials" | "security">("credentials");
  const [email,   setEmail]   = useState("");
  const [secret,  setSecret]  = useState("");
  const [answer,  setAnswer]  = useState("");
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCredentials(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, secret }),
      });
      const data = await res.json();
      if (res.ok && data.step === "security_question") {
        setStep("security");
      } else {
        setError(data.error ?? "Invalid credentials");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  async function handleSecurityAnswer(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ securityAnswer: answer }),
      });
      if (res.ok) {
        router.push(from);
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error ?? "Incorrect answer");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  const inputCls = "w-full rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200";

  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
        <div className="mb-6 text-center">
          <span className="text-4xl">{step === "credentials" ? "🔐" : "🛡️"}</span>
          <h1 className="mt-2 text-2xl font-extrabold text-slate-900">Admin Login</h1>
          <p className="mt-1 text-sm text-slate-500">
            {step === "credentials"
              ? "Sign in with your admin credentials"
              : "Security verification – Step 2 of 2"}
          </p>
        </div>

        {/* Step indicator */}
        <div className="mb-6 flex items-center gap-2">
          <div className={`flex-1 h-1.5 rounded-full ${step === "credentials" ? "bg-blue-600" : "bg-green-500"}`} />
          <div className={`flex-1 h-1.5 rounded-full ${step === "security" ? "bg-blue-600" : "bg-slate-200"}`} />
        </div>

        {step === "credentials" ? (
          <form onSubmit={handleCredentials} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
                className={inputCls}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
              <input
                type="password"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                placeholder="••••••••••••"
                required
                className={inputCls}
              />
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-blue-600 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {loading ? "Verifying…" : "Continue →"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSecurityAnswer} className="space-y-4">
            <div className="rounded-xl bg-blue-50 p-4 text-sm text-blue-800">
              <p className="font-semibold">Security Question</p>
              <p className="mt-1">Who is your 1st love?</p>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Your Answer</label>
              <input
                type="password"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Enter your answer"
                required
                autoFocus
                className={inputCls}
              />
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-blue-600 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {loading ? "Verifying…" : "Sign In"}
            </button>

            <button
              type="button"
              onClick={() => { setStep("credentials"); setError(""); setAnswer(""); }}
              className="w-full rounded-xl border border-slate-300 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              ← Back
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
