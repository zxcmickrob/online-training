import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import katex from 'katex';
import api from '../api/axios';
import toast from 'react-hot-toast';

const Training = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(true);
  const [aiHint, setAiHint] = useState<string | null>(null);
  const [loadingHint, setLoadingHint] = useState(false);

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const res = await api.get('/tasks');
        if (res.data && res.data.length > 0) {
          setTasks(res.data);
        } else {
          loadDemoTasks();
        }
      } catch (err) {
        loadDemoTasks();
      } finally {
        setLoading(false);
      }
    };

    const loadDemoTasks = () => {
      const saved = localStorage.getItem('demo_tasks');
      if (saved) {
        setTasks(JSON.parse(saved));
      }
    };

    loadTasks();
  }, []);

  const checkAnswer = async () => {
    const task = tasks[currentTaskIndex];
    setAiHint(null); // Reset hint on new check
    
    // Smart parsing: remove spaces, replace comma with dot
    const cleanAnswer = userAnswer.replace(/\s+/g, '').replace(',', '.').toLowerCase();
    const correctAnswer = String(task.answer).replace(/\s+/g, '').replace(',', '.').toLowerCase();

    // Если у задачи есть настоящий ID, отправляем на бэкенд
    if (typeof task.id === 'number' && task.id < 1000000) {
      try {
        await api.post(`/tasks/${task.id}/solve`, { answer: cleanAnswer });
        setFeedback('success');
        toast.success('Ответ принят сервером!');
      } catch (e: any) {
        setFeedback('error');
        toast.error(e.response?.data?.message || 'Неверный ответ');
      }
    } else {
      // Иначе демо-проверка
      if (cleanAnswer === correctAnswer) {
        setFeedback('success');
      } else {
        setFeedback('error');
      }
    }
  };

  const getAiHint = async () => {
    const task = tasks[currentTaskIndex];
    if (typeof task.id !== 'number' || task.id > 1000000) {
        toast.error('AI подсказки работают только для задач из реальной базы данных.');
        return;
    }

    setLoadingHint(true);
    try {
        const response = await api.post(`/tasks/${task.id}/ai-hint`, { answer: userAnswer });
        setAiHint(response.data.hint);
        toast.success('AI проанализировал твой ответ!');
    } catch (e) {
        toast.error('Не удалось получить подсказку от AI.');
    } finally {
        setLoadingHint(false);
    }
  };

  const clearDemoTasks = () => {
    localStorage.removeItem('demo_tasks');
    setTasks([]);
    toast.success('Локальные (демо) задачи удалены!');
    window.location.reload();
  };

  if (loading) return <div style={{textAlign: 'center', marginTop: '100px'}}><h1>Загрузка...</h1></div>;

  if (tasks.length === 0) return (
    <div style={{textAlign: 'center', marginTop: '100px'}}>
      <h1 style={{fontSize: '5rem'}}>404 👾</h1>
      <p style={{fontSize: '1.5rem', color: 'var(--text-p)'}}>Задач не найдено. Наполни базу в админке.</p>
    </div>
  );

  const task = tasks[currentTaskIndex];
  const progress = ((currentTaskIndex + 1) / tasks.length) * 100;

  // Функция для безопасного рендеринга формул
  const renderMath = (text: string) => {
    try {
      if (text && (text.includes('\\') || text.includes('_') || text.includes('^'))) {
        return <span dangerouslySetInnerHTML={{ __html: katex.renderToString(text, { throwOnError: false }) }} />;
      }
      return text;
    } catch (e) {
      return text;
    }
  };

  return (
    <div style={{ paddingBottom: '100px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
            <span style={{ background: 'var(--grad)', color: 'white', padding: '2px 10px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '800' }}>
              ЕГЭ ПРОФИЛЬ
            </span>
          </div>
          <h1 style={{ fontSize: '3rem' }}>{task.title}</h1>
        </motion.div>
        
        <div style={{ textAlign: 'right' }}>
          <div style={{ color: 'var(--text-p)', fontSize: '0.9rem', marginBottom: '5px' }}>Выполнено: {Math.round(progress)}%</div>
          <div style={{ width: '200px', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
            <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} style={{ height: '100%', background: 'var(--grad)' }} />
          </div>
        </div>
      </div>

      <div className="bento-grid">
        <motion.div className="bento-card" style={{ gridColumn: 'span 8', minHeight: '400px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ color: 'var(--text-p)', marginBottom: '30px', fontSize: '0.9rem', letterSpacing: '2px' }}>УСЛОВИЕ ЗАДАЧИ</div>
          <div style={{ 
            fontSize: '2.5rem', fontWeight: '800', textAlign: 'center', color: 'white',
            textShadow: '0 0 40px rgba(168, 85, 247, 0.3)'
          }}>
            {renderMath(task.question)}
          </div>
        </motion.div>

        <motion.div className="bento-card" style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ margin: '0 0 10px 0' }}>Твой ответ</h3>
            <input className="main-input" placeholder="0.00" value={userAnswer} onChange={e => setUserAnswer(e.target.value)} />
          </div>

          <div style={{ marginTop: '20px' }}>
            <AnimatePresence mode="wait">
              {feedback && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                  style={{ 
                    padding: '20px', borderRadius: '20px', textAlign: 'center', fontWeight: '800',
                    background: feedback === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)',
                    color: feedback === 'success' ? '#10b981' : '#f43f5e',
                    border: '1px solid', marginBottom: '15px'
                  }}
                >
                  {feedback === 'success' ? '✓ ВЕРНО' : '× ОШИБКА'}
                </motion.div>
              )}
            </AnimatePresence>
            <button className="main-btn" style={{ width: '100%' }} onClick={checkAnswer}>ПОДТВЕРДИТЬ</button>
            
            {feedback === 'error' && (
                <button 
                  onClick={getAiHint}
                  disabled={loadingHint}
                  style={{ 
                      width: '100%', marginTop: '10px', padding: '15px', borderRadius: '20px', 
                      background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', border: '1px solid rgba(168, 85, 247, 0.3)',
                      fontWeight: '700', cursor: loadingHint ? 'wait' : 'pointer', transition: '0.3s'
                  }}
                >
                  {loadingHint ? 'ИИ АНАЛИЗИРУЕТ...' : '✨ ПОПРОСИТЬ ИИ НАЙТИ ОШИБКУ'}
                </button>
            )}
          </div>
        </motion.div>

        <div className="bento-card" style={{ gridColumn: 'span 5' }}>
          <h3>Подсказка</h3>
          {aiHint ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ padding: '15px', background: 'rgba(168, 85, 247, 0.1)', borderRadius: '15px', border: '1px solid rgba(168, 85, 247, 0.3)' }}>
                <p style={{ color: '#e2e8f0', fontSize: '0.95rem', lineHeight: '1.6', margin: 0 }}>
                    <strong>✨ ИИ Репетитор:</strong> {aiHint}
                </p>
            </motion.div>
          ) : (
            <p style={{ color: 'var(--text-p)', fontSize: '0.95rem', lineHeight: '1.6' }}>
              Используйте стандартные методы решения математических задач. Если вы ошибетесь, здесь появится кнопка вызова ИИ-помощника.
            </p>
          )}
          {typeof task.id !== 'number' || task.id > 1000000 ? (
             <button onClick={clearDemoTasks} style={{ marginTop: '20px', background: 'transparent', color: '#f43f5e', border: '1px solid #f43f5e', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer' }}>Очистить локальные багованные задачи</button>
          ) : null}
        </div>

        <div className="bento-card" style={{ gridColumn: 'span 7', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ margin: 0 }}>Следующее задание</h3>
          <motion.button 
            disabled={feedback !== 'success'}
            onClick={() => { setCurrentTaskIndex(i => i + 1); setFeedback(''); setUserAnswer(''); setAiHint(null); }}
            style={{ 
              background: feedback === 'success' ? 'white' : 'rgba(255,255,255,0.02)',
              color: feedback === 'success' ? 'black' : 'rgba(255,255,255,0.1)',
              border: 'none', padding: '16px 32px', borderRadius: '100px', fontWeight: '800'
            }}
          >
            ПРОДОЛЖИТЬ
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default Training;
