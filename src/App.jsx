import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trash2 } from 'lucide-react';

// Components
import LoginPage from './components/LoginPage';
import Header from './components/Header';
import ProjectList from './components/ProjectList';
import TaskBoard from './components/TaskBoard';
import TaskModal from './components/TaskModal';
import TrashModal from './components/TrashModal';
import TeamMembers from './components/TeamMembers';
import UserProfile from './components/UserProfile';
import Footer from './components/Footer';
import Toast from './components/Toast';

const API_URL = 'https://dummyjson.com';

const DEFAULT_PROJECTS = [
  { id: 101, name: 'Web Development', key: 'WEB', color: 'bg-blue-600' },
  { id: 102, name: 'Mobile App', key: 'MOB', color: 'bg-purple-600' }
];

export default function App() {
  // --- Global State ---
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // --- Data State ---
  const [projects, setProjects] = useState(DEFAULT_PROJECTS);
  const [tasks, setTasks] = useState([]);
  const [team, setTeam] = useState([]);
  const [columns, setColumns] = useState(['Todo', 'In Progress', 'Done']);

  // --- UI State ---
  const [activeProject, setActiveProject] = useState(null);
  const [currentView, setCurrentView] = useState('projects'); // 'projects', 'board', 'team', 'profile'
  
  // --- Modals & Overlays ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTrashOpen, setIsTrashOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [toast, setToast] = useState(null);

  // --- Filters ---
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState('All');

  const showToast = (message, type = 'success') => setToast({ message, type });

  // --- 1. INITIAL LOAD & PERSISTENCE ---
  useEffect(() => {
    // Load User
    const savedUser = localStorage.getItem('jira_user');
    if (savedUser) { 
      setUser(JSON.parse(savedUser)); 
      loadData(); 
    } else { 
      setLoading(false); 
    }

    // Load Theme
    const savedTheme = localStorage.getItem('jira_theme');
    if (savedTheme === 'dark') setIsDarkMode(true);
  }, []);

  // Save changes to LocalStorage
  useEffect(() => { if(tasks.length > 0) localStorage.setItem('jira_tasks', JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => { localStorage.setItem('jira_projects', JSON.stringify(projects)); }, [projects]);
  useEffect(() => { localStorage.setItem('jira_columns', JSON.stringify(columns)); }, [columns]);
  useEffect(() => { localStorage.setItem('jira_theme', isDarkMode ? 'dark' : 'light'); }, [isDarkMode]);

  // --- 2. KEYBOARD SHORTCUTS ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl/Cmd + K (Search Focus)
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // You can add id="search-input" to the input in Header.jsx to make this work perfectly
        const input = document.querySelector('input[type="text"]'); 
        if(input) input.focus();
      }
      // Shift + N (New Task)
      if (e.shiftKey && e.key === 'N' && currentView === 'board') {
         e.preventDefault();
         setEditingTask(null);
         setIsModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentView]);

  // --- 3. DATA LOADING ---
  const loadData = () => {
    const savedProjects = localStorage.getItem('jira_projects');
    if (savedProjects) setProjects(JSON.parse(savedProjects));

    const savedCols = localStorage.getItem('jira_columns');
    if (savedCols) setColumns(JSON.parse(savedCols));

    fetch(`${API_URL}/users?limit=10`).then(res => res.json()).then(data => setTeam(data.users));

    const savedTasks = localStorage.getItem('jira_tasks');
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
      setLoading(false);
    } else {
      // Initialize with Dummy Data
      fetch(`${API_URL}/todos?limit=12&skip=3`)
        .then(res => res.json())
        .then(data => {
          const formattedTasks = data.todos.map((t, index) => ({
            id: t.id,
            title: t.todo,
            status: 'Todo',
            userId: t.userId,
            priority: ['High', 'Medium', 'Low'][Math.floor(Math.random() * 3)],
            projectId: index % 2 === 0 ? 101 : 102, // Assign to default projects
            dueDate: '', comments: [], tags: [], subtasks: [], 
            assignee: null, attachments: [], history: [], isArchived: false
          }));
          setTasks(formattedTasks);
          setLoading(false);
        });
    }
  };

  // --- 4. AUTH HANDLERS ---
  const handleLogin = (u) => { 
    setUser(u); 
    localStorage.setItem('jira_user', JSON.stringify(u)); 
    loadData(); 
    showToast(`Welcome back, ${u.firstName}!`, 'info');
  };

  const handleLogout = () => { 
    setUser(null); 
    localStorage.removeItem('jira_user'); 
    setCurrentView('projects'); 
    setActiveProject(null); 
  };

  const handleUpdateUser = (updatedData) => {
    setUser(updatedData);
    localStorage.setItem('jira_user', JSON.stringify(updatedData));
    
    // Update local team cache so avatars update instantly
    setTeam(prev => prev.map(m => m.id === updatedData.id ? updatedData : m));
    
    // Update local storage signup record
    const localUsers = JSON.parse(localStorage.getItem('jira_local_users') || '[]');
    const newLocalUsers = localUsers.map(u => u.id === updatedData.id ? updatedData : u);
    localStorage.setItem('jira_local_users', JSON.stringify(newLocalUsers));

    showToast('Profile updated', 'success');
  };

  // --- 5. PROJECT HANDLERS ---
  const handleSelectProject = (project) => { setActiveProject(project); setCurrentView('board'); };
  
  const handleSetView = (view) => {
    if (view === 'projects') setActiveProject(null);
    setCurrentView(view);
  };

  const handleAddProject = (project) => {
    const newProject = { ...project, id: Date.now() };
    setProjects([...projects, newProject]);
    showToast(`Project "${project.name}" created`);
  };

  const handleDeleteProject = (projectId) => {
    if(confirm('Delete project? All tasks will be deleted.')) {
       setProjects(projects.filter(p => p.id !== projectId));
       setTasks(tasks.filter(t => t.projectId !== projectId));
       showToast('Project deleted', 'info');
    }
  };

  // --- 6. TASK CRUD HANDLERS ---
  const createHistoryEntry = (action) => ({
    id: Date.now(),
    action,
    user: { firstName: user.firstName, lastName: user.lastName },
    timestamp: new Date().toLocaleString()
  });

  const handleSaveTask = (taskData) => {
    if (editingTask) {
      setTasks(tasks.map(t => {
        if (t.id === editingTask.id) {
          const newHistory = [...(t.history || []), createHistoryEntry('Updated task')];
          return { ...t, ...taskData, history: newHistory };
        }
        return t;
      }));
      showToast('Task updated');
    } else {
      const newTask = {
        id: Date.now(),
        status: columns[0],
        userId: user.id,
        projectId: activeProject.id,
        ...taskData,
        isArchived: false,
        history: [createHistoryEntry('Created task')]
      };
      setTasks([newTask, ...tasks]);
      showToast('Task created');
    }
    setIsModalOpen(false);
    setEditingTask(null);
  };

  const handleQuickAddTask = (title, status) => {
    const newTask = {
      id: Date.now(),
      title,
      status,
      userId: user.id,
      projectId: activeProject.id,
      priority: 'Medium',
      isArchived: false,
      tags: [], comments: [], subtasks: [], assignee: null, attachments: [],
      history: [createHistoryEntry('Quick Added')]
    };
    setTasks([newTask, ...tasks]);
    showToast('Task added');
  };

  const handleCloneTask = (task) => {
    const cloned = { 
      ...task, 
      id: Date.now(), 
      title: `${task.title} (Copy)`,
      history: [...(task.history || []), createHistoryEntry(`Cloned from #${task.id}`)]
    };
    setTasks([cloned, ...tasks]);
    showToast('Task cloned');
  };

  const handleArchiveTask = (taskId) => {
    if(confirm('Move to Trash?')) {
      setTasks(tasks.map(t => t.id === taskId ? { ...t, isArchived: true } : t));
      showToast('Moved to Trash', 'info');
    }
  };

  const handleRestoreTask = (taskId) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, isArchived: false } : t));
    showToast('Task Restored');
  };

  const handlePermanentDelete = (taskId) => {
    if(confirm('Delete forever? This cannot be undone.')) {
      setTasks(tasks.filter(t => t.id !== taskId));
      showToast('Deleted permanently', 'error');
    }
  };

  // --- 7. DRAG & DROP ---
  const onDragStart = (e, id) => e.dataTransfer.setData("taskId", id);
  const onDragOver = (e) => e.preventDefault();
  const onDrop = (e, targetStatus) => {
    const id = parseInt(e.dataTransfer.getData("taskId"));
    setTasks(prev => prev.map(task => {
      if (task.id === id && task.status !== targetStatus) {
        // Confetti on Done
        if (targetStatus === 'Done') confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        
        const newHistory = [...(task.history || []), createHistoryEntry(`Moved to ${targetStatus}`)];
        return { ...task, status: targetStatus, history: newHistory };
      }
      return task;
    }));
  };

  // --- 8. UTILITIES (Export/Import/Theme) ---
  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  const handleExportCSV = () => {
    const rows = filteredTasks.map(t => [t.id, `"${t.title.replace(/"/g, '""')}"`, t.status, t.priority, t.dueDate || ""]);
    const csvContent = ["ID,Title,Status,Priority,Due Date"].concat(rows.map(r => r.join(","))).join("\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([csvContent], { type: 'text/csv' }));
    link.download = `${activeProject?.key || 'Board'}_export.csv`;
    link.click();
  };

  const handleExportJSON = () => {
    const data = { tasks, projects, columns, version: 1.0 };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `jira_backup_${Date.now()}.json`;
    link.click();
    showToast('Backup downloaded');
  };

  const handleImportJSON = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (data.tasks) setTasks(data.tasks);
        if (data.projects) setProjects(data.projects);
        if (data.columns) setColumns(data.columns);
        showToast('Data restored successfully', 'success');
      } catch (err) {
        showToast('Invalid JSON file', 'error');
      }
    };
    reader.readAsText(file);
  };

  // --- 9. FILTERING ---
  const filteredTasks = tasks.filter(t => {
    if (t.isArchived) return false;
    if (!activeProject || t.projectId !== activeProject.id) return false;
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = filterPriority === 'All' || t.priority === filterPriority;
    return matchesSearch && matchesPriority;
  });

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${isDarkMode ? 'bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      {!user ? (
        <LoginPage onLogin={handleLogin} />
      ) : (
        <>
          {/* --- HEADER --- */}
          <Header 
            user={user} onLogout={handleLogout} onCreateClick={() => { setEditingTask(null); setIsModalOpen(true); }}
            searchQuery={searchQuery} setSearchQuery={setSearchQuery}
            currentView={currentView} setView={handleSetView} activeProject={activeProject}
            filterPriority={filterPriority} setFilterPriority={setFilterPriority}
            onClearFilters={() => { setSearchQuery(''); setFilterPriority('All'); }}
            isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode}
            onExportJSON={handleExportJSON} onImportJSON={handleImportJSON} onExport={handleExportCSV}
          />

          {/* --- TRASH TOGGLE (Fixed) --- */}
          <div className="fixed bottom-6 left-6 z-50">
             <button 
               onClick={() => setIsTrashOpen(true)}
               className="bg-slate-800 text-white p-3 rounded-full shadow-lg hover:bg-slate-900 transition flex items-center gap-2 border border-slate-700"
               title="Open Trash Bin"
             >
               <Trash2 size={20} />
             </button>
          </div>

          {/* --- MAIN CONTENT --- */}
          <main className="flex-1 flex flex-col relative h-full">
            
            {/* VIEW: Projects Dashboard */}
            {currentView === 'projects' && (
              <ProjectList 
                projects={projects} 
                tasks={tasks}
                onSelectProject={handleSelectProject} 
                onAddProject={handleAddProject} 
                onDeleteProject={handleDeleteProject} 
              />
            )}

            {/* VIEW: Task Board (Kanban/List) */}
            {currentView === 'board' && (
              <div className={`flex-1 flex flex-col relative h-full ${!isDarkMode && activeProject?.color ? activeProject.color.replace('bg-', 'bg-opacity-5 bg-') : ''}`}>
                 {loading ? <div className="p-10 text-center text-slate-500">Loading board...</div> : (
                  <TaskBoard 
                    tasks={filteredTasks} columns={columns} user={user} isDarkMode={isDarkMode}
                    onDragStart={onDragStart} onDragOver={onDragOver} onDrop={onDrop}
                    onDelete={handleArchiveTask} // Use Archive, not Delete
                    onEdit={(t) => { setEditingTask(t); setIsModalOpen(true); }}
                    onQuickAdd={handleQuickAddTask} 
                    onClone={handleCloneTask}
                    onAddColumn={(n) => setColumns([...columns, n])} 
                    onDeleteColumn={(c) => setColumns(columns.filter(x=>x!==c))}
                  />
                 )}
              </div>
            )}
            
            {/* VIEW: Team */}
            {currentView === 'team' && <TeamMembers />}
            
            {/* VIEW: Profile */}
            {currentView === 'profile' && (
              <UserProfile 
                user={user} 
                tasks={tasks} 
                onUpdateUser={handleUpdateUser} 
                isDarkMode={isDarkMode}
              />
            )}
          </main>

          <Footer />
          
          {/* --- OVERLAYS --- */}
          {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
          
          <TaskModal 
            isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveTask}
            editingTask={editingTask} currentUser={user} team={team}
          />

          <TrashModal 
            isOpen={isTrashOpen} onClose={() => setIsTrashOpen(false)} 
            tasks={tasks} onRestore={handleRestoreTask} onPermanentDelete={handlePermanentDelete} 
          />
        </>
      )}
    </div>
  );
}