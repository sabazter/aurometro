import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import client from '../api/client';
import { User, Budget } from '../types';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { ChevronLeft } from 'lucide-react';

const PointsStudents: React.FC = () => {
  const { year, section } = useParams<{ year: string, section: string }>();
  const [students, setStudents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
  const [reason, setReason] = useState('');
  const [budget, setBudget] = useState<Budget | null>(null);
  const [giving, setGiving] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, budgetRes] = await Promise.all([
          client.get(`/users/year/${year}/section/${section}`),
          client.get('/aura/budget').catch(() => ({ data: null }))
        ]);
        
        const rawUsers = usersRes.data.data || usersRes.data || [];
        const sorted = rawUsers.sort((a: User, b: User) => a.lastName.localeCompare(b.lastName));
        setStudents(sorted);
        if (budgetRes.data) setBudget(budgetRes.data.data || budgetRes.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [year, section]);

  const handleGivePoint = async (type: 'POSITIVE' | 'NEGATIVE') => {
    if (!selectedStudent) return;
    if (!reason.trim()) return; // extra guard, button should already be disabled
    setGiving(true);
    try {
      await client.post('/aura/give', {
        toUserId: selectedStudent.id,
        type,
        reason: reason.trim()
      });
      
      setToast(`Punto ${type === 'POSITIVE' ? 'positivo' : 'negativo'} enviado a ${selectedStudent.firstName}`);
      setTimeout(() => setToast(''), 3000);
      
      // Refresh budget
      const budgetRes = await client.get('/aura/budget');
      setBudget(budgetRes.data.data || budgetRes.data);
      
      setSelectedStudent(null);
      setReason('');
    } catch (error: any) {
      alert(error.response?.data?.error || error.response?.data?.message || 'Error al enviar punto');
    } finally {
      setGiving(false);
    }
  };

  const isReasonEmpty = reason.trim().length === 0;
  const noPoints = budget ? budget.dailyRemaining <= 0 : false;

  if (loading) {
    return <div className="text-center py-10">Cargando...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link to={`/points/${year}`} className="inline-flex items-center gap-1 text-sm font-medium opacity-70 hover:opacity-100 transition-opacity mb-2">
        <ChevronLeft size={16} /> Volver a secciones
      </Link>

      <div className="mb-6">
        <h1 className="text-3xl font-bold">{year}° Año - Sección {section}</h1>
        <p className="text-sm opacity-70 mt-1">Selecciona un alumno para darle o quitarle puntos de aura</p>
      </div>

      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-4 py-2 rounded-xl shadow-lg z-50 animate-in fade-in slide-in-from-top-4">
          {toast}
        </div>
      )}

      <div className="grid gap-3">
        {students.map(student => (
          <Card 
            key={student.id} 
            className="flex items-center gap-4 p-4 cursor-pointer hover:border-purple-500/50 hover:shadow-lg transition-all"
            onClick={() => { setSelectedStudent(student); setReason(''); }}
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-md">
              {student.firstName[0]}{student.lastName[0]}
            </div>
            <div>
              <h3 className="font-bold text-lg">{student.firstName} {student.lastName}</h3>
              {student.nickname && <p className="text-sm opacity-70">"{student.nickname}"</p>}
            </div>
          </Card>
        ))}
        {students.length === 0 && (
          <div className="text-center opacity-50 py-10">No hay estudiantes participantes en esta sección.</div>
        )}
      </div>

      <Modal isOpen={!!selectedStudent} onClose={() => { setSelectedStudent(null); setReason(''); }}>
        {selectedStudent && (
          <div className="text-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold text-3xl mx-auto mb-4 shadow-lg">
              {selectedStudent.firstName[0]}{selectedStudent.lastName[0]}
            </div>
            <h2 className="text-2xl font-bold mb-1">{selectedStudent.firstName} {selectedStudent.lastName}</h2>
            {selectedStudent.nickname && <p className="opacity-70 mb-4">"{selectedStudent.nickname}"</p>}

            {budget && (
              <div className="flex justify-center gap-4 text-sm font-medium mb-4 bg-slate-100 dark:bg-white/5 p-3 rounded-xl border border-slate-200 dark:border-white/10">
                <span className={`font-bold ${budget.dailyRemaining > 0 ? 'text-purple-600 dark:text-purple-400' : 'text-rose-600 dark:text-red-400'}`}>
                  {budget.dailyRemaining}/{budget.dailyLimit ?? 3} puntos disponibles hoy
                </span>
              </div>
            )}

            <div className="mb-2 text-left">
              <label className="text-xs font-semibold opacity-70 mb-1 block">
                Razón <span className="text-rose-500">*</span> <span className="opacity-60 font-normal">(obligatoria, máx 140 caracteres)</span>
              </label>
              <textarea
                className="w-full bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-slate-100 rounded-xl p-3 outline-none focus:border-purple-500 transition-colors resize-none"
                placeholder="¿Por qué le das o quitas aura?"
                maxLength={140}
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                autoFocus
              />
              <div className="text-right text-xs opacity-50 mt-1">{reason.length}/140</div>
            </div>

            {isReasonEmpty && (
              <p className="text-rose-500 text-xs mb-3 text-left">Debes escribir una razón para continuar.</p>
            )}

            <div className="grid grid-cols-2 gap-4 mt-2">
              <Button 
                variant="success" 
                onClick={() => handleGivePoint('POSITIVE')}
                disabled={giving || isReasonEmpty || noPoints}
                className="py-4 text-lg"
              >
                ✨ +100 Aura
              </Button>
              <Button 
                variant="danger" 
                onClick={() => handleGivePoint('NEGATIVE')}
                disabled={giving || isReasonEmpty || noPoints}
                className="py-4 text-lg"
              >
                💀 -100 Aura
              </Button>
            </div>

            {noPoints && (
              <p className="text-amber-500 text-xs mt-3 font-semibold">Has usado todos tus puntos de hoy. Vuelve mañana.</p>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PointsStudents;
