import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';

// Import Pages
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import Onboarding from './pages/Onboarding';
import Home from './pages/Home';
import Points from './pages/Points';
import PointsSection from './pages/PointsSection';
import PointsStudents from './pages/PointsStudents';
import Ranking from './pages/Ranking';
import Settings from './pages/Settings';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email/:token" element={<VerifyEmail />} />
            
            <Route element={<Layout />}>
              <Route path="/onboarding" element={<Onboarding />} />
              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<Home />} />
                <Route path="/points" element={<Points />} />
                <Route path="/points/:year" element={<PointsSection />} />
                <Route path="/points/:year/:section" element={<PointsStudents />} />
                <Route path="/ranking" element={<Ranking />} />
                <Route path="/settings" element={<Settings />} />
              </Route>
            </Route>
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
