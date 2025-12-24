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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[85vh] overflow-hidden">
                {/* Header */}
                <div className="p-4 border-b flex items-center justify-between bg-gray-50">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-red-100 text-red-600 rounded-lg">
                            <Trash2 size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-800">Trash Bin</h2>
                            <p className="text-xs text-gray-500">{deletedTasks.length} items found</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Toolbar */}
                <div className="p-4 border-b flex gap-3 items-center bg-white sticky top-0 z-10">
                    <div className="relative flex-1">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search deleted tasks..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-gray-100 border-none rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
                        />
                    </div>
                    {selectedIds.size > 0 && (
                        <div className="flex gap-2">
                            <button
                                onClick={handleRestore}
                                disabled={isDeleting}
                                className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 text-sm font-medium transition-colors"
                            >
                                <RefreshCw size={16} className={isDeleting ? 'animate-spin' : ''} />
                                Restore ({selectedIds.size})
                            </button>
                            <button
                                onClick={handlePermanentDelete}
                                disabled={isDeleting}
                                className="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 text-sm font-medium transition-colors"
                            >
                                <Trash2 size={16} />
                                Delete ({selectedIds.size})
                            </button>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-2 bg-gray-50">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                            <Loader size={32} className="animate-spin mb-2" />
                            <p className="text-sm">Loading trash...</p>
                        </div>
                    ) : filteredTasks.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                                <Trash2 size={32} />
                            </div>
                            <p className="text-sm font-medium text-gray-500">No deleted items found</p>
                            {searchQuery && <p className="text-xs">Try clearing your search query</p>}
                        </div>
                    ) : (
                        <div className="space-y-1">
                            <div className="px-3 py-2 flex items-center gap-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                <button onClick={handleSelectAll} className="hover:text-gray-700">
                                    {selectedIds.size === filteredTasks.length && filteredTasks.length > 0
                                        ? <CheckSquare size={16} className="text-blue-600" />
                                        : <Square size={16} />
                                    }
                                </button>
                                <span className="flex-1">Task Name</span>
                                <span className="w-24 text-right">Deleted</span>
                            </div>

                            {filteredTasks.map(task => {
                                const isSelected = selectedIds.has(task.id);
                                return (
                                    <div
                                        key={task.id}
                                        className={`group flex items-center gap-3 p-3 rounded-lg border transition-all ${isSelected
                                            ? 'bg-blue-50 border-blue-200'
                                            : 'bg-white border-transparent hover:border-gray-200 hover:shadow-sm'
                                            }`}
                                    >
                                        <button
                                            onClick={() => handleSelect(task.id)}
                                            className={`text-gray-400 hover:text-blue-600 transition-colors ${isSelected ? 'text-blue-600' : ''}`}
                                        >
                                            {isSelected ? <CheckSquare size={18} /> : <Square size={18} />}
                                        </button>

                                        <div className="flex-1 min-w-0">
                                            <h4 className={`text-sm font-medium truncate ${isSelected ? 'text-blue-900' : 'text-gray-800'}`}>
                                                {task.title}
                                            </h4>
                                            <p className="text-xs text-gray-500 truncate mt-0.5">
                                                {task.description || 'No description'}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <div className="text-xs text-right text-gray-400">
                                                {/* Placeholder for deleted time if available, or just random/simulated */}
                                                {task.deletedAt ? new Date(task.deletedAt).toLocaleDateString() : 'Recently'}
                                            </div>

                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    title="Restore"
                                                    onClick={() => { setSelectedIds(new Set([task.id])); handleRestore(); }}
                                                    className="p-1.5 hover:bg-blue-100 text-blue-600 rounded"
                                                >
                                                    <RefreshCw size={14} />
                                                </button>
                                                <button
                                                    title="Delete Forever"
                                                    onClick={() => { setSelectedIds(new Set([task.id])); handlePermanentDelete(); }}
                                                    className="p-1.5 hover:bg-red-100 text-red-600 rounded"
                                                >
                                                    <AlertTriangle size={14} />
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
                <div className="p-3 bg-gray-50 border-t flex justify-between items-center text-xs text-gray-500">
                    <div>
                        Selected: <span className="font-medium text-gray-700">{selectedIds.size}</span>
                    </div>
                    <div>
                        Items in trash are automatically deleted after 30 days.
                    </div>
                </div>
            </div>
        </div>
    );
}