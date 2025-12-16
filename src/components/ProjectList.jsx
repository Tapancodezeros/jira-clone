import React, { useState } from 'react';
import { Plus, ArrowRight, Trash2, PieChart } from 'lucide-react';

export default function ProjectList({ projects, tasks, onSelectProject, onAddProject, onDeleteProject }) {
  const [isCreating, setIsCreating] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectKey, setNewProjectKey] = useState('');
  const [selectedColor, setSelectedColor] = useState('bg-blue-600');

  // Available Themes
  const colors = [
    { name: 'Blue', class: 'bg-blue-600' },
    { name: 'Purple', class: 'bg-purple-600' },
    { name: 'Green', class: 'bg-emerald-600' },
    { name: 'Red', class: 'bg-red-600' },
    { name: 'Dark', class: 'bg-slate-800' },
    { name: 'Orange', class: 'bg-orange-600' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newProjectName && newProjectKey) {
      onAddProject({ name: newProjectName, key: newProjectKey, color: selectedColor });
      setNewProjectName('');
      setNewProjectKey('');
      setSelectedColor('bg-blue-600');
      setIsCreating(false);
    }
  };

  // Helper to calculate progress per project
  const getProjectStats = (pid) => {
    const projectTasks = tasks.filter(t => t.projectId === pid);
    const total = projectTasks.length;
    const done = projectTasks.filter(t => t.status === 'Done').length;
    const percent = total === 0 ? 0 : Math.round((done / total) * 100);
    return { total, done, percent };
  };

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      <div className="flex justify-between items-center mb-8">
        <div>
           <h2 className="text-3xl font-bold text-slate-800">Projects</h2>
           <p className="text-slate-500 mt-1">Manage your workstreams</p>
        </div>
        <button 
          onClick={() => setIsCreating(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium flex items-center gap-2 hover:bg-blue-700 transition shadow-sm"
        >
          <Plus size={20} /> Create Project
        </button>
      </div>
      
      {isCreating && (
        <div className="mb-8 bg-white p-6 rounded-lg shadow-lg border border-blue-100 animate-in fade-in slide-in-from-top-4">
          <h3 className="font-bold text-lg mb-4">New Project</h3>
          <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label className="block text-sm font-bold text-slate-700 mb-1">Name</label>
              <input autoFocus type="text" placeholder="e.g. Q4 Marketing" className="w-full p-2 border border-slate-300 rounded" value={newProjectName} onChange={(e) => setNewProjectName(e.target.value)} />
            </div>
            <div className="w-full md:w-32">
              <label className="block text-sm font-bold text-slate-700 mb-1">Key</label>
              <input type="text" placeholder="MKT" className="w-full p-2 border border-slate-300 rounded uppercase" maxLength={4} value={newProjectKey} onChange={(e) => setNewProjectKey(e.target.value)} />
            </div>
            {/* Color Picker */}
            <div className="w-full md:w-auto">
               <label className="block text-sm font-bold text-slate-700 mb-1">Theme</label>
               <div className="flex gap-2">
                 {colors.map(c => (
                   <button 
                     key={c.name} type="button"
                     onClick={() => setSelectedColor(c.class)}
                     className={`w-9 h-9 rounded-full ${c.class} ${selectedColor === c.class ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : 'opacity-70 hover:opacity-100'} transition`}
                     title={c.name}
                   />
                 ))}
               </div>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded font-bold hover:bg-blue-700">Create</button>
              <button type="button" onClick={() => setIsCreating(false)} className="bg-slate-100 text-slate-600 px-4 py-2 rounded font-bold hover:bg-slate-200">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => {
          const stats = getProjectStats(project.id);
          const themeColor = project.color || 'bg-blue-600';

          return (
            <div 
              key={project.id} 
              className="group bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-lg transition-all cursor-pointer relative overflow-hidden"
              onClick={() => onSelectProject(project)}
            >
              <div className={`h-3 w-full ${themeColor}`}></div>
              <div className="p-6">
                 <div className="flex justify-between items-start mb-4">
                   <div className={`w-12 h-12 rounded-lg ${themeColor} bg-opacity-10 flex items-center justify-center text-slate-700 font-bold text-xl shadow-sm border border-slate-100`}>
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
                 <p className="text-sm text-slate-500 font-medium mb-4">Key: {project.key}</p>

                 {/* Analytics Bar */}
                 <div className="mb-6">
                   <div className="flex justify-between text-xs font-semibold text-slate-500 mb-1">
                     <span>Progress</span>
                     <span>{stats.percent}%</span>
                   </div>
                   <div className="w-full bg-slate-100 rounded-full h-2">
                     <div 
                       className={`h-2 rounded-full transition-all duration-500 ${themeColor}`} 
                       style={{ width: `${stats.percent}%` }}
                     ></div>
                   </div>
                   <div className="mt-2 text-xs text-slate-400 flex gap-4">
                     <span className="flex items-center gap-1"><PieChart size={12}/> {stats.done} Done</span>
                     <span>{stats.total - stats.done} Remaining</span>
                   </div>
                 </div>
                 
                 <div className="flex items-center text-blue-600 font-semibold text-sm group-hover:translate-x-1 transition-transform">
                   Open Board <ArrowRight size={16} className="ml-1" />
                 </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}