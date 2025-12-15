import React from 'react';
import { Trash2, Pencil } from 'lucide-react';

const getPriorityColor = (priority) => {
  switch (priority) {
    case 'High': return 'bg-red-100 text-red-700 border-red-200';
    case 'Medium': return 'bg-orange-100 text-orange-700 border-orange-200';
    case 'Low': return 'bg-green-100 text-green-700 border-green-200';
    default: return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};

export default function TaskCard({ task, user, onDragStart, onDelete, onEdit }) {
  return (
    <div 
      className="bg-white p-4 rounded-md shadow-sm border border-slate-200 mb-3 cursor-grab active:cursor-grabbing hover:shadow-md transition group relative"
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
    >
      {/* Priority Badge & Actions */}
      <div className="flex justify-between items-start mb-2">
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getPriorityColor(task.priority)} uppercase tracking-wide`}>
          {task.priority}
        </span>
        
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={() => onEdit(task)}
            className="text-slate-300 hover:text-blue-500 transition"
            title="Edit"
          >
            <Pencil size={14} />
          </button>
          <button 
            onClick={() => onDelete(task.id)}
            className="text-slate-300 hover:text-red-500 transition"
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <p className="text-sm text-slate-800 leading-snug mb-4 font-medium">{task.title}</p>
      
      <div className="flex justify-between items-center pt-3 border-t border-slate-50">
        <span className="text-xs text-slate-400 font-mono">ID-{task.id}</span>
        <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-bold">
          {user.firstName ? user.firstName[0] : 'U'}
        </div>
      </div>
    </div>
  );
}