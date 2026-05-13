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
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        style={{ textAlign: 'center', marginBottom: '60px' }}
      >
        <span style={{ color: 'var(--accent)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.4em', fontSize: '0.8rem', display: 'block', marginBottom: '16px' }}>
          {role === 'student' ? 'Присоединяйся к нам' : 'Инструменты для профи'}
        </span>
        <h1 style={{ 
          fontSize: 'clamp(2rem, 6vw, 4.5rem)', 
          lineHeight: '1.2', 
          marginBottom: '24px',
          textShadow: '0 0 50px rgba(168, 85, 247, 0.2)',
          background: 'none',
          WebkitTextFillColor: 'initial'
        }}>
          {role === 'student' ? (
            <>
              <span style={{ color: 'white' }}>Математика</span><br/>
              <span style={{ 
                background: 'var(--grad)', 
                WebkitBackgroundClip: 'text', 
                WebkitTextFillColor: 'transparent' 
              }}>без границ</span>
            </>
          ) : (
            <>
              <span style={{ color: 'white' }}>Фокус</span><br/>
              <span style={{ 
                background: 'var(--grad)', 
                WebkitBackgroundClip: 'text', 
                WebkitTextFillColor: 'transparent' 
              }}>на результате</span>
            </>
          )}
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

      {/* Register Card */}
      <motion.div 
        className="bento-card"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{}}
        whileTap={{}}
        transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
        style={{ width: '100%', maxWidth: '460px', padding: '40px' }}
      >
        <h2 style={{ textAlign: 'center', marginBottom: '32px', fontSize: '2.2rem' }}>Аккаунт</h2>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Переключатель ролей */}
          <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', padding: '5px', borderRadius: '18px', border: '1px solid var(--card-border)' }}>
            <button 
              type="button"
              onClick={() => setRole('student')}
              style={{
                flex: 1, border: 'none', padding: '14px', borderRadius: '14px', fontWeight: '800', cursor: 'pointer',
                background: role === 'student' ? 'var(--grad)' : 'transparent', color: 'white', transition: '0.3s'
              }}
            >
              Ученик
            </button>
            <button 
              type="button"
              onClick={() => setRole('admin')}
              style={{
                flex: 1, border: 'none', padding: '14px', borderRadius: '14px', fontWeight: '800', cursor: 'pointer',
                background: role === 'admin' ? 'var(--grad)' : 'transparent', color: 'white', transition: '0.3s'
              }}
            >
              Преподаватель
            </button>
          </div>

          <input 
            className="main-input"
            type="text" 
            placeholder="Придумайте логин" 
            value={username} 
            onChange={e => setUsername(e.target.value)} 
            required 
          />
          <input 
            className="main-input"
            type="password" 
            placeholder="Придумайте пароль" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            required 
          />
          <button type="submit" className="main-btn" style={{ fontSize: '1.1rem', padding: '18px', marginTop: '10px' }}>СОЗДАТЬ АККАУНТ</button>
        </form>
        
        <p style={{ textAlign: 'center', marginTop: '24px', color: 'var(--text-p)', fontSize: '1rem' }}>
          Уже есть аккаунт? <Link to="/login" style={{ color: 'var(--accent)', fontWeight: '800', textDecoration: 'none' }}>Войти</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
