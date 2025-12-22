import React, { useState } from 'react';
import TaskCard from './TaskCard';
import { Plus, X, Trash2, LayoutGrid, List, Calendar as CalendarIcon, ArrowDownUp, AlertOctagon, ChevronLeft, ChevronRight, Edit2, Check } from 'lucide-react';

export default function TaskBoard({
  tasks, columns, user, onDragStart, onDrop, onDragOver,
  onDelete, onEdit, onQuickAdd, onAddColumn, onDeleteColumn, onMoveColumn, onRenameColumn, onClone, isDarkMode, onToggleTimer
}) {
  const [viewMode, setViewMode] = useState('board');
  const [sortBy, setSortBy] = useState('default');
  const [activeCol, setActiveCol] = useState(null);
  const [quickTitle, setQuickTitle] = useState('');
  const [newColName, setNewColName] = useState('');
  const [isAddingCol, setIsAddingCol] = useState(false);

  // Renaming State
  const [renamingCol, setRenamingCol] = useState(null);
  const [renameInput, setRenameInput] = useState('');

  const startRenaming = (col) => { setRenamingCol(col); setRenameInput(col); };
  const submitRename = () => { if (renamingCol && renameInput) { onRenameColumn(renamingCol, renameInput); setRenamingCol(null); } };

  const WIP_LIMIT = 5;

  // Filters & local wrappers for handlers (provide safe fallbacks)
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState('all');
  const [showOnlyMine, setShowOnlyMine] = useState(false);

  const handleAddTask = (title, col) => {
    if (onQuickAdd) return onQuickAdd(title, col);
    console.warn('onQuickAdd not provided. Title:', title, 'col:', col);
  };

  const handleEditTask = (task) => {
    if (onEdit) return onEdit(task);
    console.warn('onEdit not provided', task);
  };

  const handleDeleteTask = (id) => {
    if (onDelete) return onDelete(id);
    console.warn('onDelete not provided', id);
  };

  const handleToggleTimer = (taskId) => {
    if (onToggleTimer) return onToggleTimer(taskId);
    console.warn('onToggleTimer not provided', taskId);
  };

  const handleMoveTask = (taskId, toCol) => {
    // Best-effort wrapper: actual move should be done via drag/drop (onDrop)
    if (onDrop) {
      console.warn('handleMoveTask: prefer using drag events; onDrop exists for handling moves.');
    } else {
      console.warn('No move handler provided for', taskId, '->', toCol);
    }
  };

  const applyFilters = (taskList) => {
    return (taskList || []).filter(t => {
      if (searchQuery && !t.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (filterPriority !== 'all' && t.priority !== filterPriority) return false;
      if (showOnlyMine && (!t.assignee || (user && t.assignee.id !== user.id))) return false;
      return true;
    });
  };

  const visibleTasks = applyFilters(tasks);

  // Sorting
  const getSortedTasks = (taskList) => {
    if (sortBy === 'default') return taskList;
    return [...taskList].sort((a, b) => {
      if (sortBy === 'priority') {
        const pMap = { High: 3, Medium: 2, Low: 1 };
        return pMap[b.priority] - pMap[a.priority];
      }
      if (sortBy === 'date') {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      }
      return 0;
    });
  };

  // Calendar Rendering
  const renderCalendar = () => {
    const today = new Date();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).getDay();
    const monthName = today.toLocaleString('default', { month: 'long', year: 'numeric' });

    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className={`border h-32 ${isDarkMode ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-slate-50'}`}></div>);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = new Date(today.getFullYear(), today.getMonth(), day).toISOString().split('T')[0];
      const dayTasks = visibleTasks.filter(t => t.dueDate === dateStr);

      days.push(
        <div key={day} className={`border h-32 p-2 relative group overflow-hidden ${isDarkMode ? 'border-slate-700 hover:bg-slate-800' : 'border-slate-200 hover:bg-blue-50'}`}>
          <span className={`text-sm font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{day}</span>
          <div className="mt-1 space-y-1 overflow-y-auto max-h-[90px] custom-scrollbar">
            {dayTasks.map(t => (
              <div key={t.id} onClick={() => handleEditTask(t)} className={`text-[10px] px-1 py-1 rounded truncate cursor-pointer font-medium ${isDarkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-700'}`}>{t.title}</div>
            ))}
          </div>
          <button onClick={() => handleAddTask("New Event", columns[0])} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-blue-500"><Plus size={14} /></button>
        </div>
      );
    }

    return (
      <div className="p-6 h-full overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{monthName}</h2>
          <div className="text-sm text-slate-500">Scheduled Tasks</div>
        </div>
        <div className="grid grid-cols-7 gap-0 border rounded-lg overflow-hidden shadow-sm">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className={`p-2 text-center text-xs font-bold uppercase ${isDarkMode ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-slate-100 text-slate-500 border-b border-slate-200'}`}>{d}</div>
          ))}
          {days}
        </div>
      </div>
    );
  };

  const handleQuickSubmit = (col) => {
    if (quickTitle.trim()) { handleAddTask(quickTitle, col); setQuickTitle(''); setActiveCol(null); }
  };

  return (
    <div className={`flex-1 flex flex-col overflow-hidden h-full transition-colors duration-300 ${isDarkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>

      {/* View Switcher */}
      <div className={`px-6 py-3 border-b flex justify-between items-center z-10 ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
        <div className="flex gap-4 items-center">
          <div className={`flex p-1 rounded-lg ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
            {[{ id: 'board', icon: LayoutGrid, label: 'Board' }, { id: 'list', icon: List, label: 'List' }, { id: 'calendar', icon: CalendarIcon, label: 'Calendar' }].map(v => (
              <button key={v.id} onClick={() => setViewMode(v.id)} className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition ${viewMode === v.id ? (isDarkMode ? 'bg-slate-700 text-white shadow' : 'bg-white shadow-sm text-blue-600') : (isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700')}`}>
                <v.icon size={14} /> {v.label}
              </button>
            ))}
          </div>
          <div className="relative group">
            <button className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition ${isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-white border text-slate-600'}`}>
              <ArrowDownUp size={14} /> Sort: <span className="capitalize">{sortBy}</span>
            </button>
            <div className={`absolute left-0 top-full mt-1 w-32 rounded-md shadow-lg border hidden group-hover:block z-20 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
              {['default', 'priority', 'date'].map(s => (<button key={s} onClick={() => setSortBy(s)} className={`block w-full text-left px-4 py-2 text-xs capitalize ${isDarkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-50'}`}>{s}</button>))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              aria-label="Search tasks"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className={`text-sm px-2 py-1 rounded border focus:outline-none ${isDarkMode ? 'bg-slate-700 border-slate-600 text-slate-200' : 'bg-white border-slate-200 text-slate-700'}`}
            />
            <select
              aria-label="Filter by priority"
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className={`text-sm px-2 py-1 rounded border ${isDarkMode ? 'bg-slate-700 border-slate-600 text-slate-200' : 'bg-white border-slate-200 text-slate-700'}`}>
              <option value="all">All priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
            <label className={`flex items-center gap-2 text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              <input type="checkbox" checked={showOnlyMine} onChange={() => setShowOnlyMine(!showOnlyMine)} className="w-4 h-4" />
              Only mine
            </label>
          </div>
        </div>
        <div className={`text-xs font-semibold uppercase ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>{visibleTasks.length} Issues</div>
      </div>

      {viewMode === 'calendar' && renderCalendar()}

      {viewMode === 'board' && (
        <div className="flex-1 overflow-x-auto overflow-y-hidden p-6">
          <div className="flex h-full gap-6 items-start">
            {columns.map(col => {
              const colTasks = getSortedTasks(visibleTasks.filter(t => t.status === col));
              const isOverLimit = colTasks.length > WIP_LIMIT;
              return (
                <div key={col} className={`min-w-[300px] w-[350px] rounded-lg p-3 flex flex-col max-h-full border transition-colors ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'} ${isOverLimit ? 'border-red-400 ring-1 ring-red-400' : ''}`} onDragOver={onDragOver} onDrop={(e) => { if (onDrop) onDrop(e, col); else handleMoveTask(null, col); }}>
                  {/* Column Header */}
                  <div className="flex justify-between items-center mb-4 px-2 group/header">
                    {renamingCol === col ? (
                      <div className="flex items-center gap-2 flex-1">
                        <input autoFocus type="text" className={`w-full p-1 text-sm border rounded ${isDarkMode ? 'bg-slate-700 text-white border-slate-600' : 'bg-white border-blue-300'}`} value={renameInput} onChange={(e) => setRenameInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submitRename()} onBlur={submitRename} />
                        <button onClick={submitRename} className="text-green-600 hover:bg-green-100 p-1 rounded"><Check size={14} /></button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold text-sm uppercase flex items-center gap-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{col} <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${isOverLimit ? 'bg-red-100 text-red-600' : (isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-300 text-slate-700')}`}>{colTasks.length}</span>{isOverLimit && <AlertOctagon size={14} className="text-red-500" />}</span>
                        <button onClick={() => startRenaming(col)} className="opacity-0 group-hover/header:opacity-100 text-slate-400 hover:text-blue-500 transition-opacity"><Edit2 size={12} /></button>
                      </div>
                    )}

                    <div className="flex items-center gap-1 opacity-0 group-hover/header:opacity-100 transition-opacity">
                      <button onClick={() => onMoveColumn(col, 'left')} disabled={columns.indexOf(col) === 0} className="p-1 hover:bg-slate-200 rounded disabled:opacity-20"><ChevronLeft size={14} className={isDarkMode ? 'text-slate-400' : 'text-slate-600'} /></button>
                      <button onClick={() => onMoveColumn(col, 'right')} disabled={columns.indexOf(col) === columns.length - 1} className="p-1 hover:bg-slate-200 rounded disabled:opacity-20"><ChevronRight size={14} className={isDarkMode ? 'text-slate-400' : 'text-slate-600'} /></button>
                      {columns.length > 1 && <button onClick={() => onDeleteColumn(col)} className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded"><Trash2 size={14} /></button>}
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto min-h-[50px] pr-1 custom-scrollbar">
                    {colTasks.map(task => (<TaskCard key={task.id} task={task} user={user} onDragStart={onDragStart} onDelete={handleDeleteTask} onEdit={handleEditTask} onClone={onClone} isDarkMode={isDarkMode} onToggleTimer={handleToggleTimer} />))}
                  </div>
                  {activeCol === col ? (
                    <div className={`mt-2 p-2 rounded shadow-sm border ${isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-white border-blue-300'}`}>
                      <textarea autoFocus placeholder="Title..." className={`w-full text-sm resize-none outline-none ${isDarkMode ? 'bg-slate-700 text-white' : 'text-slate-700'}`} rows={2} value={quickTitle} onChange={(e) => setQuickTitle(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleQuickSubmit(col)} />
                      <button onClick={() => handleQuickSubmit(col)} className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded mt-2">Add</button>
                    </div>
                  ) : (
                    <button onClick={() => { setActiveCol(col); setQuickTitle(''); }} className={`mt-2 flex items-center gap-2 p-2 rounded text-sm w-full ${isDarkMode ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-500 hover:bg-slate-200'}`}><Plus size={16} /> Add card</button>
                  )}
                </div>
              );
            })}
            <div className="min-w-[300px]">
              {isAddingCol ? (
                <form onSubmit={(e) => { e.preventDefault(); if (newColName.trim()) { onAddColumn(newColName); setNewColName(''); setIsAddingCol(false) } }} className={`p-3 rounded-lg border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'}`}>
                  <input autoFocus type="text" placeholder="Column Name..." className={`w-full p-2 text-sm border rounded mb-2 ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'border-slate-300'}`} value={newColName} onChange={(e) => setNewColName(e.target.value)} />
                  <button type="submit" className="bg-blue-600 text-white text-sm font-bold px-3 py-1.5 rounded">Add</button>
                </form>
              ) : (
                <button onClick={() => setIsAddingCol(true)} className={`w-full p-3 rounded-lg flex items-center gap-2 font-bold border-2 border-dashed ${isDarkMode ? 'bg-slate-800 hover:bg-slate-800 text-slate-400 border-slate-700' : 'bg-slate-100 hover:bg-slate-100 text-slate-500 border-slate-200'}`}><Plus size={20} /> Add Column</button>
              )}
            </div>
          </div>
        </div>
      )}

      {viewMode === 'list' && (
        <div className={`flex-1 overflow-auto p-8 ${isDarkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
          <div className={`rounded-lg shadow-sm border overflow-hidden ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
            <table className={`w-full text-left text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              <thead className={`border-b font-bold uppercase text-xs ${isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                <tr><th className="px-6 py-4">Status</th><th className="px-6 py-4 w-1/3">Summary</th><th className="px-6 py-4">Assignee</th><th className="px-6 py-4">Priority</th><th className="px-6 py-4">Due Date</th><th className="px-6 py-4 text-right">Actions</th></tr>
              </thead>
              <tbody className={`divide-y ${isDarkMode ? 'divide-slate-700' : 'divide-slate-100'}`}>
                {getSortedTasks(visibleTasks).map(task => (
                  <tr key={task.id} className={`transition cursor-pointer ${isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-50'}`} onClick={() => handleEditTask(task)}>
                    <td className="px-6 py-3"><span className={`px-2 py-1 rounded text-xs font-bold ${task.status === 'Done' ? 'bg-green-100 text-green-700' : (isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600')}`}>{task.status}</span></td>
                    <td className={`px-6 py-3 font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{task.title}</td>
                    <td className="px-6 py-3">{task.assignee ? <div className="flex items-center gap-2"><img src={task.assignee.image} className="w-6 h-6 rounded-full" /><span>{task.assignee.firstName}</span></div> : <span className="text-slate-400">Unassigned</span>}</td>
                    <td className="px-6 py-3"><span className={`px-2 py-0.5 rounded border text-[10px] font-bold uppercase ${task.priority === 'High' ? 'bg-red-50 text-red-700' : task.priority === 'Medium' ? 'bg-orange-50 text-orange-700' : 'bg-green-50 text-green-700'}`}>{task.priority}</span></td>
                    <td className="px-6 py-3">{task.dueDate || '-'}</td>
                    <td className="px-6 py-3 text-right"><button onClick={(e) => { e.stopPropagation(); handleDeleteTask(task.id) }} className="p-2 text-slate-400 hover:text-red-500"><Trash2 size={16} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}