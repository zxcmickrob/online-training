import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import api from '../api/axios';
import toast from 'react-hot-toast';
import katex from 'katex';

const AdminTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [formData, setFormData] = useState({ number: '', title: '', subtopic: '', question: '', answer: '' });
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  
  const formRef = useRef<HTMLDivElement>(null);
  const [formHeight, setFormHeight] = useState<number>(0);

  const fetchTasks = async () => {
    try {
      const response = await api.get('/tasks');
      setTasks(response.data);
    } catch (err) {
      console.error("Failed to fetch tasks from server", err);
      toast.error('Ошибка загрузки задач с сервера');
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    if (!formRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setFormHeight(entry.contentRect.height);
      }
    });

    resizeObserver.observe(formRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTaskId) {
        await api.put(`/tasks/${editingTaskId}`, formData);
        toast.success('Задача обновлена');
      } else {
        await api.post('/tasks', formData);
        toast.success('Задача опубликована');
      }
      fetchTasks();
      handleCancelEdit();
    } catch (err) {
      console.error("Failed to save task", err);
      toast.error('Ошибка при сохранении задачи');
    }
  };

  const handleDeleteTask = async (id: number) => {
    try {
      await api.delete(`/tasks/${id}`);
      toast.success('Задача удалена');
      if (editingTaskId === id) {
        handleCancelEdit();
      }
      fetchTasks();
    } catch (err) {
      console.error("Failed to delete task from server", err);
      toast.error('Ошибка при удалении задачи');
    }
  };

  const handleEditTask = (task: any) => {
    setEditingTaskId(task.id);
    setFormData({
      number: task.number.toString(),
      title: task.title,
      subtopic: task.subtopic || '',
      question: task.question,
      answer: task.answer.toString()
    });
    // Scroll to top to see the form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingTaskId(null);
    setFormData({ number: '', title: '', subtopic: '', question: '', answer: '' });
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

  return (
    <div style={{ paddingBottom: '40px' }}>
      <header style={{ marginBottom: '40px' }}>
        <span style={{ color: 'var(--accent)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.8rem' }}>
          Панель управления
        </span>
        <h1 style={{ marginTop: '4px' }}>Редактор заданий</h1>
      </header>

      <div className="bento-grid">
        {/* Форма добавления */}
        <motion.div ref={formRef} className="bento-card" style={{ gridColumn: 'span 5', alignSelf: 'start', display: 'flex', flexDirection: 'column' }} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div style={{ marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid var(--card-border)' }}>
            <h3 style={{ margin: 0 }}>{editingTaskId ? 'Редактирование задачи' : 'Новое задание'}</h3>
          </div>
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-p)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Номер и Тема</label>
              <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '12px' }}>
                <input className="main-input" placeholder="№" value={formData.number} onChange={e => setFormData({...formData, number: e.target.value})} required />
                <input className="main-input" placeholder="Планиметрия" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-p)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Подтема</label>
              <input className="main-input" placeholder="Треугольники" value={formData.subtopic} onChange={e => setFormData({...formData, subtopic: e.target.value})} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-p)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Задание</label>
              <textarea 
                className="main-input" 
                style={{ minHeight: '150px', resize: 'vertical' }}
                placeholder="Текст задачи"
                value={formData.question}
                onChange={e => setFormData({...formData, question: e.target.value})}
                required
              />
            </div>

            {formData.question && (
              <div style={{ padding: '12px 16px', background: 'var(--input-bg)', borderRadius: '8px', fontSize: '0.95rem', border: '1px solid var(--card-border)', marginTop: '-8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', borderBottom: '1px solid var(--card-border)', paddingBottom: '6px' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-p)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>Предпросмотр</span>
                </div>
                <div style={{ color: 'var(--text-h)', wordBreak: 'break-word', overflowWrap: 'anywhere', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>
                  {renderMath(formData.question)}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-p)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Правильный ответ</label>
              <input className="main-input" placeholder="Число или строка" value={formData.answer} onChange={e => setFormData({...formData, answer: e.target.value})} required />
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
              <button type="submit" className="main-btn" style={{ padding: '14px', fontSize: '1rem', flex: 1 }}>
                {editingTaskId ? 'СОХРАНИТЬ ИЗМЕНЕНИЯ' : 'СОХРАНИТЬ ЗАДАЧУ'}
              </button>
              {editingTaskId && (
                <button type="button" onClick={handleCancelEdit} style={{ background: 'var(--input-bg)', border: '1px solid var(--card-border)', color: 'var(--text-p)', padding: '14px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', transition: '0.2s' }}>
                  ОТМЕНА
                </button>
              )}
            </div>
          </form>
        </motion.div>

        {/* Список задач */}
        <motion.div className="bento-card" style={{ gridColumn: 'span 7', display: 'flex', flexDirection: 'column', alignSelf: 'start', height: formHeight > 0 ? `${formHeight + 48}px` : 'auto' }} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <div style={{ marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid var(--card-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0 }}>База задач</h3>
            <span style={{ background: 'var(--input-bg)', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-p)', border: '1px solid var(--card-border)' }}>
              Всего: {tasks.length}
            </span>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', paddingRight: '12px', flex: 1, margin: '0 -4px 0 0' }} className="custom-scrollbar">
            {tasks.map((t: any) => (
              <div key={t.id} style={{ 
                background: 'var(--input-bg)', padding: '16px', 
                borderRadius: '12px', border: '1px solid var(--card-border)',
                transition: 'all 0.2s ease', position: 'relative',
                ...(editingTaskId === t.id ? { borderColor: 'var(--accent)', boxShadow: '0 0 0 1px var(--accent)' } : {})
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-h)' }}>
                    <span style={{ color: 'var(--accent)', marginRight: '8px' }}>#{t.number}</span>
                    {t.title}
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={() => handleEditTask(t)}
                      style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.75rem', transition: '0.2s', display: 'flex', alignItems: 'center', gap: '4px' }}
                      title="Редактировать"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                      РЕДАКТИРОВАТЬ
                    </button>
                    <button 
                      onClick={() => {
                        if (window.confirm('Точно удалить эту задачу?')) handleDeleteTask(t.id);
                      }}
                      style={{ background: 'rgba(244, 63, 94, 0.1)', color: '#f43f5e', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.75rem', transition: '0.2s', display: 'flex', alignItems: 'center', gap: '4px' }}
                      title="Удалить"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                      УДАЛИТЬ
                    </button>
                  </div>
                </div>
                
                {t.subtopic && (
                  <div style={{ marginBottom: '12px' }}>
                    <span className="subtopic-badge" style={{ fontSize: '0.7rem' }}>{t.subtopic}</span>
                  </div>
                )}
                
                <div style={{ color: 'var(--text-p)', fontSize: '0.85rem', marginBottom: '12px', wordBreak: 'break-word', overflowWrap: 'anywhere', lineHeight: '1.5' }}>
                  <span style={{ fontWeight: '600', color: 'var(--text-h)' }}>Условие:</span> {t.question.length > 150 ? t.question.substring(0, 150) + '...' : t.question}
                </div>
                
                <div style={{ display: 'inline-block', background: 'var(--surface)', border: '1px solid var(--card-border)', padding: '6px 12px', borderRadius: '6px', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-p)' }}>Правильный ответ:</span> <span style={{ color: 'var(--accent)', fontWeight: '700' }}>{t.answer}</span>
                </div>
              </div>
            ))}
            
            {tasks.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-p)' }}>
                Задач пока нет. Добавьте первую задачу!
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminTasks;