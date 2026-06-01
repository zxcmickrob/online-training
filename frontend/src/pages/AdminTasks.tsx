import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import katex from 'katex';

const API_URL = 'http://127.0.0.1:5000';

const AdminTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [formData, setFormData] = useState({ number: '', title: '', subtopic: '', question: '', answer: '' });

  const fetchTasks = async () => {
    try {
      const response = await axios.get(`${API_URL}/tasks`);
      setTasks(response.data);
    } catch (err) {
      console.error("Failed to fetch tasks from server", err);
      toast.error('Ошибка загрузки задач с сервера');
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/tasks`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Задача опубликована на сервере');
      fetchTasks();
      setFormData({ number: '', title: '', subtopic: '', question: '', answer: '' });
    } catch (err) {
      console.error("Failed to post task to server", err);
      toast.error('Ошибка при публикации задачи');
    }
  };

  const handleDeleteTask = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/tasks/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Задача удалена');
      fetchTasks();
    } catch (err) {
      console.error("Failed to delete task from server", err);
      toast.error('Ошибка при удалении задачи');
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
        <motion.div className="bento-card" style={{ gridColumn: 'span 5', display: 'flex', flexDirection: 'column' }} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div style={{ marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid var(--card-border)' }}>
            <h3 style={{ margin: 0 }}>Новое задание</h3>
            <p style={{ color: 'var(--text-p)', fontSize: '0.85rem', marginTop: '8px', marginBottom: 0 }}>
              Добавьте новую задачу в базу данных. Можно использовать $LaTeX$ для формул.
            </p>
          </div>
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-p)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Номер и Тема</label>
              <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '12px' }}>
                <input className="main-input" placeholder="№" value={formData.number} onChange={e => setFormData({...formData, number: e.target.value})} required />
                <input className="main-input" placeholder="Например: Текстовые задачи" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-p)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Подтема (Опционально)</label>
              <input className="main-input" placeholder="Уточняющий тег" value={formData.subtopic} onChange={e => setFormData({...formData, subtopic: e.target.value})} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-p)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Текст задачи</label>
              <textarea 
                className="main-input" 
                style={{ minHeight: '150px', resize: 'vertical' }}
                placeholder="Текст задачи. Оберните формулы в знаки доллара: $x^2 + y^2 = r^2$"
                value={formData.question}
                onChange={e => setFormData({...formData, question: e.target.value})}
                required
              />
            </div>

            {formData.question && (
              <div style={{ padding: '16px', background: 'var(--input-bg)', borderRadius: '8px', fontSize: '1rem', border: '1px solid var(--card-border)', overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', borderBottom: '1px solid var(--card-border)', paddingBottom: '8px' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-p)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>Предпросмотр</span>
                </div>
                <div style={{ color: 'var(--text-h)', wordBreak: 'break-word', overflowWrap: 'anywhere', whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>
                  {renderMath(formData.question)}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-p)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Правильный ответ</label>
              <input className="main-input" placeholder="Число или строка" value={formData.answer} onChange={e => setFormData({...formData, answer: e.target.value})} required />
            </div>

            <button type="submit" className="main-btn" style={{ marginTop: 'auto', padding: '14px', fontSize: '1rem' }}>СОХРАНИТЬ ЗАДАЧУ</button>
          </form>
        </motion.div>

        {/* Список задач */}
        <motion.div className="bento-card" style={{ gridColumn: 'span 7', display: 'flex', flexDirection: 'column', height: '800px' }} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
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
                transition: 'all 0.2s ease', position: 'relative'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-h)' }}>
                    <span style={{ color: 'var(--accent)', marginRight: '8px' }}>#{t.number}</span>
                    {t.title}
                  </div>
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