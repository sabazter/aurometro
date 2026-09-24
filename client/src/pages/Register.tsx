import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    nickname: '',
    email: '',
    password: '',
    year: '1',
    section: 'A'
  });
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) {
      setError('Debes aceptar las condiciones para registrarte.');
      return;
    }
    
    setError('');
    setLoading(true);

    try {
      await client.post('/auth/register', {
        ...formData,
        year: parseInt(formData.year)
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Error en el registro');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-[#0a0a0a] text-slate-900 dark:text-slate-100 p-4">
        <Card className="max-w-md text-center">
          <div className="text-5xl mb-4">✨</div>
          <h2 className="text-2xl font-bold mb-4">¡Registro exitoso!</h2>
          <p className="opacity-80 mb-6">
            Revisa tu correo electrónico para verificar tu cuenta y comenzar a usar Aurómetro.
          </p>
          <Link to="/login">
            <Button className="w-full">Ir al inicio de sesión</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-[#0a0a0a] text-slate-900 dark:text-slate-100 p-4 py-12 transition-colors">
      <div className="absolute inset-0 bg-gradient-to-bl from-purple-500/10 via-transparent to-indigo-500/10 z-0 pointer-events-none" />
      
      <div className="z-10 w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-500">
            Registro
          </h1>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm">{error}</div>}

            <div className="grid grid-cols-2 gap-4">
              <Input label="Nombre" name="firstName" value={formData.firstName} onChange={handleChange} required />
              <Input label="Apellido" name="lastName" value={formData.lastName} onChange={handleChange} required />
            </div>
            
            <Input label="Apodo (opcional)" name="nickname" value={formData.nickname} onChange={handleChange} />
            <Input label="Correo electrónico" name="email" type="email" value={formData.email} onChange={handleChange} required />
            <Input label="Contraseña" name="password" type="password" value={formData.password} onChange={handleChange} required />
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Año</label>
                <select name="year" value={formData.year} onChange={handleChange} className="bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-slate-100 rounded-xl px-4 py-2.5 outline-none focus:border-purple-500 transition-colors">
                  {[1, 2, 3, 4, 5].map(y => (
                    <option key={y} value={y} className="bg-white dark:bg-zinc-900 text-slate-900 dark:text-slate-100">{y}º Año</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Sección</label>
                <select name="section" value={formData.section} onChange={handleChange} className="bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-slate-100 rounded-xl px-4 py-2.5 outline-none focus:border-purple-500 transition-colors">
                  {['A', 'B', 'C', 'D'].map(s => (
                    <option key={s} value={s} className="bg-white dark:bg-zinc-900 text-slate-900 dark:text-slate-100">Sección {s}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4 p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs opacity-80">
              Esta app es un proyecto de humor entre compañeros. Tu participación es completamente voluntaria. Puedes eliminar tu cuenta y todos tus datos en cualquier momento.
            </div>

            <label className="flex items-start gap-3 mt-2 cursor-pointer">
              <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-1" />
              <span className="text-sm opacity-90">He leído y acepto las condiciones</span>
            </label>

            <Button type="submit" className="w-full mt-2 py-3" loading={loading}>
              Registrarse
            </Button>
            
            <div className="text-center mt-2 text-sm opacity-70">
              <Link to="/login" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                ¿Ya tienes cuenta? Inicia sesión
              </Link>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Register;
