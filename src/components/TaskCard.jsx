import React from 'react';
import { Trash2, Pencil, Calendar, MessageSquare, Copy, CheckSquare, Paperclip, CopyPlus } from 'lucide-react';

const getPriorityColor = (priority) => {
  switch (priority) {
    case 'High': return 'bg-red-50 text-red-700 border-red-200';
    case 'Medium': return 'bg-orange-50 text-orange-700 border-orange-200';
    case 'Low': return 'bg-green-50 text-green-700 border-green-200';
    default: return 'bg-slate-50 text-slate-700 border-slate-200';
  }
};

export default function TaskCard({ task, user, onDragStart, onDelete, onEdit, onClone }) {
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date().setHours(0,0,0,0) && task.status !== 'Done';
  
  const completedSubtasks = task.subtasks ? task.subtasks.filter(s => s.completed).length : 0;
  const totalSubtasks = task.subtasks ? task.subtasks.length : 0;
  const progress = totalSubtasks === 0 ? 0 : (completedSubtasks / totalSubtasks) * 100;
  const attachmentCount = task.attachments ? task.attachments.length : 0;

  const handleCopyId = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(task.id);
  };
  
  return (
    <div 
      className="bg-white p-3 rounded-lg shadow-sm border border-slate-200 mb-3 cursor-grab active:cursor-grabbing hover:shadow-md hover:border-blue-300 transition group relative"
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
      onClick={() => onEdit(task)}
    >
      <div className="flex justify-between items-start mb-2">
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getPriorityColor(task.priority)} uppercase tracking-wide`}>
          {task.priority}
        </span>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white pl-2">
          {/* CLONE BUTTON */}
          <button onClick={(e) => { e.stopPropagation(); onClone(task); }} className="text-slate-400 hover:text-green-600" title="Clone Task">
             <CopyPlus size={14} />
          </button>
          
          <button onClick={handleCopyId} className="text-slate-400 hover:text-slate-600" title="Copy ID"><Copy size={14} /></button>
          <button onClick={(e) => { e.stopPropagation(); onEdit(task); }} className="text-slate-400 hover:text-blue-600"><Pencil size={14} /></button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(task.id); }} className="text-slate-400 hover:text-red-500"><Trash2 size={14} /></button>
        </div>
      </div>

      <p className="text-sm text-slate-800 leading-snug mb-3 font-medium">{task.title}</p>
      
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {task.tags.map(tag => (
            <span key={tag} className="text-[10px] font-bold bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">{tag}</span>
          ))}
        </div>
      )}

      {totalSubtasks > 0 && (
        <div className="mb-3">
          <div className="flex justify-between text-[10px] text-slate-500 mb-1">
            <span className="flex items-center gap-1"><CheckSquare size={10} /> Progress</span>
            <span>{completedSubtasks}/{totalSubtasks}</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
             <div className="bg-blue-500 h-full transition-all" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-end pt-2 border-t border-slate-50 mt-1">
        <div className="flex gap-3">
          {task.dueDate && (
            <div className={`flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded ${isOverdue ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'}`}>
              <Calendar size={10} /> <span>{new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
            </div>
          )}
          {(task.comments && task.comments.length > 0) && (
            <div className="flex items-center gap-1 text-[10px] text-slate-500">
              <MessageSquare size={10} /> {task.comments.length}
            </div>
          )}
          {/* Attachments Icon */}
          {attachmentCount > 0 && (
            <div className="flex items-center gap-1 text-[10px] text-slate-500">
              <Paperclip size={10} /> {attachmentCount}
            </div>
          )}
        </div>

        <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center text-[10px] font-bold text-slate-500" title={task.assignee ? `Assigned to ${task.assignee.firstName}` : 'Unassigned'}>
          {task.assignee ? (
            <img src={task.assignee.image} alt="assignee" className="w-full h-full object-cover" />
          ) : (
            <span>?</span>
          )}
        </div>
      </div>
    </div>
  );
}