"use client";
import Link from "next/link";
import { useSearchParams, usePathname } from "next/navigation";


export default function NotFoundPage() {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    
    const isProveedor = pathname?.startsWith("/cotizar") && searchParams?.has("token");
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100 text-gray-700">
        <h1 className="text-6xl font-bold">404</h1>
        <h2 className="text-2xl font-semibold mt-2">Página no encontrada</h2>
        <p className="mt-4 text-lg">
            {isProveedor
            ? "Parece que el enlace de cotización no es válido o ha expirado."
            : "Lo sentimos, la página que buscas no existe."
            }
        </p>
        
        {isProveedor ? (
        <p className="mt-2 text-gray-500 text-sm">
          Contacta a la empresa si necesitas un nuevo enlace.
        </p>
      ) : (
        <Link
          href="/"
          className="mt-6 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          🔙 Volver al inicio
        </Link>
      )}
      </div>
    );
  }
  