import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header, Sidebar, Footer } from './components/Layout';
import Docs from './pages/Docs';
import Login from './pages/Login';
import Calculator from './pages/Calculator';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import LoadingSpinner from './components/LoadingSpinner';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { currentUser, isGuest, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';
  
  return (
    <div className="min-h-screen flex flex-col bg-[#fef8f5]">
      {!isLoginPage && <Header toggleSidebar={() => setSidebarOpen(true)} />}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="flex-1 w-full">
        <Routes>
          <Route path="/" element={<Navigate to="/docs" replace />} />
          <Route path="/docs" element={<Docs />} />
          <Route path="/login" element={<Login />} />
          <Route path="/calculator" element={<ProtectedRoute><Calculator /></ProtectedRoute>} />
          <Route path="/users/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/users/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </AuthProvider>
  );
}
