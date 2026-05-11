import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

interface Task {
  id: number;
  number: number;
  title: string;
  question: string;
  answer: string;
}

const AdminPanel: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  
  // Form states
  const [number, setNumber] = useState('');
  const [title, setTitle] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await api.get('/tasks');
      setTasks(res.data);
    } catch (err) {
      console.error('Failed to fetch tasks', err);
    }
  };

  const resetForm = () => {
    setEditingTask(null);
    setNumber('');
    setTitle('');
    setQuestion('');
    setAnswer('');
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setNumber(task.number.toString());
    setTitle(task.title);
    setQuestion(task.question);
    setAnswer(task.answer);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Вы уверены, что хотите удалить эту задачу?')) return;
    try {
      await api.delete(`/tasks/${id}`);
      fetchTasks();
    } catch (err) {
      alert('Ошибка при удалении');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const taskData = {
      number: parseInt(number),
      title,
      question,
      answer
    };

    try {
      if (editingTask) {
        await api.put(`/tasks/${editingTask.id}`, taskData);
        alert('Задача обновлена!');
      } else {
        await api.post('/tasks', taskData);
        alert('Задача создана!');
      }
      resetForm();
      fetchTasks();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Ошибка при сохранении');
    }
  };

  return (
    <div className="admin-container">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Панель администратора</h1>
        <button className="secondary" onClick={() => navigate('/')}>На главную</button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Task Form */}
        <section className="card">
          <h2>{editingTask ? 'Редактировать задачу' : 'Создать новую задачу'}</h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input 
              type="number" 
              placeholder="Номер задания" 
              value={number} 
              onChange={e => setNumber(e.target.value)} 
              required 
            />
            <input 
              type="text" 
              placeholder="Заголовок" 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              required 
            />
            <textarea 
              placeholder="Текст вопроса" 
              value={question} 
              onChange={e => setQuestion(e.target.value)} 
              rows={4}
            />
            <input 
              type="text" 
              placeholder="Правильный ответ" 
              value={answer} 
              onChange={e => setAnswer(e.target.value)} 
              required
            />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" className="primary">
                {editingTask ? 'Сохранить изменения' : 'Создать задачу'}
              </button>
              {editingTask && (
                <button type="button" className="secondary" onClick={resetForm}>Отмена</button>
              )}
            </div>
          </form>
        </section>

        {/* Task List */}
        <section>
          <h2>Список всех задач</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {tasks.map(task => (
              <div key={task.id} className="card" style={{ padding: '1rem', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <strong>№{task.number}</strong>: {task.title}
                  </div>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <button className="secondary" style={{ padding: '4px 8px', fontSize: '0.8rem' }} onClick={() => handleEdit(task)}>Edit</button>
                    <button className="danger" style={{ padding: '4px 8px', fontSize: '0.8rem' }} onClick={() => handleDelete(task.id)}>Delete</button>
                  </div>
                </div>
              </div>
            ))}
            {tasks.length === 0 && <p>Задач пока нет.</p>}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminPanel;
