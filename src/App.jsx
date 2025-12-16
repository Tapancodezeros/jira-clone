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
  const [currentView, setCurrentView] = useState('projects'); 
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
    const savedUser = localStorage.getItem('jira_user');
    if (savedUser) { 
      setUser(JSON.parse(savedUser)); 
      loadData(); 
    } else { 
      setLoading(false); 
    }

    const savedTheme = localStorage.getItem('jira_theme');
    if (savedTheme === 'dark') setIsDarkMode(true);
  }, []);

  useEffect(() => { if(tasks.length > 0) localStorage.setItem('jira_tasks', JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => { localStorage.setItem('jira_projects', JSON.stringify(projects)); }, [projects]);
  useEffect(() => { localStorage.setItem('jira_columns', JSON.stringify(columns)); }, [columns]);
  useEffect(() => { localStorage.setItem('jira_theme', isDarkMode ? 'dark' : 'light'); }, [isDarkMode]);

  // --- 2. KEYBOARD SHORTCUTS ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const input = document.querySelector('input[type="text"]'); 
        if(input) input.focus();
      }
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
      fetch(`${API_URL}/todos?limit=12&skip=3`)
        .then(res => res.json())
        .then(data => {
          const formattedTasks = data.todos.map((t, index) => ({
            id: t.id,
            title: t.todo,
            status: 'Todo',
            userId: t.userId,
            priority: ['High', 'Medium', 'Low'][Math.floor(Math.random() * 3)],
            projectId: index % 2 === 0 ? 101 : 102,
            dueDate: '', comments: [], tags: [], subtasks: [], 
            assignee: null, attachments: [], history: [], isArchived: false,
            timeSpent: 0, timerStartTime: null // <--- Timer fields
          }));
          setTasks(formattedTasks);
          setLoading(false);
        });
    }
  };

  // --- 4. AUTH HANDLERS ---
  const handleLogin = (u) => { setUser(u); localStorage.setItem('jira_user', JSON.stringify(u)); loadData(); };
  const handleLogout = () => { setUser(null); localStorage.removeItem('jira_user'); setCurrentView('projects'); setActiveProject(null); };

  const handleUpdateUser = (updatedData) => {
    setUser(updatedData);
    localStorage.setItem('jira_user', JSON.stringify(updatedData));
    setTeam(prev => prev.map(m => m.id === updatedData.id ? updatedData : m));
    showToast('Profile updated', 'success');
  };

  // --- 5. PROJECT HANDLERS ---
  const handleSelectProject = (project) => { setActiveProject(project); setCurrentView('board'); };
  const handleSetView = (view) => { if (view === 'projects') setActiveProject(null); setCurrentView(view); };
  const handleAddProject = (p) => { setProjects([...projects, { ...p, id: Date.now() }]); showToast(`Project created`); };
  const handleDeleteProject = (pid) => {
    if(confirm('Delete project?')) {
       setProjects(projects.filter(p => p.id !== pid));
       setTasks(tasks.filter(t => t.projectId !== pid));
       showToast('Project deleted', 'info');
    }
  };

  // --- 6. TASK CRUD HANDLERS ---
  const createHistoryEntry = (action) => ({ id: Date.now(), action, user: { firstName: user.firstName }, timestamp: new Date().toLocaleString() });

  const handleSaveTask = (taskData) => {
    if (editingTask) {
      setTasks(tasks.map(t => t.id === editingTask.id ? { ...t, ...taskData, history: [...(t.history || []), createHistoryEntry('Updated task')] } : t));
      showToast('Task updated');
    } else {
      const newTask = {
        id: Date.now(),
        status: columns[0],
        userId: user.id,
        projectId: activeProject.id,
        ...taskData,
        isArchived: false,
        timeSpent: 0, timerStartTime: null,
        history: [createHistoryEntry('Created task')]
      };
      setTasks([newTask, ...tasks]);
      showToast('Task created');
    }
    setIsModalOpen(false);
    setEditingTask(null);
  };

  // NEW: Toggle Timer Logic
  const handleToggleTimer = (taskId) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        if (t.timerStartTime) {
          // Stop
          const elapsed = Date.now() - t.timerStartTime;
          return { ...t, timeSpent: (t.timeSpent || 0) + elapsed, timerStartTime: null };
        } else {
          // Start
          return { ...t, timerStartTime: Date.now() };
        }
      }
      return t;
    }));
  };

  const handleQuickAddTask = (title, status) => {
    const newTask = {
      id: Date.now(), title, status, userId: user.id, projectId: activeProject.id, priority: 'Medium', isArchived: false,
      tags: [], comments: [], subtasks: [], assignee: null, attachments: [], history: [createHistoryEntry('Quick Added')],
      timeSpent: 0, timerStartTime: null
    };
    setTasks([newTask, ...tasks]);
    showToast('Task added');
  };

  const handleCloneTask = (task) => {
    const cloned = { ...task, id: Date.now(), title: `${task.title} (Copy)`, history: [...(task.history || []), createHistoryEntry(`Cloned from #${task.id}`)] };
    setTasks([cloned, ...tasks]);
    showToast('Task cloned');
  };

  const handleArchiveTask = (taskId) => { if(confirm('Move to Trash?')) { setTasks(tasks.map(t => t.id === taskId ? { ...t, isArchived: true } : t)); showToast('Moved to Trash', 'info'); }};
  const handleRestoreTask = (taskId) => { setTasks(tasks.map(t => t.id === taskId ? { ...t, isArchived: false } : t)); showToast('Task Restored'); };
  const handlePermanentDelete = (taskId) => { if(confirm('Delete forever?')) { setTasks(tasks.filter(t => t.id !== taskId)); showToast('Deleted permanently', 'error'); }};

  const onDragStart = (e, id) => e.dataTransfer.setData("taskId", id);
  const onDragOver = (e) => e.preventDefault();
  const onDrop = (e, targetStatus) => {
    const id = parseInt(e.dataTransfer.getData("taskId"));
    setTasks(prev => prev.map(task => {
      if (task.id === id && task.status !== targetStatus) {
        if (targetStatus === 'Done') confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        return { ...task, status: targetStatus, history: [...(task.history || []), createHistoryEntry(`Moved to ${targetStatus}`)] };
      }
      return task;
    }));
  };

  // --- 7. UTILITIES ---
  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);
  
  const handleExportJSON = () => {
    const data = { tasks, projects, columns };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `jira_backup_${Date.now()}.json`;
    link.click();
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
        showToast('Data restored', 'success');
      } catch (err) { showToast('Invalid JSON', 'error'); }
    };
    reader.readAsText(file);
  };

  const handleExportCSV = () => {
    const rows = filteredTasks.map(t => [t.id, `"${t.title}"`, t.status, t.priority, t.dueDate || ""]);
    const csvContent = ["ID,Title,Status,Priority,Due Date"].concat(rows.map(r => r.join(","))).join("\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([csvContent], { type: 'text/csv' }));
    link.download = `export.csv`;
    link.click();
  };

  const filteredTasks = tasks.filter(t => {
    if (t.isArchived) return false;
    if (!activeProject || t.projectId !== activeProject.id) return false;
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = filterPriority === 'All' || t.priority === filterPriority;
    return matchesSearch && matchesPriority;
  });

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${isDarkMode ? 'bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      {!user ? <LoginPage onLogin={handleLogin} /> : (
        <>
          <Header 
            user={user} onLogout={handleLogout} onCreateClick={() => { setEditingTask(null); setIsModalOpen(true); }}
            searchQuery={searchQuery} setSearchQuery={setSearchQuery}
            currentView={currentView} setView={handleSetView} activeProject={activeProject}
            filterPriority={filterPriority} setFilterPriority={setFilterPriority} onClearFilters={() => { setSearchQuery(''); setFilterPriority('All'); }}
            isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode}
            onExportJSON={handleExportJSON} onImportJSON={handleImportJSON} onExport={handleExportCSV}
          />

          <div className="fixed bottom-6 left-6 z-50">
             <button onClick={() => setIsTrashOpen(true)} className="bg-slate-800 text-white p-3 rounded-full shadow-lg hover:bg-slate-900 border border-slate-700"><Trash2 size={20} /></button>
          </div>

          <main className="flex-1 flex flex-col relative h-full">
            {currentView === 'projects' && (
              <ProjectList projects={projects} tasks={tasks} onSelectProject={handleSelectProject} onAddProject={handleAddProject} onDeleteProject={handleDeleteProject} />
            )}

            {currentView === 'board' && (
              <div className={`flex-1 flex flex-col relative h-full ${!isDarkMode && activeProject?.color ? activeProject.color.replace('bg-', 'bg-opacity-5 bg-') : ''}`}>
                 {loading ? <div className="p-10 text-center">Loading...</div> : (
                  <TaskBoard 
                    tasks={filteredTasks} columns={columns} user={user} isDarkMode={isDarkMode}
                    onDragStart={onDragStart} onDragOver={onDragOver} onDrop={onDrop}
                    onDelete={handleArchiveTask} onEdit={(t) => { setEditingTask(t); setIsModalOpen(true); }}
                    onQuickAdd={handleQuickAddTask} onClone={handleCloneTask}
                    onAddColumn={(n) => setColumns([...columns, n])} onDeleteColumn={(c) => setColumns(columns.filter(x=>x!==c))}
                    onToggleTimer={handleToggleTimer} // <--- Passed prop
                  />
                 )}
              </div>
            )}
            
            {currentView === 'team' && <TeamMembers />}
            {currentView === 'profile' && <UserProfile user={user} tasks={tasks} onUpdateUser={handleUpdateUser} isDarkMode={isDarkMode} />}
          </main>

          <Footer />
          {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
          <TaskModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveTask} editingTask={editingTask} currentUser={user} team={team} />
          <TrashModal isOpen={isTrashOpen} onClose={() => setIsTrashOpen(false)} tasks={tasks} onRestore={handleRestoreTask} onPermanentDelete={handlePermanentDelete} />
        </>
      )}
    </div>
  );
}