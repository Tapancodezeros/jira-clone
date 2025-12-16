import React, { useState, useEffect } from 'react';
import { Trash2, Pencil, Calendar, MessageSquare, Copy, CheckSquare, Paperclip, CopyPlus, Play, Pause, Clock } from 'lucide-react';

const getPriorityColor = (priority) => {
  switch (priority) {
    case 'High': return 'bg-red-50 text-red-700 border-red-200';
    case 'Medium': return 'bg-orange-50 text-orange-700 border-orange-200';
    case 'Low': return 'bg-green-50 text-green-700 border-green-200';
    default: return 'bg-slate-50 text-slate-700 border-slate-200';
  }
};

const formatTime = (ms) => {
  if (!ms) return "0m";
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  return `${minutes}m`;
};

export default function TaskCard({ task, user, onDragStart, onDelete, onEdit, onClone, isDarkMode, onToggleTimer }) {
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date().setHours(0,0,0,0) && task.status !== 'Done';
  const [elapsed, setElapsed] = useState(task.timeSpent || 0);

  useEffect(() => {
    let interval;
    if (task.timerStartTime) {
      interval = setInterval(() => {
        setElapsed((task.timeSpent || 0) + (Date.now() - task.timerStartTime));
      }, 1000);
    } else {
      setElapsed(task.timeSpent || 0);
    }
    return () => clearInterval(interval);
  }, [task.timerStartTime, task.timeSpent]);

  const completedSubtasks = task.subtasks ? task.subtasks.filter(s => s.completed).length : 0;
  const totalSubtasks = task.subtasks ? task.subtasks.length : 0;
  const progress = totalSubtasks === 0 ? 0 : (completedSubtasks / totalSubtasks) * 100;
  const attachmentCount = task.attachments ? task.attachments.length : 0;

  const handleCopyId = (e) => { e.stopPropagation(); navigator.clipboard.writeText(task.id); };
  
  return (
    <div 
      className={`p-3 rounded-lg shadow-sm border mb-3 cursor-grab active:cursor-grabbing transition group relative ${isDarkMode ? 'bg-slate-800 border-slate-700 hover:border-blue-500' : 'bg-white border-slate-200 hover:shadow-md hover:border-blue-300'}`}
      draggable onDragStart={(e) => onDragStart(e, task.id)} onClick={() => onEdit(task)}
    >
      <div className="flex justify-between items-start mb-2">
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wide ${getPriorityColor(task.priority)}`}>{task.priority}</span>
        <div className={`flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity pl-2 ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}>
          <button onClick={(e) => { e.stopPropagation(); onClone(task); }} className="text-slate-400 hover:text-green-600"><CopyPlus size={14} /></button>
          <button onClick={handleCopyId} className="text-slate-400 hover:text-slate-600"><Copy size={14} /></button>
          <button onClick={(e) => { e.stopPropagation(); onEdit(task); }} className="text-slate-400 hover:text-blue-600"><Pencil size={14} /></button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(task.id); }} className="text-slate-400 hover:text-red-500"><Trash2 size={14} /></button>
        </div>
      </div>

      <p className={`text-sm leading-snug mb-3 font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{task.title}</p>
      
      <div className="flex items-center gap-2 mb-3">
        <button onClick={(e) => { e.stopPropagation(); onToggleTimer(task.id); }} className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs font-bold transition ${task.timerStartTime ? 'bg-green-100 text-green-700 animate-pulse border border-green-200' : (isDarkMode ? 'bg-slate-700 text-slate-400 hover:bg-slate-600' : 'bg-slate-100 text-slate-500 hover:bg-slate-200')}`}>
          {task.timerStartTime ? <Pause size={10} fill="currentColor" /> : <Play size={10} fill="currentColor" />} {task.timerStartTime ? 'Tracking' : 'Start'}
        </button>
        {(elapsed > 0) && <span className={`text-xs font-mono flex items-center gap-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}><Clock size={10} /> {formatTime(elapsed)}</span>}
      </div>

      {task.tags && task.tags.length > 0 && (<div className="flex flex-wrap gap-1 mb-3">{task.tags.map(tag => (<span key={tag} className="text-[10px] font-bold bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">{tag}</span>))}</div>)}

      {totalSubtasks > 0 && (<div className="mb-3"><div className="flex justify-between text-[10px] text-slate-500 mb-1"><span><CheckSquare size={10} /> Progress</span><span>{completedSubtasks}/{totalSubtasks}</span></div><div className={`w-full h-1.5 rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-700' : 'bg-slate-100'}`}><div className="bg-blue-500 h-full transition-all" style={{ width: `${progress}%` }}></div></div></div>)}

      <div className={`flex justify-between items-end pt-2 border-t mt-1 ${isDarkMode ? 'border-slate-700' : 'border-slate-50'}`}>
        <div className="flex gap-3">
          {task.dueDate && (<div className={`flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded ${isOverdue ? 'bg-red-100 text-red-600' : (isDarkMode ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-500')}`}><Calendar size={10} /> <span>{new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span></div>)}
          {(task.comments?.length > 0) && (<div className="flex items-center gap-1 text-[10px] text-slate-500"><MessageSquare size={10} /> {task.comments.length}</div>)}
          {attachmentCount > 0 && (<div className="flex items-center gap-1 text-[10px] text-slate-500"><Paperclip size={10} /> {attachmentCount}</div>)}
        </div>
        <div className={`w-6 h-6 rounded-full border overflow-hidden flex items-center justify-center text-[10px] font-bold ${isDarkMode ? 'bg-slate-700 border-slate-600 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-500'}`}>{task.assignee ? <img src={task.assignee.image} alt="assignee" className="w-full h-full object-cover" /> : <span>?</span>}</div>
      </div>
    </div>
  );
}