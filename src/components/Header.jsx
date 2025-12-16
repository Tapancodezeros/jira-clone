import React from 'react';
import { KanbanSquare, LogOut, Plus, Search, Users, Layout, Filter, User, Moon, Sun, Upload, Download, Grid, XCircle } from 'lucide-react';

export default function Header({ 
  user, onLogout, onCreateClick, searchQuery, setSearchQuery, 
  currentView, setView, activeProject, filterPriority, setFilterPriority, 
  onClearFilters, isDarkMode, toggleDarkMode, onExportJSON, onImportJSON 
}) {
  return (
    <header className={`border-b px-6 py-4 flex flex-wrap justify-between items-center shadow-sm gap-4 sticky top-0 z-20 transition-colors duration-300 ${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'}`}>
      
      <div className="flex items-center gap-8">
        <h1 onClick={() => setView('projects')} className="text-xl font-bold flex items-center gap-2 cursor-pointer hover:text-blue-500 transition"><KanbanSquare className="text-blue-600" /> Jira Clone</h1>
        <nav className={`hidden md:flex p-1 rounded-md ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
          {[{id:'projects', label:'Projects', icon:Grid}, {id:'board', label:activeProject?.key || 'Board', icon:Layout}, {id:'team', label:'Team', icon:Users}].map(nav => (
             <button key={nav.id} onClick={() => nav.id === 'board' && !activeProject ? alert('Select a project first') : setView(nav.id)} disabled={nav.id==='board' && !activeProject} className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition ${currentView === nav.id ? (isDarkMode ? 'bg-slate-700 text-white shadow' : 'bg-white text-blue-700 shadow') : 'text-slate-500 hover:text-slate-400'}`}><nav.icon size={16}/> {nav.label}</button>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <button onClick={toggleDarkMode} className={`p-2 rounded-full transition ${isDarkMode ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{isDarkMode ? <Sun size={18} /> : <Moon size={18} />}</button>
        {currentView === 'board' && (
          <div className="flex items-center gap-2">
            <div className="relative hidden sm:block"><Search className="absolute left-3 top-2.5 text-slate-400" size={18} /><input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className={`pl-9 pr-4 py-2 rounded-md border-none focus:ring-2 focus:ring-blue-500 outline-none w-32 focus:w-48 transition-all ${isDarkMode ? 'bg-slate-800 text-white placeholder:text-slate-500' : 'bg-slate-100 text-slate-900'}`}/></div>
            <div className="flex gap-1"><button onClick={onExportJSON} className="p-2 text-slate-400 hover:text-blue-500"><Download size={20}/></button><label className="p-2 text-slate-400 hover:text-blue-500 cursor-pointer"><Upload size={20}/><input type="file" className="hidden" accept=".json" onChange={onImportJSON} /></label></div>
            <button onClick={onCreateClick} className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium flex items-center gap-2 hover:bg-blue-700 transition shadow-sm"><Plus size={18} /> <span className="hidden sm:inline">Create</span></button>
          </div>
        )}
        <div className="h-8 w-[1px] bg-slate-300 mx-2 hidden sm:block"></div>
        <div className="relative group cursor-pointer">
           <img src={user.image} alt="avatar" className="w-9 h-9 rounded-full border border-slate-300 bg-slate-100" />
           <div className="absolute right-0 top-10 w-48 bg-white border border-slate-200 rounded shadow-lg p-2 hidden group-hover:block z-50">
             <div className="px-4 py-2 text-sm text-slate-700 font-bold border-b border-slate-100 mb-1">{user.firstName}</div>
             <button onClick={() => setView('profile')} className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-blue-50 hover:text-blue-600 rounded flex items-center gap-2"><User size={16} /> My Profile</button>
             <button onClick={onLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded flex items-center gap-2 mt-1"><LogOut size={16} /> Logout</button>
           </div>
        </div>
      </div>
    </header>
  );
}