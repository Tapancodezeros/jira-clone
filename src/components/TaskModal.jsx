import React, { useState, useEffect } from 'react';
import api from '../utils/apiClient';
import { useToast } from '../context/ToastContext';
import { X, Save, Trash2, User, Flag, CheckCircle, AlignLeft, Calendar, CheckSquare } from 'lucide-react';

const TaskModal = ({ task, projectId, onClose, onSave, onDelete }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [assigneeId, setAssigneeId] = useState('');
    const [status, setStatus] = useState('Todo');
    const [priority, setPriority] = useState('Medium');
    const [dueDate, setDueDate] = useState('');
    const [labels, setLabels] = useState(''); // comma separated string for simple input
    const [isLoading, setIsLoading] = useState(false);
    const [users, setUsers] = useState([]);
    const [comments, setComments] = useState([]);
    const [activities, setActivities] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [subtasks, setSubtasks] = useState([]);
    const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

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
        } else {
            setTitle('');
            setDescription('');
            setAssigneeId('');
            setStatus('Todo');
            setStatus('Todo');
            setPriority('Medium');
            setDueDate('');
            setLabels('');
        }
    }, [task]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const labelArray = labels.split(',').map(l => l.trim()).filter(l => l);
            const payload = { title, description, projectId, assigneeId, status, priority, dueDate: dueDate || null, labels: labelArray };
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b bg-gray-50">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-mono text-xs font-bold">
                            {task ? `TASK-${task.id}` : 'NEW TASK'}
                        </span>
                        <span>{projectId ? `Project #${projectId}` : 'Jira Clone'}</span>
                    </div>
                    <div className="flex gap-2">
                        {task && (
                            <button onClick={handleDelete} className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded transition-colors" title="Delete">
                                <Trash2 size={18} />
                            </button>
                        )}
                        <button onClick={onClose} className="p-2 hover:bg-gray-200 text-gray-500 rounded transition-colors" title="Close">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                    {/* Main Content */}
                    <div className="flex-1 overflow-y-auto p-6 md:p-8">
                        <input
                            type="text"
                            className="text-2xl font-bold text-gray-900 w-full bg-transparent outline-none placeholder-gray-400 mb-6"
                            placeholder="Task Summary"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />

                        {/* Tabs */}
                        <div className="flex items-center gap-6 border-b mb-6 border-gray-100">
                            <button onClick={() => setActiveTab('details')} className={`pb-3 text-sm font-semibold border-b-2 transition-all ${activeTab === 'details' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Details</button>
                            <button onClick={() => setActiveTab('subtasks')} className={`pb-3 text-sm font-semibold border-b-2 transition-all ${activeTab === 'subtasks' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Subtasks</button>
                            <button onClick={() => setActiveTab('comments')} className={`pb-3 text-sm font-semibold border-b-2 transition-all ${activeTab === 'comments' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Comments</button>
                            <button onClick={() => setActiveTab('history')} className={`pb-3 text-sm font-semibold border-b-2 transition-all ${activeTab === 'history' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>History</button>
                        </div>

                        {activeTab === 'details' && (
                            <div className="mb-6 animate-in fade-in duration-200">
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                    <AlignLeft size={16} /> Description
                                </label>
                                <textarea
                                    className="w-full min-h-[200px] p-4 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none text-sm leading-relaxed"
                                    placeholder="Add a more detailed description..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>
                        )}
                        {activeTab === 'subtasks' && (
                            <div className="animate-in fade-in duration-200">
                                <div className="space-y-3 mb-6">
                                    {subtasks.length === 0 && <p className="text-gray-500 text-sm italic py-2">No subtasks yet</p>}
                                    {subtasks.map(st => (
                                        <div key={st.id} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 shadow-sm hover:border-blue-300 transition-all">
                                            <div className={`w-5 h-5 rounded flex items-center justify-center border ${st.status === 'Done' ? 'bg-green-500 border-green-500' : 'border-gray-300 bg-gray-50'}`}>
                                                {st.status === 'Done' && <CheckSquare size={12} className="text-white" />}
                                            </div>
                                            <span className={`text-sm flex-1 ${st.status === 'Done' ? 'text-gray-400 line-through' : 'text-gray-700 font-medium'}`}>{st.title}</span>

                                            <div className="flex items-center gap-2">
                                                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${st.priority === 'High' || st.priority === 'Critical' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-gray-100 text-gray-500 border border-gray-200'}`}>{st.priority}</span>
                                                <span className="text-xs text-gray-500 bg-gray-50 px-2 py-0.5 rounded border border-gray-200">{st.status}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        className="flex-1 bg-white border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                                        placeholder="What needs to be done?"
                                        value={newSubtaskTitle}
                                        onChange={e => setNewSubtaskTitle(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleAddSubtask()}
                                    />
                                    <button
                                        onClick={handleAddSubtask}
                                        className="bg-blue-600 text-white hover:bg-blue-700 px-5 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm"
                                    >
                                        Add Subtask
                                    </button>
                                </div>
                            </div>
                        )}
                        {activeTab === 'comments' && (
                            <div className="animate-in fade-in duration-200">
                                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                    <div className="flex gap-3">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs shrink-0">YOU</div>
                                        <div className="flex-1">
                                            <textarea
                                                placeholder="Add a comment..."
                                                className="w-full bg-white border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none min-h-[80px]"
                                                value={newComment}
                                                onChange={e => setNewComment(e.target.value)}
                                            ></textarea>
                                            <div className="flex justify-end mt-2 gap-2">
                                                <button onClick={async () => {
                                                    if (!newComment.trim() || !task) return;
                                                    try {
                                                        await api.post(`/tasks/${task.id}/comments`, { content: newComment });
                                                        setNewComment('');
                                                        fetchComments(task.id);
                                                    } catch (err) { console.error(err); }
                                                }} className="px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded hover:bg-blue-700">Save</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    {comments.length === 0 && <p className="text-gray-500 text-sm text-center">No comments yet</p>}
                                    {comments.map(c => (
                                        <div key={c.id} className="flex gap-3 group">
                                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs shrink-0">
                                                {c.author?.name?.substring(0, 2)?.toUpperCase() || '??'}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-sm font-semibold text-gray-900">{c.author?.name || 'Unknown'}</span>
                                                    <span className="text-xs text-gray-500">{new Date(c.createdAt).toLocaleString()}</span>
                                                </div>
                                                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{c.content}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {activeTab === 'history' && (
                            <div className="animate-in fade-in duration-200 space-y-4">
                                {activities.length === 0 && <p className="text-gray-500 text-sm text-center">No history yet</p>}
                                {activities.map(a => (
                                    <div key={a.id} className="flex gap-3 items-start border-l-2 border-gray-200 pl-4 py-1">
                                        <div className="text-sm text-gray-600">
                                            <span className="font-semibold text-gray-900">{a.actor?.name || 'Someone'}</span>
                                            <span className="mx-1">{a.description}</span>
                                            <div className="text-xs text-gray-400 mt-0.5">{new Date(a.createdAt).toLocaleString()}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="w-full md:w-80 bg-gray-50 border-l p-6 overflow-y-auto">
                        <div className="space-y-6">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Status</label>
                                <select
                                    className="w-full p-2 bg-white border border-gray-200 rounded-md text-sm outline-none focus:border-blue-500 shadow-sm font-medium"
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                >
                                    <option value="Todo">Todo</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Done">Done</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Details</label>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Flag size={14} /> Priority
                                        </div>
                                        <select
                                            value={priority}
                                            onChange={(e) => setPriority(e.target.value)}
                                            className="bg-transparent text-sm font-medium outline-none text-right cursor-pointer hover:bg-gray-200 rounded px-1"
                                        >
                                            <option value="Low">Low</option>
                                            <option value="Medium">Medium</option>
                                            <option value="High">High</option>
                                            <option value="Critical">Critical</option>
                                        </select>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <User size={14} /> Assignee
                                        </div>
                                        <select
                                            value={assigneeId}
                                            onChange={(e) => setAssigneeId(e.target.value)}
                                            className="bg-transparent text-sm font-medium outline-none text-right cursor-pointer hover:bg-gray-200 rounded px-1 w-32 truncate"
                                        >
                                            <option value="">Unassigned</option>
                                            {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <User size={14} /> Reporter
                                        </div>
                                        <span className="text-sm font-medium text-gray-800">
                                            {task?.reporter?.name || 'Unknown'}
                                        </span>
                                    </div>
                                    {/* Mock Dates */}
                                    <div className="flex items-center justify-between pt-2">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Calendar size={14} /> Created
                                        </div>
                                        <span className="text-sm text-gray-800">
                                            {task?.createdAt ? new Date(task.createdAt).toLocaleDateString() : 'Today'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Calendar size={14} /> Due Date
                                        </div>
                                        <input
                                            type="date"
                                            className="text-sm bg-transparent outline-none text-right cursor-pointer"
                                            value={dueDate}
                                            onChange={e => setDueDate(e.target.value)}
                                        />
                                    </div>

                                    <div className="pt-4">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Labels</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Bug, Frontend"
                                            className="w-full text-sm p-2 border rounded"
                                            value={labels}
                                            onChange={e => setLabels(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 border-t">
                                <button
                                    onClick={handleSubmit}
                                    disabled={isLoading}
                                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg flex items-center justify-center gap-2 transition-all shadow-sm"
                                >
                                    {isLoading ? 'Saving...' : (
                                        <>
                                            <Save size={16} /> Save Changes
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