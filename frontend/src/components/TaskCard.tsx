import type { Task } from '../types';

const statusStyles: Record<string, string> = {
  todo: 'bg-gray-100 text-gray-600',
  in_progress: 'bg-blue-100 text-blue-700',
  done: 'bg-green-100 text-green-700',
};

const priorityStyles: Record<string, string> = {
  low: 'bg-slate-100 text-slate-600',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-red-100 text-red-700',
};

const statusLabel: Record<string, string> = {
  todo: 'To Do',
  in_progress: 'In Progress',
  done: 'Done',
};

interface Props {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
  onStatusChange: (id: number, status: Task['status']) => void;
}

export default function TaskCard({ task, onEdit, onDelete, onStatusChange }: Props) {
  const isOverdue =
    task.due_date &&
    new Date(task.due_date) < new Date() &&
    task.status !== 'done';

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition group">
      <div className="flex items-start justify-between gap-2">
        <h3 className={`font-medium text-gray-900 text-sm leading-snug flex-1 ${task.status === 'done' ? 'line-through text-gray-400' : ''}`}>
          {task.title}
        </h3>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
          <button
            onClick={() => onEdit(task)}
            className="text-xs px-2 py-1 rounded-md hover:bg-gray-100 text-gray-500"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="text-xs px-2 py-1 rounded-md hover:bg-red-50 text-red-400"
          >
            Delete
          </button>
        </div>
      </div>

      {task.description && (
        <p className="text-xs text-gray-500 mt-1.5 line-clamp-2">
          {task.description}
        </p>
      )}

      <div className="flex flex-wrap gap-1.5 mt-3">
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusStyles[task.status]}`}>
          {statusLabel[task.status]}
        </span>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityStyles[task.priority]}`}>
          {task.priority}
        </span>
        {task.due_date && (
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isOverdue ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'}`}>
            {isOverdue ? '⚠ ' : ''}
            {new Date(task.due_date).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short'
            })}
          </span>
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-gray-50">
        <select
          value={task.status}
          onChange={(e) => onStatusChange(task.id, e.target.value as Task['status'])}
          className="text-xs border border-gray-200 rounded-lg px-2 py-1 text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white"
        >
          <option value="todo">Move to: To Do</option>
          <option value="in_progress">Move to: In Progress</option>
          <option value="done">Move to: Done</option>
        </select>
      </div>
    </div>
  );
}