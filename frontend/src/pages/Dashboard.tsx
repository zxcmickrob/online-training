import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

interface Task {
  id: number;
  number: number;
  title: string;
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
  const [answers, setAnswers] = useState<{[key: number]: string}>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'solved' | 'unsolved'>('all');
  
  const { logout } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tasksRes, statsRes] = await Promise.all([
        api.get('/tasks'),
        api.get('/statistics')
      ]);
      setTasks(tasksRes.data);
      setStats(statsRes.data);
    } catch {
      console.error('Failed to fetch data');
    }
  };

  const handleSolve = async (taskId: number) => {
    const answer = answers[taskId];
    if (!answer) return alert('Введите ответ');

    try {
      const res = await api.post(`/tasks/${taskId}/solve`, { answer });
      alert(res.data.message);
      fetchData(); // Refresh everything
    } catch (error: any) {
      alert(error.response?.data?.message || 'Ошибка при сохранении решения');
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         task.number.toString().includes(searchTerm);
    const isSolved = stats?.solved_tasks_ids.includes(task.id);
    
    if (filter === 'solved') return matchesSearch && isSolved;
    if (filter === 'unsolved') return matchesSearch && !isSolved;
    return matchesSearch;
  });

  return (
    <div>
      <header className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Добро пожаловать, {stats?.username}!</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Ваш прогресс: <strong>{stats?.solved_count}</strong> решенных задач</p>
        </div>
        <button className="danger" onClick={logout}>Выйти</button>
      </header>

      <section className="card">
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <input 
              type="text" 
              placeholder="Поиск по названию или номеру..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className={filter === 'all' ? 'primary' : 'secondary'} onClick={() => setFilter('all')}>Все</button>
            <button className={filter === 'solved' ? 'primary' : 'secondary'} onClick={() => setFilter('solved')}>Решенные</button>
            <button className={filter === 'unsolved' ? 'primary' : 'secondary'} onClick={() => setFilter('unsolved')}>Не решенные</button>
          </div>
        </div>

        <div className="task-grid">
          {filteredTasks.map(task => (
            <div key={task.id} className="card" style={{ margin: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <h3 style={{ margin: 0 }}>№{task.number}. {task.title}</h3>
                  {stats?.solved_tasks_ids.includes(task.id) && (
                    <span className="solved-badge">✓ Решено</span>
                  )}
                </div>
                <p style={{ whiteSpace: 'pre-wrap', marginBottom: '1.5rem' }}>{task.question}</p>
              </div>
              
              {!stats?.solved_tasks_ids.includes(task.id) && (
                <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
                  <input 
                    type="text" 
                    placeholder="Ваш ответ" 
                    value={answers[task.id] || ''} 
                    onChange={e => setAnswers({...answers, [task.id]: e.target.value})}
                    onKeyPress={e => e.key === 'Enter' && handleSolve(task.id)}
                  />
                  <button className="primary" onClick={() => handleSolve(task.id)}>Проверить</button>
                </div>
              )}
            </div>
          ))}
        </div>
        {filteredTasks.length === 0 && <p style={{ textAlign: 'center', padding: '2rem' }}>Задачи не найдены.</p>}
      </section>
    </div>
  );
};

export default Dashboard;
