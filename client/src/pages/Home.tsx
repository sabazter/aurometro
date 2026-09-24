import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';
import { Card } from '../components/ui/Card';
import { Zap, Trophy, Settings as SettingsIcon } from 'lucide-react';
import { Budget } from '../types';

const Home: React.FC = () => {
  const { user } = useAuth();
  const [budget, setBudget] = useState<Budget | null>(null);
  const [auraScore, setAuraScore] = useState<number>(0);

  useEffect(() => {
    const fetchBudget = async () => {
      try {
        const res = await client.get('/aura/budget');
        setBudget(res.data.data);
      } catch (error) {
        console.error('Failed to fetch budget', error);
      }
    };
    const fetchScore = async () => {
      try {
        const res = await client.get('/ranking?mine=true');
        setAuraScore(res.data.data?.aura ?? 0);
      } catch {
        setAuraScore(0);
      }
    };
    if (user?.preferences?.participationMode && user.preferences.participationMode !== 'SPECTATOR') {
      fetchBudget();
      fetchScore();
    }
  }, [user]);

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">¡Hola, {user?.firstName}!</h1>
        <p className="opacity-70 mt-1">Bienvenido al Aurómetro</p>
      </div>

      {user?.preferences?.showScore && (
        <Card className="bg-gradient-to-br from-purple-600/10 via-purple-600/20 to-indigo-600/10 border-purple-500/30 text-center py-8">
          <p className="text-xs uppercase tracking-widest font-semibold opacity-70 mb-2">Tu Aura Actual</p>
          <div className="text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-500 dark:from-purple-400 dark:to-indigo-400">
            {auraScore}
          </div>
        </Card>
      )}

      {user?.preferences?.participationMode !== 'SPECTATOR' && budget && (
        <div className="text-center p-4 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-sm">
          <p className="text-sm opacity-80 mb-2">Puntos disponibles hoy</p>
          <div className="flex justify-center gap-4 text-lg font-bold">
            <span className="text-emerald-600 dark:text-green-400">+{budget.positiveAvailable} positivos</span>
            <span className="opacity-30">|</span>
            <span className="text-rose-600 dark:text-red-400">-{budget.negativeAvailable} negativos</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        <Link to="/points">
          <Card className="h-full hover:border-purple-500/50 hover:shadow-lg transition-all cursor-pointer group">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Zap size={24} />
            </div>
            <h3 className="text-xl font-bold mb-2">Dar / Quitar Puntos</h3>
            <p className="text-sm opacity-70">Reparte aura entre tus compañeros.</p>
          </Card>
        </Link>

        <Link to="/ranking">
          <Card className="h-full hover:border-amber-500/50 hover:shadow-lg transition-all cursor-pointer group">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Trophy size={24} />
            </div>
            <h3 className="text-xl font-bold mb-2">Ranking</h3>
            <p className="text-sm opacity-70">¿Quién tiene más aura?</p>
          </Card>
        </Link>

        <Link to="/settings">
          <Card className="h-full hover:border-indigo-500/50 hover:shadow-lg transition-all cursor-pointer group">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <SettingsIcon size={24} />
            </div>
            <h3 className="text-xl font-bold mb-2">Configuración</h3>
            <p className="text-sm opacity-70">Ajusta tu experiencia.</p>
          </Card>
        </Link>
      </div>
    </div>
  );
};

export default Home;
