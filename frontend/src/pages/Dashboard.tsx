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
  subtopic?: string;
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
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubtopic, setSelectedSubtopic] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  const { role } = useAuth();

  const fetchData = async () => {
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const renderMath = (text: string) => {
    if (!text || !text.includes('$')) return text;
    try {
      const parts = text.split('$');
      return parts.map((part, index) => {
        if (index % 2 === 1 && part && part.trim()) {
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
                         (task.subtopic || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.number.toString().includes(searchTerm);
    const isSolved = stats?.solved_tasks_ids.includes(task.id);
    
    if (filter === 'solved') return matchesSearch && isSolved;
    if (filter === 'unsolved') return matchesSearch && !isSolved;
    return matchesSearch;
  });

  const categoriesMap = filteredTasks.reduce((acc, task) => {
    const category = task.title || 'Без темы';
    if (!acc[category]) {
      acc[category] = {};
    }
    const subtopic = task.subtopic || 'Общее';
    if (!acc[category][subtopic]) {
      acc[category][subtopic] = [];
    }
    acc[category][subtopic].push(task);
    return acc;
  }, {} as Record<string, Record<string, Task[]>>);

  const sortedCategories = Object.entries(categoriesMap).sort((a, b) => a[0].localeCompare(b[0]));

  const getCategoryStats = (subtopics: Record<string, Task[]>) => {
    const allTasks = Object.values(subtopics).flat();
    const total = allTasks.length;
    const solved = allTasks.filter(t => stats?.solved_tasks_ids.includes(t.id)).length;
    return { total, solved, percent: total > 0 ? Math.round((solved / total) * 100) : 0 };
  };

  const getSubtopicStats = (subtopicTasks: Task[]) => {
    const total = subtopicTasks.length;
    const solved = subtopicTasks.filter(t => stats?.solved_tasks_ids.includes(t.id)).length;
    return { total, solved, percent: total > 0 ? Math.round((solved / total) * 100) : 0 };
  };

  const solvedCount = stats?.solved_count || 0;

  const getRank = (count: number) => {
    if (count === 0) return 'Задания пока не были решены';
    if (count < 30) return 'Начальный уровень';
    if (count < 50) return 'Базовый уровень';
    if (count < 100) return 'Повышенный уровень';
    return 'Профильный уровень';
  };

  const getRankClass = (count: number) => {
    if (count === 0) return 'novice';
    if (count < 5) return 'pupil';
    if (count < 15) return 'pro';
    if (count < 30) return 'master';
    return 'legend';
  };

  const handleBack = () => {
    if (selectedSubtopic) {
      setSelectedSubtopic(null);
    } else if (selectedCategory) {
      setSelectedCategory(null);
    }
  };

  return (
    <div style={{ paddingBottom: '60px' }}>
      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 style={{ fontSize: '2.2rem', marginBottom: '8px' }}>
            Привет, {stats?.username}!
          </h1>
  
        </motion.div>
        
        {role !== 'admin' && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <div className={`rank-badge ${getRankClass(solvedCount)}`} style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
              {getRank(solvedCount)}
            </div>
          </motion.div>
        )}
      </div>


      <div style={{ marginBottom: '24px' }}>
        <AnimatePresence mode="popLayout">
          {selectedCategory && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}
            >
              <button 
                onClick={handleBack}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-p)', cursor: 'pointer', background: 'var(--surface)', border: '1px solid var(--card-border)', padding: '8px 16px', borderRadius: '8px', fontWeight: '600', fontSize: '0.85rem', transition: '0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}
                onMouseOver={e => e.currentTarget.style.color = 'var(--text-h)'}
                onMouseOut={e => e.currentTarget.style.color = 'var(--text-p)'}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
                Назад
              </button>
              <span style={{ color: 'var(--card-border)' }}>/</span>
              <span style={{ color: selectedSubtopic ? 'var(--text-p)' : 'var(--text-h)', fontWeight: '600', fontSize: '0.95rem' }}>{selectedCategory}</span>
              {selectedSubtopic && (
                <>
                  <span style={{ color: 'var(--card-border)' }}>/</span>
                  <span style={{ color: 'var(--text-h)', fontWeight: '600', fontSize: '0.95rem' }}>{selectedSubtopic}</span>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center', background: 'var(--surface)', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--card-border)' }}>
          {/* Search */}
          <div style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: '250px', background: 'var(--input-bg)', borderRadius: '8px', padding: '0 12px', border: '1px solid transparent' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-p)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input 
              style={{ border: 'none', background: 'transparent', width: '100%', padding: '10px 10px', color: 'var(--text-h)', outline: 'none', fontSize: '0.95rem', fontFamily: 'inherit' }} 
              placeholder="Поиск по теме или номеру задания..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Filters */}
          <div style={{ display: 'flex', gap: '4px', background: 'var(--input-bg)', padding: '4px', borderRadius: '8px' }}>
            {(['all', 'solved', 'unsolved'] as const).map((f) => (
              <button 
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  background: filter === f ? 'var(--surface)' : 'transparent',
                  border: filter === f ? '1px solid var(--card-border)' : '1px solid transparent',
                  color: filter === f ? 'var(--text-h)' : 'var(--text-p)',
                  padding: '8px 16px', borderRadius: '6px',
                  fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer', transition: '0.2s',
                  boxShadow: filter === f ? '0 2px 4px rgba(0,0,0,0.05)' : 'none'
                }}
              >
                {f === 'all' ? 'Все задания' : f === 'solved' ? 'Решенные' : 'В процессе'}
              </button>
            ))}
          </div>
        </div>
      </div>


      <AnimatePresence mode="wait">

        {!selectedCategory && (
          <motion.div 
            key="categories"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
          >
            {sortedCategories.map(([category, subtopics]) => {
              const { total, solved, percent } = getCategoryStats(subtopics);
              const isComplete = percent === 100 && total > 0;
              return (
                <motion.div 
                  key={category}
                  whileHover={{ x: 4, background: 'var(--surface)' }}
                  onClick={() => setSelectedCategory(category)}
                  style={{ 
                    background: 'var(--input-bg)', borderRadius: '12px', padding: '16px 20px', cursor: 'pointer',
                    border: '1px solid var(--card-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    transition: 'all 0.2s ease', flexWrap: 'wrap', gap: '16px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <h2 style={{ fontSize: '1.15rem', fontWeight: '600', margin: '0', color: 'var(--text-h)' }}>
                      {category}
                    </h2>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '200px' }}>
                      <div style={{ flex: 1, height: '4px', background: 'var(--card-border)', borderRadius: '2px', overflow: 'hidden' }}>
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${percent}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                          style={{ height: '100%', background: isComplete ? '#10b981' : 'var(--accent)', borderRadius: '2px' }}
                        />
                      </div>
                      <span style={{ fontSize: '0.9rem', fontWeight: '700', color: isComplete ? '#10b981' : 'var(--text-h)', width: '40px', textAlign: 'right' }}>
                        {solved}<span style={{ color: 'var(--text-p)', fontSize: '0.8rem', fontWeight: '500' }}>/{total}</span>
                      </span>
                    </div>
                    <div style={{ color: 'var(--text-p)' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}


        {selectedCategory && !selectedSubtopic && (
          <motion.div 
            key="subtopics"
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
          >
            {Object.entries(categoriesMap[selectedCategory] || {}).map(([subtopic, subTasks]) => {
              const { total, solved, percent } = getSubtopicStats(subTasks);
              const isComplete = percent === 100 && total > 0;
              return (
                <motion.div 
                  key={subtopic}
                  whileHover={{ x: 4, background: 'var(--surface)' }}
                  onClick={() => setSelectedSubtopic(subtopic)}
                  style={{ 
                    background: 'var(--input-bg)', borderRadius: '12px', padding: '16px 20px', cursor: 'pointer',
                    border: '1px solid var(--card-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    transition: 'all 0.2s ease', flexWrap: 'wrap', gap: '16px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: '600', margin: '0', color: 'var(--text-h)' }}>
                      {subtopic}
                    </h3>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '200px' }}>
                      <div style={{ flex: 1, height: '4px', background: 'var(--card-border)', borderRadius: '2px', overflow: 'hidden' }}>
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${percent}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                          style={{ height: '100%', background: isComplete ? '#10b981' : 'var(--accent)', borderRadius: '2px' }}
                        />
                      </div>
                      <span style={{ fontSize: '0.9rem', fontWeight: '700', color: isComplete ? '#10b981' : 'var(--text-h)', width: '40px', textAlign: 'right' }}>
                        {solved}<span style={{ color: 'var(--text-p)', fontSize: '0.8rem', fontWeight: '500' }}>/{total}</span>
                      </span>
                    </div>
                    <div style={{ color: 'var(--text-p)' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* VIEW: TASKS */}
        {selectedCategory && selectedSubtopic && (
          <motion.div 
            key="tasks"
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
          >
            {(categoriesMap[selectedCategory]?.[selectedSubtopic] || []).map((task) => {
              const isSolved = stats?.solved_tasks_ids.includes(task.id);
              return (
                <Link 
                  key={task.id}
                  to={`/training/${task.id}`} 
                  style={{ textDecoration: 'none' }}
                >
                  <motion.div 
                    whileHover={{ x: 4, borderColor: 'var(--accent)' }}
                    style={{ 
                      background: 'var(--input-bg)', borderRadius: '12px', padding: '16px 20px', cursor: 'pointer',
                      border: isSolved ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid var(--card-border)', 
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px',
                      boxShadow: isSolved ? '0 4px 12px rgba(16, 185, 129, 0.05)' : 'none',
                      position: 'relative', overflow: 'hidden', transition: 'all 0.2s', flexWrap: 'wrap'
                    }}
                  >
                    {isSolved && <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', background: '#10b981' }} />}
                    
                    <div style={{ flex: 1, minWidth: '250px', paddingLeft: isSolved ? '12px' : '0', transition: 'padding 0.2s' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                        <span style={{ color: 'var(--text-p)', fontWeight: '700', fontSize: '0.85rem' }}>Задача №{task.number}</span>
                        {isSolved && (
                          <span style={{ color: '#10b981', fontSize: '0.7rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            РЕШЕНО
                          </span>
                        )}
                      </div>
                      <div style={{ 
                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', 
                        overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '0.95rem', lineHeight: '1.5', color: 'var(--text-h)',
                        wordBreak: 'break-word', overflowWrap: 'anywhere'
                      }}>
                        {renderMath(task.question)}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexShrink: 0 }}>
                      <span className="subtopic-badge" style={{ background: 'var(--surface)', border: '1px solid var(--card-border)', color: 'var(--text-p)' }}>{selectedSubtopic}</span>
                      <div style={{ color: 'var(--accent)' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {!loading && ((!selectedCategory && sortedCategories.length === 0) || 
        (selectedCategory && !selectedSubtopic && Object.keys(categoriesMap[selectedCategory] || {}).length === 0) ||
        (selectedCategory && selectedSubtopic && (!categoriesMap[selectedCategory]?.[selectedSubtopic] || categoriesMap[selectedCategory][selectedSubtopic].length === 0))) && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-p)' }}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '16px', opacity: 0.5 }}><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <h3 style={{ fontSize: '1.2rem', color: 'var(--text-h)', marginBottom: '8px' }}>Задач не найдено</h3>
        </motion.div>
      )}
      
      {/* Loading State */}
      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 20px' }}>
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} style={{ width: 40, height: 40, border: '4px solid var(--accent)', borderTopColor: 'transparent', borderRadius: '50%' }} />
        </div>
      )}
    </div>
  );
};

export default Dashboard;
