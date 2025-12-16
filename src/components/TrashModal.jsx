import React from 'react';
import { X, RefreshCcw, Trash2, Archive } from 'lucide-react';

export default function TrashModal({ isOpen, onClose, tasks, onRestore, onPermanentDelete }) {
  if (!isOpen) return null;

  // Filter for tasks that are marked as archived
  const archivedTasks = tasks.filter(t => t.isArchived);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl flex flex-col max-h-[80vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Archive className="text-red-500" /> Trash Bin
          </h2>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* List of Deleted Tasks */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-slate-50">
          {archivedTasks.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={32} className="opacity-40" />
              </div>
              <p className="font-medium">The trash is empty.</p>
              <p className="text-sm mt-1">Tasks deleted from the board appear here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {archivedTasks.map(task => (
                <div key={task.id} className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex justify-between items-center hover:shadow-md transition">
                  <div>
                    <h3 className="font-bold text-slate-700 line-through decoration-slate-400 decoration-2">{task.title}</h3>
                    <div className="flex gap-2 text-xs text-slate-400 mt-1 font-mono">
                      <span>ID: {task.id}</span>
                      <span>•</span>
                      <span>{task.history?.[task.history.length-1]?.timestamp || 'Unknown Date'}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => onRestore(task.id)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded border border-green-200 text-xs font-bold transition"
                      title="Restore to Board"
                    >
                      <RefreshCcw size={14} /> Restore
                    </button>
                    <button 
                      onClick={() => onPermanentDelete(task.id)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded border border-red-200 text-xs font-bold transition"
                      title="Delete Forever"
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-white rounded-b-lg flex justify-between items-center text-xs text-slate-400">
          <span>Items in trash are safe until permanently deleted.</span>
          <button onClick={onClose} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded font-bold transition">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}