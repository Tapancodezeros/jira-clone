import React, { useMemo } from 'react';
import { PieChart, BarChart, TrendingUp, CheckCircle, AlertCircle, Clock } from 'lucide-react';

const Reports = ({ tasks, members }) => {
    // 1. Statistics Calculation
    const stats = useMemo(() => {
        const total = tasks.length;
        const byStatus = {
            'Todo': 0,
            'In Progress': 0,
            'Done': 0,
            'Backlog': 0
        };
        const byPriority = { 'High': 0, 'Medium': 0, 'Low': 0, 'Critical': 0 };
        const byAssignee = {};

        tasks.forEach(t => {
            // Status
            if (byStatus[t.status] !== undefined) byStatus[t.status]++;
            else byStatus[t.status] = (byStatus[t.status] || 0) + 1;

            // Priority
            if (byPriority[t.priority] !== undefined) byPriority[t.priority]++;
            else byPriority[t.priority] = (byPriority[t.priority] || 0) + 1;

            // Assignee
            const assigneeName = t.assignee?.name || 'Unassigned';
            byAssignee[assigneeName] = (byAssignee[assigneeName] || 0) + 1;
        });

        return { total, byStatus, byPriority, byAssignee };
    }, [tasks]);

    // Helper for Pie Chart (CSS Conic Gradient)
    const getPieGradient = () => {
        const total = stats.total || 1;
        let activeAngle = 0;
        const colors = {
            'Done': '#10B981', // Emerald 500
            'In Progress': '#3B82F6', // Blue 500
            'Todo': '#94A3B8', // Slate 400
            'Backlog': '#CBD5E1' // Slate 300
        };

        const segments = Object.entries(stats.byStatus).map(([status, count]) => {
            if (count === 0) return '';
            const percentage = (count / total) * 100;
            const angle = (count / total) * 360;
            const start = activeAngle;
            activeAngle += angle;
            return `${colors[status] || '#ccc'} ${start}deg ${activeAngle}deg`;
        }).filter(Boolean);

        return segments.length ? `conic-gradient(${segments.join(', ')})` : 'conic-gradient(#f1f5f9 0deg 360deg)';
    };

    return (
        <div className="flex-1 h-full overflow-y-auto custom-scrollbar p-8 bg-slate-50/50 dark:bg-slate-900">
            <div className="max-w-6xl mx-auto space-y-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3">
                        <PieChart className="text-blue-600" /> Project Reports
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">Real-time overview of project velocity and distribution.</p>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col justify-between">
                        <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Total Issues</div>
                        <div className="text-3xl font-bold text-slate-800 dark:text-white">{stats.total}</div>
                        <div className="mt-2 text-xs text-green-500 flex items-center font-medium"><TrendingUp size={12} className="mr-1" /> Updated just now</div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col justify-between">
                        <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Completion Rate</div>
                        <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                            {stats.total ? Math.round((stats.byStatus['Done'] / stats.total) * 100) : 0}%
                        </div>
                        <div className="mt-2 w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-emerald-500 h-full rounded-full transition-all duration-1000" style={{ width: `${stats.total ? (stats.byStatus['Done'] / stats.total) * 100 : 0}%` }}></div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col justify-between">
                        <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">High Priority</div>
                        <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                            {stats.byPriority['High'] + (stats.byPriority['Critical'] || 0)}
                        </div>
                        <div className="mt-2 text-xs text-slate-400 flex items-center gap-1">
                            <AlertCircle size={12} className="text-red-500" /> Needs attention
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col justify-between">
                        <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Unassigned</div>
                        <div className="text-3xl font-bold text-orange-500 dark:text-orange-400">
                            {stats.byAssignee['Unassigned'] || 0}
                        </div>
                        <div className="mt-2 text-xs text-slate-400 flex items-center gap-1">
                            <Clock size={12} className="text-orange-500" /> Pending assignment
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Status Distribution (Pie) */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
                            Status Distribution
                        </h3>
                        <div className="flex items-center justify-center gap-8 flex-wrap">
                            <div
                                className="w-48 h-48 rounded-full shadow-inner relative flex items-center justify-center transition-all duration-1000"
                                style={{ background: getPieGradient() }}
                            >
                                <div className="w-32 h-32 bg-white dark:bg-slate-800 rounded-full flex flex-col items-center justify-center shadow-sm">
                                    <span className="text-3xl font-bold text-slate-800 dark:text-white">{stats.total}</span>
                                    <span className="text-xs text-slate-400 uppercase font-bold">Issues</span>
                                </div>
                            </div>
                            <div className="space-y-3">
                                {Object.entries(stats.byStatus).map(([status, count]) => (
                                    <div key={status} className="flex items-center gap-3 min-w-[120px]">
                                        <div className={`w-3 h-3 rounded-full ${status === 'Done' ? 'bg-emerald-500' :
                                            status === 'In Progress' ? 'bg-blue-500' :
                                                status === 'Todo' ? 'bg-slate-400' : 'bg-slate-200'
                                            }`}></div>
                                        <div className="flex-1 text-sm font-medium text-slate-600 dark:text-slate-300 flex justify-between gap-4">
                                            <span>{status}</span>
                                            <span className="font-bold text-slate-800 dark:text-slate-100">{count}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Priority Breakdown (Bar) */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-6">
                            Priority Breakdown
                        </h3>
                        <div className="space-y-5">
                            {['Critical', 'High', 'Medium', 'Low'].map(priority => {
                                const count = stats.byPriority[priority] || 0;
                                const percentage = stats.total ? (count / stats.total) * 100 : 0;
                                const color =
                                    priority === 'Critical' ? 'bg-red-600' :
                                        priority === 'High' ? 'bg-red-500' :
                                            priority === 'Medium' ? 'bg-orange-500' :
                                                'bg-blue-500';

                                return (
                                    <div key={priority}>
                                        <div className="flex justify-between text-sm mb-1.5">
                                            <span className="font-semibold text-slate-600 dark:text-slate-300">{priority}</span>
                                            <span className="font-mono font-bold text-slate-500">{count}</span>
                                        </div>
                                        <div className="w-full bg-slate-100 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-1000 ${color}`}
                                                style={{ width: `${percentage}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Team Workload */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-6">
                        Team Workload
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Object.entries(stats.byAssignee).sort((a, b) => b[1] - a[1]).map(([name, count]) => (
                            <div key={name} className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700">
                                <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm">
                                    {name[0]}
                                </div>
                                <div className="flex-1">
                                    <div className="font-bold text-slate-800 dark:text-slate-200 text-sm mb-0.5">{name}</div>
                                    <div className="text-xs text-slate-500">{count} issues assigned</div>
                                    <div className="mt-2 w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                                        <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${(count / stats.total) * 100}%` }}></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reports;
