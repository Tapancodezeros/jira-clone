import React, { useEffect, useState, useCallback, useRef } from 'react';
import api from '../utils/apiClient';
import { useParams } from 'react-router-dom';
import Header from './Header';
import confetti from 'canvas-confetti';
import { Plus, Trash2, Download } from 'lucide-react';
import TaskModal from './TaskModal';
import TaskCard from './TaskCard';
import { useToast } from '../context/ToastContext';
import TrashModal from './TrashModal';
import Backlog from './Backlog';
import ProjectSidebar from './ProjectSidebar';
import ProjectSettings from './ProjectSettings';
import Reports from './Reports';
import Releases from './Releases';
import Roadmap from './Roadmap';

const TaskBoard = () => {
    const { id } = useParams();
    const [tasks, setTasks] = useState([]);
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

    const [showMyTasks, setShowMyTasks] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('');
    const [assigneeFilter, setAssigneeFilter] = useState('');

    const fetchTasks = useCallback(async () => {
        const queryParams = new URLSearchParams();
        if (searchQuery) queryParams.append('search', searchQuery);
        if (statusFilter) queryParams.append('status', statusFilter);
        if (priorityFilter) queryParams.append('priority', priorityFilter);
        if (assigneeFilter) queryParams.append('assigneeId', assigneeFilter);

        const data = await api.get(`/tasks/project/${id}?${queryParams.toString()}`);
        if (data) setTasks(data);
    }, [id, searchQuery, statusFilter, priorityFilter, assigneeFilter]);

    // Use a separate useEffect to debounce the search if needed or just fetch on filter change
    useEffect(() => {
        const timer = setTimeout(() => { fetchTasks(); }, 300); // 300ms debounce
        return () => clearTimeout(timer);
    }, [fetchTasks]);

    useEffect(() => {
        const fetchProject = async () => {
            try {
                // Optimized: Fetch single project data directly
                const data = await api.get(`/projects/${id}`);
                setProject(data);
            } catch (err) {
                console.error('Failed to fetch project details', err);
            }
        };

        const fetchMembers = async () => {
            try {
                // Fetch members in parallel
                const data = await api.get(`/projects/${id}/members`);
                setMembers(data || []);
            } catch (err) {
                console.error('Failed to fetch members', err);
            }
        };

        const fetchUsers = async () => {
            try {
                // Fetch all users separately (non-blocking for project details)
                const data = await api.get('/users');
                setAllUsers(data || []);
            } catch (err) {
                console.error('Failed to fetch users', err);
            }
        };

        fetchProject();
        fetchMembers();
        fetchUsers();
    }, [id]);

    const canManageMembers = () => {
        if (!project || !currentUser) return false;
        return String(project.ownerId) === String(currentUser.id) || String(project.teamLeaderId) === String(currentUser.id);
    };

    const addMember = async () => {
        if (!newMemberId) return showToast({ msg: 'Select a user to add' });
        if (members.length >= 8) {
            return showToast({ msg: 'Project cannot have more than 8 members.', type: 'error' });
        }
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

    const [currentView, setCurrentView] = useState('board');

    // ... logic ...

    return (
        <div className="flex flex-col h-screen bg-slate-50 dark:bg-dark-bg transition-colors duration-300">
            <Header />
            <div className="flex flex-1 overflow-hidden">
                {/* Left Sidebar Navigation */}
                <ProjectSidebar
                    project={project}
                    currentView={currentView}
                    onViewChange={setCurrentView}
                />

                {/* Main Content Area */}
                <main className="flex-1 overflow-hidden relative flex flex-col">
                    {/* View: ROADMAP */}
                    {currentView === 'roadmap' && (
                        <Roadmap
                            tasks={tasks}
                            project={project}
                            onCreateEpic={() => { setSelectedTask({ issueType: 'Epic', projectId: id }); setIsModalOpen(true); }}
                            onCreateTask={(preset) => { setSelectedTask({ projectId: id, ...preset }); setIsModalOpen(true); }}
                        />
                    )}

                    {/* View: BOARD */}
                    {currentView === 'board' && (
                        <div className="flex-1 flex flex-col overflow-hidden">
                            {/* Filters Bar & Actions */}
                            <div className="px-6 py-4 flex flex-wrap gap-4 items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm z-10">
                                <div className="flex items-center gap-4 flex-1">
                                    <div className="relative min-w-[200px] max-w-sm">
                                        <input
                                            type="text"
                                            placeholder="Search this board..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                        />
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                                        </div>
                                    </div>

                                    {/* Avatar Group Filter */}
                                    <div className="flex items-center -space-x-2">
                                        {members.slice(0, 5).map(m => (
                                            <button
                                                key={m.id}
                                                onClick={() => setAssigneeFilter(assigneeFilter === m.id ? '' : m.id)}
                                                className={`w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center text-xs font-bold transition-transform hover:scale-110 hover:z-10 ${assigneeFilter === m.id ? 'ring-2 ring-blue-500 z-10' : ''} ${currentUser && m.id === currentUser.id ? 'bg-blue-100 text-blue-600' : 'bg-slate-200 text-slate-600'}`}
                                                title={m.name}
                                            >
                                                {m.name[0]}
                                            </button>
                                        ))}
                                        {members.length > 5 && (
                                            <div className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 bg-slate-100 text-slate-500 flex items-center justify-center text-[10px] font-bold">
                                                +{members.length - 5}
                                            </div>
                                        )}
                                    </div>

                                    <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-2"></div>

                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="p-2 text-sm bg-transparent font-medium text-slate-600 dark:text-slate-400 border-none outline-none cursor-pointer hover:text-blue-600 transition-colors"
                                    >
                                        <option value="">All Statuses</option>
                                        {columns.map(col => <option key={col} value={col}>{col}</option>)}
                                    </select>
                                </div>

                                <div className="flex items-center gap-3">
                                    <button onClick={() => setShowMyTasks(!showMyTasks)} className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${showMyTasks ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'}`}>
                                        Only My Issues
                                    </button>
                                    <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30">
                                        <Plus size={18} /> New Issue
                                    </button>
                                </div>
                            </div>

                            {/* Board Columns */}
                            <div className="flex-1 overflow-x-auto overflow-y-hidden p-6">
                                <div className="flex gap-6 h-full">
                                    {columns.map(col => (
                                        <div
                                            key={col}
                                            onDragOver={(e) => e.preventDefault()}
                                            onDrop={(e) => handleDrop(e, col)}
                                            className="flex-1 min-w-[320px] max-w-sm flex flex-col h-full bg-slate-100/50 dark:bg-black/20 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 backdrop-blur-md"
                                        >
                                            {/* Column Header */}
                                            <div className="p-4 flex justify-between items-center bg-white/40 dark:bg-slate-800/40 rounded-t-2xl border-b border-slate-200/50 dark:border-slate-800/50">
                                                <h4 className="uppercase text-xs font-extrabold text-slate-500 dark:text-slate-400 tracking-wider flex items-center gap-2">
                                                    <span className={`w-2 h-2 rounded-full ${col === 'Todo' ? 'bg-slate-400' : col === 'In Progress' ? 'bg-blue-500' : 'bg-green-500'}`}></span>
                                                    {col}
                                                </h4>
                                                <span className="text-xs font-bold bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-lg border border-slate-100 dark:border-slate-600 shadow-sm">
                                                    {tasks.filter(t => t.status === col).length}
                                                </span>
                                            </div>

                                            {/* Tasks List */}
                                            <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                                                {tasks
                                                    .filter(t => !t.parentTaskId) // Top level only
                                                    .filter(t => t.status === col)
                                                    .filter(t => {
                                                        if (searchQuery && !t.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
                                                        if (priorityFilter && t.priority !== priorityFilter) return false;
                                                        if (assigneeFilter && t.assigneeId != assigneeFilter) return false;
                                                        if (showMyTasks && currentUser && String(t.assigneeId) !== String(currentUser.id)) return false;
                                                        return true;
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
                                                                // ... (Delete logic)
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

                                            {/* Quick Add Button (Bottom of Column) */}
                                            <button
                                                onClick={() => { setSelectedTask({ status: col, projectId: id }); setIsModalOpen(true); }}
                                                className="m-3 p-2 flex items-center justify-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 hover:bg-white dark:hover:bg-slate-700/50 rounded-xl transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700 border-dashed"
                                            >
                                                <Plus size={16} /> Create
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* View: BACKLOG */}
                    {currentView === 'backlog' && (
                        <Backlog
                            tasks={tasks}
                            project={project}
                            currentUserId={currentUser?.id}
                            onEditTask={(t) => { setSelectedTask(t); setIsModalOpen(true); }}
                            onRefresh={fetchTasks}
                        />
                    )}

                    {/* View: REPORTS */}
                    {currentView === 'reports' && (
                        <Reports
                            tasks={tasks}
                            members={members}
                        />
                    )}

                    {/* View: RELEASES */}
                    {currentView === 'releases' && (
                        <Releases
                            projectId={id}
                            tasks={tasks}
                            onRefresh={fetchTasks}
                        />
                    )}

                    {/* View: SETTINGS */}
                    {currentView === 'settings' && (
                        <ProjectSettings
                            project={project}
                            members={members}
                            allUsers={allUsers}
                            currentUserId={currentUser?.id}
                            onAddMember={async (id) => {
                                setNewMemberId(id);
                                // A hack to reuse existing addMember logic which depends on state 'newMemberId'
                                // We need to update state then trigger. But state update is async.
                                // Instead, let's just copy logic or call api directly here if possible, 
                                // OR better: update addMember to accept an ID arg.
                                try {
                                    await api.post(`/projects/${project.id}/members`, { userId: id });
                                    const updated = await api.get(`/projects/${project.id}/members`);
                                    if (updated) setMembers(updated);
                                    showToast({ msg: 'Member added' });
                                } catch (err) {
                                    showToast({ msg: err?.data?.message || 'Failed to add member' });
                                }
                            }}
                            onRemoveMember={removeMember}
                        />
                    )}
                </main>

                {/* Right Sidebar - Project Info (Collapsible or persistent?) - Kept Persistent for now in BOARD view only or both? */}
                {/* For layout cleanliness, let's keep details in settings or a toggle. For now, I will omit the right sidebar to focus on the Jira-like main board feeling, as ProjectSidebar covers navigation. The "Members" part can be moved to a modal or settings page in future. */}
                {/* But wait, member management is important. I'll add a "Team" button in the Top Header Filter Bar to Manage Team. */}

            </div>

            {/* Modals */}
            {isTrashOpen && <TrashModal projectId={id} onClose={() => setIsTrashOpen(false)} onUpdate={fetchTasks} />}
            {isModalOpen && (
                <TaskModal
                    task={selectedTask}
                    projectId={id}
                    onClose={() => { setIsModalOpen(false); setSelectedTask(null); }}
                    onSave={() => { fetchTasks(); setSelectedTask(null); }}
                    onDelete={(t) => {
                        setIsModalOpen(false);
                        if (!t || !t.id) return;
                        setTasks(prev => prev.filter(x => x.id !== t.id));
                        // ... Same delete logic ...
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
                    }}
                />
            )}
        </div>
    );

};
export default TaskBoard;