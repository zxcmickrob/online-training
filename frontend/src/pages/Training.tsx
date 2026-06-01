import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import katex from 'katex';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { useParams, useNavigate } from 'react-router-dom';
import 'katex/dist/katex.min.css';

interface Task {
  id: number;
  number: string;
  title: string;
  subtopic?: string;
  question: string;
}

const Training = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<'success' | 'error' | null>(null);
  const [aiHint, setAiHint] = useState<string | null>(null);
  const [loadingHint, setLoadingHint] = useState(false);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const res = await api.get(`/tasks/${taskId}`);
        setCurrentTask(res.data);
        setAiHint(null);
        setFeedback(null);
        setUserAnswer('');
      } catch (err) {
        toast.error('Ошибка при загрузке задачи');
        navigate('/');
      }
    };

    const redirectToFirstTask = async () => {
      try {
        const res = await api.get('/tasks');
        if (res.data && res.data.length > 0) {
          const sorted = res.data.sort((a: any, b: any) => parseInt(a.number) - parseInt(b.number));
          navigate(`/training/${sorted[0].id}`, { replace: true });
        } else {
          toast.error('Задач пока нет');
          navigate('/');
        }
      } catch (err) {
        navigate('/');
      }
    };

    if (taskId) {
      fetchTask();
    } else {
      redirectToFirstTask();
    }
  }, [taskId, navigate]);

  const checkAnswer = async () => {
    try {
      const res = await api.post(`/tasks/${taskId}/solve`, { answer: userAnswer });
      if (res.status === 201 || res.status === 200) {
        setFeedback('success');
        toast.success('Правильно!');
      } else {
        setFeedback('error');
        toast.error('Неверный ответ');
      }
    } catch (err: any) {
      setFeedback('error');
      if (err.response && err.response.data && err.response.data.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error('Ошибка проверки');
      }
    }
  };

  const getAiHint = async () => {
    setLoadingHint(true);
    try {
      const res = await api.post(`/tasks/${taskId}/ai-hint`, { answer: userAnswer });
      setAiHint(res.data.hint);
    } catch (err) {
      toast.error('Не удалось получить подсказку');
    } finally {
      setLoadingHint(false);
    }
  };

  const handleNextTask = async () => {
     try {
       const res = await api.get('/tasks');
       const allTasks = res.data.sort((a: any, b: any) => parseInt(a.number) - parseInt(b.number));
       const currentIndex = allTasks.findIndex((t: any) => t.id === Number(taskId));
       if (currentIndex !== -1 && currentIndex < allTasks.length - 1) {
         navigate(`/training/${allTasks[currentIndex + 1].id}`);
       } else {
         toast.success('Все задачи в этом разделе решены!');
         navigate('/');
       }
     } catch (err) {
       navigate('/');
     }
  };

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

  if (!currentTask) return null;

  return (
    <div style={{ paddingBottom: '60px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <button 
            onClick={() => navigate('/')} 
            style={{ 
              background: 'var(--input-bg)', border: '1px solid var(--card-border)', color: 'var(--text-p)', padding: '8px 16px', borderRadius: '8px', 
              cursor: 'pointer', marginBottom: '20px', fontSize: '0.85rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', transition: '0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'var(--hover-bg)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'var(--input-bg)'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
            НАЗАД К СПИСКУ
          </button>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px', alignItems: 'center' }}>
            <span style={{ background: 'var(--surface)', border: '1px solid var(--card-border)', color: 'var(--text-p)', padding: '4px 10px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>
              МАТЕМАТИКА (ПРОФИЛЬ)
            </span>
            {currentTask.subtopic && (
              <span className="subtopic-badge" style={{ fontSize: '0.7rem', textTransform: 'uppercase' }}>
                {currentTask.subtopic}
              </span>
            )}
          </div>
          <h1 style={{ fontSize: '1.8rem' }}>{currentTask.title} <span style={{ color: 'var(--text-p)', fontWeight: '400' }}>№{currentTask.number}</span></h1>
        </motion.div>
      </div>

      <div className="bento-grid">
        {/* Условие задачи */}
        <motion.div className="bento-card span-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ minHeight: '350px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px', paddingBottom: '12px', borderBottom: '1px solid var(--card-border)' }}>
            <div style={{ background: 'var(--accent-glow)', padding: '8px', borderRadius: '8px', color: 'var(--accent)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
            </div>
            <span style={{ color: 'var(--text-p)', fontSize: '0.8rem', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase' }}>УСЛОВИЕ ЗАДАЧИ</span>
          </div>
          
          <div className="training-question" style={{ fontSize: '1.4rem', fontWeight: '500', color: 'var(--text-h)', lineHeight: '1.6', wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
            {renderMath(currentTask.question)}
          </div>
        </motion.div>

        {/* Панель решения */}
        <motion.div className="bento-card span-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px', paddingBottom: '12px', borderBottom: '1px solid var(--card-border)' }}>
            <div style={{ background: 'var(--accent-glow)', padding: '8px', borderRadius: '8px', color: 'var(--accent)' }}>
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            </div>
            <span style={{ color: 'var(--text-p)', fontSize: '0.8rem', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase' }}>РЕШЕНИЕ</span>
          </div>

          <div style={{ flex: 1 }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '1rem' }}>Твой ответ</h3>
            <input 
               className="main-input" 
               style={{ fontSize: '1.2rem', padding: '16px', textAlign: 'center', letterSpacing: '2px', fontWeight: '700' }}
               placeholder="0.00" 
               value={userAnswer} 
               onChange={e => setUserAnswer(e.target.value)} 
               onKeyPress={e => e.key === 'Enter' && checkAnswer()} 
            />
            
            <div style={{ marginTop: '24px' }}>
              <AnimatePresence mode="wait">
                {feedback && (
                  <motion.div 
                    key={feedback}
                    initial={{ opacity: 0, scale: 0.9, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: -10 }}
                    style={{ 
                      padding: '16px', borderRadius: '12px', textAlign: 'center', fontWeight: '700',
                      background: feedback === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)',
                      color: feedback === 'success' ? '#10b981' : '#f43f5e',
                      border: '1px solid', marginBottom: '16px', fontSize: '0.9rem', letterSpacing: '0.5px'
                    }}
                  >
                    {feedback === 'success' ? '✓ ВЕРНО!' : '× ОШИБКА В ОТВЕТЕ'}
                  </motion.div>
                )}
              </AnimatePresence>
              
              <button 
                className="main-btn" 
                style={{ width: '100%', padding: '16px', fontSize: '1rem', fontWeight: '700' }} 
                onClick={checkAnswer}
              >
                ОТПРАВИТЬ
              </button>
              
              {feedback === 'success' && (
                  <motion.button 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    onClick={handleNextTask}
                    style={{ 
                      width: '100%', marginTop: '12px', background: 'var(--text-h)', color: 'var(--bg)', border: 'none', 
                      padding: '16px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', transition: '0.2s', fontSize: '1rem'
                    }}
                  >
                    ДАЛЕЕ →
                  </motion.button>
              )}
              
              {feedback === 'error' && (
                  <button 
                    onClick={getAiHint}
                    disabled={loadingHint}
                    style={{ 
                        width: '100%', marginTop: '12px', padding: '16px', borderRadius: '8px', 
                        background: 'var(--accent-glow)', color: 'var(--accent)', border: '1px solid var(--accent)',
                        fontWeight: '700', cursor: loadingHint ? 'wait' : 'pointer', transition: '0.2s', fontSize: '0.95rem',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                    }}
                  >
                    {loadingHint ? (
                       <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} style={{ width: 18, height: 18, border: '3px solid var(--accent)', borderTopColor: 'transparent', borderRadius: '50%' }} />
                    ) : (
                       <>✨ ПОМОЩЬ ИИ</>
                    )}
                  </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Подсказка */}
        <motion.div className="bento-card span-12" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <div style={{ background: 'var(--accent-glow)', padding: '6px', borderRadius: '6px', color: 'var(--accent)' }}>
               <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            </div>
            <h3 style={{ margin: 0, fontSize: '1rem' }}>Подсказка репетитора</h3>
          </div>
          
          <div style={{ padding: '20px', background: 'var(--input-bg)', borderRadius: '12px', border: '1px solid var(--card-border)', minHeight: '80px' }}>
            {aiHint ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <p style={{ color: 'var(--text-h)', fontSize: '1.05rem', lineHeight: '1.7', margin: 0, wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                      <strong>✨ ИИ Репетитор:</strong> {renderMath(aiHint)}
                  </p>
              </motion.div>
            ) : (
              <p style={{ color: 'var(--text-p)', fontSize: '0.95rem', lineHeight: '1.6', margin: 0 }}>
                Попробуй решить задачу самостоятельно. Если не получится — нажми на кнопку помощи ИИ выше, и я дам тебе ценный совет.
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Training;
