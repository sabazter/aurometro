import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Card } from '../components/ui/Card';
import { Toggle } from '../components/ui/Toggle';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import client from '../api/client';

const Settings: React.FC = () => {
  const { user, updatePreferences, logout, updateUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  
  const [nickname, setNickname] = useState(user?.nickname || '');
  const [savingNick, setSavingNick] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [cooldownError, setCooldownError] = useState('');

  if (!user) return null;

  const prefs = user.preferences || { participationMode: 'SPECTATOR', showScore: false, showInRanking: false };

  const handleModeChange = async (mode: 'SPECTATOR' | 'CONTROLLED' | 'FULL') => {
    setCooldownError('');
    let newPrefs = { participationMode: mode, showScore: prefs.showScore, showInRanking: prefs.showInRanking };
    if (mode === 'SPECTATOR' || mode === 'CONTROLLED') {
      newPrefs.showScore = false;
      newPrefs.showInRanking = false;
    } else {
      newPrefs.showScore = true;
      newPrefs.showInRanking = true;
    }
    try {
      await updatePreferences(newPrefs);
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || '';
      if (msg) setCooldownError(msg);
    }
  };

  const handleUpdateNickname = async () => {
    setSavingNick(true);
    try {
      await client.put('/users/me/profile', { nickname });
      updateUser({ nickname });
    } catch (error) {
      console.error(error);
    } finally {
      setSavingNick(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await client.delete('/users/me');
      logout();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Configuración</h1>
        <p className="opacity-70">Ajusta tu experiencia en Aurómetro</p>
      </div>

      <section>
        <h2 className="text-lg font-semibold mb-4 text-purple-400">Apariencia</h2>
        <Card>
          <Toggle 
            label="Modo Oscuro" 
            checked={theme === 'dark'} 
            onChange={toggleTheme} 
          />
        </Card>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4 text-purple-400">Participación</h2>
        <Card className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {(['SPECTATOR', 'CONTROLLED', 'FULL'] as const).map(mode => (
              <div 
                key={mode}
                onClick={() => handleModeChange(mode)}
                className={`p-3 rounded-xl border cursor-pointer transition-all text-center ${
                  prefs.participationMode === mode 
                    ? 'border-purple-500 bg-purple-500/20' 
                    : 'border-white/10 hover:bg-white/5'
                }`}
              >
                <div className="text-2xl mb-1">
                  {mode === 'SPECTATOR' ? '👁️' : mode === 'CONTROLLED' ? '🎯' : '🚀'}
                </div>
                <div className="font-semibold text-sm">
                  {mode === 'SPECTATOR' ? 'Espectador' : mode === 'CONTROLLED' ? 'Controlado' : 'Completo'}
                </div>
              </div>
            ))}
          </div>
          <p className="text-sm opacity-70 mt-2">
            {prefs.participationMode === 'SPECTATOR' && 'Solo ves, no participas activamente.'}
            {prefs.participationMode === 'CONTROLLED' && 'Participas, pero mantienes tu información privada.'}
            {prefs.participationMode === 'FULL' && 'Experiencia completa. Puntaje público y ranking.'}
          </p>
          {cooldownError && (
            <div className="mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-sm font-medium">
              ⏳ {cooldownError}
            </div>
          )}
        </Card>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4 text-purple-400">Visibilidad</h2>
        <Card className="flex flex-col gap-4">
          <Toggle 
            label="Mostrar mi puntaje" 
            description="Los demás verán tu aura total."
            checked={prefs.showScore} 
            onChange={(checked) => updatePreferences({ showScore: checked })} 
            disabled={prefs.participationMode === 'SPECTATOR'}
          />
          <hr className="border-white/10" />
          <Toggle 
            label="Aparecer en el ranking" 
            description="Visible en la tabla general."
            checked={prefs.showInRanking} 
            onChange={(checked) => updatePreferences({ showInRanking: checked })} 
            disabled={prefs.participationMode === 'SPECTATOR'}
          />
        </Card>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4 text-purple-400">Perfil</h2>
        <Card className="flex flex-col sm:flex-row items-end gap-4">
          <Input 
            label="Apodo (visible para todos)" 
            value={nickname} 
            onChange={e => setNickname(e.target.value)} 
            placeholder="Sin apodo"
          />
          <Button onClick={handleUpdateNickname} loading={savingNick} className="whitespace-nowrap">
            Guardar
          </Button>
        </Card>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4 text-red-400">Cuenta</h2>
        <Card className="flex flex-col gap-4">
          <Button variant="ghost" onClick={logout} className="w-full text-left justify-start py-3">
            🚪 Cerrar Sesión
          </Button>
          <hr className="border-white/10" />
          <Button variant="danger" onClick={() => setDeleteModalOpen(true)} className="w-full py-3">
            🗑️ Eliminar mi cuenta
          </Button>
        </Card>
      </section>

      <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Eliminar cuenta">
        <p className="mb-6 opacity-80">
          ¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer y perderás todos tus datos y puntos de aura.
        </p>
        <div className="flex gap-4">
          <Button variant="ghost" onClick={() => setDeleteModalOpen(false)} className="flex-1">
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleDeleteAccount} className="flex-1">
            Sí, eliminar
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default Settings;
