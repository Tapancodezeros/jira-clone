import React, { useState } from 'react';
import TaskCard from './TaskCard';
import { Plus, X, Trash2 } from 'lucide-react';

export default function TaskBoard({ 
  tasks, 
  columns, 
  user, 
  onDragStart, 
  onDrop, 
  onDragOver, 
  onDelete, 
  onEdit, 
  onQuickAdd, 
  onAddColumn, 
  onDeleteColumn,
  onClone // <--- Passed from App
}) {
  
  const [activeCol, setActiveCol] = useState(null);
  const [quickTitle, setQuickTitle] = useState('');
  const [newColName, setNewColName] = useState('');
  const [isAddingCol, setIsAddingCol] = useState(false);

  // Handle Quick Add Submission
  const handleQuickSubmit = (col) => {
    if (quickTitle.trim()) {
      onQuickAdd(quickTitle, col);
      setQuickTitle('');
      setActiveCol(null);
    }
  };

  // Handle New Column Submission
  const handleAddColSubmit = (e) => {
    e.preventDefault();
    if(newColName.trim()) {
      onAddColumn(newColName.trim());
      setNewColName('');
      setIsAddingCol(false);
    }
  };

  return (
    <div className="flex-1 overflow-x-auto overflow-y-hidden p-6">
      <div className="flex h-full gap-6 items-start">
        
        {/* --- Render Columns --- */}
        {columns.map(col => (
          <div 
            key={col} 
            className="bg-slate-100 min-w-[300px] w-[350px] rounded-lg p-3 flex flex-col max-h-full border border-slate-200 group/col relative"
            onDragOver={onDragOver}
            onDrop={(e) => onDrop(e, col)}
          >
            {/* Column Header */}
            <div className="flex justify-between items-center mb-4 px-2">
              <span className="font-semibold text-sm uppercase text-slate-600 tracking-wider flex items-center gap-2">
                {col}
                <span className="bg-slate-300 text-slate-700 text-[10px] px-2 py-0.5 rounded-full">
                  {tasks.filter(t => t.status === col).length}
                </span>
              </span>
              
              {/* Delete Column Button (Only if > 1 column) */}
              {columns.length > 1 && (
                <button 
                  onClick={() => onDeleteColumn(col)} 
                  className="text-slate-300 hover:text-red-500 opacity-0 group-hover/col:opacity-100 transition"
                  title="Delete Column"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
            
            {/* Task List (Scrollable) */}
            <div className="flex-1 overflow-y-auto min-h-[50px] pr-1 custom-scrollbar">
              {tasks
                .filter(task => task.status === col)
                .map(task => (
                  <TaskCard 
                    key={task.id} 
                    task={task} 
                    user={user} 
                    onDragStart={onDragStart} 
                    onDelete={onDelete} 
                    onEdit={onEdit} 
                    onClone={onClone} 
                  />
              ))}
            </div>

            {/* Inline Quick Add */}
            {activeCol === col ? (
              <div className="mt-2 p-2 bg-white rounded shadow-sm border border-blue-300 animate-in fade-in zoom-in-95 duration-200">
                <textarea 
                  autoFocus 
                  placeholder="What needs to be done?" 
                  className="w-full text-sm resize-none outline-none text-slate-700 placeholder:text-slate-400" 
                  rows={2} 
                  value={quickTitle} 
                  onChange={(e) => setQuickTitle(e.target.value)} 
                  onKeyDown={(e) => e.key === 'Enter' && handleQuickSubmit(col)}
                />
                <div className="flex justify-between items-center mt-2">
                   <button 
                     onClick={() => handleQuickSubmit(col)} 
                     className="bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded hover:bg-blue-700 transition"
                   >
                     Add Card
                   </button>
                   <button onClick={() => setActiveCol(null)} className="text-slate-400 hover:text-slate-600">
                     <X size={18} />
                   </button>
                </div>
              </div>
            ) : (
              <button 
                onClick={() => { setActiveCol(col); setQuickTitle(''); }} 
                className="mt-2 flex items-center gap-2 text-slate-500 hover:bg-slate-200/50 hover:text-slate-700 p-2 rounded transition text-sm font-medium w-full"
              >
                <Plus size={16} /> Add a card
              </button>
            )}
          </div>
        ))}

        {/* --- ADD NEW COLUMN BUTTON --- */}
        <div className="min-w-[300px]">
          {isAddingCol ? (
            <form onSubmit={handleAddColSubmit} className="bg-slate-100 p-3 rounded-lg border border-slate-200 shadow-sm">
              <input 
                autoFocus 
                type="text" 
                placeholder="Column Name..." 
                className="w-full p-2 text-sm border border-slate-300 rounded mb-2 outline-none focus:border-blue-500"
                value={newColName} 
                onChange={(e) => setNewColName(e.target.value)}
              />
              <div className="flex gap-2">
                <button type="submit" className="bg-blue-600 text-white text-sm font-bold px-3 py-1.5 rounded hover:bg-blue-700">Add Column</button>
                <button type="button" onClick={() => setIsAddingCol(false)} className="text-slate-500 hover:text-slate-700"><X size={20}/></button>
              </div>
            </form>
          ) : (
            <button 
              onClick={() => setIsAddingCol(true)}
              className="w-full bg-slate-100/50 hover:bg-slate-100 text-slate-500 hover:text-slate-700 p-3 rounded-lg flex items-center gap-2 font-bold border-2 border-dashed border-slate-200 transition"
            >
              <Plus size={20} /> Add Column
            </button>
          )}
        </div>

      </div>
    </div>
  );
}