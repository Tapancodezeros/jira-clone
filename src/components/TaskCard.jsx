import React from 'react';
import { Edit2, Trash2, Calendar, Tag, CheckSquare, Bug, BookOpen, Zap } from 'lucide-react';

export default function TaskCard({ task, index, onClick, onEdit, onDelete, onDragStart }) {
    return (
        <div
            draggable
            onDragStart={onDragStart}
            onClick={onClick}
            className="bg-white dark:bg-slate-900 section-glass p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 cursor-grab active:cursor-grabbing relative group hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
            style={{ animationDelay: `${index * 0.05}s` }}
        >
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 z-10">
                <button
                    onClick={(e) => { e.stopPropagation(); onEdit(); }}
                    className="p-1 text-slate-400 hover:text-blue-500 rounded bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-sm"
                    title="Edit"
                >
                    <Edit2 size={13} />
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); onDelete(); }}
                    className="p-1 text-slate-400 hover:text-red-500 rounded bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-sm"
                    title="Delete"
                >
                    <Trash2 size={13} />
                </button>
            </div>

            <div className="flex items-start gap-3 mb-2.5">
                <span className={`w-1 self-stretch rounded-full ${task.priority === 'High' || task.priority === 'Critical' ? 'bg-red-500' :
                    task.priority === 'Medium' ? 'bg-orange-400' :
                        task.priority === 'Low' ? 'bg-blue-400' : 'bg-slate-300'
                    }`}></span>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                        {task.issueType === 'Bug' && <Bug size={12} className="text-red-500 shrink-0" />}
                        {task.issueType === 'Story' && <BookOpen size={12} className="text-green-600 shrink-0" />}
                        {task.issueType === 'Epic' && <Zap size={12} className="text-purple-600 shrink-0" />}
                        {(!task.issueType || task.issueType === 'Task') && <CheckSquare size={12} className="text-blue-500 shrink-0" />}
                        <strong className="text-slate-800 dark:text-slate-100 text-sm font-bold leading-snug block line-clamp-2">{task.title}</strong>
                    </div>
                    {task.description && <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{task.description}</p>}
                </div>
            </div>

            <div className="flex flex-wrap gap-1.5 mb-3">
                {task.priority && (
                    <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border ${task.priority === 'High' || task.priority === 'Critical' ? 'text-red-600 bg-red-50 border-red-100 dark:bg-red-900/20 dark:border-red-900' :
                        task.priority === 'Medium' ? 'text-orange-600 bg-orange-50 border-orange-100 dark:bg-orange-900/20 dark:border-orange-900' :
                            'text-blue-600 bg-blue-50 border-blue-100 dark:bg-blue-900/20 dark:border-blue-900'
                        }`}>
                        {task.priority}
                    </span>
                )}
                {Array.isArray(task.labels) && task.labels.map((l, i) => (
                    <span key={i} className="text-[10px] font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 flex items-center gap-1">
                        <Tag size={8} /> {l}
                    </span>
                ))}
                {task.storyPoints != null && (
                    <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded-full border border-slate-300 dark:border-slate-600 flex items-center gap-1" title="Story Points">
                        {task.storyPoints}
                    </span>
                )}
            </div>

            {task.originalEstimate > 0 && (
                <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full mb-3 overflow-hidden">
                    <div
                        className={`h-full rounded-full ${task.timeSpent > task.originalEstimate ? 'bg-red-500' : 'bg-green-500'}`}
                        style={{ width: `${Math.min(100, ((task.timeSpent || 0) / task.originalEstimate) * 100)}%` }}
                    ></div>
                </div>
            )}

            <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-50 dark:border-slate-800/50">
                <div className="flex items-center gap-2">
                    {task.dueDate && (
                        <div className={`flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded ${new Date(task.dueDate) < new Date() ? 'text-red-600 bg-red-50 dark:bg-red-900/10' : 'text-slate-400 bg-slate-50 dark:bg-slate-800'
                            }`}>
                            <Calendar size={10} />
                            {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-1.5">
                    {task.assignee ? (
                        <div className="flex items-center gap-1.5" title={`Assigned to ${task.assignee.name}`}>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium max-w-[60px] truncate">
                                {task.assignee.name.split(' ')[0]}
                            </span>
                            {task.assignee.avatar ? (
                                <img src={task.assignee.avatar} alt={task.assignee.name} className="w-5 h-5 rounded-full object-cover shadow-sm ring-1 ring-white dark:ring-slate-800" />
                            ) : (
                                <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 text-white flex items-center justify-center text-[8px] font-bold shadow-sm ring-1 ring-white dark:ring-slate-800">
                                    {task.assignee.name[0]}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center shadow-sm border border-slate-200 dark:border-slate-700" title="Unassigned">
                            <span className="text-[10px] font-bold">?</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}