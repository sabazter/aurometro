import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Moon, Sun, Home, User, Settings, ArrowLeft, Zap, ShieldAlert, LogOut } from 'lucide-react';

export const Layout: React.FC = () => {
  const { user, isAdmin, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const isHome = location.pathname === '/';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0a0a0a] text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/80 dark:bg-black/60 border-b border-slate-200 dark:border-white/10 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {!isHome && (
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-1 text-sm font-medium px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 transition-colors"
                title="Volver atrás"
              >
                <ArrowLeft size={18} />
                <span className="hidden sm:inline">Volver</span>
              </button>
            )}
            <Link to="/" className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-500 flex items-center gap-2">
              <span>Aurómetro</span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          {user && (
            <nav className="hidden md:flex items-center gap-6">
              <Link to="/" className={`text-sm font-medium transition-colors ${location.pathname === '/' ? 'text-purple-600 dark:text-purple-400 font-bold' : 'opacity-70 hover:opacity-100'}`}>
                Inicio
              </Link>
              <Link to="/points" className={`text-sm font-medium transition-colors ${location.pathname.startsWith('/points') ? 'text-purple-600 dark:text-purple-400 font-bold' : 'opacity-70 hover:opacity-100'}`}>
                Puntos
              </Link>
              <Link to="/ranking" className={`text-sm font-medium transition-colors ${location.pathname === '/ranking' ? 'text-purple-600 dark:text-purple-400 font-bold' : 'opacity-70 hover:opacity-100'}`}>
                Ranking
              </Link>
              <Link to="/settings" className={`text-sm font-medium transition-colors ${location.pathname === '/settings' ? 'text-purple-600 dark:text-purple-400 font-bold' : 'opacity-70 hover:opacity-100'}`}>
                Ajustes
              </Link>
              {isAdmin && (
                <Link to="/admin" className={`text-sm font-bold transition-colors ${location.pathname === '/admin' ? 'text-amber-500' : 'text-amber-600 dark:text-amber-400 hover:opacity-100'}`}>
                  👑 Admin
                </Link>
              )}
            </nav>
          )}

          <div className="flex items-center gap-2.5">
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 transition-colors"
              title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            >
              {theme === 'dark' ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-slate-700" />}
            </button>

            {user && (
              <>
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                    {user.firstName[0]}
                  </div>
                </div>

                <button
                  onClick={logout}
                  className="p-2.5 sm:px-3 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 transition-colors flex items-center gap-1.5 text-xs font-semibold border border-rose-500/20"
                  title="Cerrar sesión"
                >
                  <LogOut size={18} />
                  <span className="hidden sm:inline">Salir</span>
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6 pb-24 max-w-4xl">
        <Outlet />
      </main>

      {/* Mobile Navigation Bar */}
      {user && (
        <nav className="fixed bottom-0 w-full backdrop-blur-md bg-white/90 dark:bg-black/90 border-t border-slate-200 dark:border-white/10 px-6 py-2.5 flex justify-around items-center sm:hidden z-40 shadow-lg">
          <Link to="/" className={`flex flex-col items-center gap-1 ${location.pathname === '/' ? 'text-purple-600 dark:text-purple-400 font-bold' : 'opacity-70'}`}>
            <Home size={20} />
            <span className="text-[10px]">Inicio</span>
          </Link>
          <Link to="/points" className={`flex flex-col items-center gap-1 ${location.pathname.startsWith('/points') ? 'text-purple-600 dark:text-purple-400 font-bold' : 'opacity-70'}`}>
            <Zap size={20} />
            <span className="text-[10px]">Puntos</span>
          </Link>
          <Link to="/ranking" className={`flex flex-col items-center gap-1 ${location.pathname === '/ranking' ? 'text-purple-600 dark:text-purple-400 font-bold' : 'opacity-70'}`}>
            <User size={20} />
            <span className="text-[10px]">Ranking</span>
          </Link>
          <Link to="/settings" className={`flex flex-col items-center gap-1 ${location.pathname === '/settings' ? 'text-purple-600 dark:text-purple-400 font-bold' : 'opacity-70'}`}>
            <Settings size={20} />
            <span className="text-[10px]">Ajustes</span>
          </Link>
          {isAdmin && (
            <Link to="/admin" className={`flex flex-col items-center gap-1 ${location.pathname === '/admin' ? 'text-amber-500 font-bold' : 'text-amber-600 dark:text-amber-400 opacity-90'}`}>
              <ShieldAlert size={20} />
              <span className="text-[10px]">Admin</span>
            </Link>
          )}
        </nav>
      )}
    </div>
  );
};
