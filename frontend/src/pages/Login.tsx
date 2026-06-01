import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/login', { username, password });
      login(res.data.access_token, res.data.role);
      toast.success('Успешный вход!');
      navigate('/');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Ошибка входа');
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      width: '100%',
      display: 'flex', 
      flexDirection: 'column', 
      justifyContent: 'center', 
      alignItems: 'center',
      padding: '40px 20px',
      boxSizing: 'border-box'
    }}>
      {/* Hero Slogan Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        style={{ textAlign: 'center', marginBottom: '40px' }}
      >
        <span style={{ color: 'var(--accent)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.2em', fontSize: '0.85rem', display: 'block', marginBottom: '12px' }}>
          Инновационная платформа
        </span>
        <h1 style={{ 
          fontSize: '2.5rem', 
          lineHeight: '1.2', 
          marginBottom: '24px',
          color: 'var(--text-h)'
        }}>
          Подготовка к ЕГЭ<br/>
          <span style={{ color: 'var(--accent)' }}>профмат</span>
        </h1>
      </motion.div>

      {/* Login Card */}
      <motion.div 
        className="bento-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        style={{ width: '100%', maxWidth: '400px', padding: '32px' }}
      >
        <h2 style={{ textAlign: 'center', marginBottom: '24px', fontSize: '1.5rem' }}>Вход</h2>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <input 
            className="main-input"
            type="text" 
            placeholder="Логин" 
            value={username} 
            onChange={e => setUsername(e.target.value)} 
            required 
          />
          <input 
            className="main-input"
            type="password" 
            placeholder="Пароль" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            required 
          />
          <button type="submit" className="main-btn" style={{ fontSize: '1rem', padding: '12px', marginTop: '8px' }}>ВОЙТИ</button>
        </form>
        
        <p style={{ textAlign: 'center', marginTop: '24px', color: 'var(--text-p)', fontSize: '0.95rem' }}>
          Впервые здесь? <Link to="/register" style={{ color: 'var(--accent)', fontWeight: '600', textDecoration: 'none' }}>Создать аккаунт</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
