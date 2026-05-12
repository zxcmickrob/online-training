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
    <div style={{ maxWidth: '480px', margin: '100px auto' }}>
      <motion.div 
        className="bento-card"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h1 style={{ fontSize: '3rem', marginBottom: '16px' }}>Вход</h1>
            <div style={{ 
                background: 'var(--grad)', 
                height: '4px', 
                width: '60px', 
                margin: '0 auto 24px',
                borderRadius: '10px',
                boxShadow: '0 0 15px var(--accent-glow)'
            }}></div>
            <p style={{ 
                color: 'white', 
                fontSize: '1.1rem', 
                fontWeight: '800', 
                lineHeight: '1.4',
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
                textShadow: '0 0 10px rgba(168, 85, 247, 0.5)'
            }}>
                Совершенно новый подход<br/>
                к подготовке к ЕГЭ
            </p>
        </div>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <input 
            className="main-input"
            type="text" 
            placeholder="Ваш логин" 
            value={username} 
            onChange={e => setUsername(e.target.value)} 
            required 
          />
          <input 
            className="main-input"
            type="password" 
            placeholder="Ваш пароль" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            required 
          />
          <button type="submit" className="main-btn" style={{ fontSize: '1.2rem', padding: '20px' }}>ВОЙТИ В СИСТЕМУ</button>
        </form>
        
        <p style={{ textAlign: 'center', marginTop: '32px', color: 'var(--text-p)', fontSize: '0.95rem' }}>
          Впервые здесь? <Link to="/register" style={{ color: 'var(--accent)', fontWeight: '800', textDecoration: 'none' }}>Создать аккаунт</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
