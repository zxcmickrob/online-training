import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import katex from 'katex';

const API_URL = 'http://127.0.0.1:5000';

const AdminTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [formData, setFormData] = useState({ number: '', title: '', subtopic: '', question: '', answer: '' });
  const { logout } = useAuth();

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
    <div style={{ paddingBottom: '100px' }}>
      <header style={{ marginBottom: '60px' }}>
        <span style={{ color: 'var(--accent)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.2em', fontSize: '0.8rem' }}>
          Панель управления
        </span>
        <h1>Редактор заданий</h1>
      </header>

      <div className="bento-grid">
        {/* Форма добавления */}
        <motion.div className="bento-card" style={{ gridColumn: 'span 5' }} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h3 style={{ marginTop: 0, marginBottom: '24px' }}>Новое задание</h3>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2.5fr', gap: '15px' }}>
              <input className="main-input" placeholder="№" value={formData.number} onChange={e => setFormData({...formData, number: e.target.value})} required />
              <input className="main-input" placeholder="Тема задания" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
            </div>
            <input className="main-input" placeholder="Подтема" value={formData.subtopic} onChange={e => setFormData({...formData, subtopic: e.target.value})} />
            <div>
              <textarea 
                className="main-input" 
                style={{ minHeight: '160px', resize: 'none', marginBottom: '10px' }}
                placeholder="Текст задачи"
                value={formData.question}
                onChange={e => setFormData({...formData, question: e.target.value})}
                required
              />
              {formData.question && (
                <div style={{ padding: '20px', background: 'rgba(168, 85, 247, 0.05)', borderRadius: '20px', fontSize: '1.2rem', textAlign: 'center', border: '1px dashed var(--card-border)' }}>
                  <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-p)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>Предпросмотр:</span>
                  <div style={{ color: 'white' }}>{renderMath(formData.question)}</div>
                </div>
              )}
            </div>
            <input className="main-input" placeholder="Правильный ответ" value={formData.answer} onChange={e => setFormData({...formData, answer: e.target.value})} required />

            <button type="submit" className="main-btn" style={{ marginTop: '10px' }}>СОХРАНИТЬ</button>
          </form>
        </motion.div>

        {/* Список задач */}
        <motion.div className="bento-card" style={{ gridColumn: 'span 7' }} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <h3 style={{ marginTop: 0, marginBottom: '24px' }}>Все задачи ({tasks.length})</h3>
          <div style={{ display: 'grid', gap: '12px', maxHeight: '600px', overflowY: 'auto', paddingRight: '10px' }}>
            {tasks.map((t: any) => (
              <div key={t.id} style={{ 
                background: 'rgba(255,255,255,0.02)', padding: '20px 24px', 
                borderRadius: '24px', display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', border: '1px solid var(--card-border)',
                transition: 'all 0.3s ease'
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: '700', color: 'white', marginBottom: '4px' }}>
                    <span style={{ color: 'var(--accent)', marginRight: '10px' }}>#{t.number}</span>
                    {t.title}
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    {t.subtopic && <span style={{ fontSize: '0.7rem', color: 'var(--accent)', fontWeight: '800' }}>{t.subtopic.toUpperCase()}</span>}
                  </div>
                  <div style={{ color: 'var(--text-p)', fontSize: '0.85rem' }}>Правильный ответ: <span style={{ color: 'var(--accent)', fontWeight: '700' }}>{t.answer}</span></div>
                </div>
                <button 
                  onClick={() => {
                    if (window.confirm('Точно удалить эту задачу?')) handleDeleteTask(t.id);
                  }}
                  style={{ background: 'rgba(244, 63, 94, 0.1)', color: '#f43f5e', border: 'none', padding: '10px 16px', borderRadius: '12px', cursor: 'pointer', fontWeight: '800', fontSize: '0.75rem', marginLeft: '15px', textTransform: 'uppercase', letterSpacing: '1px' }}
                >
                  Удалить
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminTasks;
