import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Training from './pages/Training';
import StudentStats from './pages/StudentStats';
import AdminPanel from './pages/AdminPanel';
import AdminTasks from './pages/AdminTasks';
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
    <div className="floating-nav">
      <Link to="/" className="nav-link">Главная</Link>
      {role !== 'admin' && <Link to="/training" className="nav-link">Тренажёр</Link>}
      {role !== 'admin' && <Link to="/statistics" className="nav-link">Статистика</Link>}
      {/* Показываем админку только для преподавателей */}
      {role === 'admin' && <Link to="/admin-tasks" className="nav-link">Задачи</Link>}
      {role === 'admin' && <Link to="/admin" className="nav-link">Статистика</Link>}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navigation />
        <Toaster 
          position="top-right"
          toastOptions={{
            style: {
              background: '#1e293b',
              color: '#fff',
              borderRadius: '12px',
              border: '1px solid rgba(168, 85, 247, 0.2)',
            },
          }}
        />
        <div className="container">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/training" element={<Training />} />
            <Route path="/training/:taskId" element={<Training />} />
            <Route path="/statistics" element={
              <ProtectedRoute>
                <StudentStats />
              </ProtectedRoute>
            } />
            <Route path="/admin-tasks" element={<AdminTasks />} />
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
