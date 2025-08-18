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
  const handleSocialLogin = async (provider: string) => {
    await signIn(provider, { callbackUrl: '/' });
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
{/*           
              <div className="my-4 text-center text-gray-600">o</div>
              <button
                onClick={() => handleSocialLogin('google')}
                className="w-full bg-white text-black border border-gray-300 px-4 py-2 rounded hover:bg-gray-100 mb-4 flex items-center justify-center"
              >
                <svg
                  className="mr-2"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 48 48"
                  width="24px"
                  height="24px"
                >
                  <path
                    fill="#4285F4"
                    d="M24 9.5c3.5 0 6 1.5 7.4 2.7l5.5-5.4C32.8 3.4 28.7 2 24 2 14.7 2 7.2 8.1 4.2 16.7l6.5 5C12.3 14.4 17.6 9.5 24 9.5z"
                  />
                  <path
                    fill="#34A853"
                    d="M46.5 24.5c0-1.3-.1-2.6-.4-3.9H24v7.4h12.7c-.5 2.3-1.9 4.2-3.8 5.5l6.2 4.8C43.7 34.5 46.5 29.9 46.5 24.5z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M10.7 29.1C9.8 26.8 9.8 24.2 10.7 21.9l-6.5-5C2.2 20.5 1 22.8 1 25.5c0 2.7 1.2 5 3.2 6.6l6.5-5z"
                  />
                  <path
                    fill="#EA4335"
                    d="M24 46c4.6 0 8.5-1.5 11.3-4.1l-6.2-4.8c-1.7 1.1-3.9 1.7-6.1 1.7-6.3 0-11.6-4.9-12.7-11.3l-6.5 5C7.2 40.9 14.7 46 24 46z"
                  />
                </svg>
                Conectarse con Google
              </button> */}
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
