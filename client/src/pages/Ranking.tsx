import React, { useEffect, useState } from 'react';
import client from '../api/client';
import { RankingEntry } from '../types';
import { Card } from '../components/ui/Card';

const Ranking: React.FC = () => {
  const [entries, setEntries] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [yearFilter, setYearFilter] = useState('all');
  const [sectionFilter, setSectionFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  useEffect(() => {
    const fetchRanking = async () => {
      try {
        const params = new URLSearchParams();
        if (yearFilter !== 'all') params.set('year', yearFilter);
        if (sectionFilter !== 'all') params.set('section', sectionFilter);
        params.set('sort', sortOrder);
        const res = await client.get(`/ranking?${params.toString()}`);
        setEntries(res.data.data || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchRanking();
  }, [yearFilter, sectionFilter, sortOrder]);

  const getPositionBadge = (index: number) => {
    if (sortOrder === 'asc') return <span className="font-bold opacity-50 w-6 text-center">{index + 1}</span>;
    if (index === 0) return <span className="text-2xl w-8 text-center">🥇</span>;
    if (index === 1) return <span className="text-2xl w-8 text-center">🥈</span>;
    if (index === 2) return <span className="text-2xl w-8 text-center">🥉</span>;
    return <span className="font-bold opacity-50 w-8 text-center">{index + 1}</span>;
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">🏆 Ranking de Aura</h1>
        <p className="opacity-70">Tabla general de puntuaciones de aura</p>
      </div>

      <Card className="flex flex-wrap gap-4 items-center p-4 mb-6">
        <div className="flex flex-col gap-1 flex-1 min-w-[120px]">
          <label className="text-xs font-semibold opacity-70">Año</label>
          <select 
            value={yearFilter} 
            onChange={e => setYearFilter(e.target.value)}
            className="bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/20 text-slate-900 dark:text-slate-100 rounded-xl p-2 outline-none"
          >
            <option value="all" className="bg-white dark:bg-zinc-900 text-slate-900 dark:text-slate-100">Todos</option>
            {[1, 2, 3, 4, 5].map(y => <option key={y} value={y} className="bg-white dark:bg-zinc-900 text-slate-900 dark:text-slate-100">{y}º</option>)}
          </select>
        </div>
        
        <div className="flex flex-col gap-1 flex-1 min-w-[120px]">
          <label className="text-xs font-semibold opacity-70">Sección</label>
          <select 
            value={sectionFilter} 
            onChange={e => setSectionFilter(e.target.value)}
            className="bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/20 text-slate-900 dark:text-slate-100 rounded-xl p-2 outline-none"
          >
            <option value="all" className="bg-white dark:bg-zinc-900 text-slate-900 dark:text-slate-100">Todas</option>
            {['A', 'B', 'C', 'D'].map(s => <option key={s} value={s} className="bg-white dark:bg-zinc-900 text-slate-900 dark:text-slate-100">{s}</option>)}
          </select>
        </div>

        <div className="flex flex-col gap-1 flex-1 min-w-[120px]">
          <label className="text-xs font-semibold opacity-70">Orden</label>
          <select 
            value={sortOrder} 
            onChange={e => setSortOrder(e.target.value as 'desc' | 'asc')}
            className="bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/20 text-slate-900 dark:text-slate-100 rounded-xl p-2 outline-none"
          >
            <option value="desc" className="bg-white dark:bg-zinc-900 text-slate-900 dark:text-slate-100">Mayor a menor</option>
            <option value="asc" className="bg-white dark:bg-zinc-900 text-slate-900 dark:text-slate-100">Menor a mayor</option>
          </select>
        </div>
      </Card>

      {loading ? (
        <div className="text-center py-10">Cargando ranking...</div>
      ) : (
        <div className="flex flex-col gap-3">
          {entries.map((entry, index) => (
            <Card key={index} className="flex items-center gap-4 p-4 hover:scale-[1.01] transition-transform">
              {getPositionBadge(index)}
              
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold flex-shrink-0 shadow-md">
                {entry.avatarUrl ? (
                  <img src={entry.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
                ) : (
                  `${entry.firstName[0]}${entry.lastName[0]}`
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-baseline gap-2">
                  <h3 className="font-bold">{entry.firstName} {entry.lastName}</h3>
                  {entry.nickname && <span className="text-xs opacity-70">"{entry.nickname}"</span>}
                </div>
                <div className="text-xs opacity-60 mt-0.5">
                  {entry.year}º Año - Sección {entry.section}
                </div>
              </div>

              <div className="text-right">
                {entry.aura !== null ? (
                  <div className={`text-xl font-bold ${entry.aura >= 0 ? 'text-purple-600 dark:text-purple-400' : 'text-rose-600 dark:text-red-400'}`}>
                    {entry.aura > 0 ? '+' : ''}{entry.aura}
                  </div>
                ) : (
                  <div className="text-sm italic opacity-50">Oculto</div>
                )}
              </div>
            </Card>
          ))}
          {entries.length === 0 && (
            <div className="text-center opacity-50 py-10">No hay usuarios para mostrar.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default Ranking;
