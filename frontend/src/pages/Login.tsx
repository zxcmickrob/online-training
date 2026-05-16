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
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        style={{ textAlign: 'center', marginBottom: '60px' }}
      >
        <span style={{ color: 'var(--accent)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.4em', fontSize: '0.8rem', display: 'block', marginBottom: '16px' }}>
          Инновационная платформа
        </span>
        <h1 style={{ 
          fontSize: 'clamp(2rem, 6vw, 4.5rem)', 
          lineHeight: '1.2', 
          marginBottom: '24px',
          textShadow: '0 0 50px rgba(168, 85, 247, 0.2)',
          background: 'none',
          WebkitTextFillColor: 'initial'
        }}>
          <span style={{ color: 'white' }}>Подготовка к ЕГЭ</span><br/>
          <span style={{ 
            background: 'var(--grad)', 
            WebkitBackgroundClip: 'text', 
            WebkitTextFillColor: 'transparent' 
          }}>профмат</span>
        </h1>
        <div style={{ 
            background: 'var(--grad)', 
            height: '4px', 
            width: '100px', 
            margin: '0 auto',
            borderRadius: '10px',
            boxShadow: '0 0 20px var(--accent-glow)'
        }}></div>
      </motion.div>

      {/* Login Card */}
      <motion.div 
        className="bento-card"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{}} 
        whileTap={{}}
        transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
        style={{ width: '100%', maxWidth: '460px', padding: '40px' }}
      >
        <h2 style={{ textAlign: 'center', marginBottom: '32px', fontSize: '2.2rem' }}>Вход</h2>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
          <button type="submit" className="main-btn" style={{ fontSize: '1.2rem', padding: '20px', marginTop: '10px' }}>ВОЙТИ</button>
        </form>
        
        <p style={{ textAlign: 'center', marginTop: '32px', color: 'var(--text-p)', fontSize: '1rem' }}>
          Впервые здесь? <Link to="/register" style={{ color: 'var(--accent)', fontWeight: '800', textDecoration: 'none' }}>Создать аккаунт</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
