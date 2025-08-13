"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errorLoc, setErrorLoc] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [token, setToken] = useState<string | null>(null);
  const [ref, setRef] = useState<string | null>(null); // 🔹 si tu API lo usa

  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenFromUrl = params.get("token");
    const refFromUrl = params.get("ref"); // 🔹 si está en el enlace
    if (!tokenFromUrl /* || !refFromUrl */) {
      setErrorLoc("Token no válido o faltante");
    } else {
      setToken(tokenFromUrl);
      setRef(refFromUrl);
    }
  }, []);

  const handleResetPassword = async () => {
    setErrorLoc(null);
    setMessage(null);

    if (!token /* || !ref */) {
      setErrorLoc("Enlace inválido.");
      return;
    }
    if (password.length < 8) {
      setErrorLoc("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (password !== confirm) {
      setErrorLoc("Las contraseñas no coinciden.");
      return;
    }

    try {
      setBusy(true);
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          ref,          // 🔹 envía si tu API lo requiere
          password,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setMessage(data.message || "Contraseña restablecida con éxito");
        setTimeout(() => router.push("/login"), 2000);
      } else {
        setErrorLoc(data.message || "Hubo un error al restablecer la contraseña");
      }
    } catch {
      setErrorLoc("Hubo un error al restablecer la contraseña");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-lg">
        <h2 className="text-2xl font-semibold text-center mb-6">Redefinir contraseña</h2>

        <input
          type="password"
          placeholder="Nueva contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 mb-3 border rounded-lg"
        />
        <input
          type="password"
          placeholder="Confirmar contraseña"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="w-full px-4 py-2 mb-4 border rounded-lg"
        />

        {errorLoc && <p className="text-red-600 text-sm mb-3">{errorLoc}</p>}
        {message && <p className="text-green-600 text-sm mb-3">{message}</p>}

        <button
          onClick={handleResetPassword}
          disabled={busy || !token /* || !ref */}
          className="w-full bg-blue-500 text-white py-2 rounded-lg disabled:opacity-50"
        >
          {busy ? "Actualizando..." : "Actualizar Contraseña"}
        </button>
      </div>
    </div>
  );
}
