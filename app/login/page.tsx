"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignInAlt } from "@fortawesome/free-solid-svg-icons";
import { Footer } from "@/components/general/Footer";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter();

  const handleRegister = () => router.push("/register");
  const handleForgotPassword = () => router.push("/forgot-password");

  const handleLogin = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);
    try {
      const result = await signIn("credentials", {
        redirect: false,               // capturamos el resultado aquí
        email,
        password,
        callbackUrl: "/",              // URL a donde quieres ir tras éxito
      });

      // NextAuth devuelve { ok, error, status, url }
      if (result?.error) {
        // Mensaje amigable; puedes mapear códigos si lo prefieres
        setErrorMsg("Credenciales inválidas. Intenta nuevamente.");
      } else {
        // Redirige manualmente (o usa result.url si la confías)
        router.push("/");
      }
    } catch (err) {
      setErrorMsg("Ocurrió un error inesperado. Intenta más tarde.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="max-w-md w-full bg-white p-8 rounded shadow">
        <h2 className="text-2xl font-bold mb-6 text-center">Ingreso a la aplicación</h2>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            autoComplete="email"
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            autoComplete="current-password"
            required
          />

          {errorMsg && <p className="text-red-600 text-sm">{errorMsg}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            <FontAwesomeIcon icon={faSignInAlt} className="mr-1" />
            {submitting ? "Ingresando..." : "Ingresar con clave interna"}
          </button>
        </form>

        <div className="mt-3 flex justify-between text-sm">
          <button onClick={handleForgotPassword} className="text-blue-600 hover:underline">
            ¿Olvidaste tu contraseña?
          </button>
          {/* <button onClick={handleRegister} className="text-blue-600 hover:underline">
            Crear cuenta
          </button> */}
        </div>

        <div className="mt-6">
          <Footer />
        </div>
      </div>
    </div>
  );
}
