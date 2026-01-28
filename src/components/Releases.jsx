import React, { useState, useEffect } from 'react';
import { Box, Calendar, Plus, MoreHorizontal, CheckCircle, Circle, Archive, Clock } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import api from '../utils/apiClient';

// Mock release management using LocalStorage since we might not have a backend endpoint for it yet
const Releases = ({ projectId, tasks, onRefresh }) => {
    const [releases, setReleases] = useState([]);
    const [isCreating, setIsCreating] = useState(false);
    const { showToast } = useToast();

    // Form State
    const [name, setName] = useState('');
    const [startDate, setStartDate] = useState('');
    const [releaseDate, setReleaseDate] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        const loadReleases = () => {
            try {
                const stored = localStorage.getItem(`releases_${projectId}`);
                if (stored) {
                    setReleases(JSON.parse(stored));
                } else {
                    // Default Data
                    setReleases([
                        { id: 1, name: 'MVP Launch', status: 'Released', startDate: '2025-01-01', releaseDate: '2025-01-15', description: 'Initial release' },
                        { id: 2, name: 'v1.1 Features', status: 'Unreleased', startDate: '2025-01-16', releaseDate: '2025-02-01', description: 'Adding user profiles and reports' }
                    ]);
                }
            } catch (e) {
                console.error(e);
            }
        };
        loadReleases();
    }, [projectId]);

    const saveReleases = (newReleases) => {
        setReleases(newReleases);
        localStorage.setItem(`releases_${projectId}`, JSON.stringify(newReleases));
    };

    const handleCreate = (e) => {
        e.preventDefault();
        if (!name) return showToast({ msg: 'Version name is required', type: 'error' });

        const newRelease = {
            id: Date.now(),
            name,
            startDate,
            releaseDate,
            description,
            status: 'Unreleased'
        };

        saveReleases([...releases, newRelease]);
        setIsCreating(false);
        resetForm();
        showToast({ msg: 'Release created' });
    };

    const resetForm = () => {
        setName('');
        setStartDate('');
        setReleaseDate('');
        setDescription('');
    };

    const getReleaseProgress = (releaseName) => {
        // Filter tasks that have a label "v:releaseName"
        const releaseTag = `v:${releaseName}`;
        const relevantTasks = tasks.filter(t => t.labels && t.labels.includes(releaseTag));

        if (relevantTasks.length === 0) return { percent: 0, total: 0, done: 0 };

        const done = relevantTasks.filter(t => t.status === 'Done').length;
        return {
            percent: Math.round((done / relevantTasks.length) * 100),
            total: relevantTasks.length,
            done
        };
    };

    const handleStatusChange = (id, newStatus) => {
        const updated = releases.map(r => r.id === id ? { ...r, status: newStatus } : r);
        saveReleases(updated);
        showToast({ msg: `Release marked as ${newStatus}` });
    };

    const deleteRelease = (id) => {
        if (!confirm('Are you sure? This will not delete issues, only the version.')) return;
        const updated = releases.filter(r => r.id !== id);
        saveReleases(updated);
        showToast({ msg: 'Release deleted' });
    };

    return (
        <div className="flex-1 h-full overflow-y-auto custom-scrollbar p-8 bg-slate-50/50 dark:bg-slate-900">
            <div className="max-w-5xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3">
                            <Box className="text-purple-600" /> Releases
                        </h1>
                        <p className="text-slate-500 text-sm mt-1">Manage software versions and track release progress.</p>
                    </div>
                    <button
                        onClick={() => setIsCreating(true)}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl shadow-lg shadow-purple-500/30 transition-all flex items-center gap-2"
                    >
                        <Plus size={18} /> Create Version
                    </button>
                </div>

                {isCreating && (
                    <div className="mb-8 p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm animate-in fade-in slide-in-from-top-4">
                        <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-4">New Version</h3>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Version Name</label>
                                    <input
                                        type="text"
                                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-purple-500/20 text-slate-900 dark:text-white"
                                        placeholder="e.g. 2.0.0"
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        autoFocus
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Description</label>
                                    <input
                                        type="text"
                                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-purple-500/20 text-slate-900 dark:text-white"
                                        placeholder="What's in this release?"
                                        value={description}
                                        onChange={e => setDescription(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Start Date</label>
                                    <input
                                        type="date"
                                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-purple-500/20 text-slate-900 dark:text-white"
                                        value={startDate}
                                        onChange={e => setStartDate(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Release Date</label>
                                    <input
                                        type="date"
                                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-purple-500/20 text-slate-900 dark:text-white"
                                        value={releaseDate}
                                        onChange={e => setReleaseDate(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => { setIsCreating(false); resetForm(); }} className="px-4 py-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg font-medium">Cancel</button>
                                <button type="submit" className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold shadow-md">Create</button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="space-y-4">
                    {releases.length === 0 && <div className="text-center py-10 text-slate-400 italic">No releases found. Create one to get started!</div>}

                    {/* Unreleased */}
                    {releases.some(r => r.status === 'Unreleased') && <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-6 mb-2 flex items-center gap-2"><Circle size={12} /> Unreleased</h4>}
                    {releases.filter(r => r.status === 'Unreleased').map(r => (
                        <ReleaseCard key={r.id} release={r} progress={getReleaseProgress(r.name)} onDelete={deleteRelease} onStatusChange={handleStatusChange} />
                    ))}

                    {/* Released */}
                    {releases.some(r => r.status === 'Released') && <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-10 mb-2 flex items-center gap-2"><CheckCircle size={12} className="text-green-500" /> Released</h4>}
                    {releases.filter(r => r.status === 'Released').map(r => (
                        <ReleaseCard key={r.id} release={r} progress={getReleaseProgress(r.name)} onDelete={deleteRelease} onStatusChange={handleStatusChange} />
                    ))}

                    {/* Archived */}
                    {releases.some(r => r.status === 'Archived') && <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-10 mb-2 flex items-center gap-2"><Archive size={12} /> Archived</h4>}
                    {releases.filter(r => r.status === 'Archived').map(r => (
                        <ReleaseCard key={r.id} release={r} progress={getReleaseProgress(r.name)} onDelete={deleteRelease} onStatusChange={handleStatusChange} />
                    ))}
                </div>
            </div>
        </div>
    );
};

const ReleaseCard = ({ release, progress, onDelete, onStatusChange }) => {
    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">{release.name}</h3>
                    <p className="text-sm text-slate-500">{release.description || 'No description'}</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${release.status === 'Released' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' :
                        release.status === 'Archived' ? 'bg-slate-100 text-slate-600' :
                            'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                        }`}>
                        {release.status}
                    </span>
                    <div className="relative group/menu">
                        <button className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-lg transition-colors">
                            <MoreHorizontal size={18} />
                        </button>
                        <div className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl shadow-xl z-20 hidden group-hover/menu:block animate-in fade-in zoom-in-95">
                            {release.status !== 'Released' && (
                                <button onClick={() => onStatusChange(release.id, 'Released')} className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200">Release</button>
                            )}
                            {release.status !== 'Unreleased' && (
                                <button onClick={() => onStatusChange(release.id, 'Unreleased')} className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200">Unrelease</button>
                            )}
                            {release.status !== 'Archived' && (
                                <button onClick={() => onStatusChange(release.id, 'Archived')} className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200">Archive</button>
                            )}
                            <div className="border-t border-slate-100 dark:border-slate-700 my-1"></div>
                            <button onClick={() => onDelete(release.id)} className="w-full text-left px-4 py-2.5 text-sm hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600">Delete</button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-6 text-xs text-slate-500 mb-4">
                <div className="flex items-center gap-1.5">
                    <Calendar size={14} />
                    <span>{release.releaseDate ? new Date(release.releaseDate).toLocaleDateString() : 'No date'}</span>
                </div>
                {progress.total > 0 && (
                    <div className="flex items-center gap-1.5">
                        <CheckCircle size={14} className="text-emerald-500" />
                        <span>{progress.done} of {progress.total} issues done</span>
                    </div>
                )}
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden mb-1">
                <div className={`h-full rounded-full transition-all duration-1000 ${progress.percent === 100 ? 'bg-green-500' : 'bg-blue-500'}`} style={{ width: `${progress.percent}%` }}></div>
            </div>
            <div className="text-right text-xs font-bold text-slate-400">{progress.percent}% Complete</div>
        </div>
    );
};

export default Releases;
