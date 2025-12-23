import React, { useEffect, useState, useCallback, useRef } from 'react';
import api from '../utils/apiClient';
import { useParams } from 'react-router-dom';
import Header from './Header';
import confetti from 'canvas-confetti';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import TaskModal from './TaskModal';
import { useToast } from '../context/ToastContext';

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

    return (
        <>
            <Header />
            <div className="p-5">
                <div className="mb-5 flex items-center gap-3">
                    <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded">
                        <Plus size={16} /> Add Task
                    </button>
                    <div className="ml-2 inline-flex items-center border rounded">
                        <button onClick={() => setShowMyTasks(true)} className={`px-3 py-1 ${showMyTasks ? 'bg-blue-600 text-white' : 'text-gray-700'}`}>My Tasks</button>
                        <button onClick={() => setShowMyTasks(false)} className={`px-3 py-1 ${!showMyTasks ? 'bg-blue-600 text-white' : 'text-gray-700'}`}>All Tasks</button>
                    </div>
                </div>

                <div className="flex gap-5 h-[80vh]">
                    <div className="flex-1 flex gap-5">
                        {columns.map(col => (
                            <div 
                                key={col} 
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => handleDrop(e, col)}
                                className="flex-1 bg-gray-100 p-3 rounded"
                            >
                                <h4 className="uppercase text-sm text-gray-500">{col}</h4>
                                {tasks
                                    .filter(t => t.status === col)
                                    // show only tasks assigned to the logged in user
                                    .filter(t => {
                                        if (!showMyTasks) return true;
                                        return currentUser ? String(t.assigneeId) === String(currentUser.id) : true;
                                    })
                                    .map(task => (
                                    <div 
                                        key={task.id} 
                                        draggable 
                                        onDragStart={(e) => e.dataTransfer.setData("taskId", task.id)}
                                        onDoubleClick={() => { setSelectedTask(task); setIsModalOpen(true); }}
                                        className="bg-white p-3 my-2 rounded shadow cursor-grab relative"
                                    >
                                        <button onClick={(ev) => {
                                            ev.stopPropagation();
                                            // schedule deletion with undo
                                            setTasks(prev => prev.filter(t => t.id !== task.id));
                                            const timer = setTimeout(async () => {
                                                try { await api.del(`/tasks/${task.id}`); } catch (err) { console.error('Delete failed', err); showToast({ msg: 'Delete failed' }); }
                                                pendingDeletes.current.delete(task.id);
                                            }, DELETE_TIMEOUT);
                                            pendingDeletes.current.set(task.id, { timer, task });
                                            showToast({ msg: 'Task deleted', actionLabel: 'Undo', onAction: async () => {
                                                const entry = pendingDeletes.current.get(task.id);
                                                if (!entry) return;
                                                clearTimeout(entry.timer);
                                                // restore locally
                                                setTasks(prev => [entry.task, ...prev]);
                                                pendingDeletes.current.delete(task.id);
                                                // try to restore on server as well (in case delete already executed)
                                                try {
                                                    await api.post(`/tasks/${task.id}/restore`);
                                                    showToast({ msg: 'Delete undone', duration: 2000 });
                                                } catch (err) {
                                                    // still show undone locally; inform user if server restore failed
                                                    console.error('Restore failed', err);
                                                    showToast({ msg: 'Undo failed on server', duration: 3000 });
                                                }
                                            }, duration: DELETE_TIMEOUT });
                                        }} className="absolute top-2 right-2 text-red-500">
                                            <Trash2 size={14} />
                                        </button>
                                        <strong>{task.title}</strong>
                                        <div className="mt-2">
                                            <button onClick={(ev) => { ev.stopPropagation(); setSelectedTask(task); setIsModalOpen(true); }} className="text-xs text-blue-600 inline-flex items-center gap-1">
                                                <Edit2 size={14} /> Edit
                                            </button>
                                        </div>
                                        <p className="text-xs text-gray-600">{task.priority}</p>
                                        <div className="text-xs text-blue-600 mt-1">
                                            {task.assignee?.name || 'Unassigned'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>

                    <aside className="w-64 bg-white p-4 rounded shadow">
                        <h4 className="text-lg font-semibold mb-2">Team Members</h4>
                        {project ? (
                            <div className="mb-3">
                                <div className="text-sm text-gray-600">Project: <span className="font-medium">{project.name}</span></div>
                                <div className="mt-2">
                                    <div className="text-xs text-gray-500">Owner</div>
                                    <div className="font-medium">{members.find(u => u.id === project.ownerId)?.name || 'Owner'}</div>
                                </div>
                                {project.teamLeaderId && (
                                    <div className="mt-2">
                                        <div className="text-xs text-gray-500">Team Leader</div>
                                        <div className="font-medium">{members.find(u => u.id === project.teamLeaderId)?.name || 'Team Leader'}</div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-sm text-gray-500">Loading project...</div>
                        )}

                        <div>
                            <div className="text-xs text-gray-500">Project Members</div>
                            {canManageMembers() && (
                                <div className="mt-2 flex gap-2">
                                    <select value={newMemberId} onChange={e => setNewMemberId(e.target.value)} className="flex-1 p-2 border rounded">
                                        <option value="">Add member...</option>
                                        {allUsers
                                            .filter(u => !members.find(m => String(m.id) === String(u.id)))
                                            .map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                    </select>
                                    <button onClick={addMember} className="px-3 py-2 bg-green-600 text-white rounded">Add</button>
                                </div>
                            )}

                            <ul className="mt-2 space-y-1">
                                {members.map(u => (
                                    <li key={u.id} className="flex items-center justify-between text-sm">
                                        <span className={`${currentUser && u.id === currentUser.id ? 'font-semibold text-blue-600' : 'text-gray-700'}`}>{u.name}</span>
                                        {canManageMembers() && String(u.id) !== String(project.ownerId) && (
                                            <button onClick={() => removeMember(u.id)} className="text-red-500 text-xs">Remove</button>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </aside>
                </div>
            </div>
            {isModalOpen && <TaskModal task={selectedTask} projectId={id} onClose={() => { setIsModalOpen(false); setSelectedTask(null); }} onSave={() => { fetchTasks(); setSelectedTask(null); }} onDelete={(t) => {
                // handle delete from modal with same undo flow
                setIsModalOpen(false);
                if (!t || !t.id) return;
                setTasks(prev => prev.filter(x => x.id !== t.id));
                const timer = setTimeout(async () => {
                    try { await api.del(`/tasks/${t.id}`); } catch (err) { console.error('Delete failed', err); showToast({ msg: 'Delete failed' }); }
                    pendingDeletes.current.delete(t.id);
                }, DELETE_TIMEOUT);
                pendingDeletes.current.set(t.id, { timer, task: t });
                showToast({ msg: 'Task deleted', actionLabel: 'Undo', onAction: async () => {
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
                }, duration: DELETE_TIMEOUT });
            }} />}
        </>
    );
};
export default TaskBoard;