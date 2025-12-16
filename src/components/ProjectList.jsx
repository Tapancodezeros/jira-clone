import React, { useState } from 'react';
import { FolderGit2, Plus, ArrowRight, MoreVertical, Trash2 } from 'lucide-react';

export default function ProjectList({ projects, onSelectProject, onAddProject, onDeleteProject }) {
  const [isCreating, setIsCreating] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectKey, setNewProjectKey] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newProjectName && newProjectKey) {
      onAddProject({ name: newProjectName, key: newProjectKey });
      setNewProjectName('');
      setNewProjectKey('');
      setIsCreating(false);
    }
  };

  const colors = [
    'bg-blue-600', 'bg-purple-600', 'bg-green-600', 'bg-orange-600', 'bg-pink-600', 'bg-teal-600'
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      <div className="flex justify-between items-center mb-8">
        <div>
           <h2 className="text-3xl font-bold text-slate-800">Projects</h2>
           <p className="text-slate-500 mt-1">Select a project to view its board</p>
        </div>
        <button 
          onClick={() => setIsCreating(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium flex items-center gap-2 hover:bg-blue-700 transition"
        >
          <Plus size={20} /> Create Project
        </button>
      </div>
      
      {/* Create Project Form (Inline) */}
      {isCreating && (
        <div className="mb-8 bg-white p-6 rounded-lg shadow-lg border border-blue-100 animate-in fade-in slide-in-from-top-4">
          <h3 className="font-bold text-lg mb-4">New Project Details</h3>
          <form onSubmit={handleSubmit} className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-bold text-slate-700 mb-1">Project Name</label>
              <input 
                autoFocus
                type="text" 
                placeholder="e.g. Website Redesign"
                className="w-full p-2 border border-slate-300 rounded"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
              />
            </div>
            <div className="w-32">
              <label className="block text-sm font-bold text-slate-700 mb-1">Key</label>
              <input 
                type="text" 
                placeholder="e.g. WEB"
                className="w-full p-2 border border-slate-300 rounded uppercase"
                maxLength={4}
                value={newProjectKey}
                onChange={(e) => setNewProjectKey(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded font-bold hover:bg-blue-700">Create</button>
              <button type="button" onClick={() => setIsCreating(false)} className="bg-slate-100 text-slate-600 px-4 py-2 rounded font-bold hover:bg-slate-200">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project, index) => (
          <div 
            key={project.id} 
            className="group bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all cursor-pointer relative overflow-hidden"
            onClick={() => onSelectProject(project)}
          >
            <div className={`h-2 w-full ${colors[index % colors.length]}`}></div>
            <div className="p-6">
               <div className="flex justify-between items-start mb-4">
                 <div className={`w-12 h-12 rounded-lg ${colors[index % colors.length]} flex items-center justify-center text-white font-bold text-xl shadow-sm`}>
                   {project.key[0]}
                 </div>
                 <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => { e.stopPropagation(); onDeleteProject(project.id); }}
                      className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full"
                    >
                      <Trash2 size={18} />
                    </button>
                 </div>
               </div>
               
               <h3 className="text-xl font-bold text-slate-800 mb-1">{project.name}</h3>
               <p className="text-sm text-slate-500 font-medium mb-6">Key: {project.key}</p>
               
               <div className="flex items-center text-blue-600 font-semibold text-sm group-hover:translate-x-1 transition-transform">
                 Go to Board <ArrowRight size={16} className="ml-1" />
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}