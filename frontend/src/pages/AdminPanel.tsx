import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

interface UserStat {
  id: number;
  username: string;
  role: string;
  solved_count: number;
}

const AdminPanel: React.FC = () => {
  const [users, setUsers] = useState<UserStat[]>([]);
  const { logout } = useAuth();

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to fetch users', err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteUser = async (id: number) => {
    if (!window.confirm('Вы уверены, что хотите удалить этого пользователя?')) return;
    try {
      await api.delete(`/users/${id}`);
      alert('Пользователь удален');
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Ошибка при удалении');
    }
  };

  return (
    <div style={{ paddingBottom: '100px' }}>
      <header style={{ marginBottom: '60px' }}>
        <span style={{ color: 'var(--accent)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.2em', fontSize: '0.8rem' }}>
          Доступ: Преподаватель
        </span>
        <h1>Статистика учеников</h1>
      </header>

      <div className="bento-grid">
        <motion.div 
          className="bento-card" 
          style={{ gridColumn: 'span 12' }}
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
        >
          <h3 style={{ marginTop: 0, marginBottom: '24px' }}>Зарегистрированные пользователи ({users.length})</h3>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--card-border)', color: 'var(--text-p)' }}>
                  <th style={{ padding: '15px 10px', fontWeight: '600' }}>ID</th>
                  <th style={{ padding: '15px 10px', fontWeight: '600' }}>Логин (Имя)</th>
                  <th style={{ padding: '15px 10px', fontWeight: '600' }}>Роль</th>
                  <th style={{ padding: '15px 10px', fontWeight: '600' }}>Решено задач</th>
                  <th style={{ padding: '15px 10px', fontWeight: '600' }}>Уровень</th>
                  <th style={{ padding: '15px 10px', fontWeight: '600', textAlign: 'right' }}>Действия</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <motion.tr 
                    key={user.id}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.05 }}
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }}
                    whileHover={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
                  >
                    <td style={{ padding: '15px 10px', color: 'var(--accent)', fontWeight: '800' }}>#{user.id}</td>
                    <td style={{ padding: '15px 10px', fontWeight: '600' }}>{user.username}</td>
                    <td style={{ padding: '15px 10px' }}>
                      <span style={{ 
                        background: user.role === 'admin' ? 'rgba(168, 85, 247, 0.2)' : 'rgba(255, 255, 255, 0.1)', 
                        color: user.role === 'admin' ? '#c084fc' : '#cbd5e1',
                        padding: '4px 10px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 'bold'
                      }}>
                        {user.role === 'admin' ? 'ПРЕПОДАВАТЕЛЬ' : 'УЧЕНИК'}
                      </span>
                    </td>
                    <td style={{ padding: '15px 10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontWeight: '800', fontSize: '1.1rem' }}>{user.solved_count}</span>
                        <div style={{ height: '4px', width: '50px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px' }}>
                          <div style={{ height: '100%', width: `${Math.min((user.solved_count / 10) * 100, 100)}%`, background: 'var(--grad)', borderRadius: '2px' }}></div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '15px 10px', color: 'var(--text-p)', fontSize: '0.9rem' }}>
                      {user.solved_count >= 10 ? 'Бог математики 🏆' : user.solved_count >= 3 ? 'Алгебраист 📚' : 'Новичок 🐣'}
                    </td>
                    <td style={{ padding: '15px 10px', textAlign: 'right' }}>
                      <button 
                        onClick={() => handleDeleteUser(user.id)}
                        style={{ background: 'rgba(244, 63, 94, 0.1)', color: '#f43f5e', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem' }}
                      >
                        Удалить
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            
            {users.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-p)' }}>
                Пользователей пока нет.
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '60px' }}>
        <button 
          onClick={logout} 
          className="main-btn" 
          style={{ background: 'rgba(244, 63, 94, 0.1)', color: '#f43f5e', border: '1px solid rgba(244, 63, 94, 0.2)', boxShadow: 'none' }}
        >
          Выйти из системы
        </button>
      </div>
    </div>
  );
};

export default AdminPanel;
