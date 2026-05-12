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
    <div style={{ maxWidth: '480px', margin: '80px auto' }}>
      <motion.div 
        className="bento-card"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h1 style={{ fontSize: '2.8rem', marginBottom: '12px' }}>Аккаунт</h1>
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
          <button type="submit" className="main-btn" style={{ fontSize: '1.1rem', padding: '18px' }}>СОЗДАТЬ АККАУНТ</button>
        </form>
        
        <p style={{ textAlign: 'center', marginTop: '24px', color: 'var(--text-p)', fontSize: '0.95rem' }}>
          Уже есть аккаунт? <Link to="/login" style={{ color: 'var(--accent)', fontWeight: '800', textDecoration: 'none' }}>Войти</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
