"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import  labels  from '../../data/labels.json';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const router = useRouter();

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      alert(labels.registerNewUser.messageFailedPassword);
      return;
    }
    const response = await fetch('/api/createUser', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        email,
        password,
      }),
    });

    if (response.ok) {
      alert(labels.registerNewUser.messageSuccess);
      router.push('/login'); // Redirigir a la página de login después del registro
    } else {
      const errorData = await response.json();
      alert(labels.registerNewUser.messageFailed + errorData.message);
    }
  };
  return (
    <div className="register-page flex justify-center items-center min-h-screen bg-gray-100">
      <div className="register-container max-w-md w-full bg-white p-8 rounded shadow">
        <h2 className="text-2xl font-bold mb-6 text-center">{labels.registerNewUser.title}</h2>
        <div className="register-form">
          <input
            type="text"
            placeholder={labels.registerNewUser.namePlaceholder}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full mb-4 p-2 border border-gray-300 rounded"
          />
          <input
            type="email"
            placeholder={labels.registerNewUser.EmailPlaceholder}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mb-4 p-2 border border-gray-300 rounded"
          />
          <input
            type="password"
            placeholder={labels.registerNewUser.passwordPlaceholder}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full mb-4 p-2 border border-gray-300 rounded"
          />
          <input
            type="password"
            placeholder={labels.registerNewUser.passwordConfirmPlaceholder}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full mb-4 p-2 border border-gray-300 rounded"
          />
          <button
            onClick={handleRegister}
            className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            {labels.registerNewUser.botonRegister}
          </button>
          <p className="mt-4 text-center text-gray-600">
            {labels.registerNewUser.labelBotonRegister} 
            <button
              onClick={() => router.push('/login')}
              className="text-blue-500 hover:underline"
            >
              {labels.registerNewUser.urlToLogin}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
export default RegisterPage;