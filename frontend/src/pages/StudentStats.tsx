import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { motion } from 'framer-motion';

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

const StudentStats: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [tasksRes, statsRes] = await Promise.all([
        api.get('/tasks'),
        api.get('/statistics')
      ]);
      setTasks(tasksRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error('Failed to fetch data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <div style={{ textAlign: 'center', marginTop: '100px' }}>Загрузка статистики...</div>;

  const totalTasks = tasks.length;
  const solvedCount = stats?.solved_count || 0;
  const progressPercent = totalTasks > 0 ? Math.round((solvedCount / totalTasks) * 100) : 0;

  const getTopicStats = () => {
    const topicData: Record<string, { total: number, solved: number }> = {};
    tasks.forEach(task => {
        const category = task.title || 'Без темы';
        if (!topicData[category]) topicData[category] = { total: 0, solved: 0 };
        topicData[category].total++;
        if (stats?.solved_tasks_ids.includes(task.id)) topicData[category].solved++;
    });
    return topicData;
  };

  const topicStats = getTopicStats();

  const getRank = (count: number) => {
    if (count === 0) return 'НОВИЧОК';
    if (count < 5) return 'УЧЕНИК';
    if (count < 15) return 'ПРОФИ';
    if (count < 30) return 'МАГИСТР';
    return 'ЛЕГЕНДА';
  };

  return (
    <div style={{ paddingBottom: '40px' }}>
      <header style={{ marginBottom: '40px' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <span style={{ color: 'var(--accent)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.8rem' }}>
            Личные достижения
          </span>
          <h1 style={{ marginTop: '4px' }}>Твоя статистика, {stats?.username}</h1>
          
          {/* Визуализация системы рангов */}
          <div style={{ marginTop: '24px', background: 'var(--surface)', padding: '20px', borderRadius: '12px', border: '1px solid var(--card-border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <span style={{ color: 'var(--text-p)', fontSize: '0.9rem', fontWeight: '500' }}>Прогресс ранга</span>
              <span style={{ color: 'var(--accent)', fontWeight: '700' }}>{getRank(solvedCount)}</span>
            </div>
            
            <div style={{ position: 'relative', height: '8px', background: 'var(--input-bg)', borderRadius: '4px', display: 'flex', alignItems: 'center' }}>
              {/* Фоновые деления для рангов */}
              {[0, 3, 10, 20].map((threshold) => (
                <div 
                  key={threshold} 
                  style={{ 
                    position: 'absolute', 
                    left: `${(threshold / 25) * 100}%`, 
                    height: '14px', 
                    width: '2px', 
                    background: solvedCount >= threshold ? 'var(--accent)' : 'var(--card-border)',
                    zIndex: 1
                  }} 
                />
              ))}
              
              {/* Полоса прогресса (ограничена 25 для визуала) */}
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((solvedCount / 25) * 100, 100)}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                style={{ height: '100%', background: 'var(--grad)', borderRadius: '4px', position: 'relative', zIndex: 0 }}
              />
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', fontSize: '0.75rem', color: 'var(--text-p)', fontWeight: '600' }}>
              <span>НОВИЧОК (0)</span>
              <span style={{ marginLeft: '-20px' }}>УЧЕНИК (3)</span>
              <span>АЛГЕБРАИСТ (10)</span>
              <span>МАСТЕР (20)</span>
              <span>БОГ (25+)</span>
            </div>
          </div>
        </motion.div>
      </header>

      <div className="bento-grid">
        {/* Карточка общего прогресса */}
        <motion.div 
          className="bento-card" 
          style={{ gridColumn: 'span 4' }} 
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }}
        >
          <h3 style={{ margin: 0 }}>Общий прогресс</h3>
          <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--accent)', margin: '16px 0' }}>
            {progressPercent}%
          </div>
          <div style={{ height: '6px', background: 'var(--input-bg)', borderRadius: '4px', overflow: 'hidden' }}>
            <motion.div 
              initial={{ width: 0 }} 
              animate={{ width: `${progressPercent}%` }} 
              transition={{ duration: 1, ease: "easeOut" }}
              style={{ height: '100%', background: 'var(--grad)' }} 
            />
          </div>
          <p style={{ color: 'var(--text-p)', marginTop: '12px', fontSize: '0.9rem' }}>
            Решено задач: {solvedCount} из {totalTasks}
          </p>
        </motion.div>

        {/* Детальная статистика по темам */}
        <motion.div 
          className="bento-card" 
          style={{ gridColumn: 'span 8' }} 
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ delay: 0.1 }}
        >
          <h3 style={{ margin: '0 0 16px 0' }}>Успехи по темам</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
            {Object.entries(topicStats).map(([topic, data]) => (
              <div key={topic} style={{ background: 'var(--input-bg)', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--card-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}>
                  <span style={{ fontWeight: '600', color: 'var(--text-h)' }}>{topic}</span>
                  <span style={{ color: 'var(--accent)', fontWeight: '600' }}>{data.solved}/{data.total}</span>
                </div>
                <div style={{ height: '4px', background: 'var(--input-bg)', borderRadius: '2px', overflow: 'hidden' }}>
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(data.solved / data.total) * 100}%` }}
                    transition={{ duration: 1, delay: 0.2 }}
                    style={{ height: '100%', background: 'var(--grad)' }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Список последних решенных задач */}
        <motion.div 
          className="bento-card" 
          style={{ gridColumn: 'span 12' }} 
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ delay: 0.2 }}
        >
          <h3 style={{ margin: '0 0 16px 0' }}>Решенные задачи</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {tasks.filter(t => stats?.solved_tasks_ids.includes(t.id)).map(task => (
              <div 
                key={task.id} 
                style={{ 
                  background: 'rgba(16, 185, 129, 0.1)', 
                  color: '#10b981', 
                  padding: '6px 12px', 
                  borderRadius: '6px', 
                  fontSize: '0.85rem', 
                  fontWeight: '600',
                  border: '1px solid rgba(16, 185, 129, 0.2)'
                }}
              >
                #{task.number} {task.title}
              </div>
            ))}
            {solvedCount === 0 && (
              <div style={{ color: 'var(--text-p)', padding: '16px 0', fontSize: '0.95rem' }}>
                Вы еще не решили ни одной задачи. Самое время начать!
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default StudentStats;
