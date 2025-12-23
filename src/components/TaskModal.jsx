import React, { useState, useEffect } from 'react';
import api from '../utils/apiClient';
import { useToast } from '../context/ToastContext';
const TaskModal = ({ task, projectId, onClose, onSave, onDelete }) => {
    const [title, setTitle] = useState('');
    const [assigneeId, setAssigneeId] = useState('');
    const [status, setStatus] = useState('Todo');
    const [priority, setPriority] = useState('Medium');
    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const fetchUsers = async () => {
            const data = await api.get('/users');
            if (data) setUsers(data);
        };
        fetchUsers();
    }, []);

    useEffect(() => {
        if (task) {
            setTitle(task.title || '');
            setAssigneeId(task.assigneeId || '');
            setStatus(task.status || 'Todo');
            setPriority(task.priority || 'Medium');
        } else {
            setTitle('');
            setAssigneeId('');
            setStatus('Todo');
            setPriority('Medium');
        }
    }, [task]);

    // Use parent-provided onDelete to integrate with global undo flow
    const { showToast } = useToast();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (task && task.id) {
                await api.put(`/tasks/${task.id}`, { title, assigneeId, status, priority });
            } else {
                await api.post('/tasks', { title, projectId, assigneeId, status, priority });
            }
            onSave();
            onClose();
        } catch (err) {
            console.error('Task save failed', err);
            const message = err?.data?.message || err.message || 'Failed to save task';
            showToast({ msg: message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-5 rounded w-[320px]">
                <h3 className="text-lg font-semibold mb-3">{task ? 'Edit Task' : 'New Task'}</h3>
                <form onSubmit={handleSubmit}>
                    <input type="text" placeholder="Task Title" value={title} onChange={e=>setTitle(e.target.value)} required className="w-full mb-3 p-2 border rounded" />
                    <select value={assigneeId} onChange={e=>setAssigneeId(e.target.value)} className="w-full mb-3 p-2 border rounded">
                        <option value="">Assignee</option>
                        {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>

                    <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-2">
                            <button type="submit" disabled={loading} className={`px-3 py-2 rounded text-white ${loading ? 'bg-blue-300' : 'bg-blue-600'}`}>
                                {loading ? 'Saving...' : (task ? 'Save' : 'Create')}
                            </button>
                            <button type="button" onClick={() => { onClose(); }} className="px-3 py-2 rounded border">
                                Cancel
                            </button>
                        </div>
                        {task && (
                            <button type="button" className="text-sm text-red-600" onClick={() => {
                                // delegate deletion to parent to enable undo — no confirm, undo will be available
                                if (typeof onDelete === 'function') {
                                    onDelete(task);
                                    onClose();
                                } else {
                                    // fallback direct delete (rare)
                                    (async () => {
                                        setLoading(true);
                                        try { await api.del(`/tasks/${task.id}`); onSave(); onClose(); } catch (err) { console.error(err); } finally { setLoading(false); }
                                    })();
                                }
                            }}>Delete</button>
                        )}
                    </div>
                </form>
                {/* deletion handled above inside form actions */}
            </div>
        </div>
    );
};
export default TaskModal;