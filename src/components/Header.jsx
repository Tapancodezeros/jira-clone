import React from 'react';
import { KanbanSquare, LogOut, Plus, Search, Users, Layout, Filter, User, Download, XCircle, Grid } from 'lucide-react';

export default function Header({ 
  user, 
  onLogout, 
  onCreateClick, 
  searchQuery, 
  setSearchQuery, 
  currentView, 
  setView, 
  filterPriority,
  setFilterPriority,
  onExport, 
  onClearFilters,
  activeProject // <--- New Prop: To show which project is active
}) {
  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-wrap justify-between items-center shadow-sm gap-4 sticky top-0 z-10">
      <div className="flex items-center gap-8">
        <h1 
          onClick={() => setView('projects')} 
          className="text-xl font-bold flex items-center gap-2 text-slate-800 cursor-pointer hover:text-blue-600 transition"
        >
          <KanbanSquare className="text-blue-600" /> Jira Clone
        </h1>

        <nav className="hidden md:flex bg-slate-100 p-1 rounded-md">
          {/* Projects Link (Dashboard) */}
          <button 
            onClick={() => setView('projects')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition ${
              currentView === 'projects' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Grid size={16} /> Projects
          </button>
          
          {/* Board Link (Only active if a project is selected) */}
          <button 
            onClick={() => activeProject ? setView('board') : alert('Please select a project first.')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition ${
              currentView === 'board' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
            disabled={!activeProject}
          >
            <Layout size={16} /> {activeProject ? activeProject.key : 'Board'}
          </button>

          <button 
             onClick={() => setView('team')}
             className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition ${
              currentView === 'team' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Users size={16} /> Team
          </button>
        </nav>
      </div>

      {currentView === 'board' && (
        <div className="flex-1 max-w-xl flex gap-3 items-center">
          <div className="flex-1 relative hidden sm:block">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder={`Search in ${activeProject?.key}...`}
              className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="relative group">
            <button className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition ${filterPriority !== 'All' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
              <Filter size={16} /> 
              {filterPriority === 'All' ? 'Filter' : filterPriority}
            </button>
            <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-slate-200 shadow-lg rounded-md hidden group-hover:block z-20">
              {['All', 'High', 'Medium', 'Low'].map(p => (
                <button
                  key={p}
                  onClick={() => setFilterPriority(p)}
                  className={`block w-full text-left px-4 py-2 text-sm hover:bg-slate-50 ${filterPriority === p ? 'text-blue-600 font-bold' : 'text-slate-700'}`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          
          {(searchQuery || filterPriority !== 'All') && (
            <button onClick={onClearFilters} className="text-slate-400 hover:text-red-500" title="Clear Filters">
              <XCircle size={20} />
            </button>
          )}

          <button onClick={onExport} className="text-slate-400 hover:text-blue-600" title="Export CSV">
            <Download size={20} />
          </button>
        </div>
      )}

      <div className="flex items-center gap-4">
        {currentView === 'board' && (
          <button 
            onClick={onCreateClick}
            className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium flex items-center gap-2 hover:bg-blue-700 transition shadow-sm hover:shadow"
          >
            <Plus size={18} /> <span className="hidden sm:inline">Create</span>
          </button>
        )}
        
        <div className="h-8 w-[1px] bg-slate-300 mx-2 hidden sm:block"></div>

        <div className="flex items-center gap-2 group cursor-pointer relative">
           <img src={user.image} alt="avatar" className="w-9 h-9 rounded-full border border-slate-300 bg-slate-100" />
           <div className="absolute right-0 top-10 w-48 bg-white border border-slate-200 rounded shadow-lg p-2 hidden group-hover:block z-50 animate-in fade-in slide-in-from-top-2 duration-150">
             <div className="px-4 py-2 text-sm text-slate-700 font-bold border-b border-slate-100 mb-1">{user.firstName} {user.lastName}</div>
             <button onClick={() => setView('profile')} className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-blue-50 hover:text-blue-600 rounded flex items-center gap-2">
               <User size={16} /> My Profile
             </button>
             <button onClick={onLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded flex items-center gap-2 mt-1">
               <LogOut size={16} /> Logout
             </button>
           </div>
        </div>
      </div>
    </header>
  );
}