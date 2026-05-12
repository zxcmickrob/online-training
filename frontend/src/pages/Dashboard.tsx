import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

interface Task {
  id: number;
  number: number;
  title: string;
  question: string;
}

interface Stats {
  username: string;
  solved_count: number;
  solved_tasks_ids: number[];
}

const Dashboard: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'solved' | 'unsolved'>('all');
  
  const { logout, role } = useAuth();

  const fetchData = async () => {
    try {
      const [tasksRes, statsRes] = await Promise.all([
        api.get('/tasks'),
        api.get('/statistics')
      ]);
      setTasks(tasksRes.data);
      setStats(statsRes.data);
    } catch {
      console.error('Failed to fetch data');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         task.number.toString().includes(searchTerm);
    const isSolved = stats?.solved_tasks_ids.includes(task.id);
    
    if (filter === 'solved') return matchesSearch && isSolved;
    if (filter === 'unsolved') return matchesSearch && !isSolved;
    return matchesSearch;
  });

  const groupedTasks = filteredTasks.reduce((acc, task) => {
    const category = task.title.split(' (')[0];
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  const totalTasks = tasks.length;
  const solvedCount = stats?.solved_count || 0;
  const progressPercent = totalTasks > 0 ? Math.round((solvedCount / totalTasks) * 100) : 0;

  // Система рангов
  const getRank = (count: number) => {
    if (count === 0) return 'НОВИЧОК';
    if (count < 3) return 'УЧЕНИК';
    if (count < 10) return 'АЛГЕБРАИСТ';
    if (count < 20) return 'МАСТЕР ЛОГАРИФМОВ';
    return 'БОГ МАТЕМАТИКИ';
  };

  return (
    <div style={{ paddingBottom: '100px' }}>
      {/* Приветствие */}
      <div style={{ marginBottom: '64px' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <span style={{ color: 'var(--accent)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.2em', fontSize: '0.8rem' }}>
            Личный кабинет
          </span>
          <h1 style={{ marginTop: '10px' }}>Привет, {stats?.username || (role === 'admin' ? 'Преподаватель' : 'Ученик')}!</h1>
          {role !== 'admin' && <div className="rank-badge">{getRank(solvedCount)}</div>}
        </motion.div>
      </div>

      <div className="bento-grid">
        {/* Карточка статистики */}
        {role !== 'admin' && (
          <motion.div className="bento-card" style={{ gridColumn: 'span 4' }} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <h3 style={{ margin: 0 }}>Общий прогресс</h3>
            <div style={{ fontSize: '4rem', fontWeight: '800', color: 'var(--accent)', margin: '20px 0' }}>
              {progressPercent}%
            </div>
            <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
              <motion.div initial={{ width: 0 }} animate={{ width: `${progressPercent}%` }} style={{ height: '100%', background: 'var(--grad)' }} />
            </div>
            <p style={{ color: 'var(--text-p)', marginTop: '15px', fontSize: '0.9rem' }}>
              Решено задач: {solvedCount} из {totalTasks}
            </p>
          </motion.div>
        )}

        {/* Поиск и фильтры */}
        <motion.div className="bento-card" style={{ gridColumn: role === 'admin' ? 'span 12' : 'span 8' }} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
          <h3 style={{ margin: '0 0 20px 0' }}>База знаний</h3>
          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
            <input 
              className="main-input" 
              style={{ flex: 1, minWidth: '200px' }}
              placeholder="Поиск задания..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <div style={{ display: 'flex', gap: '8px', background: 'rgba(0,0,0,0.2)', padding: '5px', borderRadius: '15px', flexWrap: 'wrap' }}>
              {(['all', 'solved', 'unsolved'] as const).map((f) => (
                <button 
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{
                    background: filter === f ? 'var(--grad)' : 'transparent',
                    border: 'none', color: 'white', padding: '8px 16px', borderRadius: '10px',
                    fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer', transition: '0.3s'
                  }}
                >
                  {f === 'all' ? 'Все' : f === 'solved' ? 'Решенные' : 'В процессе'}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Список задач по категориям */}
        <div style={{ gridColumn: 'span 12', marginTop: '20px' }}>
          <AnimatePresence>
            {Object.entries(groupedTasks).map(([category, catTasks], categoryIndex) => (
              <motion.div 
                key={category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: categoryIndex * 0.1 }}
                style={{ marginBottom: '40px' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                  <h2 style={{ color: 'white', margin: 0, fontSize: '1.8rem' }}>{category}</h2>
                  <span style={{ background: 'rgba(168, 85, 247, 0.2)', color: '#c084fc', padding: '4px 12px', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.9rem' }}>
                    {catTasks.length} задач
                  </span>
                  <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, rgba(168, 85, 247, 0.5) 0%, transparent 100%)', marginLeft: '10px' }}></div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                  {catTasks.map((task) => (
                    <motion.div 
                      key={task.id}
                      className="bento-card" 
                      style={{ 
                        minHeight: '180px',
                        border: stats?.solved_tasks_ids.includes(task.id) ? '1px solid #10b98155' : '1px solid var(--card-border)'
                      }}
                      whileHover={{ scale: 1.02, boxShadow: '0 10px 30px rgba(168, 85, 247, 0.15)' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                        <span style={{ color: 'var(--accent)', fontWeight: '800' }}>#{task.number}</span>
                        {stats?.solved_tasks_ids.includes(task.id) && (
                          <span style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '2px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '800' }}>
                            ВЫПОЛНЕНО
                          </span>
                        )}
                      </div>
                      <h3 style={{ margin: '0 0 10px 0', fontSize: '1.2rem', lineHeight: '1.4' }}>{task.title}</h3>
                      <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
                        <a 
                          href={`/training`} 
                          style={{ 
                            textDecoration: 'none', 
                            color: stats?.solved_tasks_ids.includes(task.id) ? '#94a3b8' : 'white',
                            fontWeight: '700',
                            fontSize: '0.9rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: stats?.solved_tasks_ids.includes(task.id) ? 'transparent' : 'rgba(255,255,255,0.05)',
                            padding: stats?.solved_tasks_ids.includes(task.id) ? '0' : '10px 20px',
                            borderRadius: '12px',
                            transition: '0.3s'
                          }}
                        >
                          {stats?.solved_tasks_ids.includes(task.id) ? 'Повторить' : 'Перейти к решению'} <span>→</span>
                        </a>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {Object.keys(groupedTasks).length === 0 && (
            <div style={{ textAlign: 'center', padding: '100px', color: 'var(--text-p)' }}>
              <h2>Задач не найдено</h2>
              <p>Попробуй изменить параметры поиска или фильтры</p>
            </div>
          )}
        </div>
      </div>

      {/* Кнопка выхода */}
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

export default Dashboard;
