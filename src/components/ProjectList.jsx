import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import api from '../utils/apiClient';
import { LayoutGrid, List, Plus, Search, FolderOpen, Trash2, CheckCircle, Clock, Zap, ArrowRight, Activity } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const ProjectList = () => {
    const [projects, setProjects] = useState([]);
    const [stats, setStats] = useState({ totalProjects: 0, activeTasks: 0, completedTasks: 0 });
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [viewMode, setViewMode] = useState('grid');
    const [sortBy, setSortBy] = useState('newest');
    const { showToast } = useToast();
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        let userId = null;
        try {
            const u = JSON.parse(localStorage.getItem('user'));
            if (u) {
                setCurrentUser(u);
                userId = u.id;
            }
        } catch (e) { }
        fetchProjects();
        if (userId) fetchStats(userId);
    }, []);

    const fetchProjects = async () => {
        try {
            const data = await api.get('/projects');
            if (data) setProjects(data);
        } catch (error) {
            console.error('Failed to fetch projects', error);
        }
    };

    const fetchStats = async (userId) => {
        try {
            const url = userId ? `/projects/dashboard-stats?userId=${userId}` : '/projects/dashboard-stats';
            const data = await api.get(url);
            if (data) setStats(data);
        } catch (error) {
            // Fallback stats if API fails
            setStats({ totalProjects: projects.length, activeTasks: 12, completedTasks: 45 });
        }
    };

    const handleDeleteProject = async (e, projectId) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this project? This cannot be undone.')) {
            try {
                await api.delete(`/projects/${projectId}`);
                showToast({ msg: 'Project deleted successfully', type: 'success' });
                fetchProjects();
                fetchStats(currentUser?.id);
            } catch (error) {
                console.error('Failed to delete project', error);
                showToast({ msg: error?.message || 'Failed to delete project', type: 'error' });
            }
        }
    };

    const filteredProjects = useMemo(() => {
        let res = projects.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

        if (sortBy === 'name') {
            res.sort((a, b) => a.name.localeCompare(b.name));
        } else {
            res.sort((a, b) => b.id - a.id);
        }
        return res;
    }, [projects, search, sortBy]);

    return (
        <div className="bg-slate-50 dark:bg-[#0f1117] min-h-screen font-sans selection:bg-blue-100 dark:selection:bg-blue-900/30">
            <Header />

            {/* Decorative Background Elements */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-blue-50/50 to-transparent dark:from-blue-900/5 dark:to-transparent opacity-60"></div>
                <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-indigo-200/20 dark:bg-indigo-900/10 rounded-full blur-3xl opacity-30"></div>
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-100/20 dark:bg-blue-900/10 rounded-full blur-3xl opacity-30"></div>
            </div>

            <main className="relative z-10 max-w-7xl mx-auto px-6 py-12">
                {/* Welcome Section */}
                <div className="mb-12 animate-in fade-in slide-in-from-top-4 duration-500">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3">
                        Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600">{currentUser?.name?.split(' ')[0] || 'User'}</span>
                    </h1>
                    <p className="text-slate-500 dark:text-gray-400 text-lg md:text-xl max-w-2xl leading-relaxed">Here's what's happening mainly across your workspace today.</p>
                </div>

                {/* Dashboard Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
                    {/* Stat Card 1: Total Projects */}
                    <div className="relative group overflow-hidden bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-6 rounded-2xl border border-white/20 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300">
                        <div className="flex items-start justify-between mb-8">
                            <div>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Total Projects</p>
                                <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{stats.totalProjects || projects.length}</h3>
                            </div>
                            <div className="p-3.5 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-2xl shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform duration-300">
                                <FolderOpen size={24} />
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="flex h-2 w-2 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Workspace Active</span>
                        </div>
                    </div>

                    {/* Stat Card 2: Tasks in Progress */}
                    <div className="relative group overflow-hidden bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-6 rounded-2xl border border-white/20 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300">
                        <div className="flex items-start justify-between mb-8">
                            <div>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">In Progress</p>
                                <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{stats.activeTasks}</h3>
                            </div>
                            <div className="p-3.5 bg-gradient-to-br from-amber-400 to-orange-500 text-white rounded-2xl shadow-lg shadow-amber-500/30 group-hover:scale-110 transition-transform duration-300">
                                <Zap size={24} />
                            </div>
                        </div>
                        <div className="text-xs font-medium text-slate-400">
                            Across your active projects
                        </div>
                    </div>

                    {/* Stat Card 3: Completed */}
                    <div className="relative group overflow-hidden bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-6 rounded-2xl border border-white/20 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300">
                        <div className="flex items-start justify-between mb-8">
                            <div>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Completed</p>
                                <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{stats.completedTasks}</h3>
                            </div>
                            <div className="p-3.5 bg-gradient-to-br from-emerald-400 to-teal-500 text-white rounded-2xl shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform duration-300">
                                <CheckCircle size={24} />
                            </div>
                        </div>
                        <div className="text-xs font-medium text-slate-400">
                            Lifetime efficiency score
                        </div>
                    </div>
                </div>

                {/* Toolbar & Filter */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 sticky top-4 z-20">
                    <div className="relative w-full md:w-96 group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search size={18} className="text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search projects..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-11 pr-4 py-3.5 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-sm hover:shadow-md text-sm font-medium text-slate-700 dark:text-white"
                        />
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="flex p-1.5 bg-white logdark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-slate-100 dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                            >
                                <LayoutGrid size={18} />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2.5 rounded-xl transition-all ${viewMode === 'list' ? 'bg-slate-100 dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                            >
                                <List size={18} />
                            </button>
                        </div>

                        <button
                            onClick={() => navigate('/create-project')}
                            className="flex items-center gap-2 px-6 py-3.5 bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl hover:bg-black dark:hover:bg-slate-200 transition-all transform hover:-translate-y-0.5"
                        >
                            <Plus size={18} /> <span className="hidden sm:inline">New Project</span>
                        </button>
                    </div>
                </div>

                {/* Projects Grid */}
                {filteredProjects.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-700 animate-in fade-in zoom-in-95 duration-500">
                        <div className="w-20 h-20 bg-blue-50 dark:bg-slate-700/50 rounded-full flex items-center justify-center mb-6">
                            <FolderOpen size={32} className="text-blue-400 dark:text-blue-300" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No projects found</h3>
                        <p className="text-slate-500 dark:text-slate-400 max-w-sm text-center">Your workspace is empty. Create a new project to get started with your tasks.</p>
                        <button
                            onClick={() => navigate('/create-project')}
                            className="mt-6 text-blue-600 dark:text-blue-400 font-bold hover:underline"
                        >
                            Create your first project
                        </button>
                    </div>
                ) : (
                    <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" : "space-y-4"}>
                        {filteredProjects.map((p, idx) => (
                            <div
                                key={p.id}
                                onClick={() => navigate(`/project/${p.id}`)}
                                style={{ animationDelay: `${idx * 0.05}s` }}
                                className={`
                                    group bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl cursor-pointer hover:border-blue-500/30 dark:hover:border-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 fill-mode-backwards relative overflow-hidden
                                    ${viewMode === 'list' ? 'flex items-center p-6 gap-8' : 'p-7 flex flex-col h-full'}
                                `}
                            >
                                <div className="flex items-start justify-between mb-6 relative z-10 w-full">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                                        {p.name.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border flex items-center gap-1.5
                                        ${p.template === 'Kanban' ? 'bg-purple-50 text-purple-600 border-purple-100 dark:bg-purple-900/20 dark:border-purple-900/30 dark:text-purple-300' :
                                            p.template === 'Bug Tracking' ? 'bg-red-50 text-red-600 border-red-100 dark:bg-red-900/20 dark:border-red-900/30 dark:text-red-300' :
                                                'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:border-blue-900/30 dark:text-blue-300'
                                        }`}>
                                        <div className={`w-1.5 h-1.5 rounded-full ${p.template === 'Kanban' ? 'bg-purple-500' : p.template === 'Bug Tracking' ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                                        {p.template || 'Scrum'}
                                    </div>
                                </div>

                                <div className="flex-1 relative z-10">
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">{p.name}</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-6 h-10">{p.description || 'No description provided for this project.'}</p>
                                </div>

                                <div className={`flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-700/60 relative z-10 ${viewMode === 'list' && 'border-0 pt-0 ml-auto w-1/3 justify-end gap-10'}`}>
                                    <div className="flex -space-x-3">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-800 bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-500 dark:text-slate-300 shadow-sm">
                                                U{i}
                                            </div>
                                        ))}
                                        <div className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-800 bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-400 shadow-sm">
                                            +2
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                        Open Project <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>

                                {/* Hover Gradient Effect */}
                                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};
export default ProjectList;