import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';
import './App.css';

const ProtectedRoute = ({ children, adminOnly = false }: { children: React.ReactNode, adminOnly?: boolean }) => {
  const { token, role } = useAuth();
  
  if (!token) return <Navigate to="/login" />;
  if (adminOnly && role !== 'admin') return <Navigate to="/" />;
  
  return <>{children}</>;
};

const Navigation = () => {
  const { token, role } = useAuth();
  if (!token) return null;
  
  return (
    <nav className="main-nav">
      <Link to="/">Главная</Link>
      {role === 'admin' && <Link to="/admin">Админ-панель</Link>}
    </nav>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navigation />
        <div className="container">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute adminOnly>
                <AdminPanel />
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
