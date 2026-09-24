import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import client from '../api/client';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

const VerifyEmail: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    const verify = async () => {
      try {
        await client.get(`/auth/verify-email/${token}`);
        setStatus('success');
      } catch (error) {
        setStatus('error');
      }
    };
    if (token) {
      verify();
    }
  }, [token]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0a] text-white p-4">
      <Card className="max-w-md text-center">
        {status === 'loading' && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
            <p>Verificando tu correo...</p>
          </div>
        )}
        
        {status === 'success' && (
          <div className="flex flex-col items-center gap-4">
            <div className="text-5xl">✅</div>
            <h2 className="text-2xl font-bold">¡Correo verificado!</h2>
            <p className="opacity-80 mb-4">Ya puedes iniciar sesión en tu cuenta.</p>
            <Link to="/login" className="w-full">
              <Button className="w-full">Ir a Iniciar Sesión</Button>
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center gap-4">
            <div className="text-5xl">❌</div>
            <h2 className="text-2xl font-bold">Error de verificación</h2>
            <p className="opacity-80 mb-4">El enlace de verificación no es válido o ha expirado.</p>
            <Link to="/login" className="w-full">
              <Button variant="ghost" className="w-full">Volver al inicio</Button>
            </Link>
          </div>
        )}
      </Card>
    </div>
  );
};

export default VerifyEmail;
