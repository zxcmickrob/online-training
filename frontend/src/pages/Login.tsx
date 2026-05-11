import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

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
      navigate('/');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Ошибка входа');
    }
  };

  return (
    <div className="card auth-form">
      <h1 style={{ textAlign: 'center' }}>Вход в систему</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <input 
          type="text" 
          placeholder="Логин" 
          value={username} 
          onChange={e => setUsername(e.target.value)} 
          required 
        />
        <input 
          type="password" 
          placeholder="Пароль" 
          value={password} 
          onChange={e => setPassword(e.target.value)} 
          required 
        />
        <button type="submit" className="primary">Войти</button>
      </form>
      <p style={{ textAlign: 'center', marginTop: '1rem' }}>
        Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
      </p>
    </div>
  );
};

export default Login;
