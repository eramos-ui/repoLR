"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLabels } from '@/hooks/ohers/useLabels';
//import  labels  from '../../data/labels.json';


const ForgotPasswordPage = () => {
  const [ email, setEmail ]     = useState('');
  const [ message, setMessage ] = useState('');
  const router                  = useRouter();

  const { labels, error }       = useLabels();
  if (error) {
    return <div>{error}</div>;
  }
  const handleForgotPassword = async () => {
    const response = await fetch('/api/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();
    if (response.ok) {
      if (labels) setMessage(labels.forgotPassword.messageEnviado);
      router.push('/login');
    } else {
      setMessage(`Error: ${data.error}`);
    }
  };

  return (
  <div>
      { labels ? (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-lg">
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">{labels.forgotPassword.title}</h2>
        <input
          type="email"
          placeholder={labels.forgotPassword.emailPlaceHolder}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleForgotPassword}
          className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
        {labels.forgotPassword.botonEnviar}
        </button>
        {message && <p className="mt-4 text-center text-green-600">{message}</p>}
      </div>
    </div>
     ): (
      <div>Loading labels...</div>
    )}
  </div>

  );
};

export default ForgotPasswordPage;