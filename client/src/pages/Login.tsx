import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await client.post('/auth/login', { email, password });
      const payload = res.data.data || res.data;
      const { token, user } = payload;
      if (token && user) {
        login(token, user);
        navigate('/');
      } else {
        setError('Respuesta del servidor no válida');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-[#0a0a0a] text-slate-900 dark:text-slate-100 p-4 transition-colors">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-indigo-500/10 z-0 pointer-events-none" />
      
      <div className="z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-500 mb-2">
            Aurómetro
          </h1>
          <p className="opacity-70">Mide el aura de tu sección</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <h2 className="text-2xl font-semibold mb-2">Iniciar sesión</h2>
            
            {error && <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm">{error}</div>}

            <Input
              label="Correo electrónico"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="tu@correo.com"
            />
            
            <Input
              label="Contraseña"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />

            <Button type="submit" className="w-full mt-4 py-3" loading={loading}>
              Iniciar sesión
            </Button>
            
            <div className="text-center mt-4 text-sm opacity-70">
              <Link to="/register" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                ¿No tienes cuenta? Regístrate
              </Link>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Login;
