import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import katex from 'katex';

const API_URL = 'http://127.0.0.1:5000';

const AdminTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [formData, setFormData] = useState({ number: '', title: '', question: '', answer: '' });
  const { logout } = useAuth();

  const fetchTasks = async () => {
    try {
      const response = await axios.get(`${API_URL}/tasks`);
      setTasks(response.data);
    } catch {
      const saved = localStorage.getItem('demo_tasks');
      if (saved) setTasks(JSON.parse(saved));
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
      toast.success('Данные синхронизированы с сервером');
      fetchTasks();
    } catch {
      const updated = [...tasks, { ...formData, id: Date.now() }];
      setTasks(updated);
      localStorage.setItem('demo_tasks', JSON.stringify(updated));
      toast.success('Сохранено в локальное хранилище');
    }
    setFormData({ number: '', title: '', question: '', answer: '' });
  };

  const handleDeleteTask = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/tasks/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Задача удалена');
      fetchTasks();
    } catch {
      const updated = tasks.filter((t: any) => t.id !== id);
      setTasks(updated);
      localStorage.setItem('demo_tasks', JSON.stringify(updated));
      toast.success('Задача удалена локально');
    }
  };

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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '15px' }}>
              <input className="main-input" placeholder="№" value={formData.number} onChange={e => setFormData({...formData, number: e.target.value})} required />
              <input className="main-input" placeholder="Тема (напр. Геометрия)" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
            </div>
            <div>
              <textarea 
                className="main-input" 
                style={{ minHeight: '120px', resize: 'none', marginBottom: '10px' }}
                placeholder="Текст задачи (можно использовать LaTeX: \log_2 x)"
                value={formData.question}
                onChange={e => setFormData({...formData, question: e.target.value})}
                required
              />
              {formData.question && (
                <div style={{ padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '15px', fontSize: '1.2rem', textAlign: 'center' }}>
                  <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-p)', marginBottom: '5px' }}>Предпросмотр:</span>
                  {renderMath(formData.question)}
                </div>
              )}
            </div>
            <input className="main-input" placeholder="Эталонный ответ" value={formData.answer} onChange={e => setFormData({...formData, answer: e.target.value})} required />
            <button type="submit" className="main-btn">ОПУБЛИКОВАТЬ</button>
          </form>
        </motion.div>

        {/* Список задач */}
        <motion.div className="bento-card" style={{ gridColumn: 'span 7' }} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <h3 style={{ marginTop: 0, marginBottom: '24px' }}>Активные задачи ({tasks.length})</h3>
          <div style={{ display: 'grid', gap: '12px', maxHeight: '550px', overflowY: 'auto', paddingRight: '10px' }}>
            {tasks.map((t: any) => (
              <div key={t.id} style={{ 
                background: 'rgba(255,255,255,0.03)', padding: '15px 20px', 
                borderRadius: '16px', display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', border: '1px solid var(--card-border)'
              }}>
                <div style={{ flex: 1 }}>
                  <span style={{ color: 'var(--accent)', fontWeight: '800', marginRight: '10px' }}>#{t.number}</span>
                  <span style={{ fontSize: '0.95rem' }}>{t.title}</span>
                  <div style={{ color: 'var(--text-p)', fontSize: '0.8rem', marginTop: '5px' }}>Ответ: {t.answer}</div>
                </div>
                <button 
                  onClick={() => {
                    toast((t_toast) => (
                      <span>
                        Точно удалить эту задачу?
                        <button onClick={() => { toast.dismiss(t_toast.id); handleDeleteTask(t.id); }} style={{ margin: '0 10px', padding: '4px 8px', background: '#f43f5e', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Да</button>
                        <button onClick={() => toast.dismiss(t_toast.id)} style={{ padding: '4px 8px', background: '#475569', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Нет</button>
                      </span>
                    ));
                  }}
                  style={{ background: 'rgba(244, 63, 94, 0.1)', color: '#f43f5e', border: 'none', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem', marginLeft: '15px' }}
                >
                  Удалить
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '60px' }}>
        <button 
          onClick={logout} 
          className="main-btn" 
          style={{ background: 'rgba(244, 63, 94, 0.1)', color: '#f43f5e', border: '1px solid rgba(244, 63, 94, 0.2)', boxShadow: 'none' }}
        >
          Выйти из системы
        </button>
      </div>
    </div>
  );
};

export default AdminTasks;
