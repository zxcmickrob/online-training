import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import katex from 'katex';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { useParams, useNavigate } from 'react-router-dom';

const Training = () => {
  const [tasks, setTasks] = useState<any[]>([]); // All tasks fetched (for progression)
  const [currentTask, setCurrentTask] = useState<any | null>(null); // The task currently displayed
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(true);
  const [aiHint, setAiHint] = useState<string | null>(null);
  const [loadingHint, setLoadingHint] = useState(false);

  const { taskId } = useParams<{ taskId?: string }>(); // Get task ID from URL
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Fetch all tasks for progress calculation and sorting
        const allRes = await api.get('/tasks');
        const sortedTasks = allRes.data.sort((a: any, b: any) => a.id - b.id);
        setTasks(sortedTasks);

        if (taskId) {
          const res = await api.get(`/tasks/${taskId}`);
          setCurrentTask(res.data);
        } else if (sortedTasks.length > 0) {
          setCurrentTask(sortedTasks[0]);
          navigate(`/training/${sortedTasks[0].id}`, { replace: true });
        }
      } catch (err) {
        console.error("Backend error, trying demo mode", err);
        const saved = localStorage.getItem('demo_tasks');
        if (saved) {
          const demoTasks = JSON.parse(saved);
          setTasks(demoTasks);
          if (taskId) {
            setCurrentTask(demoTasks.find((t: any) => t.id === parseInt(taskId)));
          } else {
            setCurrentTask(demoTasks[0]);
          }
        }
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [taskId]);

  const checkAnswer = async () => {
    if (!currentTask) return;
    setAiHint(null); // Reset hint on new check
    
    // Smart parsing: remove spaces, replace comma with dot
    const cleanAnswer = userAnswer.replace(/\s+/g, '').replace(',', '.').toLowerCase();
    const correctAnswer = String(currentTask.answer).replace(/\s+/g, '').replace(',', '.').toLowerCase();

    // If task has a real ID (from DB), send to backend
    if (typeof currentTask.id === 'number' && currentTask.id < 1000000) {
      try {
        await api.post(`/tasks/${currentTask.id}/solve`, { answer: cleanAnswer });
        setFeedback('success');
        toast.success('Ответ принят сервером!');
      } catch (e: any) {
        setFeedback('error');
        toast.error(e.response?.data?.message || 'Неверный ответ');
      }
    } else {
      // Otherwise demo check
      if (cleanAnswer === correctAnswer) {
        setFeedback('success');
      } else {
        setFeedback('error');
      }
    }
  };

  const getAiHint = async () => {
    if (!currentTask) return;

    if (typeof currentTask.id !== 'number' || currentTask.id > 1000000) {
        toast.error('AI подсказки работают только для задач из реальной базы данных.');
        return;
    }

    setLoadingHint(true);
    try {
        const response = await api.post(`/tasks/${currentTask.id}/ai-hint`, { answer: userAnswer });
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
    navigate('/training'); // Redirect after clearing
  };

  const handleNextTask = () => {
    const currentIndex = tasks.findIndex(t => t.id === currentTask.id);
    if (currentIndex !== -1 && currentIndex < tasks.length - 1) {
      navigate(`/training/${tasks[currentIndex + 1].id}`);
      // Reset state for new task
      setUserAnswer('');
      setFeedback('');
      setAiHint(null);
    } else {
      // If it's the last task, or not found, navigate to general training
      toast('Поздравляем, ты решил все задачи по этой теме!', { icon: '👏' });
      navigate('/training'); 
    }
  };

  if (loading) return <div style={{textAlign: 'center', marginTop: '100px'}}><h1>Загрузка...</h1></div>;

  if (!currentTask) return (
    <div style={{textAlign: 'center', marginTop: '100px'}}>
      <h1 style={{fontSize: '5rem'}}>404 👾</h1>
      <p style={{fontSize: '1.5rem', color: 'var(--text-p)'}}>Задача не найдена или база пуста.</p>
      <button onClick={() => navigate('/admin-tasks')} className="main-btn" style={{marginTop: '20px'}}>Добавить задачи</button>
      {tasks.length === 0 && (
          <button onClick={clearDemoTasks} style={{ marginTop: '20px', background: 'transparent', color: '#f43f5e', border: '1px solid #f43f5e', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', marginLeft: '10px' }}>Очистить локальные демо-задачи</button>
      )}
    </div>
  );

  const task = currentTask;
  const currentTaskIndex = tasks.findIndex(t => t.id === task.id);
  const progress = tasks.length > 0 ? ((currentTaskIndex + 1) / tasks.length) * 100 : 0;

  // Функция для безопасного рендеринга формул (теперь поддерживает текст вне формул)
  const renderMath = (text: string) => {
    if (!text) return text;
    try {
      const parts = text.split('$');
      return parts.map((part, index) => {
        if (index % 2 === 1) { // Это часть внутри знаков $
          return (
            <span 
              key={index} 
              style={{ color: 'var(--accent)', textShadow: '0 0 10px var(--accent-glow)' }}
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
            
            {feedback === 'success' && (
                <motion.button 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  onClick={handleNextTask}
                  style={{ 
                    width: '100%', marginTop: '10px', background: 'white', color: 'black', border: 'none', 
                    padding: '15px', borderRadius: '20px', fontWeight: '800', cursor: 'pointer', transition: '0.3s'
                  }}
                >
                  ПРОДОЛЖИТЬ →
                </motion.button>
            )}
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

        <div className="bento-card" style={{ gridColumn: 'span 12' }}>
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
      </div>
    </div>
  );
};

export default Training;