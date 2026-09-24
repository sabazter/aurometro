import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user && !user.emailVerified) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <div className="text-4xl mb-4">📧</div>
        <h2 className="text-2xl font-bold mb-2">Verifica tu correo</h2>
        <p className="opacity-70 max-w-md">
          Hemos enviado un enlace de verificación a tu correo electrónico. Por favor, revisa tu bandeja de entrada o carpeta de spam.
        </p>
      </div>
    );
  }

  if (user && !user.onboardingCompleted && window.location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  return <Outlet />;
};
