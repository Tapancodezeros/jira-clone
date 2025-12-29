import React, { useEffect, useState, useCallback, useRef } from 'react';
import api from '../utils/apiClient';
import { useParams } from 'react-router-dom';
import Header from './Header';
import confetti from 'canvas-confetti';
import { Plus, Trash2, Edit2, Download, Calendar, Tag } from 'lucide-react';
import TaskModal from './TaskModal';
import TaskCard from './TaskCard';
import { useToast } from '../context/ToastContext';
import TrashModal from './TrashModal';

const TaskBoard = () => {
    const { id } = useParams();
    const [tasks, setTasks] = useState([]);
    // members will hold actual project members (from /projects/:id/members)
    const [members, setMembers] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [newMemberId, setNewMemberId] = useState('');
    const [project, setProject] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const { showToast } = useToast();
    const [isTrashOpen, setIsTrashOpen] = useState(false);
    const pendingDeletes = useRef(new Map());
    const DELETE_TIMEOUT = 5000; // ms
    const columns = ['Todo', 'In Progress', 'Done'];

    const currentUser = JSON.parse(localStorage.getItem('user') || 'null');

    const fetchTasks = useCallback(async () => {
        const data = await api.get(`/tasks/${id}`);
        if (data) setTasks(data);
    }, [id]);

    useEffect(() => {
        // avoid synchronous setState inside effect by scheduling the fetch
        const timer = setTimeout(() => { fetchTasks(); }, 0);
        return () => clearTimeout(timer);
    }, [fetchTasks]);

    // Fetch project meta and members to show team members
    useEffect(() => {
        const fetchMeta = async () => {
            try {
                const [projects, membersList, usersList] = await Promise.all([api.get('/projects'), api.get(`/projects/${id}/members`), api.get('/users')]);
                if (projects) {
                    const p = projects.find(pr => String(pr.id) === String(id));
                    if (p) setProject(p);
                }
                if (membersList) setMembers(membersList);
                if (usersList) setAllUsers(usersList);
            } catch (err) {
                console.error('Meta fetch failed', err);
            }
        };
        fetchMeta();
    }, [id]);

    const canManageMembers = () => {
        if (!project || !currentUser) return false;
        return String(project.ownerId) === String(currentUser.id) || String(project.teamLeaderId) === String(currentUser.id);
    };

    const addMember = async () => {
        if (!newMemberId) return showToast({ msg: 'Select a user to add' });
        try {
            await api.post(`/projects/${id}/members`, { userId: newMemberId });
            // refresh members
            const updated = await api.get(`/projects/${id}/members`);
            if (updated) setMembers(updated);
            setNewMemberId('');
            showToast({ msg: 'Member added' });
        } catch (err) {
            console.error('Add member failed', err);
            showToast({ msg: err?.data?.message || 'Failed to add member' });
        }
    };

    const removeMember = async (userId) => {
        try {
            await api.del(`/projects/${id}/members/${userId}`);
            setMembers(prev => prev.filter(u => String(u.id) !== String(userId)));
            showToast({ msg: 'Member removed' });
        } catch (err) {
            console.error('Remove member failed', err);
            showToast({ msg: err?.data?.message || 'Failed to remove member' });
        }
    };

    const [showMyTasks, setShowMyTasks] = useState(true);

    const handleDrop = async (e, status) => {
        const taskId = e.dataTransfer.getData("taskId");
        // Optimistic UI update
        setTasks(prev => prev.map(t => t.id == taskId ? { ...t, status } : t));
        if (status === 'Done') confetti();

        await api.put(`/tasks/${taskId}`, { status });
    };

    const exportToCSV = () => {
        if (!tasks || tasks.length === 0) return showToast({ msg: 'No tasks to export' });

        const headers = ['ID', 'Title', 'Description', 'Status', 'Priority', 'Assignee', 'Reporter', 'Created At'];
        const rows = tasks.map(t => [
            t.id,
            `"${(t.title || '').replace(/"/g, '""')}"`,
            `"${(t.description || '').replace(/"/g, '""')}"`,
            t.status,
            t.priority,
            `"${(t.assignee?.name || 'Unassigned').replace(/"/g, '""')}"`,
            `"${(t.reporter?.name || 'Unknown').replace(/"/g, '""')}"`,
            t.createdAt || ''
        ]);

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `tasks_${id}_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showToast({ msg: 'Exporting tasks...' });
    };

    return (
        <>
            <Header />
            <div className="p-6 h-[calc(100vh-80px)] overflow-hidden">
                <div className="mb-6 flex items-center justify-between glass-panel p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 animate-in fade-in slide-in-from-top-4">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30">
                            <Plus size={18} /> New Task
                        </button>
                        <div className="flex bg-gray-100 dark:bg-slate-800 p-1 rounded-xl">
                            <button onClick={() => setShowMyTasks(true)} className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${showMyTasks ? 'bg-white dark:bg-slate-700 shadow text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}>My Tasks</button>
                            <button onClick={() => setShowMyTasks(false)} className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${!showMyTasks ? 'bg-white dark:bg-slate-700 shadow text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}>All Tasks</button>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={exportToCSV} className="p-2.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition-colors" title="Export to CSV">
                            <Download size={20} />
                        </button>
                        <button onClick={() => setIsTrashOpen(true)} className="p-2.5 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Trash Bin">
                            <Trash2 size={20} />
                        </button>
                    </div>
                </div>

                <div className="flex gap-6 h-full pb-4">
                    <div className="flex-1 flex gap-6 overflow-x-auto pb-4">
                        {columns.map(col => (
                            <div
                                key={col}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => handleDrop(e, col)}
                                className="flex-1 min-w-[300px] bg-slate-50/50 dark:bg-slate-800/20 backdrop-blur-sm p-4 rounded-2xl border border-gray-200/50 dark:border-slate-800 flex flex-col h-full"
                            >
                                <div className="flex justify-between items-center mb-4 px-2">
                                    <h4 className="uppercase text-xs font-bold text-gray-400 tracking-wider flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${col === 'Todo' ? 'bg-slate-400' : col === 'In Progress' ? 'bg-blue-400' : 'bg-emerald-400'}`}></div>
                                        {col}
                                    </h4>
                                    <span className="text-xs font-semibold bg-gray-200 dark:bg-slate-700 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full">
                                        {tasks.filter(t => t.status === col).length}
                                    </span>
                                </div>

                                <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                                    {tasks
                                        .filter(t => !t.parentTaskId)
                                        .filter(t => t.status === col)
                                        .filter(t => {
                                            if (!showMyTasks) return true;
                                            return currentUser ? String(t.assigneeId) === String(currentUser.id) : true;
                                        })
                                        .map((task, idx) => (
                                            <TaskCard
                                                key={task.id}
                                                task={task}
                                                index={idx}
                                                onDragStart={(e) => e.dataTransfer.setData("taskId", task.id)}
                                                onClick={() => { setSelectedTask(task); setIsModalOpen(true); }}
                                                onEdit={() => { setSelectedTask(task); setIsModalOpen(true); }}
                                                onDelete={() => {
                                                    setTasks(prev => prev.filter(t => t.id !== task.id));
                                                    const timer = setTimeout(async () => {
                                                        try { await api.del(`/tasks/${task.id}`); } catch (err) { console.error('Delete failed', err); showToast({ msg: 'Delete failed' }); }
                                                        pendingDeletes.current.delete(task.id);
                                                    }, DELETE_TIMEOUT);
                                                    pendingDeletes.current.set(task.id, { timer, task });
                                                    showToast({
                                                        msg: 'Task deleted', actionLabel: 'Undo', onAction: async () => {
                                                            const entry = pendingDeletes.current.get(task.id);
                                                            if (!entry) return;
                                                            clearTimeout(entry.timer);
                                                            setTasks(prev => [entry.task, ...prev]);
                                                            pendingDeletes.current.delete(task.id);
                                                            try {
                                                                await api.post(`/tasks/${task.id}/restore`);
                                                                showToast({ msg: 'Delete undone', duration: 2000 });
                                                            } catch (err) {
                                                                console.error('Restore failed', err);
                                                                showToast({ msg: 'Undo failed on server', duration: 3000 });
                                                            }
                                                        }, duration: DELETE_TIMEOUT
                                                    });
                                                }}
                                            />
                                        ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <aside className="w-80 glass-panel p-5 rounded-2xl h-full border border-gray-100 dark:border-slate-800 flex flex-col shadow-sm">
                        <div className="mb-6">
                            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Project Details</h4>
                            {project ? (
                                <div className="space-y-4">
                                    <div className="p-3 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/30">
                                        <div className="text-xs text-blue-500 font-semibold uppercase mb-1">Project Name</div>
                                        <div className="font-semibold text-gray-800 dark:text-gray-100">{project.name}</div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="p-3 bg-gray-50 dark:bg-slate-800/50 rounded-xl">
                                            <div className="text-[10px] text-gray-500 uppercase font-bold mb-1">Owner</div>
                                            <div className="text-sm font-medium truncate" title={members.find(u => u.id === project.ownerId)?.name}>{members.find(u => u.id === project.ownerId)?.name || 'Owner'}</div>
                                        </div>
                                        {project.teamLeaderId && (
                                            <div className="p-3 bg-gray-50 dark:bg-slate-800/50 rounded-xl">
                                                <div className="text-[10px] text-gray-500 uppercase font-bold mb-1">Leader</div>
                                                <div className="text-sm font-medium truncate" title={members.find(u => u.id === project.teamLeaderId)?.name}>{members.find(u => u.id === project.teamLeaderId)?.name || 'Leader'}</div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-sm text-gray-500 animate-pulse">Loading project details...</div>
                            )}
                        </div>

                        <div className="flex-1 overflow-hidden flex flex-col">
                            <div className="flex justify-between items-center mb-3">
                                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Team Members</h4>
                                <span className="bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 text-xs font-bold px-2 py-0.5 rounded-full">{members.length}</span>
                            </div>

                            {canManageMembers() && (
                                <div className="mb-4 flex gap-2">
                                    <select value={newMemberId} onChange={e => setNewMemberId(e.target.value)} className="flex-1 p-2 text-sm bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20">
                                        <option value="">+ Add member...</option>
                                        {allUsers
                                            .filter(u => !members.find(m => String(m.id) === String(u.id)))
                                            .map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                    </select>
                                    <button onClick={addMember} className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">Add</button>
                                </div>
                            )}

                            <div className="flex-1 overflow-y-auto -mx-2 px-2 custom-scrollbar">
                                <ul className="space-y-2">
                                    {members.map(u => (
                                        <li key={u.id} className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg transition-colors group">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${currentUser && u.id === currentUser.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-gray-300'}`}>
                                                    {u.name?.[0]}
                                                </div>
                                                <span className={`text-sm ${currentUser && u.id === currentUser.id ? 'font-semibold text-blue-600' : 'text-gray-700 dark:text-gray-300'}`}>
                                                    {u.name}
                                                    {currentUser && u.id === currentUser.id && <span className="text-[10px] bg-blue-50 text-blue-600 px-1 rounded ml-2">You</span>}
                                                </span>
                                            </div>
                                            {canManageMembers() && String(u.id) !== String(project.ownerId) && (
                                                <button onClick={() => removeMember(u.id)} className="text-gray-300 group-hover:text-red-500 transition-colors p-1" title="Remove Member">
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
            {isTrashOpen && <TrashModal projectId={id} onClose={() => setIsTrashOpen(false)} onUpdate={fetchTasks} />}
            {isModalOpen && <TaskModal task={selectedTask} projectId={id} onClose={() => { setIsModalOpen(false); setSelectedTask(null); }} onSave={() => { fetchTasks(); setSelectedTask(null); }} onDelete={(t) => {
                setIsModalOpen(false);
                if (!t || !t.id) return;
                setTasks(prev => prev.filter(x => x.id !== t.id));
                const timer = setTimeout(async () => {
                    try { await api.del(`/tasks/${t.id}`); } catch (err) { console.error('Delete failed', err); showToast({ msg: 'Delete failed' }); }
                    pendingDeletes.current.delete(t.id);
                }, DELETE_TIMEOUT);
                pendingDeletes.current.set(t.id, { timer, task: t });
                showToast({
                    msg: 'Task deleted', actionLabel: 'Undo', onAction: async () => {
                        const entry = pendingDeletes.current.get(t.id);
                        if (!entry) return;
                        clearTimeout(entry.timer);
                        setTasks(prev => [entry.task, ...prev]);
                        pendingDeletes.current.delete(t.id);
                        try {
                            await api.post(`/tasks/${t.id}/restore`);
                            showToast({ msg: 'Delete undone', duration: 2000 });
                        } catch (err) {
                            console.error('Restore failed', err);
                            showToast({ msg: 'Undo failed on server', duration: 3000 });
                        }
                    }, duration: DELETE_TIMEOUT
                });
            }} />}
        </>
    );

};
export default TaskBoard;