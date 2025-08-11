"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLabels } from '@/hooks/ohers/useLabels';
//import  labels  from '../../data/labels.json';

const ResetPasswordPage = () => {
  const [ password, setPassword ]               = useState('');
  const [ confirmPassword, setConfirmPassword ] = useState('');
  const [ errorLoc, setErrorLoc ]               = useState('');
  const [ message, setMessage ]                 = useState('');
  const router                                  = useRouter();
  const [ token, setToken ]                     = useState('');

  const { labels, error }                       = useLabels();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    } else {
      if (labels) setErrorLoc(labels.resetPassword.messageTokenNoValid);
    }
  }, [labels]);
  const handleResetPassword = async () => {
    if (password !== confirmPassword) {
      if (labels) setErrorLoc(labels.resetPassword.messageFailedPassword);
      return;
    }

    try {
        const response = await fetch('/api/reset-password', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              token,
              password,
            }),
          });

          if (response.ok) {
            if (labels) setMessage(labels.resetPassword.messageResetSuccess);
            setTimeout(() => {
              router.push('/login');
            }, 2000); // Redirigir al login después de 2 segundos
          } else {
            if (labels) setErrorLoc(labels.resetPassword.messageResetInvalid);
          }
        } catch (err) {
          if (labels) setErrorLoc(labels.resetPassword.messageResetInvalid);
        }
      };
      if (error) {
        return <div>{error}</div>;
      }
  return (
   <div>
     { labels ? (
    <div className="reset-password-container">
      <h2>{labels.resetPassword.title}</h2>
      <input
        type="password"
        placeholder={labels.resetPassword.passwordPlaceholder}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <input
        type="password"
        placeholder={labels.resetPassword.passwordConfirmPlaceholder}
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />
      {errorLoc && <p className="error-message">{errorLoc}</p>}
      <button onClick={handleResetPassword}>{labels.resetPassword.botonResetPassword}</button>
      {message && <p className="success-message">{message}</p>}
    </div>
    ): (
     <div>Loading language labels...</div>
    )}
  </div>
  )
  
};

export default ResetPasswordPage;