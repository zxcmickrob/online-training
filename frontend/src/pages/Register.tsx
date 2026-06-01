import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const Register: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/register', { username, password, role });
      toast.success('Регистрация успешна! Теперь вы можете войти.');
      navigate('/login');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Ошибка регистрации');
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
          {role === 'student' ? 'Присоединяйся к нам' : 'Присоединяйся к нам'}
        </span>
        <h1 style={{ 
          fontSize: '2.5rem', 
          lineHeight: '1.2', 
          marginBottom: '24px',
          color: 'var(--text-h)'
        }}>
          Профильная<br/>
          <span style={{ color: 'var(--accent)' }}>математика</span>
        </h1>
      </motion.div>

      {/* Register Card */}
      <motion.div 
        className="bento-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        style={{ width: '100%', maxWidth: '400px', padding: '32px' }}
      >
        <h2 style={{ textAlign: 'center', marginBottom: '24px', fontSize: '1.5rem' }}>Аккаунт</h2>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Переключатель ролей */}
          <div style={{ display: 'flex', background: 'var(--input-bg)', padding: '4px', borderRadius: '8px', border: '1px solid var(--card-border)' }}>
            <button 
              type="button"
              onClick={() => setRole('student')}
              style={{
                flex: 1, border: 'none', padding: '8px 12px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', fontSize: '0.9rem',
                background: role === 'student' ? 'var(--surface)' : 'transparent', color: role === 'student' ? 'var(--text-h)' : 'var(--text-p)', transition: '0.2s',
                boxShadow: role === 'student' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              Ученик
            </button>
            <button 
              type="button"
              onClick={() => setRole('admin')}
              style={{
                flex: 1, border: 'none', padding: '8px 12px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', fontSize: '0.9rem',
                background: role === 'admin' ? 'var(--surface)' : 'transparent', color: role === 'admin' ? 'var(--text-h)' : 'var(--text-p)', transition: '0.2s',
                boxShadow: role === 'admin' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              Преподаватель
            </button>
          </div>

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
          <button type="submit" className="main-btn" style={{ fontSize: '1rem', padding: '12px', marginTop: '8px' }}>СОЗДАТЬ АККАУНТ</button>
        </form>
        
        <p style={{ textAlign: 'center', marginTop: '24px', color: 'var(--text-p)', fontSize: '0.95rem' }}>
          Уже есть аккаунт? <Link to="/login" style={{ color: 'var(--accent)', fontWeight: '600', textDecoration: 'none' }}>Войти</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
