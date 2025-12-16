import React, { useState } from 'react';
import TaskCard from './TaskCard';
import { Plus, X, Trash2, LayoutGrid, List, Calendar, User, AlertOctagon } from 'lucide-react';

export default function TaskBoard({ 
  tasks, columns, user, onDragStart, onDrop, onDragOver, 
  onDelete, onEdit, onQuickAdd, onAddColumn, onDeleteColumn, onClone, isDarkMode 
}) {
  const [viewMode, setViewMode] = useState('board'); // 'board' or 'list'
  const [activeCol, setActiveCol] = useState(null);
  const [quickTitle, setQuickTitle] = useState('');
  const [newColName, setNewColName] = useState('');
  const [isAddingCol, setIsAddingCol] = useState(false);

  const WIP_LIMIT = 5; // Max tasks per column

  const handleQuickSubmit = (col) => {
    if (quickTitle.trim()) {
      onQuickAdd(quickTitle, col);
      setQuickTitle('');
      setActiveCol(null);
    }
  };

  const handleAddColSubmit = (e) => {
    e.preventDefault();
    if(newColName.trim()) {
      onAddColumn(newColName.trim());
      setNewColName('');
      setIsAddingCol(false);
    }
  };

  return (
    <div className={`flex-1 flex flex-col overflow-hidden h-full transition-colors duration-300 ${isDarkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
      
      {/* --- VIEW SWITCHER BAR --- */}
      <div className={`px-6 py-3 border-b flex justify-between items-center z-10 ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
        <div className={`flex p-1 rounded-lg ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
          <button 
            onClick={() => setViewMode('board')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition ${
              viewMode === 'board' 
                ? (isDarkMode ? 'bg-slate-700 text-white shadow' : 'bg-white shadow-sm text-blue-600') 
                : (isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700')
            }`}
          >
            <LayoutGrid size={14} /> Board
          </button>
          <button 
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition ${
              viewMode === 'list' 
                ? (isDarkMode ? 'bg-slate-700 text-white shadow' : 'bg-white shadow-sm text-blue-600') 
                : (isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700')
            }`}
          >
            <List size={14} /> List
          </button>
        </div>
        <div className={`text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
          {tasks.length} Issues
        </div>
      </div>

      {/* --- BOARD VIEW --- */}
      {viewMode === 'board' && (
        <div className="flex-1 overflow-x-auto overflow-y-hidden p-6">
          <div className="flex h-full gap-6 items-start">
            {columns.map(col => {
              const colTasks = tasks.filter(t => t.status === col);
              const isOverLimit = colTasks.length > WIP_LIMIT;
              
              return (
                <div 
                  key={col} 
                  className={`min-w-[300px] w-[350px] rounded-lg p-3 flex flex-col max-h-full border transition-colors ${
                    isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'
                  } ${isOverLimit ? 'border-red-400 ring-1 ring-red-400' : ''}`}
                  onDragOver={onDragOver}
                  onDrop={(e) => onDrop(e, col)}
                >
                  <div className="flex justify-between items-center mb-4 px-2">
                    <span className={`font-semibold text-sm uppercase tracking-wider flex items-center gap-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      {col} 
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        isOverLimit ? 'bg-red-100 text-red-600' : (isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-300 text-slate-700')
                      }`}>
                        {colTasks.length}
                      </span>
                      {isOverLimit && <AlertOctagon size={14} className="text-red-500" title="WIP Limit Exceeded!" />}
                    </span>
                    {columns.length > 1 && (
                      <button onClick={() => onDeleteColumn(col)} className="text-slate-400 hover:text-red-500 transition"><Trash2 size={16} /></button>
                    )}
                  </div>
                  
                  <div className="flex-1 overflow-y-auto min-h-[50px] pr-1 custom-scrollbar">
                    {colTasks.map(task => (
                        <TaskCard key={task.id} task={task} user={user} onDragStart={onDragStart} onDelete={onDelete} onEdit={onEdit} onClone={onClone} isDarkMode={isDarkMode} />
                    ))}
                  </div>

                  {activeCol === col ? (
                    <div className={`mt-2 p-2 rounded shadow-sm border animate-in fade-in zoom-in-95 duration-200 ${isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-white border-blue-300'}`}>
                      <textarea autoFocus placeholder="Task title..." className={`w-full text-sm resize-none outline-none ${isDarkMode ? 'bg-slate-700 text-white placeholder:text-slate-400' : 'text-slate-700'}`} rows={2} value={quickTitle} onChange={(e) => setQuickTitle(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleQuickSubmit(col)}/>
                      <div className="flex justify-between mt-2">
                        <button onClick={() => handleQuickSubmit(col)} className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded">Add</button>
                        <button onClick={() => setActiveCol(null)}><X size={16} className="text-slate-400"/></button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => { setActiveCol(col); setQuickTitle(''); }} className={`mt-2 flex items-center gap-2 p-2 rounded transition text-sm font-medium w-full ${isDarkMode ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-500 hover:bg-slate-200/50'}`}><Plus size={16} /> Add card</button>
                  )}
                </div>
              );
            })}

            <div className="min-w-[300px]">
              {isAddingCol ? (
                <form onSubmit={handleAddColSubmit} className={`p-3 rounded-lg border shadow-sm ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'}`}>
                  <input autoFocus type="text" placeholder="Column Name..." className={`w-full p-2 text-sm border rounded mb-2 outline-none ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'border-slate-300'}`} value={newColName} onChange={(e) => setNewColName(e.target.value)}/>
                  <div className="flex gap-2">
                    <button type="submit" className="bg-blue-600 text-white text-sm font-bold px-3 py-1.5 rounded">Add</button>
                    <button type="button" onClick={() => setIsAddingCol(false)} className="text-slate-500"><X size={20}/></button>
                  </div>
                </form>
              ) : (
                <button onClick={() => setIsAddingCol(true)} className={`w-full p-3 rounded-lg flex items-center gap-2 font-bold border-2 border-dashed transition ${isDarkMode ? 'bg-slate-800/50 hover:bg-slate-800 text-slate-400 border-slate-700' : 'bg-slate-100/50 hover:bg-slate-100 text-slate-500 border-slate-200'}`}><Plus size={20} /> Add Column</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- LIST VIEW --- */}
      {viewMode === 'list' && (
        <div className={`flex-1 overflow-auto p-8 ${isDarkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
          <div className={`rounded-lg shadow-sm border overflow-hidden ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
            <table className={`w-full text-left text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              <thead className={`border-b font-bold uppercase text-xs ${isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                <tr>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 w-1/3">Summary</th>
                  <th className="px-6 py-4">Assignee</th>
                  <th className="px-6 py-4">Priority</th>
                  <th className="px-6 py-4">Due Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDarkMode ? 'divide-slate-700' : 'divide-slate-100'}`}>
                {tasks.map(task => (
                  <tr 
                    key={task.id} 
                    className={`transition cursor-pointer ${isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-50'}`} 
                    onClick={() => onEdit(task)}
                  >
                    <td className="px-6 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        task.status === 'Done' 
                          ? 'bg-green-100 text-green-700' 
                          : (isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600')
                      }`}>
                        {task.status}
                      </span>
                    </td>
                    <td className={`px-6 py-3 font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{task.title}</td>
                    <td className="px-6 py-3">
                      {task.assignee ? (
                        <div className="flex items-center gap-2">
                          <img src={task.assignee.image} className="w-6 h-6 rounded-full border border-slate-200" alt="assignee" />
                          <span>{task.assignee.firstName}</span>
                        </div>
                      ) : <span className="text-slate-400 flex items-center gap-1"><User size={14}/> Unassigned</span>}
                    </td>
                    <td className="px-6 py-3">
                       <span className={`px-2 py-0.5 rounded border text-[10px] font-bold uppercase ${
                         task.priority === 'High' ? 'bg-red-50 text-red-700 border-red-200' : 
                         task.priority === 'Medium' ? 'bg-orange-50 text-orange-700 border-orange-200' : 
                         'bg-green-50 text-green-700 border-green-200'
                       }`}>
                         {task.priority}
                       </span>
                    </td>
                    <td className="px-6 py-3">
                      {task.dueDate ? (
                        <span className="flex items-center gap-1 opacity-70"><Calendar size={14}/> {new Date(task.dueDate).toLocaleDateString()}</span>
                      ) : <span className="text-slate-400">-</span>}
                    </td>
                    <td className="px-6 py-3 text-right">
                       <button onClick={(e) => { e.stopPropagation(); onDelete(task.id) }} className="p-2 text-slate-400 hover:text-red-500 rounded"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {tasks.length === 0 && <div className="p-12 text-center text-slate-500">No tasks found.</div>}
          </div>
        </div>
      )}
    </div>
  );
}