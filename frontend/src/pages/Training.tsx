import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import katex from 'katex';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { useParams, useNavigate } from 'react-router-dom';

const Training = () => {
  const [tasks, setTasks] = useState<any[]>([]); 
  const [currentTask, setCurrentTask] = useState<any | null>(null); 
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(true);
  const [aiHint, setAiHint] = useState<string | null>(null);
  const [loadingHint, setLoadingHint] = useState(false);

  const { taskId } = useParams<{ taskId?: string }>(); 
  const navigate = useNavigate();

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

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const allRes = await api.get('/tasks');
        
        // Сортируем задачи по темам и номерам для логичного переключения
        const sortedTasks = allRes.data.sort((a: any, b: any) => {
          const indexA = TOPIC_ORDER.indexOf(a.title);
          const indexB = TOPIC_ORDER.indexOf(b.title);
          
          if (indexA !== indexB) {
            if (indexA !== -1 && indexB !== -1) return indexA - indexB;
            if (indexA !== -1) return -1;
            if (indexB !== -1) return 1;
            return a.title.localeCompare(b.title);
          }
          
          return (parseInt(a.number) || 0) - (parseInt(b.number) || 0);
        });

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
  }, [taskId, navigate]);

  const checkAnswer = async () => {
    if (!currentTask) return;
    setAiHint(null);
    
    const cleanAnswer = userAnswer.replace(/\s+/g, '').replace(',', '.').toLowerCase();
    const correctAnswer = String(currentTask.answer).replace(/\s+/g, '').replace(',', '.').toLowerCase();

    if (typeof currentTask.id === 'number' && currentTask.id < 1000000) {
      try {
        await api.post(`/tasks/${currentTask.id}/solve`, { answer: cleanAnswer });
        setFeedback('success');
        toast.success('Ответ принят!');
      } catch (e: any) {
        setFeedback('error');
        toast.error(e.response?.data?.message || 'Неверный ответ');
      }
    } else {
      if (cleanAnswer === correctAnswer) {
        setFeedback('success');
      } else {
        setFeedback('error');
      }
    }
  };

  const getAiHint = async () => {
    if (!currentTask) return;
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

  const handleNextTask = () => {
    const currentIndex = tasks.findIndex(t => t.id === currentTask.id);
    if (currentIndex !== -1 && currentIndex < tasks.length - 1) {
      navigate(`/training/${tasks[currentIndex + 1].id}`);
      setUserAnswer('');
      setFeedback('');
      setAiHint(null);
    } else {
      toast('Поздравляем, ты решил все задачи!', { icon: '👏' });
      navigate('/dashboard'); 
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} style={{ width: 50, height: 50, border: '5px solid var(--accent)', borderTopColor: 'transparent', borderRadius: '50%' }} />
    </div>
  );

  if (!currentTask) return (
    <div style={{textAlign: 'center', marginTop: '140px'}}>
      <h1 style={{fontSize: '5rem', marginBottom: '20px'}}>👾</h1>
      <p style={{fontSize: '1.5rem', color: 'var(--text-p)'}}>Задач пока нет. Загляни позже!</p>
      <button onClick={() => navigate('/dashboard')} className="main-btn" style={{marginTop: '30px'}}>НА ГЛАВНУЮ</button>
    </div>
  );

  const renderMath = (text: string) => {
    if (!text) return text;
    try {
      const parts = text.split('$');
      return parts.map((part, index) => {
        if (index % 2 === 1) {
          return (
            <span 
              key={index} 
              style={{ color: 'var(--accent)', textShadow: '0 0 15px var(--accent-glow)' }}
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
              МАТЕМАТИКА (ПРОФИЛЬНЫЙ УРОВЕНЬ)
            </span>
          </div>
          <h1 style={{ fontSize: '3rem' }}>{currentTask.title}</h1>
        </motion.div>
      </div>

      <div className="bento-grid">
        <motion.div className="bento-card" style={{ gridColumn: 'span 8', minHeight: '400px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ color: 'var(--text-p)', marginBottom: '30px', fontSize: '0.9rem', letterSpacing: '2px' }}>УСЛОВИЕ ЗАДАЧИ</div>
          <div style={{ 
            fontSize: '2.5rem', fontWeight: '800', textAlign: 'center', color: 'white',
            textShadow: '0 0 40px rgba(168, 85, 247, 0.3)'
          }}>
            {renderMath(currentTask.question)}
          </div>
        </motion.div>

        <motion.div className="bento-card" style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ margin: '0 0 10px 0' }}>Твой ответ</h3>
            <input className="main-input" placeholder="0.00" value={userAnswer} onChange={e => setUserAnswer(e.target.value)} onKeyPress={e => e.key === 'Enter' && checkAnswer()} />
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
        </div>
      </div>
    </div>
  );
};

export default Training;
