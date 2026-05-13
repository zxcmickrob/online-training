import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface Task {
  id: number;
  number: string | number;
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
  
  const { role } = useAuth();

  const fetchData = async () => {
    try {
      const [tasksRes, statsRes] = await Promise.all([
        api.get('/tasks'),
        api.get('/statistics')
      ]);
      
      const sortedTasks = tasksRes.data.sort((a: Task, b: Task) => {
        const numA = parseInt(String(a.number)) || 0;
        const numB = parseInt(String(b.number)) || 0;
        if (numA !== numB) return numA - numB;
        return a.id - b.id;
      });
      
      setTasks(sortedTasks);
      setStats(statsRes.data);
    } catch {
      console.error('Failed to fetch data');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const renderMath = (text: string) => {
    if (!text) return text;
    try {
      const parts = text.split('$');
      return parts.map((part, index) => {
        if (index % 2 === 1) {
          return (
            <span 
              key={index} 
              style={{ color: 'var(--accent)', fontWeight: '700' }}
              dangerouslySetInnerHTML={{ __html: katex.renderToString(part, { throwOnError: false }) }} 
            />
          );
        }
        return <span key={index}>{part}</span>;
      });
    } catch (e) {
      return text;
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         task.number.toString().includes(searchTerm);
    const isSolved = stats?.solved_tasks_ids.includes(task.id);
    
    if (filter === 'solved') return matchesSearch && isSolved;
    if (filter === 'unsolved') return matchesSearch && !isSolved;
    return matchesSearch;
  });

  const TOPIC_ORDER = [
    "Планиметрия",
    "Стереометрия",
    "Теория вероятностей",
    "Логарифмические уравнения",
    "Вычисления и преобразования",
    "Производная",
    "Текстовые задачи",
    "Графики функций"
  ];

  const categoriesMap = filteredTasks.reduce((acc, task) => {
    const category = task.title || 'Без темы';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  const sortedCategories = Object.entries(categoriesMap).sort((a, b) => {
    const indexA = TOPIC_ORDER.indexOf(a[0]);
    const indexB = TOPIC_ORDER.indexOf(b[0]);
    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;
    return a[0].localeCompare(b[0]);
  });

  sortedCategories.forEach(([_, catTasks]) => {
    catTasks.sort((a, b) => {
      const numA = parseInt(String(a.number)) || 0;
      const numB = parseInt(String(b.number)) || 0;
      return numA - numB;
    });
  });

  const solvedCount = stats?.solved_count || 0;

  const getRank = (count: number) => {
    if (count === 0) return 'НОВИЧОК';
    if (count < 5) return 'УЧЕНИК';
    if (count < 15) return 'ПРОФИ';
    if (count < 30) return 'МАГИСТР';
    return 'ЛЕГЕНДА';
  };

  return (
    <div style={{ paddingBottom: '100px' }}>
      <div style={{ marginBottom: '64px' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <span style={{ color: 'var(--accent)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.2em', fontSize: '0.8rem' }}>
            Личный кабинет
          </span>
          <h1 style={{ marginTop: '10px' }}>Привет, {stats?.username || (role === 'admin' ? 'Преподаватель' : 'Ученик')}!</h1>
          {role !== 'admin' && (
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginTop: '15px' }}>
                <div className="rank-badge" style={{ padding: '8px 20px', fontSize: '0.9rem' }}>{getRank(solvedCount)}</div>
                <div style={{ color: 'var(--text-p)', fontSize: '0.9rem', fontWeight: '600' }}>Решено задач: {solvedCount}</div>
              </div>
          )}
        </motion.div>
      </div>

      <div className="bento-grid">
        <motion.div className="bento-card" style={{ gridColumn: 'span 12' }} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <h3 style={{ margin: '0 0 20px 0' }}>База знаний</h3>
          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
            <input 
              className="main-input" 
              style={{ flex: 1, minWidth: '200px' }}
              placeholder="Поиск по теме или номеру..." 
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

        <div style={{ gridColumn: 'span 12', marginTop: '40px' }}>
          <AnimatePresence>
            {sortedCategories.map(([category, catTasks], categoryIndex) => (
              <motion.div 
                key={category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: categoryIndex * 0.1 }}
                style={{ marginBottom: '50px' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px' }}>
                  <h2 style={{ color: 'white', margin: 0, fontSize: '1.8rem', fontWeight: '800' }}>{category}</h2>
                  <span style={{ background: 'rgba(168, 85, 247, 0.2)', color: '#c084fc', padding: '4px 12px', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.9rem' }}>
                    {catTasks.length} задач
                  </span>
                  <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, rgba(168, 85, 247, 0.5) 0%, transparent 100%)', marginLeft: '10px' }}></div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
                  {catTasks.map((task) => {
                    const isSolved = stats?.solved_tasks_ids.includes(task.id);
                    return (
                      <motion.div 
                        key={task.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ y: -5, scale: 1.01 }}
                      >
                        <Link 
                          to={`/training/${task.id}`} 
                          className="bento-card" 
                          style={{ 
                            minHeight: '110px',
                            display: 'flex',
                            flexDirection: 'column',
                            padding: '20px 24px',
                            border: isSolved ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid var(--card-border)',
                            textDecoration: 'none',
                            cursor: 'pointer',
                            boxShadow: 'none'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                            <span style={{ color: 'var(--accent)', fontWeight: '800', fontSize: '0.8rem', opacity: 0.8, letterSpacing: '1px' }}>№{task.number}</span>
                            {isSolved && (
                              <span style={{ color: '#10b981', fontSize: '0.65rem', fontWeight: '800' }}>РЕШЕНО</span>
                            )}
                          </div>
                          <div style={{ fontSize: '1rem', lineHeight: '1.4', color: '#e2e8f0', flex: 1 }}>
                              {renderMath(task.question)}
                          </div>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {sortedCategories.length === 0 && (
            <div style={{ textAlign: 'center', padding: '100px', color: 'var(--text-p)' }}>
              <h2>Задач не найдено</h2>
              <p>Попробуй изменить параметры поиска или фильтры</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
