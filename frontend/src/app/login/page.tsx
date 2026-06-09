"use client";

import { useState, useId } from "react";
import { useRouter } from "next/navigation";
import { loginUser, registerUser } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";

type Tab = "login" | "register";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

export default function LoginPage() {
  const router = useRouter();
  const storeLogin = useAuthStore((s) => s.login);

  const [tab, setTab] = useState<Tab>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const emailId = useId();
  const passwordId = useId();

  function validate(): string | null {
    if (!email || !emailRegex.test(email)) return "E-mail inválido.";
    if (!passwordRegex.test(password))
      return "Senha precisa ter mínimo 8 caracteres, 1 maiúscula e 1 número.";
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      if (tab === "login") {
        const { access_token } = await loginUser(email, password);
        storeLogin(access_token);
        router.push("/");
      } else {
        await registerUser(email, password);
        setSuccess("Conta criada! Faça login para continuar.");
        setTab("login");
        setPassword("");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0d0f14] relative overflow-hidden">
      {/* Orbit decorations */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(212,175,55,0.12) 0%, transparent 70%)",
        }}
      />
      <OrbitRings />

      <div className="relative z-10 w-full max-w-sm mx-4">
        {/* Logo */}
        <div className="text-center mb-8">
          <span
            className="text-4xl font-bold tracking-tight text-[#e8d5a3]"
            style={{ fontFamily: "'DM Serif Display', 'Georgia', serif" }}
          >
            Orbita
          </span>
          <p className="mt-1 text-sm text-[#6b7280]">
            Organização pessoal, em órbita.
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#13161d] border border-[#1f2330] rounded-2xl shadow-2xl p-8">
          {/* Tabs */}
          <div className="flex mb-6 bg-[#0d0f14] rounded-lg p-1">
            {(["login", "register"] as Tab[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setTab(t);
                  setError(null);
                  setSuccess(null);
                }}
                className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                  tab === t
                    ? "bg-[#1f2330] text-[#e8d5a3] shadow-sm cursor-pointer"
                    : "text-[#6b7280] hover:text-[#9ca3af] cursor-pointer"
                }`}
              >
                {t === "login" ? "Entrar" : "Criar conta"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Email */}
            <div>
              <label
                htmlFor={emailId}
                className="block text-xs font-medium text-[#9ca3af] mb-1.5"
              >
                E-mail
              </label>
              <input
                id={emailId}
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full bg-[#0d0f14] border border-[#1f2330] rounded-lg px-3.5 py-2.5 text-sm text-[#e5e7eb] placeholder-[#374151] focus:outline-none focus:border-[#a88a3d] focus:ring-1 focus:ring-[#a88a3d] transition-colors"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor={passwordId}
                className="block text-xs font-medium text-[#9ca3af] mb-1.5"
              >
                Senha
              </label>
              <div className="relative">
                <input
                  id={passwordId}
                  type={showPassword ? "text" : "password"}
                  autoComplete={
                    tab === "login" ? "current-password" : "new-password"
                  }
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#0d0f14] border border-[#1f2330] rounded-lg px-3.5 py-2.5 pr-10 text-sm text-[#e5e7eb] placeholder-[#374151] focus:outline-none focus:border-[#a88a3d] focus:ring-1 focus:ring-[#a88a3d] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-[#4b5563] hover:text-[#9ca3af] transition-colors"
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </div>

            {/* Feedback */}
            {error && (
              <p role="alert" className="text-xs text-red-400 pt-1">
                {error}
              </p>
            )}
            {success && (
              <p role="status" className="text-xs text-green-400 pt-1">
                {success}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-[#a88a3d] hover:bg-[#c4a24a] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer text-[#0d0f14] font-semibold text-sm py-2.5 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
            >
              {loading && <Spinner />}
              {tab === "login" ? "Entrar" : "Criar conta"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function OrbitRings() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center">
      {[320, 480, 640].map((size, i) => (
        <div
          key={size}
          className="absolute rounded-full border border-[#1a1e2a]"
          style={{
            width: size,
            height: size,
            opacity: 0.6 - i * 0.15,
          }}
        />
      ))}
      {/* Dot on orbit */}
      <div
        className="absolute w-2 h-2 rounded-full bg-[#a88a3d]"
        style={{ transform: "translate(160px, -40px)" }}
      />
      <div
        className="absolute w-1.5 h-1.5 rounded-full bg-[#4b5563]"
        style={{ transform: "translate(-200px, 60px)" }}
      />
    </div>
  );
}

function Eye() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOff() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
    </svg>
  );
}
