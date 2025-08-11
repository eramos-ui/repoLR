'use client';
/*
Usado en Server component para ver archivos
*/
import { useRouter } from 'next/navigation';

export default function GoBackButton() {
  const router = useRouter();
  return (
    <button
      onClick={() => router.back()}
      // className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
      className={`px-4 py-2 rounded bg-blue-600 hover:bg-blue-300 text-white`}
    >
      ⬅ Volver a página anterior
    </button>
  );
} 