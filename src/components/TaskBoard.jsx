import React from 'react';
import TaskCard from './TaskCard';

export default function TaskBoard({ tasks, user, onDragStart, onDrop, onDragOver, onDelete, onEdit }) {
  const columns = ['Todo', 'In Progress', 'Done'];

  return (
    <div className="flex-1 overflow-x-auto overflow-y-hidden p-6">
      <div className="flex h-full gap-6 items-start">
        {columns.map(col => (
          <div 
            key={col} 
            className="bg-slate-100 min-w-[300px] w-[350px] rounded-lg p-3 flex flex-col max-h-full border border-slate-200"
            onDragOver={onDragOver}
            onDrop={(e) => onDrop(e, col)}
          >
            <div className="flex justify-between items-center mb-4 px-2">
              <span className="font-semibold text-sm uppercase text-slate-600 tracking-wider flex items-center gap-2">
                {col}
                <span className="bg-slate-300 text-slate-700 text-[10px] px-2 py-0.5 rounded-full">
                  {tasks.filter(t => t.status === col).length}
                </span>
              </span>
            </div>
            
            <div className="flex-1 overflow-y-auto min-h-[150px] pr-1 custom-scrollbar">
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
                  />
                ))}
              {tasks.filter(t => t.status === col).length === 0 && (
                <div className="text-center py-10 text-slate-400 text-sm border-2 border-dashed border-slate-200 rounded">
                  No tasks
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}