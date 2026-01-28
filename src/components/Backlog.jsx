import React, { useState } from 'react';
import { Plus, ChevronDown, ChevronRight, MoreHorizontal, ArrowRight, User, AlertCircle } from 'lucide-react';
import api from '../utils/apiClient';

const Backlog = ({ tasks, project, onEditTask, onRefresh, currentUserId }) => {
    const [isSprintOpen, setIsSprintOpen] = useState(true);
    const [isBacklogOpen, setIsBacklogOpen] = useState(true);
    const [quickAddTitle, setQuickAddTitle] = useState('');

    // Filter tasks
    const activeSprintTasks = tasks.filter(t => t.status !== 'Backlog');
    const backlogTasks = tasks.filter(t => t.status === 'Backlog');

    const handleQuickAdd = async (e) => {
        if (e.key === 'Enter' && quickAddTitle.trim()) {
            try {
                await api.post('/tasks', {
                    title: quickAddTitle,
                    projectId: project.id,
                    status: 'Backlog',
                    priority: 'Medium',
                    assigneeId: null
                });
                setQuickAddTitle('');
                onRefresh();
            } catch (err) {
                console.error('Failed to create task', err);
            }
        }
    };

    const moveToBoard = async (task) => {
        try {
            await api.put(`/tasks/${task.id}`, { status: 'Todo' });
            onRefresh();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="flex-1 h-full overflow-y-auto custom-scrollbar p-8">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Backlog</h1>
                    {/* Stats or Actions */}
                    <div className="flex gap-4 text-sm text-slate-500">
                        <span>{backlogTasks.length} issues in backlog</span>
                    </div>
                </div>

                {/* Active Board / Sprint Section */}
                <div className="bg-white dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                    <div
                        className="px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between cursor-pointer select-none"
                        onClick={() => setIsSprintOpen(!isSprintOpen)}
                    >
                        <div className="flex items-center gap-2">
                            {isSprintOpen ? <ChevronDown size={18} className="text-slate-400" /> : <ChevronRight size={18} className="text-slate-400" />}
                            <h3 className="font-bold text-sm uppercase tracking-wider text-slate-700 dark:text-slate-300">Board ({activeSprintTasks.length})</h3>
                        </div>
                        <button className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold px-3 py-1 rounded-full">Active</button>
                    </div>

                    {isSprintOpen && (
                        <div className="divide-y divide-slate-100 dark:divide-slate-800/50 bg-white/50 dark:bg-transparent">
                            {activeSprintTasks.length === 0 && (
                                <div className="p-8 text-center text-slate-400 text-sm border-dashed border-2 border-slate-100 dark:border-slate-800 m-4 rounded-xl">
                                    No active tasks on the board. Drag issues here or start a sprint!
                                </div>
                            )}
                            {activeSprintTasks.map(task => (
                                <BacklogItem key={task.id} task={task} onEdit={onEditTask} location="board" />
                            ))}
                        </div>
                    )}
                </div>

                {/* Backlog Section */}
                <div className="bg-white dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                    <div
                        className="px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between cursor-pointer select-none"
                        onClick={() => setIsBacklogOpen(!isBacklogOpen)}
                    >
                        <div className="flex items-center gap-2">
                            {isBacklogOpen ? <ChevronDown size={18} className="text-slate-400" /> : <ChevronRight size={18} className="text-slate-400" />}
                            <h3 className="font-bold text-sm uppercase tracking-wider text-slate-700 dark:text-slate-300">Backlog ({backlogTasks.length})</h3>
                        </div>
                        <div className="text-xs font-bold text-slate-400">All unplanned issues</div>
                    </div>

                    {isBacklogOpen && (
                        <div className="divide-y divide-slate-100 dark:divide-slate-800/50 bg-white/50 dark:bg-transparent">
                            {backlogTasks.map(task => (
                                <BacklogItem
                                    key={task.id}
                                    task={task}
                                    onEdit={onEditTask}
                                    onMoveToBoard={() => moveToBoard(task)}
                                    location="backlog"
                                />
                            ))}

                            {/* Quick Add */}
                            <div className="p-2">
                                <div className="flex items-center gap-3 p-2 group hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg transition-colors cursor-text" onClick={() => document.getElementById('quick-add').focus()}>
                                    <Plus size={16} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
                                    <input
                                        id="quick-add"
                                        type="text"
                                        className="bg-transparent border-none outline-none text-sm w-full p-0 placeholder-slate-400 text-slate-700 dark:text-slate-200"
                                        placeholder="Create issue..."
                                        value={quickAddTitle}
                                        onChange={e => setQuickAddTitle(e.target.value)}
                                        onKeyDown={handleQuickAdd}
                                    />
                                    {quickAddTitle && <span className="text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-500 px-2 py-0.5 rounded animate-in fade-in">Press Enter</span>}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const BacklogItem = ({ task, onEdit, onMoveToBoard, location }) => {
    return (
        <div className="group flex items-center gap-3 p-3 pl-4 hover:bg-blue-50/50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer" onClick={() => onEdit(task)}>
            {/* Type Icon */}
            <div className="text-slate-400" title={task.issueType || 'Task'}>
                {task.issueType === 'Bug' ? <AlertCircle size={16} className="text-red-500" /> :
                    task.issueType === 'Story' ? <div className="w-4 h-4 bg-green-500 rounded text-[10px] text-white flex items-center justify-center font-bold">S</div> :
                        <div className="w-4 h-4 bg-blue-500 rounded text-[10px] text-white flex items-center justify-center font-bold">✓</div>}
            </div>

            <div className="flex-1 flex items-center gap-3 overflow-hidden">
                <span className="text-xs font-mono text-slate-400 group-hover:text-blue-500 transition-colors">TASK-{task.id}</span>
                <span className={`text-sm font-medium truncate ${task.status === 'Done' ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-200'}`}>{task.title}</span>
            </div>

            <div className="flex items-center gap-4 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                {/* Labels/Priority */}
                <div className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${task.priority === 'High' ? 'bg-red-50 text-red-600 dark:bg-red-900/20' : 'bg-slate-100 text-slate-500 dark:bg-slate-700'
                    }`}>
                    {task.priority || 'Med'}
                </div>

                {/* Assignee */}
                <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-500 overflow-hidden" title={task.assignee?.name || 'Unassigned'}>
                    {task.assignee?.name ? task.assignee.name[0] : <User size={12} />}
                </div>

                {location === 'backlog' && (
                    <div
                        onClick={(e) => { e.stopPropagation(); onMoveToBoard(); }}
                        className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
                        title="Move to Board"
                    >
                        <ArrowRight size={16} />
                    </div>
                )}
            </div>

            <div className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300">
                <MoreHorizontal size={16} />
            </div>
        </div>
    );
};

export default Backlog;
