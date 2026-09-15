"use client";

import { FormEvent, Suspense, useState } from "react";
import { LockKeyhole } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    const response = await fetch(`/api/auth/${mode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    if (!response.ok) {
      const result = await response.json();
      setError(result.error || "Unable to sign in.");
      setSubmitting(false);
      return;
    }

    const next = searchParams.get("next");
    router.replace(next?.startsWith("/admin") ? next : "/admin");
    router.refresh();
  }

  return (
    <main className="admin-login-page">
      <form className="admin-login-card" onSubmit={login}>
        <div className="login-mark"><LockKeyhole size={24} /></div>
        <span>THIEAB KA</span>
        <h1>{mode === "login" ? "ចូលគណនី" : "បង្កើតគណនី"}</h1>
        <p>{mode === "login" ? "Log in to manage your wedding" : "Create your wedding workspace"}</p>
        <div className="login-tabs">
          <button type="button" className={mode === "login" ? "active" : ""} onClick={() => { setMode("login"); setError(""); }}>ចូលគណនី</button>
          <button type="button" className={mode === "signup" ? "active" : ""} onClick={() => { setMode("signup"); setError(""); }}>ចុះឈ្មោះ</button>
        </div>
        <label>
          ឈ្មោះអតិថិជន
          <input
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            autoComplete="name"
            placeholder="your name"
            autoFocus
            required
          />
        </label>
        <label>
          ពាក្យសម្ងាត់
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
          />
        </label>
        {error && <div className="login-error">{error}</div>}
        <button className="primary-button" disabled={submitting}>
          {submitting ? "កំពុងដំណើរការ..." : mode === "login" ? "ចូល Dashboard" : "បង្កើតគណនី"}
        </button>
      </form>
    </main>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<main className="center-screen">កំពុងរៀបចំ...</main>}>
      <LoginForm />
    </Suspense>
  );
}
