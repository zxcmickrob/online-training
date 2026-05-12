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
    <div style={{ maxWidth: '450px', margin: '100px auto' }}>
      <motion.div 
        className="bento-card"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <h1 style={{ fontSize: '2.5rem', textAlign: 'center', marginBottom: '32px' }}>Создать аккаунт</h1>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Переключатель ролей */}
          <div style={{ display: 'flex', background: 'rgba(0,0,0,0.2)', padding: '5px', borderRadius: '15px' }}>
            <button 
              type="button"
              onClick={() => setRole('student')}
              style={{
                flex: 1, border: 'none', padding: '12px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer',
                background: role === 'student' ? 'var(--grad)' : 'transparent', color: 'white', transition: '0.3s'
              }}
            >
              Студент
            </button>
            <button 
              type="button"
              onClick={() => setRole('admin')}
              style={{
                flex: 1, border: 'none', padding: '12px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer',
                background: role === 'admin' ? 'var(--grad)' : 'transparent', color: 'white', transition: '0.3s'
              }}
            >
              Преподаватель
            </button>
          </div>

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
          <button type="submit" className="main-btn">Зарегистрироваться</button>
        </form>
        
        <p style={{ textAlign: 'center', marginTop: '24px', color: 'var(--text-p)' }}>
          Уже есть аккаунт? <Link to="/login" style={{ color: 'var(--accent)', fontWeight: '700', textDecoration: 'none' }}>Войти</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
