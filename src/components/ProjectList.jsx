import React, { useState, useMemo } from 'react';
import { Plus, ArrowRight, Trash2, PieChart, Edit, Search, LayoutGrid, List as ListIcon, SlidersHorizontal } from 'lucide-react';

export default function ProjectList({ projects, tasks, onSelectProject, onAddProject, onEditProject, onDeleteProject }) {
  const [isCreating, setIsCreating] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectKey, setNewProjectKey] = useState('');
  const [selectedColor, setSelectedColor] = useState('bg-blue-600');

  // Advanced States
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name-asc'); // name-asc, name-desc, progress-desc, progress-asc
  const [viewMode, setViewMode] = useState('grid'); // grid, list

  // Available Themes
  const colors = [
    { name: 'Blue', class: 'bg-blue-600' },
    { name: 'Purple', class: 'bg-purple-600' },
    { name: 'Green', class: 'bg-emerald-600' },
    { name: 'Red', class: 'bg-red-600' },
    { name: 'Dark', class: 'bg-slate-800' },
    { name: 'Orange', class: 'bg-orange-600' },
  ];

  const resetForm = () => {
    setNewProjectName('');
    setNewProjectKey('');
    setSelectedColor('bg-blue-600');
    setIsCreating(false);
    setEditingProject(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newProjectName && newProjectKey) {
      if (editingProject) {
        onEditProject({ id: editingProject.id, name: newProjectName, key: newProjectKey, color: selectedColor });
      } else {
        onAddProject({ name: newProjectName, key: newProjectKey, color: selectedColor });
      }
      resetForm();
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

  // Filter and Sort Projects
  const filteredProjects = useMemo(() => {
    let result = [...projects];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(q) || p.key.toLowerCase().includes(q));
    }

    result.sort((a, b) => {
      if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
      if (sortBy === 'name-desc') return b.name.localeCompare(a.name);
      if (sortBy === 'created-desc') return b.id - a.id;

      if (sortBy === 'progress-desc' || sortBy === 'progress-asc') {
        const statsA = getProjectStats(a.id);
        const statsB = getProjectStats(b.id);
        return sortBy === 'progress-desc' ? statsB.percent - statsA.percent : statsA.percent - statsB.percent;
      }
      return 0;
    });

    return result;
  }, [projects, searchQuery, sortBy, tasks]);

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Projects</h2>
          <p className="text-slate-500 mt-1">Manage your workstreams</p>
        </div>
        <button
          onClick={() => { setEditingProject(null); setNewProjectName(''); setNewProjectKey(''); setSelectedColor('bg-blue-600'); setIsCreating(true); }}
          className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium flex items-center gap-2 hover:bg-blue-700 transition shadow-sm whitespace-nowrap"
        >
          <Plus size={20} /> Create Project
        </button>
      </div>

      {/* Advanced Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between animate-in fade-in slide-in-from-top-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search projects by name or key..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-slate-100 text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
              title="Grid View"
            >
              <LayoutGrid size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-slate-100 text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
              title="List View"
            >
              <ListIcon size={18} />
            </button>
          </div>

          <div className="relative bg-white border border-slate-200 rounded-lg flex items-center px-3 py-2 gap-2">
            <SlidersHorizontal size={16} className="text-slate-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-sm font-medium text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="created-desc">Newest First</option>
              <option value="progress-desc">Progress (High)</option>
              <option value="progress-asc">Progress (Low)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Create/Edit Form */}
      {isCreating && (
        <div className="mb-8 bg-white p-6 rounded-lg shadow-lg border border-blue-100 animate-in fade-in slide-in-from-top-4">
          <h3 className="font-bold text-lg mb-4">{editingProject ? 'Edit Project' : 'New Project'}</h3>
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
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded font-bold hover:bg-blue-700">{editingProject ? 'Save Changes' : 'Create'}</button>
              <button type="button" onClick={resetForm} className="bg-slate-100 text-slate-600 px-4 py-2 rounded font-bold hover:bg-slate-200">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Projects List/Grid */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
          <p className="text-slate-500 font-medium">No projects found matching your criteria.</p>
          {(searchQuery || sortBy !== 'name-asc') && (
            <button onClick={() => { setSearchQuery(''); setSortBy('name-asc'); }} className="text-blue-600 text-sm mt-2 hover:underline">Clear Filters</button>
          )}
        </div>
      ) : (
        <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "flex flex-col gap-3"}>
          {filteredProjects.map((project) => {
            const stats = getProjectStats(project.id);
            const themeColor = project.color || 'bg-blue-600';

            // LIST VIEW CARD
            if (viewMode === 'list') {
              return (
                <div
                  key={project.id}
                  onClick={() => onSelectProject(project)}
                  className="group bg-white rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-all cursor-pointer flex items-center p-4 gap-6"
                >
                  <div className={`w-10 h-10 rounded-md ${themeColor} bg-opacity-10 flex items-center justify-center text-slate-700 font-bold text-lg`}>
                    {project.key[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold text-slate-800 truncate">{project.name}</h3>
                    <p className="text-xs text-slate-500 font-medium">Key: {project.key}</p>
                  </div>

                  <div className="hidden md:block w-48">
                    <div className="flex justify-between text-xs font-semibold text-slate-500 mb-1">
                      <span>Progress</span>
                      <span>{stats.percent}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5">
                      <div className={`h-1.5 rounded-full ${themeColor}`} style={{ width: `${stats.percent}%` }}></div>
                    </div>
                  </div>

                  <div className="hidden sm:flex gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded"><PieChart size={12} /> {stats.done}/{stats.total} Tasks</span>
                  </div>

                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => { e.stopPropagation(); setEditingProject(project); setNewProjectName(project.name); setNewProjectKey(project.key); setSelectedColor(project.color || 'bg-blue-600'); setIsCreating(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                      className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded text-center"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onDeleteProject(project.id); }}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded text-center"
                    >
                      <Trash2 size={16} />
                    </button>
                    <ArrowRight size={18} className="text-slate-300 group-hover:text-blue-600 ml-2" />
                  </div>
                </div>
              );
            }

            // GRID VIEW CARD
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
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); setEditingProject(project); setNewProjectName(project.name); setNewProjectKey(project.key); setSelectedColor(project.color || 'bg-blue-600'); setIsCreating(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        className="p-2 text-slate-300 hover:text-blue-500 hover:bg-blue-50 rounded-full"
                      >
                        <Edit size={18} />
                      </button>
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
                      <span className="flex items-center gap-1"><PieChart size={12} /> {stats.done} Done</span>
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
      )}
    </div>
  );
}