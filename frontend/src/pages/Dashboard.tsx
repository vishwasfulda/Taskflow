import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import type { Task, TaskFormData, TaskStats } from '../types';
import TaskCard from '../components/TaskCard';
import TaskForm from '../components/TaskForm';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<TaskStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [filter, setFilter] = useState('');
  const fetchData = useCallback(async () => {
    try {
      const [tasksRes, statsRes] = await Promise.all([
        api.get('/tasks', { params: filter ? { status: filter } : {} }),
        api.get('/tasks/stats'),
      ]);
      setTasks(tasksRes.data);
      setStats(statsRes.data);
    } catch {
      toast.error('Failed to load tasks.');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  const handleCreate = async (data: TaskFormData) => {
    try {
      await api.post('/tasks', data);
      toast.success('Task created!');
      setShowForm(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to create task.');
    }
  };

  const handleUpdate = async (data: TaskFormData) => {
    if (!editTask) return;
    try {
      await api.put(`/tasks/${editTask.id}`, data);
      toast.success('Task updated!');
      setEditTask(null);
      fetchData();
    } catch {
      toast.error('Failed to update task.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${id}`);
      toast.success('Task deleted.');
      fetchData();
    } catch {
      toast.error('Failed to delete task.');
    }
  };

  const handleStatusChange = async (id: number, status: Task['status']) => {
    try {
      await api.put(`/tasks/${id}`, { status });
      fetchData();
    } catch {
      toast.error('Failed to update status.');
    }
  };
  const filters = [
    { label: 'All', value: '' },
    { label: 'To Do', value: 'todo' },
    { label: 'In Progress', value: 'in_progress' },
    { label: 'Done', value: 'done' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-900">TaskFlow</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">{user?.name}</span>
          <button
            onClick={logout}
            className="text-sm text-gray-500 hover:text-gray-800 transition"
          >
            Sign out
          </button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            {[
              { label: 'Total Tasks', value: stats.total, color: 'text-gray-900' },
              { label: 'In Progress', value: stats.in_progress, color: 'text-blue-600' },
              { label: 'Completed', value: stats.done, color: 'text-green-600' },
              { label: 'Overdue', value: stats.overdue, color: 'text-red-500' },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4">
                <p className="text-xs text-gray-500 mb-1">{s.label}</p>
                <p className={`text-2xl font-semibold ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div className="flex gap-2 flex-wrap">
            {filters.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`text-sm px-3 py-1.5 rounded-lg transition font-medium ${
                  filter === f.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
          >
            + New Task
          </button>
        </div>

        {loading ? (
          <p className="text-center text-gray-400 py-16">Loading tasks...</p>
        ) : tasks.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-sm">No tasks yet.</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-3 text-blue-600 text-sm hover:underline"
            >
              Create your first task →
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={(t) => setEditTask(t)}
                onDelete={handleDelete}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        )}
      </main>

      {(showForm || editTask) && (
        <TaskForm
          task={editTask}
          onSubmit={editTask ? handleUpdate : handleCreate}
          onClose={() => { setShowForm(false); setEditTask(null); }}
        />
      )}
    </div>
  );
}