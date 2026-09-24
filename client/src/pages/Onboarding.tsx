import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Toggle } from '../components/ui/Toggle';

const Onboarding: React.FC = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<'SPECTATOR' | 'CONTROLLED' | 'FULL'>('FULL');
  const [showScore, setShowScore] = useState(true);
  const [showInRanking, setShowInRanking] = useState(true);

  const handleModeSelect = (selectedMode: 'SPECTATOR' | 'CONTROLLED' | 'FULL') => {
    setMode(selectedMode);
    if (selectedMode === 'SPECTATOR') {
      setShowScore(false);
      setShowInRanking(false);
    } else if (selectedMode === 'CONTROLLED') {
      setShowScore(false);
      setShowInRanking(false);
    } else {
      setShowScore(true);
      setShowInRanking(true);
    }
  };

  const handleNext = () => {
    if (step === 1) {
      if (mode === 'SPECTATOR') setStep(3); // Skip configuration for spectator
      else setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      await client.put('/users/me/preferences', {
        participationMode: mode,
        showScore,
        showInRanking
      });
      await client.put('/users/me/onboarding');
      updateUser({ onboardingCompleted: true });
      navigate('/');
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto min-h-[80vh] flex flex-col justify-center">
      <div className="mb-8">
        <div className="flex gap-2 mb-4">
          {[1, 2, 3].map(s => (
            <div key={s} className={`h-2 flex-1 rounded-full transition-colors ${s <= step ? 'bg-purple-500' : 'bg-slate-200 dark:bg-white/10'}`} />
          ))}
        </div>
      </div>

      {step === 1 && (
        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
          <h2 className="text-3xl font-bold mb-2">¿Cómo quieres participar?</h2>
          <p className="opacity-70 mb-8">Elige tu nivel de compromiso con el Aurómetro.</p>
          
          <div className="flex flex-col gap-4">
            <Card 
              className={`cursor-pointer transition-all ${mode === 'SPECTATOR' ? 'ring-2 ring-purple-500 bg-purple-500/10' : 'hover:bg-white/5'}`}
              onClick={() => handleModeSelect('SPECTATOR')}
            >
              <div className="flex items-center gap-4">
                <div className="text-4xl">👁️</div>
                <div>
                  <h3 className="font-bold text-lg">Espectador</h3>
                  <p className="text-sm opacity-70">Solo quiero ver. No daré ni recibiré puntos de aura.</p>
                </div>
              </div>
            </Card>

            <Card 
              className={`cursor-pointer transition-all ${mode === 'CONTROLLED' ? 'ring-2 ring-purple-500 bg-purple-500/10' : 'hover:bg-white/5'}`}
              onClick={() => handleModeSelect('CONTROLLED')}
            >
              <div className="flex items-center gap-4">
                <div className="text-4xl">🎯</div>
                <div>
                  <h3 className="font-bold text-lg">Controlado</h3>
                  <p className="text-sm opacity-70">Quiero participar, pero mantener mi puntaje en privado.</p>
                </div>
              </div>
            </Card>

            <Card 
              className={`cursor-pointer transition-all ${mode === 'FULL' ? 'ring-2 ring-purple-500 bg-purple-500/10' : 'hover:bg-white/5'}`}
              onClick={() => handleModeSelect('FULL')}
            >
              <div className="flex items-center gap-4">
                <div className="text-4xl">🚀</div>
                <div>
                  <h3 className="font-bold text-lg">Completo</h3>
                  <p className="text-sm opacity-70">¡Quiero la experiencia completa! Puntaje visible y en el ranking.</p>
                </div>
              </div>
            </Card>
          </div>
          
          <div className="mt-8 flex justify-end">
            <Button onClick={handleNext}>Siguiente</Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
          <h2 className="text-3xl font-bold mb-2">Configura tu visibilidad</h2>
          <p className="opacity-70 mb-8">Ajusta cómo te ven los demás.</p>

          <Card className="flex flex-col gap-6">
            <Toggle 
              label="Mostrar mi puntaje de aura" 
              description="Los demás podrán ver tu aura total."
              checked={showScore} 
              onChange={setShowScore} 
            />
            <hr className="border-white/10" />
            <Toggle 
              label="Aparecer en el ranking" 
              description="Tu perfil será visible en la tabla de posiciones general."
              checked={showInRanking} 
              onChange={setShowInRanking} 
            />
          </Card>

          <div className="mt-8 flex justify-between">
            <Button variant="ghost" onClick={() => setStep(1)}>Atrás</Button>
            <Button onClick={handleNext}>Siguiente</Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="animate-in fade-in slide-in-from-right-4 duration-300 text-center">
          <div className="text-6xl mb-6">✨</div>
          <h2 className="text-3xl font-bold mb-4">¡Todo listo!</h2>
          <p className="opacity-70 mb-8 max-w-md mx-auto">
            Has configurado tu perfil en modo <strong>{mode === 'SPECTATOR' ? 'Espectador' : mode === 'CONTROLLED' ? 'Controlado' : 'Completo'}</strong>. 
            Puedes cambiar esto en cualquier momento desde los ajustes.
          </p>
          
          <div className="flex justify-between max-w-md mx-auto">
            <Button variant="ghost" onClick={() => setStep(mode === 'SPECTATOR' ? 1 : 2)}>Atrás</Button>
            <Button onClick={handleComplete} loading={loading} className="px-8">Comenzar</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Onboarding;
