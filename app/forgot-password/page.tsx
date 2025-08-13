"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const router = useRouter();

  const handleForgotPassword = async () => {
    if (!email) return;
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      // Responder igual aunque el email no exista (anti-enumeración)
      setMsg("Si el email existe, te enviaremos instrucciones para restablecer tu contraseña.");
      if (res.ok) {
        // espera 2–3s o muestra un link a Login
        setTimeout(() => router.push("/login"), 2000);
      }
    } catch {
      setMsg("Si el email existe, te enviaremos instrucciones para restablecer tu contraseña.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-lg">
        <h2 className="text-2xl font-semibold text-center mb-6">Recuperar contraseña</h2>
        <input
          type="email"
          placeholder="Introduce tu email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 mb-4 border rounded-lg"
        />
        <button
          onClick={handleForgotPassword}
          disabled={!email || busy}
          className="w-full bg-blue-500 text-white py-2 rounded-lg disabled:opacity-50"
        >
          {busy ? "Enviando..." : "Enviar instrucciones"}
        </button>
        {msg && <p className="mt-4 text-center text-green-600">{msg}</p>}
      </div>
    </div>
  );
}
