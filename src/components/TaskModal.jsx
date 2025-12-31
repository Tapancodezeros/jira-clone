import React, { useState, useEffect } from 'react';
import api from '../utils/apiClient';
import { useToast } from '../context/ToastContext';
import { X, Save, Trash2, User, Flag, CheckCircle, AlignLeft, Calendar, CheckSquare, Bug, BookOpen, Zap, Hash } from 'lucide-react';

const TaskModal = ({ task, projectId, onClose, onSave, onDelete }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [assigneeId, setAssigneeId] = useState('');
    const [status, setStatus] = useState('Todo');
    const [priority, setPriority] = useState('Medium');
    const [dueDate, setDueDate] = useState('');
    const [labels, setLabels] = useState('');
    const [issueType, setIssueType] = useState('Task');
    const [storyPoints, setStoryPoints] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [users, setUsers] = useState([]);
    const [comments, setComments] = useState([]);
    const [activities, setActivities] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [subtasks, setSubtasks] = useState([]);
    const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
    const [isCommentFocused, setIsCommentFocused] = useState(false);
    const [showMentionList, setShowMentionList] = useState(false);
    const [mentionFilter, setMentionFilter] = useState('');
    const [originalEstimate, setOriginalEstimate] = useState('');
    const [timeSpent, setTimeSpent] = useState('');


    // For now simple single tag, later can be array
    const [activeTab, setActiveTab] = useState('details');

    const { showToast } = useToast();

    useEffect(() => {
        const fetchUsers = async () => {
            const data = await api.get('/users');
            if (data) setUsers(data);
        };
        fetchUsers();
    }, []);

    const fetchComments = async (tid) => {
        if (!tid) return;
        const data = await api.get(`/tasks/${tid}/comments`);
        if (data) setComments(data);
    };

    const fetchActivities = async (tid) => {
        if (!tid) return;
        const data = await api.get(`/tasks/${tid}/activities`);
        if (data) setActivities(data);
    };

    const fetchSubtasks = async (tid) => {
        if (!tid) return;
        const data = await api.get(`/tasks/${tid}/subtasks`);
        if (data) setSubtasks(data);
    };

    const handleAddSubtask = async () => {
        if (!newSubtaskTitle.trim() || !task) return;
        try {
            await api.post('/tasks', {
                title: newSubtaskTitle,
                projectId: task.projectId,
                parentTaskId: task.id,
                status: 'Todo',
                priority: 'Medium'
            });
            setNewSubtaskTitle('');
            fetchSubtasks(task.id);
        } catch (err) {
            console.error('Failed to add subtask', err);
            showToast({ msg: 'Failed to add subtask' });
        }
    };

    useEffect(() => {
        if (task && task.id) {
            if (activeTab === 'comments') fetchComments(task.id);
            if (activeTab === 'history') fetchActivities(task.id);
            if (activeTab === 'subtasks') fetchSubtasks(task.id);
        }
    }, [activeTab, task]);

    useEffect(() => {
        if (task) {
            setTitle(task.title || '');
            setDescription(task.description || '');
            setAssigneeId(task.assigneeId || '');
            setStatus(task.status || 'Todo');
            setStatus(task.status || 'Todo');
            setPriority(task.priority || 'Medium');
            setDueDate(task.dueDate || '');
            setLabels(Array.isArray(task.labels) ? task.labels.join(', ') : '');
            setIssueType(task.issueType || 'Task');
            setIssueType(task.issueType || 'Task');
            setStoryPoints(task.storyPoints || '');
            setOriginalEstimate(task.originalEstimate || '');
            setTimeSpent(task.timeSpent || '');
        } else {
            setTitle('');
            setDescription('');
            setAssigneeId('');
            setStatus('Todo');
            setStatus('Todo');
            setPriority('Medium');
            setDueDate('');
            setLabels('');
            setIssueType('Task');
            setIssueType('Task');
            setStoryPoints('');
            setOriginalEstimate('');
            setTimeSpent('');
        }
    }, [task]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const labelArray = labels.split(',').map(l => l.trim()).filter(l => l);
            const payload = {
                title, description, projectId, assigneeId, status, priority,
                dueDate: dueDate || null,
                labels: labelArray,
                issueType,
                storyPoints: storyPoints ? parseInt(storyPoints) : null,
                originalEstimate: originalEstimate ? parseInt(originalEstimate) : 0,
                timeSpent: timeSpent ? parseInt(timeSpent) : 0
            };
            if (task && task.id) {
                await api.put(`/tasks/${task.id}`, payload);
            } else {
                await api.post('/tasks', payload);
            }
            onSave();
            onClose();
        } catch (err) {
            console.error('Task save failed', err);
            showToast({ msg: err?.data?.message || 'Failed to save task' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = () => {
        if (typeof onDelete === 'function') {
            onDelete(task);
            onClose();
        } else {
            // fallback
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex justify-center items-center p-4 animate-in fade-in duration-300">
            <div className="glass-panel w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden rounded-2xl shadow-2xl border border-gray-100/50 dark:border-slate-700/50 relative">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-200/50 dark:border-slate-700/50 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center bg-white dark:bg-slate-700 rounded-md border border-gray-200 dark:border-slate-600 p-1">
                            <select
                                value={issueType}
                                onChange={e => setIssueType(e.target.value)}
                                className="bg-transparent text-xs font-bold uppercase text-gray-700 dark:text-gray-200 outline-none cursor-pointer"
                            >
                                <option value="Task">Task</option>
                                <option value="Bug">Bug</option>
                                <option value="Story">Story</option>
                                <option value="Epic">Epic</option>
                            </select>
                            <div className="ml-1">
                                {issueType === 'Bug' && <Bug size={14} className="text-red-500" />}
                                {issueType === 'Task' && <CheckSquare size={14} className="text-blue-500" />}
                                {issueType === 'Story' && <BookOpen size={14} className="text-green-600" />}
                                {issueType === 'Epic' && <Zap size={14} className="text-purple-600" />}
                            </div>
                        </div>
                        <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2.5 py-1 rounded-lg font-mono text-xs font-bold tracking-tight">
                            {task ? `TASK-${task.id}` : 'NEW TASK'}
                        </span>
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{projectId ? `Project #${projectId}` : 'Jira Clone'}</span>
                    </div>
                    <div className="flex gap-2">
                        {task && (
                            <button onClick={handleDelete} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-colors" title="Delete">
                                <Trash2 size={20} />
                            </button>
                        )}
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 rounded-lg transition-colors" title="Close">
                            <X size={22} />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                    {/* Main Content */}
                    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                        <input
                            type="text"
                            className="text-3xl font-bold text-gray-900 dark:text-white w-full bg-transparent outline-none placeholder-gray-400 dark:placeholder-gray-600 mb-8 leading-tight"
                            placeholder="Task Summary"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />

                        {/* Tabs */}
                        <div className="flex items-center gap-8 border-b border-gray-200/60 dark:border-slate-700/60 mb-8">
                            {['details', 'subtasks', 'comments', 'history'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`pb-3 text-sm font-bold border-b-2 transition-all capitalize ${activeTab === tab ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'}`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        {activeTab === 'details' && (
                            <div className="mb-6 animate-in fade-in duration-300">
                                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider">
                                    <AlignLeft size={16} /> Description
                                </label>
                                <textarea
                                    className="w-full min-h-[250px] p-4 bg-gray-50/50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700/50 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:bg-white dark:focus:bg-slate-900 outline-none resize-none text-sm leading-relaxed text-gray-800 dark:text-gray-200 transition-all"
                                    placeholder="Add a more detailed description..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>
                        )}
                        {activeTab === 'subtasks' && (
                            <div className="animate-in fade-in duration-300">
                                <div className="space-y-3 mb-6">
                                    {subtasks.length === 0 && <div className="text-gray-400 text-sm text-center py-8 bg-gray-50/30 dark:bg-slate-800/30 rounded-xl border border-dashed border-gray-200 dark:border-slate-700">No subtasks yet. Break it down!</div>}
                                    {subtasks.map(st => (
                                        <div
                                            key={st.id}
                                            onClick={async () => {
                                                const newStatus = st.status === 'Done' ? 'Todo' : 'Done';
                                                try {
                                                    await api.put(`/tasks/${st.id}`, { status: newStatus });
                                                    fetchSubtasks(task.id);
                                                } catch (err) {
                                                    console.error('Failed to update subtask', err);
                                                    showToast({ msg: 'Failed to update subtask' });
                                                }
                                            }}
                                            className="flex items-center gap-4 p-4 bg-white dark:bg-slate-800/80 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group"
                                        >
                                            <div className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all ${st.status === 'Done' ? 'bg-green-500 border-green-500' : 'border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-700'}`}>
                                                {st.status === 'Done' && <CheckSquare size={14} className="text-white" />}
                                            </div>
                                            <span className={`text-sm flex-1 font-medium transition-colors ${st.status === 'Done' ? 'text-gray-400 line-through dark:text-gray-500' : 'text-gray-700 dark:text-gray-200'}`}>{st.title}</span>

                                            <div className="flex items-center gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                                                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${st.priority === 'High' || st.priority === 'Critical' ? 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-gray-100 text-gray-500 dark:bg-slate-700 dark:text-gray-400'}`}>{st.priority}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex gap-3">
                                    <input
                                        type="text"
                                        className="flex-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-3.5 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none shadow-sm transition-all text-gray-800 dark:text-gray-200"
                                        placeholder="What needs to be done?"
                                        value={newSubtaskTitle}
                                        onChange={e => setNewSubtaskTitle(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleAddSubtask()}
                                    />
                                    <button
                                        onClick={handleAddSubtask}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-500/30 active:scale-95"
                                    >
                                        Add
                                    </button>
                                </div>
                            </div>
                        )}
                        {activeTab === 'comments' && (
                            <div className="animate-in fade-in duration-300">
                                <div className={`bg-white dark:bg-slate-900 border transition-all duration-200 ${isCommentFocused ? 'border-blue-500 ring-4 ring-blue-500/10 rounded-xl shadow-lg p-4' : 'border-gray-200 dark:border-slate-700 rounded-[20px] p-0 hover:border-gray-300 dark:hover:border-slate-600'}`}>
                                    <div className={`flex gap-4 ${isCommentFocused ? '' : 'p-2 mb-0'}`}>
                                        {!isCommentFocused && (
                                            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xs shrink-0 ml-1 mt-1">
                                                YOU
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            {isCommentFocused && (
                                                <div className="flex items-center gap-1 mb-2 pb-2 border-b border-gray-100 dark:border-slate-800 text-gray-400">
                                                    <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded text-gray-500 dark:text-gray-400 transition-colors" title="Bold"><strong>B</strong></button>
                                                    <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded text-gray-500 dark:text-gray-400 transition-colors italic" title="Italic"><em>I</em></button>
                                                    <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded text-gray-500 dark:text-gray-400 transition-colors underline decoration-solid" title="Underline">U</button>
                                                    <div className="w-px h-4 bg-gray-200 dark:bg-slate-700 mx-1"></div>
                                                    <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded text-gray-500 dark:text-gray-400 transition-colors" title="List"><AlignLeft size={14} /></button>
                                                    <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded text-gray-500 dark:text-gray-400 transition-colors" title="Code">{'< >'}</button>
                                                </div>
                                            )}
                                            <div className="relative">
                                                <textarea
                                                    placeholder={isCommentFocused ? "Add a comment..." : "Add a comment..."}
                                                    onFocus={() => setIsCommentFocused(true)}
                                                    className={`w-full bg-transparent outline-none text-sm text-gray-800 dark:text-gray-200 placeholder-gray-500 resize-none transition-all ${isCommentFocused ? 'min-h-[120px]' : 'min-h-[40px] pt-2.5 ml-1'}`}
                                                    value={newComment}
                                                    onChange={e => {
                                                        const val = e.target.value;
                                                        setNewComment(val);

                                                        // Simple mention detection: last word starts with @
                                                        const cursorPos = e.target.selectionStart;
                                                        const textBeforeCursor = val.slice(0, cursorPos);
                                                        const words = textBeforeCursor.split(/\s/);
                                                        const lastWord = words[words.length - 1];

                                                        if (lastWord.startsWith('@')) {
                                                            const query = lastWord.slice(1).toLowerCase();
                                                            setMentionFilter(query);
                                                            setShowMentionList(true);
                                                        } else {
                                                            setShowMentionList(false);
                                                        }
                                                    }}
                                                ></textarea>

                                                {showMentionList && (
                                                    <div className="absolute left-0 bottom-full mb-2 w-64 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                                        <div className="px-3 py-2 bg-gray-50 dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 text-xs font-bold text-gray-500 uppercase">
                                                            Mention User
                                                        </div>
                                                        <div className="max-h-48 overflow-y-auto">
                                                            {users.filter(u => u.name.toLowerCase().includes(mentionFilter)).map(u => (
                                                                <button
                                                                    key={u.id}
                                                                    onClick={() => {
                                                                        const cursorPos = document.querySelector('textarea').selectionStart;
                                                                        const textBeforeCursor = newComment.slice(0, cursorPos);
                                                                        const words = textBeforeCursor.split(/\s/);
                                                                        words.pop();
                                                                        const pre = words.join(' ');
                                                                        const post = newComment.slice(cursorPos);

                                                                        const insertedStart = pre ? `${pre} @[${u.name}] ` : `@[${u.name}] `;
                                                                        setNewComment(insertedStart + post);
                                                                        setShowMentionList(false);
                                                                        document.querySelector('textarea').focus();
                                                                    }}
                                                                    className="w-full text-left px-4 py-2.5 hover:bg-blue-50 dark:hover:bg-slate-700/50 flex items-center gap-3 transition-colors"
                                                                >
                                                                    <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold">
                                                                        {u.name.charAt(0)}
                                                                    </div>
                                                                    <span className="text-sm text-gray-700 dark:text-gray-200">{u.name}</span>
                                                                </button>
                                                            ))}
                                                            {users.filter(u => u.name.toLowerCase().includes(mentionFilter)).length === 0 && (
                                                                <div className="p-3 text-center text-gray-400 text-sm italic">No users found</div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {isCommentFocused && (
                                                <div className="flex items-center justify-between mt-3 animate-in fade-in slide-in-from-top-1 duration-200">
                                                    <span className="text-xs text-gray-400 font-medium"><strong>Pro tip:</strong> press <kbd className="bg-gray-100 dark:bg-slate-800 px-1 py-0.5 rounded border border-gray-200 dark:border-slate-700 font-sans">M</kbd> to comment</span>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => setIsCommentFocused(false)}
                                                            className="px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button
                                                            onClick={async () => {
                                                                if (!newComment.trim() || !task) return;
                                                                try {
                                                                    await api.post(`/tasks/${task.id}/comments`, { content: newComment });
                                                                    setNewComment('');
                                                                    fetchComments(task.id);
                                                                    setIsCommentFocused(false);
                                                                } catch (err) { console.error(err); }
                                                            }}
                                                            className="px-4 py-2 text-sm font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all"
                                                        >
                                                            Save
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    {comments.length === 0 && <p className="text-gray-400 text-sm text-center italic">No comments yet.</p>}
                                    {comments.map(c => (
                                        <div key={c.id} className="flex gap-4 group animate-in fade-in slide-in-from-bottom-2">
                                            <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xs shrink-0 shadow-sm border border-indigo-200 dark:border-indigo-800">
                                                {c.author?.name?.substring(0, 2)?.toUpperCase() || '??'}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1.5">
                                                    <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{c.author?.name || 'Unknown'}</span>
                                                    <span className="text-xs text-gray-400">{new Date(c.createdAt).toLocaleString()}</span>
                                                </div>
                                                <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap bg-white dark:bg-slate-800/50 p-3 rounded-tr-xl rounded-br-xl rounded-bl-xl border border-gray-100 dark:border-slate-700/50 shadow-sm inline-block max-w-[90%]">
                                                    {c.content.split(/(@\[[^\]]+\])/g).map((part, i) => {
                                                        const match = part.match(/@\[([^\]]+)\]/);
                                                        if (match) {
                                                            return <span key={i} className="font-bold text-blue-600 dark:text-blue-400">@{match[1]}</span>;
                                                        }
                                                        return part;
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {activeTab === 'history' && (
                            <div className="animate-in fade-in duration-300 space-y-4">
                                {activities.length === 0 && <p className="text-gray-400 text-sm text-center italic">No history yet.</p>}
                                {activities.map((a, i) => (
                                    <div key={a.id} className="flex gap-4 items-start pl-2 relative" style={{ animationDelay: `${i * 0.05}s` }}>
                                        <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gray-100 dark:bg-slate-800 ml-[5px]"></div>
                                        <div className="w-3 h-3 rounded-full bg-blue-400 ring-4 ring-white dark:ring-slate-900 z-10 mt-1.5"></div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50/50 dark:bg-slate-800/30 p-2 rounded-lg flex-1">
                                            <span className="font-bold text-gray-900 dark:text-gray-200">{a.actor?.name || 'Someone'}</span>
                                            <span className="mx-1">{a.description}</span>
                                            <div className="text-xs text-gray-400 mt-1 font-medium">{new Date(a.createdAt).toLocaleString()}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="w-full md:w-80 bg-gray-50/80 dark:bg-slate-900/80 backdrop-blur-md border-l border-gray-200 dark:border-slate-700 p-6 overflow-y-auto section-glass">
                        <div className="space-y-8">
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 block">Status</label>
                                <div className="relative">
                                    <select
                                        className="w-full p-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm font-semibold appearance-none text-gray-700 dark:text-gray-200 hover:border-blue-400 transition-colors"
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value)}
                                    >
                                        <option value="Todo">Todo</option>
                                        <option value="In Progress">In Progress</option>
                                        <option value="Done">Done</option>
                                    </select>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400"><svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></div>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 block">Attributes</label>
                                <div className="space-y-5">
                                    <div className="flex items-center justify-between group">
                                        <div className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                                            <Flag size={16} className="text-gray-400" /> Priority
                                        </div>
                                        <select
                                            value={priority}
                                            onChange={(e) => setPriority(e.target.value)}
                                            className={`text-sm font-bold outline-none text-right cursor-pointer rounded-lg px-2 py-1 transition-colors ${priority === 'High' ? 'text-red-600 bg-red-50 dark:bg-red-900/20' :
                                                priority === 'Medium' ? 'text-orange-600 bg-orange-50 dark:bg-orange-900/20' :
                                                    'text-blue-600 bg-blue-50 dark:bg-blue-900/20'
                                                }`}
                                        >
                                            <option value="Low">Low</option>
                                            <option value="Medium">Medium</option>
                                            <option value="High">High</option>
                                            <option value="Critical">Critical</option>
                                        </select>
                                    </div>
                                    <div className="flex items-center justify-between group">
                                        <div className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                                            <Hash size={16} className="text-gray-400" /> Story Points
                                        </div>
                                        <input
                                            type="number"
                                            className="text-sm font-bold bg-gray-100 dark:bg-slate-800 border-none rounded-lg w-16 text-center py-1 outline-none focus:ring-2 focus:ring-blue-500/20 text-gray-800 dark:text-gray-200"
                                            placeholder="-"
                                            value={storyPoints}
                                            onChange={e => setStoryPoints(e.target.value)}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between group">
                                        <div className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                                            <User size={16} className="text-gray-400" /> Assignee
                                        </div>
                                        <select
                                            value={assigneeId}
                                            onChange={(e) => setAssigneeId(e.target.value)}
                                            className="bg-transparent text-sm font-medium outline-none text-right cursor-pointer hover:bg-gray-200 dark:hover:bg-slate-700/50 rounded px-2 py-1 w-40 truncate text-gray-800 dark:text-gray-200 transition-colors"
                                        >
                                            <option value="">Unassigned</option>
                                            {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                                            <User size={16} className="text-gray-400" /> Reporter
                                        </div>
                                        <span className="text-sm font-medium text-gray-800 dark:text-gray-200 px-2 py-1">
                                            {task?.reporter?.name || 'Unknown'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between pt-2 border-t border-dashed border-gray-200 dark:border-slate-700">
                                        <div className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                                            <Calendar size={16} className="text-gray-400" /> Due Date
                                        </div>
                                        <input
                                            type="date"
                                            className="text-sm bg-transparent outline-none text-right cursor-pointer font-medium text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 rounded px-2 py-1 transition-colors"
                                            value={dueDate}
                                            onChange={e => setDueDate(e.target.value)}
                                        />
                                    </div>

                                    <div className="pt-6">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Labels</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Bug, Frontend"
                                            className="w-full text-sm p-3 border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm"
                                            value={labels}
                                            onChange={e => setLabels(e.target.value)}
                                        />
                                    </div>

                                    <div className="pt-6">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Time Tracking</label>
                                        <div className="space-y-3">
                                            {originalEstimate > 0 && (
                                                <div className="mb-2">
                                                    <div className="flex justify-between text-xs mb-1 text-gray-500">
                                                        <span>Progress</span>
                                                        <span>{Math.round((parseInt(timeSpent || 0) / parseInt(originalEstimate)) * 100)}%</span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700 overflow-hidden">
                                                        <div className="bg-blue-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (parseInt(timeSpent || 0) / parseInt(originalEstimate)) * 100)}%` }}></div>
                                                    </div>
                                                </div>
                                            )}
                                            <div className="flex gap-2">
                                                <div className="flex-1">
                                                    <label className="text-[10px] uppercase font-bold text-gray-400 mb-1 block">Est. (m)</label>
                                                    <input
                                                        type="number"
                                                        placeholder="Min"
                                                        className="w-full text-sm p-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20"
                                                        value={originalEstimate}
                                                        onChange={e => setOriginalEstimate(e.target.value)}
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <label className="text-[10px] uppercase font-bold text-gray-400 mb-1 block">Spent (m)</label>
                                                    <input
                                                        type="number"
                                                        placeholder="Min"
                                                        className="w-full text-sm p-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20"
                                                        value={timeSpent}
                                                        onChange={e => setTimeSpent(e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-gray-200 dark:border-slate-700 mt-auto">
                                <button
                                    onClick={handleSubmit}
                                    disabled={isLoading}
                                    className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                                >
                                    {isLoading ? 'Saving...' : (
                                        <>
                                            <Save size={18} /> Save Changes
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default TaskModal;