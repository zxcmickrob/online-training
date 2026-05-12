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
    <div style={{ maxWidth: '450px', margin: '100px auto' }}>
      <motion.div 
        className="bento-card"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <h1 style={{ fontSize: '2.5rem', textAlign: 'center', marginBottom: '32px' }}>Вход в систему</h1>
        
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
          <button type="submit" className="main-btn">Войти</button>
        </form>
        
        <p style={{ textAlign: 'center', marginTop: '24px', color: 'var(--text-p)' }}>
          Нет аккаунта? <Link to="/register" style={{ color: 'var(--accent)', fontWeight: '700', textDecoration: 'none' }}>Зарегистрироваться</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
