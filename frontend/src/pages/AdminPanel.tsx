import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import toast from 'react-hot-toast';

interface UserStat {
  id: number;
  username: string;
  role: string;
  solved_count: number;
}

const AdminPanel: React.FC = () => {
  const [users, setUsers] = useState<UserStat[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'student'>('all');

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
      toast.success('Пользователь удален');
      fetchUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Ошибка при удалении');
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.username.toLowerCase().includes(searchTerm.toLowerCase()) || u.id.toString() === searchTerm;
    const matchesRole = roleFilter === 'all' ? true : u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Helper to generate a consistent avatar color based on username
  const getAvatarColor = (username: string) => {
    const colors = ['#0ea5e9', '#3b82f6', '#0284c7', '#0369a1', '#0c4a6e', '#14b8a6', '#0d9488'];
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const getRankInfo = (count: number) => {
    if (count >= 30) return { label: 'ЛЕГЕНДА', color: 'url(#legend-grad)' };
    if (count >= 15) return { label: 'МАГИСТР', color: '#d97706' };
    if (count >= 5) return { label: 'ПРОФИ', color: '#2563eb' };
    if (count >= 1) return { label: 'УЧЕНИК', color: '#059669' };
    return { label: 'НОВИЧОК', color: '#64748b' };
  };

  return (
    <div style={{ paddingBottom: '60px' }}>
      <svg style={{ width: 0, height: 0, position: 'absolute' }} aria-hidden="true">
        <linearGradient id="legend-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
      </svg>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <span style={{ color: 'var(--accent)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.8rem', display: 'block', marginBottom: '8px' }}>
            Доступ: Преподаватель
          </span>
          <h1 style={{ fontSize: '2.2rem', marginBottom: '8px' }}>Статистика учеников</h1>
          <p style={{ color: 'var(--text-p)', margin: 0, fontSize: '1rem', maxWidth: '600px' }}>
            Управление пользователями платформы. Просматривайте прогресс, фильтруйте учеников и управляйте аккаунтами.
          </p>
        </motion.div>
      </div>

      <div className="bento-grid">
        <motion.div className="bento-card span-12" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Controls Bar */}
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '24px', background: 'var(--input-bg)', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--card-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: '250px', background: 'var(--surface)', borderRadius: '8px', padding: '0 12px', border: '1px solid var(--card-border)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-p)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              <input 
                style={{ border: 'none', background: 'transparent', width: '100%', padding: '10px 10px', color: 'var(--text-h)', outline: 'none', fontSize: '0.95rem', fontFamily: 'inherit' }} 
                placeholder="Поиск по логину или ID..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div style={{ display: 'flex', gap: '4px', background: 'var(--surface)', padding: '4px', borderRadius: '8px', border: '1px solid var(--card-border)' }}>
              {(['all', 'student', 'admin'] as const).map((r) => (
                <button 
                  key={r}
                  onClick={() => setRoleFilter(r)}
                  style={{
                    background: roleFilter === r ? 'var(--input-bg)' : 'transparent',
                    border: '1px solid transparent',
                    color: roleFilter === r ? 'var(--text-h)' : 'var(--text-p)',
                    padding: '8px 16px', borderRadius: '6px',
                    fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer', transition: '0.2s',
                  }}
                >
                  {r === 'all' ? 'Все' : r === 'student' ? 'Ученики' : 'Преподаватели'}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', padding: '0 8px' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Список пользователей</h3>
            <span style={{ background: 'var(--input-bg)', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-p)', border: '1px solid var(--card-border)' }}>
              Найдено: {filteredUsers.length}
            </span>
          </div>

          {/* Users List Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <AnimatePresence>
              {filteredUsers.map((user) => {
                const avatarColor = getAvatarColor(user.username);
                const rankInfo = getRankInfo(user.solved_count);
                const progressPercent = Math.min((user.solved_count / 30) * 100, 100);

                return (
                  <motion.div 
                    key={user.id}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                    style={{ 
                      background: 'var(--surface)', border: '1px solid var(--card-border)', borderRadius: '12px', 
                      padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '20px',
                      transition: 'border-color 0.2s, transform 0.2s', cursor: 'default'
                    }}
                    whileHover={{ y: -2, borderColor: 'var(--accent)' }}
                  >
                    {/* Avatar */}
                    <div style={{ 
                      width: '48px', height: '48px', borderRadius: '50%', background: avatarColor, 
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white', fontWeight: '800', fontSize: '1.2rem', textTransform: 'uppercase',
                      flexShrink: 0, boxShadow: `0 4px 12px ${avatarColor}40`
                    }}>
                      {user.username.substring(0, 2)}
                    </div>

                    {/* User Info */}
                    <div style={{ flex: '1 1 200px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-h)' }}>{user.username}</span>
                        {user.role === 'admin' && (
                          <span style={{ background: 'var(--accent-glow)', color: 'var(--accent)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: '800', border: '1px solid var(--accent)' }}>
                            АДМИН
                          </span>
                        )}
                      </div>
                      <div style={{ color: 'var(--text-p)', fontSize: '0.85rem', fontWeight: '500' }}>
                        ID: <span style={{ color: 'var(--text-h)', fontWeight: '600' }}>#{user.id}</span>
                      </div>
                    </div>

                    {/* Progress Section */}
                    {user.role === 'student' ? (
                      <div style={{ flex: '2 1 300px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-p)', fontWeight: '600' }}>
                            Ранг: <span style={{ fill: rankInfo.color, color: typeof rankInfo.color === 'string' && !rankInfo.color.startsWith('url') ? rankInfo.color : 'var(--text-h)', fontWeight: '700' }}>{rankInfo.label}</span>
                          </span>
                          <span style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-h)' }}>
                            {user.solved_count} <span style={{ color: 'var(--text-p)', fontSize: '0.8rem', fontWeight: '500' }}>задач</span>
                          </span>
                        </div>
                        <div style={{ height: '6px', background: 'var(--input-bg)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${progressPercent}%`, background: rankInfo.color.startsWith('url') ? 'var(--grad)' : rankInfo.color, borderRadius: '3px' }} />
                        </div>
                      </div>
                    ) : (
                      <div style={{ flex: '2 1 300px', display: 'flex', alignItems: 'center', color: 'var(--text-p)', fontSize: '0.9rem', fontWeight: '500', fontStyle: 'italic' }}>
                        Прогресс не отслеживается
                      </div>
                    )}

                    {/* Actions */}
                    <div style={{ flexShrink: 0, paddingLeft: '16px', borderLeft: '1px solid var(--card-border)' }}>
                      <button 
                        onClick={() => handleDeleteUser(user.id)}
                        style={{ 
                          background: 'rgba(244, 63, 94, 0.1)', color: '#f43f5e', border: 'none', 
                          padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', 
                          fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', transition: '0.2s' 
                        }}
                        onMouseOver={e => e.currentTarget.style.background = 'rgba(244, 63, 94, 0.2)'}
                        onMouseOut={e => e.currentTarget.style.background = 'rgba(244, 63, 94, 0.1)'}
                        title="Удалить пользователя"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                        УДАЛИТЬ
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {filteredUsers.length === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-p)', background: 'var(--surface)', borderRadius: '12px', border: '1px dashed var(--card-border)' }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '16px', opacity: 0.5 }}><circle cx="12" cy="12" r="10"></circle><path d="M16 16s-1.5-2-4-2-4 2-4 2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>
                <h3 style={{ margin: '0 0 8px 0', color: 'var(--text-h)' }}>Пользователи не найдены</h3>
                <p style={{ margin: 0, fontSize: '0.9rem' }}>Попробуйте изменить параметры поиска или фильтр ролей.</p>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminPanel;