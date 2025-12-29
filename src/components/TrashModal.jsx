import React, { useState, useEffect, useMemo } from 'react';
import { X, Trash2, RefreshCw, Search, AlertTriangle, CheckSquare, Square, Loader } from 'lucide-react';
import api from '../utils/apiClient';
import { useToast } from '../context/ToastContext';

export default function TrashModal({ projectId, onClose, onUpdate }) {
    const [deletedTasks, setDeletedTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [isDeleting, setIsDeleting] = useState(false);
    const { showToast } = useToast();

    // Fetch deleted tasks
    useEffect(() => {
        const fetchDeleted = async () => {
            try {
                // Assuming endpoint to get deleted tasks for project
                // If backend doesn't support filtering by status 'deleted', this might need adjustment
                const data = await api.get(`/projects/${projectId}/trash`);
                setDeletedTasks(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("Failed to fetch trash", err);
                // Fallback for demo/dev if API endpoint doesn't exist
                // setDeletedTasks([]); 
                showToast({ msg: 'Could not load trash', type: 'error' });
            } finally {
                setLoading(false);
            }
        };
        if (projectId) fetchDeleted();
    }, [projectId, showToast]);

    const filteredTasks = useMemo(() => {
        return deletedTasks.filter(t =>
            t.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.description?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [deletedTasks, searchQuery]);

    const handleSelect = (id) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) newSelected.delete(id);
        else newSelected.add(id);
        setSelectedIds(newSelected);
    };

    const handleSelectAll = () => {
        if (selectedIds.size === filteredTasks.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(filteredTasks.map(t => t.id)));
        }
    };

    const handleRestore = async () => {
        if (selectedIds.size === 0) return;
        setIsDeleting(true);
        try {
            await Promise.all(Array.from(selectedIds).map(id => api.post(`/tasks/${id}/restore`)));
            showToast({ msg: `Restored ${selectedIds.size} tasks` });
            setDeletedTasks(prev => prev.filter(t => !selectedIds.has(t.id)));
            setSelectedIds(new Set());
            if (onUpdate) onUpdate();
        } catch (err) {
            showToast({ msg: 'Failed to restore tasks', type: 'error' });
        } finally {
            setIsDeleting(false);
        }
    };

    const handlePermanentDelete = async () => {
        if (selectedIds.size === 0) return;
        if (!window.confirm('Are you sure? This cannot be undone.')) return;

        setIsDeleting(true);
        try {
            await Promise.all(Array.from(selectedIds).map(id => api.del(`/tasks/${id}?permanent=true`)));
            showToast({ msg: `Permanently deleted ${selectedIds.size} tasks` });
            setDeletedTasks(prev => prev.filter(t => !selectedIds.has(t.id)));
            setSelectedIds(new Set());
        } catch (err) {
            showToast({ msg: 'Failed to delete tasks', type: 'error' });
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="glass-panel rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[85vh] overflow-hidden border border-gray-100 dark:border-slate-800">
                {/* Header */}
                <div className="p-5 border-b border-gray-200/50 dark:border-slate-700/50 flex items-center justify-between bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl">
                            <Trash2 size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Trash Bin</h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{deletedTasks.length} items found</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors">
                        <X size={24} className="text-gray-500 dark:text-gray-400" />
                    </button>
                </div>

                {/* Toolbar */}
                <div className="p-4 border-b border-gray-100 dark:border-slate-800 flex gap-3 items-center bg-white/30 dark:bg-slate-900/30 sticky top-0 z-10 backdrop-blur-md">
                    <div className="relative flex-1">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search deleted tasks..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:bg-white dark:focus:bg-slate-900 transition-all outline-none text-gray-800 dark:text-gray-200"
                        />
                    </div>
                    {selectedIds.size > 0 && (
                        <div className="flex gap-2 animate-in fade-in slide-in-from-right-2">
                            <button
                                onClick={handleRestore}
                                disabled={isDeleting}
                                className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/40 text-sm font-bold transition-colors shadow-sm"
                            >
                                <RefreshCw size={16} className={isDeleting ? 'animate-spin' : ''} />
                                Restore
                            </button>
                            <button
                                onClick={handlePermanentDelete}
                                disabled={isDeleting}
                                className="flex items-center gap-2 px-4 py-2.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 text-sm font-bold transition-colors shadow-sm"
                            >
                                <Trash2 size={16} />
                                Delete
                            </button>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-gray-50/30 dark:bg-slate-900/30">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                            <Loader size={32} className="animate-spin mb-3 text-blue-500" />
                            <p className="text-sm font-medium">Loading trash...</p>
                        </div>
                    ) : filteredTasks.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                            <div className="w-20 h-20 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 inner-shadow">
                                <Trash2 size={40} className="text-gray-300 dark:text-gray-600" />
                            </div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No deleted items found</p>
                            {searchQuery && <p className="text-xs mt-1">Try clearing your search query</p>}
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <div className="px-4 py-2 flex items-center gap-3 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                <button onClick={handleSelectAll} className="hover:text-blue-600 transition-colors">
                                    {selectedIds.size === filteredTasks.length && filteredTasks.length > 0
                                        ? <CheckSquare size={18} className="text-blue-600" />
                                        : <Square size={18} />
                                    }
                                </button>
                                <span className="flex-1">Task Details</span>
                                <span className="w-24 text-right hidden sm:block">Deleted</span>
                            </div>

                            {filteredTasks.map(task => {
                                const isSelected = selectedIds.has(task.id);
                                return (
                                    <div
                                        key={task.id}
                                        className={`group flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer ${isSelected
                                            ? 'bg-blue-50/80 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800 shadow-sm'
                                            : 'bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700 hover:border-gray-200 dark:hover:border-slate-600 hover:shadow-md hover:-translate-y-0.5'
                                            }`}
                                        onClick={() => handleSelect(task.id)}
                                    >
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleSelect(task.id); }}
                                            className={`transition-colors ${isSelected ? 'text-blue-600' : 'text-gray-300 dark:text-gray-600 group-hover:text-gray-400'}`}
                                        >
                                            {isSelected ? <CheckSquare size={20} /> : <Square size={20} />}
                                        </button>

                                        <div className="flex-1 min-w-0">
                                            <h4 className={`text-sm font-bold truncate ${isSelected ? 'text-blue-900 dark:text-blue-100' : 'text-gray-800 dark:text-gray-200'}`}>
                                                {task.title}
                                            </h4>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1 max-w-[90%]">
                                                {task.description || 'No description provided'}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <div className="text-xs text-right text-gray-400 font-medium hidden sm:block">
                                                {task.deletedAt ? new Date(task.deletedAt).toLocaleDateString() : 'Recently'}
                                            </div>

                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    title="Restore"
                                                    onClick={(e) => { e.stopPropagation(); setSelectedIds(new Set([task.id])); handleRestore(); }}
                                                    className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg transition-colors"
                                                >
                                                    <RefreshCw size={16} />
                                                </button>
                                                <button
                                                    title="Delete Forever"
                                                    onClick={(e) => { e.stopPropagation(); setSelectedIds(new Set([task.id])); handlePermanentDelete(); }}
                                                    className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 bg-gray-50/80 dark:bg-slate-800/80 border-t border-gray-100 dark:border-slate-700 flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 backdrop-blur-sm">
                    <div>
                        Selected: <span className="font-bold text-gray-700 dark:text-gray-200">{selectedIds.size}</span>
                    </div>
                    <div>
                        Items are automatically deleted after <span className="font-bold">30 days</span>.
                    </div>
                </div>
            </div>
        </div>
    );
}