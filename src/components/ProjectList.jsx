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
            <div className="p-8 max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800">Projects</h2>
                        <p className="text-gray-500 mt-1">Manage your team's ongoing work.</p>
                    </div>
                    <button onClick={() => navigate('/create-project')} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                        <Plus size={18} /> New Project
                    </button>
                </div>

                {/* Dashboard Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-6 rounded-xl text-white shadow-lg">
                        <div className="flex items-center gap-3 mb-2 opacity-80">
                            <FolderOpen size={20} />
                            <span className="text-sm font-medium">Total Projects</span>
                        </div>
                        <div className="text-3xl font-bold">{stats.totalProjects}</div>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <div className="flex items-center gap-3 mb-2 text-gray-500">
                            <Clock size={20} className="text-yellow-500" />
                            <span className="text-sm font-medium">Active Tasks</span>
                        </div>
                        <div className="text-3xl font-bold text-gray-800">{stats.activeTasks}</div>
                        <p className="text-xs text-gray-400 mt-1">Across all projects</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <div className="flex items-center gap-3 mb-2 text-gray-500">
                            <CheckCircle size={20} className="text-green-500" />
                            <span className="text-sm font-medium">Completed</span>
                        </div>
                        <div className="text-3xl font-bold text-gray-800">{stats.completedTasks}</div>
                        <p className="text-xs text-gray-400 mt-1">All time</p>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="bg-white p-4 rounded-xl shadow-sm border mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full md:w-96">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search projects..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                        />
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="p-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                        >
                            <option value="newest">Newest First</option>
                            <option value="name">Name (A-Z)</option>
                        </select>
                        <div className="flex p-1 bg-gray-100 rounded-lg">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                <LayoutGrid size={18} />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                <List size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                {filteredProjects.length === 0 ? (
                    <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                        <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto mb-4">
                            <FolderOpen size={32} className="text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">No projects found</h3>
                        <p className="text-gray-500 mt-1">Try adjusting your search terms or create a new one.</p>
                    </div>
                ) : (
                    <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-3"}>
                        {filteredProjects.map(p => (
                            <div
                                key={p.id}
                                onClick={() => navigate(`/project/${p.id}`)}
                                className={`
                                    group bg-white border border-gray-200 rounded-xl cursor-pointer hover:shadow-md hover:border-blue-300 transition-all 
                                    ${viewMode === 'list' ? 'flex items-center p-4 gap-6' : 'p-6 flex flex-col h-full'}
                                `}
                            >
                                <div className={`${viewMode === 'list' ? 'flex-1' : 'flex-1'}`}>
                                    <div className="flex items-start justify-between">
                                        <h3 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">{p.name}</h3>
                                        <div className="flex gap-2">
                                            {p.template && (
                                                <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full tracking-wide">
                                                    {p.template}
                                                </span>
                                            )}
                                            <button
                                                onClick={(e) => handleDeleteProject(e, p.id)}
                                                className="p-1 text-gray-400 hover:bg-red-50 hover:text-red-500 rounded transition-colors opacity-0 group-hover:opacity-100"
                                                title="Delete Project"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                    <p className={`text-sm text-gray-500 mt-2 line-clamp-2 ${viewMode === 'list' ? 'mb-0' : 'mb-4'}`}>
                                        {p.description || 'No description provided.'}
                                    </p>
                                </div>
                                <div className={`flex items-center justify-between text-xs text-gray-500 ${viewMode === 'list' ? 'w-48 justify-end gap-8' : 'pt-4 border-t mt-auto'}`}>
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-[10px]">
                                            {p.owner?.name?.[0] || 'O'}
                                        </div>
                                        <span>Owner: {p.owner?.name || 'Unknown'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-[10px]">
                                            {p.teamLeader?.name?.[0] || 'T'}
                                        </div>
                                        <span>Leader: {p.teamLeader?.name || 'None'}</span>
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