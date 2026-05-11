import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

const Register: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/register', { username, password });
      alert('Регистрация успешна! Теперь вы можете войти.');
      navigate('/login');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Ошибка регистрации');
    }
  };

  return (
    <div className="card auth-form">
      <h1 style={{ textAlign: 'center' }}>Регистрация</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <input 
          type="text" 
          placeholder="Придумайте логин" 
          value={username} 
          onChange={e => setUsername(e.target.value)} 
          required 
        />
        <input 
          type="password" 
          placeholder="Придумайте пароль" 
          value={password} 
          onChange={e => setPassword(e.target.value)} 
          required 
        />
        <button type="submit" className="primary">Зарегистрироваться</button>
      </form>
      <p style={{ textAlign: 'center', marginTop: '1rem' }}>
        Уже есть аккаунт? <Link to="/login">Войти</Link>
      </p>
    </div>
  );
};

export default Register;
