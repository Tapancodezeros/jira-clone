import React, { useMemo, useState, useEffect } from 'react';
import { Calendar, ChevronRight, ChevronDown, Plus, MoreHorizontal } from 'lucide-react';
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';
import api from '../utils/apiClient';

const Roadmap = ({ tasks, project, onCreateEpic, onCreateTask }) => {
    const [timeRange, setTimeRange] = useState('month'); // month, quarter
    const [expandedEpics, setExpandedEpics] = useState({});
    const [epics, setEpics] = useState([]);

    // Roadmap View Configuration
    const VIEW_DAYS = 30; // Number of days to show

    useEffect(() => {
        const fetchRoadmap = async () => {
            if (!project) return;
            try {
                const data = await api.get(`/projects/${project.id}/roadmap`);

                // Process epics to ensure valid date objects
                const processed = (data || []).map(e => ({
                    ...e,
                    startDate: e.startDate ? new Date(e.startDate) : new Date(),
                    endDate: e.dueDate ? new Date(e.dueDate) : addDays(new Date(), 14),
                    color: e.color || 'bg-purple-600'
                }));
                setEpics(processed);
            } catch (error) {
                console.error('Failed to fetch roadmap', error);
                setEpics([]);
            }
        };
        fetchRoadmap();
    }, [project, tasks]);

    // Generate Calendar Grid
    const { calendarDays, viewStart, viewEnd } = useMemo(() => {
        const today = new Date();
        const start = startOfWeek(today);
        const end = addDays(start, VIEW_DAYS - 1);
        return {
            calendarDays: eachDayOfInterval({ start, end }),
            viewStart: start,
            viewEnd: end
        };
    }, [timeRange]);

    const toggleEpic = (id) => {
        setExpandedEpics(prev => ({ ...prev, [id]: !prev[id] }));
    };

    // Helper: Calculate standard progress based on child tasks
    const calculateProgress = (epicId) => {
        const children = tasks.filter(t => t.parentTaskId === epicId);
        if (children.length === 0) return 0;
        const completed = children.filter(t => t.status === 'Done').length;
        return Math.round((completed / children.length) * 100);
    };

    // Helper: Calculate style for positioning bars
    const getPositionStyle = (start, end) => {
        const s = new Date(start);
        const e = new Date(end);

        // Calculate offset from view start
        const diffStart = (s - viewStart) / (1000 * 60 * 60 * 24);
        const duration = (e - s) / (1000 * 60 * 60 * 24);

        // Convert to percentages based on total VIEW_DAYS
        // We add a clamp or handle out of view bounds if necessary, 
        // but for now we assume they fall somewhat reasonably or CSS hidden handles it.

        const left = (diffStart / VIEW_DAYS) * 100;
        const width = Math.max((duration / VIEW_DAYS) * 100, 2); // Min width 2%

        return {
            left: `${left}%`,
            width: `${width}%`
        };
    };

    return (
        <div className="flex-1 h-full flex flex-col bg-white dark:bg-slate-900 overflow-hidden">
            {/* Header */}
            <div className="px-8 py-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm z-10">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3">
                        <Calendar className="text-purple-600" /> Roadmap
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">Timeline view of epics and strategic initiatives.</p>
                </div>
                <div className="flex gap-2">
                    <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-lg flex text-xs font-bold">
                        <button
                            className={`px-3 py-1.5 rounded-md transition-all ${timeRange === 'month' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-800 dark:text-slate-200' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
                            onClick={() => setTimeRange('month')}
                        >
                            30 Days
                        </button>
                        {/* Future: Add Quarters view logic */}
                    </div>
                    <button
                        onClick={onCreateEpic}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-purple-500/30 flex items-center gap-2"
                    >
                        <Plus size={16} /> Create Epic
                    </button>
                </div>
            </div>

            {/* Timeline Area */}
            <div className="flex-1 overflow-auto custom-scrollbar relative flex flex-col">
                <div className="min-w-[1000px] flex-1 flex flex-col">
                    {/* Calendar Header */}
                    <div className="flex sticky top-0 bg-white dark:bg-slate-900 z-20 border-b border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="w-72 shrink-0 p-4 border-r border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 font-bold text-slate-500 text-xs uppercase tracking-wider flex items-center">
                            Epics
                        </div>
                        <div className="flex-1 flex">
                            {calendarDays.map((day, i) => (
                                <div key={i} className={`flex-1 border-r border-slate-100 dark:border-slate-800/50 p-2 text-center text-xs ${isSameDay(day, new Date()) ? 'bg-blue-50/50 dark:bg-blue-900/20' : ''}`}>
                                    <div className="font-bold text-slate-700 dark:text-slate-300">{format(day, 'd')}</div>
                                    <div className="text-[10px] text-slate-400 uppercase">{format(day, 'EEE')}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Epics Rows */}
                    <div className="divide-y divide-slate-100 dark:divide-slate-800 flex-1">
                        {epics.length === 0 && (
                            <div className="p-12 text-center">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-50 dark:bg-purple-900/20 text-purple-500 mb-4">
                                    <Calendar size={32} />
                                </div>
                                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">No Epics Found</h3>
                                <p className="text-slate-500 max-w-md mx-auto mb-6">Create an Epic to start planning your roadmap. Epics are large bodies of work that can be broken down into smaller tasks.</p>
                                <button onClick={onCreateEpic} className="text-purple-600 font-bold hover:underline">
                                    Create your first Epic
                                </button>
                            </div>
                        )}
                        {epics.map(epic => {
                            const progress = calculateProgress(epic.id);
                            const style = getPositionStyle(epic.startDate, epic.endDate);

                            return (
                                <div key={epic.id} className="group bg-white dark:bg-slate-900">
                                    <div className="flex hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors border-l-4 border-l-transparent hover:border-l-purple-500">
                                        {/* Epic Title Column */}
                                        <div className="w-72 shrink-0 p-3 border-r border-slate-200 dark:border-slate-800 flex items-center justify-between group-epic">
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <button onClick={() => toggleEpic(epic.id)} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors text-slate-400 hover:text-slate-600">
                                                    {expandedEpics[epic.id] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                                </button>
                                                <div className={`w-3 h-3 rounded shrink-0 ${epic.color || 'bg-purple-500'}`}></div>
                                                <div className="overflow-hidden">
                                                    <div className="font-bold text-sm text-slate-700 dark:text-slate-200 truncate" title={epic.title}>{epic.title}</div>
                                                    <div className="text-[10px] text-slate-400">{tasks.filter(t => t.parentTaskId === epic.id).length} issues</div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => onCreateTask && onCreateTask({ parentTaskId: epic.id })}
                                                className="opacity-0 group-hover/epic:opacity-100 p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-400"
                                                title="Add Child Issue"
                                            >
                                                <Plus size={14} />
                                            </button>
                                        </div>

                                        {/* Timeline Column */}
                                        <div className="flex-1 relative py-4">
                                            {/* Grid Lines (Background) */}
                                            <div className="absolute inset-0 flex h-full pointer-events-none">
                                                {calendarDays.map((d, i) => (
                                                    <div key={i} className={`flex-1 border-r border-slate-50 dark:border-slate-800/20 h-full ${isSameDay(d, new Date()) ? 'bg-blue-50/20 dark:bg-blue-900/5' : ''}`}></div>
                                                ))}
                                            </div>

                                            {/* Epic Bar */}
                                            <div
                                                style={style}
                                                className="absolute h-9 rounded-md bg-purple-100 dark:bg-purple-900/40 border border-purple-200 dark:border-purple-700/50 flex align-center shadow-sm cursor-pointer hover:brightness-105 transition-all group-bar overflow-hidden"
                                            >
                                                {/* Progress Fill */}
                                                <div
                                                    className="absolute left-0 top-0 bottom-0 bg-purple-200 dark:bg-purple-800/50 transition-all duration-500"
                                                    style={{ width: `${progress}%` }}
                                                ></div>

                                                <div className="relative z-10 flex items-center px-3 w-full h-full">
                                                    <span className="text-xs font-bold text-purple-900 dark:text-purple-100 truncate flex-1">{epic.title}</span>
                                                    <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300 ml-2 bg-white/30 px-1.5 py-0.5 rounded">{progress}%</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Child Issues (if expanded) */}
                                    {expandedEpics[epic.id] && (
                                        <div className="bg-slate-50/50 dark:bg-slate-900/30 border-y border-slate-100 dark:border-slate-800/50">
                                            {tasks
                                                .filter(t => t.parentTaskId === epic.id)
                                                .map(task => {
                                                    // Default to epic dates if task has no dates, just for viz
                                                    const sDate = task.startDate ? new Date(task.startDate) : new Date(epic.startDate);
                                                    const eDate = task.dueDate ? new Date(task.dueDate) : new Date(epic.endDate);
                                                    const taskStyle = getPositionStyle(sDate, eDate);

                                                    return (
                                                        <div key={task.id} className="flex hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors">
                                                            <div className="w-72 shrink-0 p-2 pl-12 border-r border-slate-200 dark:border-slate-800 flex items-center gap-3">
                                                                <div className={`w-2 h-2 rounded-full ${task.status === 'Done' ? 'bg-green-500' : 'bg-blue-400'}`}></div>
                                                                <span className={`text-xs font-medium truncate ${task.status === 'Done' ? 'text-slate-400 line-through' : 'text-slate-600 dark:text-slate-400'}`}>{task.title}</span>
                                                            </div>
                                                            <div className="flex-1 relative py-2">
                                                                <div className="absolute inset-0 flex h-full pointer-events-none">
                                                                    {calendarDays.map((_, i) => (
                                                                        <div key={i} className="flex-1 border-r border-slate-50 dark:border-slate-800/20 h-full"></div>
                                                                    ))}
                                                                </div>
                                                                <div
                                                                    style={taskStyle}
                                                                    className={`absolute h-5 rounded text-[10px] flex items-center px-2 truncate shadow-sm border ${task.status === 'Done'
                                                                        ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800'
                                                                        : 'bg-white text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                                                                        }`}
                                                                >
                                                                    {task.title}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            {tasks.filter(t => t.parentTaskId === epic.id).length === 0 && (
                                                <div className="py-2 pl-72 text-center text-xs text-slate-400 italic bg-slate-50 dark:bg-slate-900/20">
                                                    No issues in this epic yet.
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Roadmap;
