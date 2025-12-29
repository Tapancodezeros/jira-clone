import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import api from '../utils/apiClient';
import { LayoutGrid, List, Plus, Search, FolderOpen, Trash2, CheckCircle, Clock } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const ProjectList = () => {
    const [projects, setProjects] = useState([]);
    const [stats, setStats] = useState({ totalProjects: 0, activeTasks: 0, completedTasks: 0 });
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [viewMode, setViewMode] = useState('grid');
    const [sortBy, setSortBy] = useState('newest');
    const { showToast } = useToast();

    const fetchProjects = async () => {
        try {
            const data = await api.get('/projects');
            if (data) setProjects(data);
        } catch (error) {
            console.error('Failed to fetch projects', error);
        }
    };

    const fetchStats = async () => {
        try {
            const data = await api.get('/projects/dashboard-stats');
            if (data) setStats(data);
        } catch (error) {
            console.error('Failed to fetch stats', error);
        }
    };

    useEffect(() => {
        fetchProjects();
        fetchStats();
    }, []);

    const handleDeleteProject = async (e, projectId) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this project? This cannot be undone.')) {
            try {
                await api.delete(`/projects/${projectId}`);
                showToast({ msg: 'Project deleted successfully', type: 'success' });
                fetchProjects();
                fetchStats();
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
        <>
            <Header />
            <div className="p-8 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">Projects</h2>
                        <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">Manage your team's ongoing work efficiently.</p>
                    </div>
                    <button onClick={() => navigate('/create-project')} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all duration-300">
                        <Plus size={20} /> Create Project
                    </button>
                </div>

                {/* Dashboard Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="relative group overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 p-6 rounded-2xl text-white shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02]">
                        <div className="absolute right-0 top-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
                            <FolderOpen size={100} />
                        </div>
                        <div className="flex items-center gap-3 mb-2 opacity-90">
                            <FolderOpen size={24} />
                            <span className="text-sm font-semibold uppercase tracking-wider">Total Projects</span>
                        </div>
                        <div className="text-4xl font-bold">{stats.totalProjects}</div>
                    </div>

                    <div className="glass-panel p-6 rounded-2xl shadow-sm hover:shadow-md transition-all hover:scale-[1.02] border border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-3 mb-2 text-gray-500 dark:text-gray-400">
                            <Clock size={24} className="text-amber-500" />
                            <span className="text-sm font-semibold uppercase tracking-wider">Active Tasks</span>
                        </div>
                        <div className="text-4xl font-bold text-gray-800 dark:text-gray-100">{stats.activeTasks}</div>
                        <p className="text-xs text-gray-400 mt-1">Across all workspaces</p>
                    </div>

                    <div className="glass-panel p-6 rounded-2xl shadow-sm hover:shadow-md transition-all hover:scale-[1.02] border border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-3 mb-2 text-gray-500 dark:text-gray-400">
                            <CheckCircle size={24} className="text-emerald-500" />
                            <span className="text-sm font-semibold uppercase tracking-wider">Completed</span>
                        </div>
                        <div className="text-4xl font-bold text-gray-800 dark:text-gray-100">{stats.completedTasks}</div>
                        <p className="text-xs text-gray-400 mt-1">Lifetime completion</p>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="glass-panel p-2 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 mb-8 flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full md:w-96">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search projects..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-slate-800/50 border border-transparent focus:bg-white dark:focus:bg-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
                        />
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto px-2">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="p-2.5 border-none bg-gray-100 dark:bg-slate-800 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500/20 outline-none cursor-pointer hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
                        >
                            <option value="newest">Newest First</option>
                            <option value="name">Name (A-Z)</option>
                        </select>
                        <div className="flex p-1 bg-gray-100 dark:bg-slate-800 rounded-xl">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                            >
                                <LayoutGrid size={20} />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                            >
                                <List size={20} />
                            </button>
                        </div>
                    </div>
                </div>

                {filteredProjects.length === 0 ? (
                    <div className="text-center py-24 bg-gray-50/50 dark:bg-slate-800/20 rounded-3xl border-2 border-dashed border-gray-200 dark:border-slate-800">
                        <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-full shadow-sm flex items-center justify-center mx-auto mb-6">
                            <FolderOpen size={40} className="text-gray-300 dark:text-gray-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">No projects found</h3>
                        <p className="text-gray-500 dark:text-gray-400 mt-2">Try adjusting your search terms or create a new one.</p>
                    </div>
                ) : (
                    <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8" : "space-y-4"}>
                        {filteredProjects.map((p, idx) => (
                            <div
                                key={p.id}
                                onClick={() => navigate(`/project/${p.id}`)}
                                style={{ animationDelay: `${idx * 0.05}s` }}
                                className={`
                                    group bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl cursor-pointer hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-1 transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 fill-mode-backwards
                                    ${viewMode === 'list' ? 'flex items-center p-6 gap-8' : 'p-8 flex flex-col h-full relative overflow-hidden'}
                                `}
                            >
                                {viewMode === 'grid' && (
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-blue-500/10 transition-colors"></div>
                                )}

                                <div className={`${viewMode === 'list' ? 'flex-1' : 'flex-1 z-10'}`}>
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            {p.template && (
                                                <span className="text-[10px] uppercase font-bold px-2.5 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg tracking-wider mb-2 inline-block">
                                                    {p.template}
                                                </span>
                                            )}
                                            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{p.name}</h3>
                                        </div>
                                        <button
                                            onClick={(e) => handleDeleteProject(e, p.id)}
                                            className="p-2 text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                            title="Delete Project"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                    <p className={`text-sm text-gray-500 dark:text-gray-400 leading-relaxed ${viewMode === 'list' ? 'mb-0 line-clamp-1' : 'mb-6 line-clamp-3'}`}>
                                        {p.description || 'No description provided.'}
                                    </p>
                                </div>

                                <div className={`flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 ${viewMode === 'list' ? 'w-64 justify-end gap-8' : 'pt-6 border-t dark:border-slate-800 mt-auto z-10'}`}>
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-700 dark:text-indigo-400 font-bold shadow-sm">
                                            {p.owner?.name?.[0] || 'O'}
                                        </div>
                                        <div>
                                            <div className="text-[10px] uppercase tracking-wide opacity-70">Owner</div>
                                            <div className="font-medium text-gray-700 dark:text-gray-300">{p.owner?.name || 'Unknown'}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-700 dark:text-emerald-400 font-bold shadow-sm">
                                            {p.teamLeader?.name?.[0] || 'T'}
                                        </div>
                                        <div>
                                            <div className="text-[10px] uppercase tracking-wide opacity-70">Leader</div>
                                            <div className="font-medium text-gray-700 dark:text-gray-300">{p.teamLeader?.name || 'None'}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
};
export default ProjectList;