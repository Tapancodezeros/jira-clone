import React from 'react';
import { Layout, List, Settings, Plus, Box, PieChart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProjectSidebar = ({ project, currentView, onViewChange }) => {
    const navigate = useNavigate();

    const navItems = [
        { id: 'board', label: 'Board', icon: Layout },
        { id: 'backlog', label: 'Backlog', icon: List },
        { id: 'reports', label: 'Reports', icon: PieChart },
        { id: 'releases', label: 'Releases', icon: Box },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];

    return (
        <div className="w-64 h-full flex flex-col glass-panel border-r border-slate-200 dark:border-slate-800 z-10">
            {/* Project Header */}
            <div className="p-5 flex items-center gap-3 border-b border-slate-100 dark:border-slate-800">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/30">
                    {project ? project.name.substring(0, 2).toUpperCase() : 'P'}
                </div>
                <div className="overflow-hidden">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 truncate">{project ? project.name : 'Project'}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">Software Project</p>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 py-4 px-3 space-y-1">
                {/* Planning Group */}
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-3 mb-2 mt-2">Planning</div>
                {navItems.filter(i => ['board', 'backlog'].includes(i.id)).map(item => (
                    <button
                        key={item.id}
                        onClick={() => onViewChange(item.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${currentView === item.id
                            ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30 shadow-sm'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 border border-transparent'
                            }`}
                    >
                        <item.icon size={18} />
                        {item.label}
                    </button>
                ))}

                {/* Development Group */}
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-3 mb-2 mt-6">Development</div>
                {navItems.filter(i => ['releases', 'reports'].includes(i.id)).map(item => (
                    <button
                        key={item.id}
                        onClick={() => onViewChange(item.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${currentView === item.id
                            ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30 shadow-sm'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 border border-transparent'
                            }`}
                    >
                        <item.icon size={18} />
                        {item.label}
                    </button>
                ))}

                {/* Settings Group */}
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-3 mb-2 mt-6">Configuration</div>
                {navItems.filter(i => ['settings'].includes(i.id)).map(item => (
                    <button
                        key={item.id}
                        onClick={() => onViewChange(item.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${currentView === item.id
                            ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30 shadow-sm'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 border border-transparent'
                            }`}
                    >
                        <item.icon size={18} />
                        {item.label}
                    </button>
                ))}
            </div>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="w-full py-2 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
                >
                    Switch Project
                </button>
            </div>
        </div>
    );
};

export default ProjectSidebar;
