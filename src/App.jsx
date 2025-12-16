import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import LoginPage from './components/LoginPage';
import Header from './components/Header';
import TaskBoard from './components/TaskBoard';
import TaskModal from './components/TaskModal';
import TeamMembers from './components/TeamMembers';
import UserProfile from './components/UserProfile';
import ProjectList from './components/ProjectList'; // <--- New Component
import Footer from './components/Footer';
import Toast from './components/Toast';

const API_URL = 'https://dummyjson.com';

// Default Demo Projects
const DEFAULT_PROJECTS = [
  { id: 101, name: 'Web Development', key: 'WEB' },
  { id: 102, name: 'Mobile App', key: 'MOB' }
];

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Data State
  const [projects, setProjects] = useState(DEFAULT_PROJECTS);
  const [tasks, setTasks] = useState([]);
  const [team, setTeam] = useState([]);
  const [columns, setColumns] = useState(['Todo', 'In Progress', 'Done']);

  // UI State
  const [activeProject, setActiveProject] = useState(null); // <--- Which project is open?
  const [currentView, setCurrentView] = useState('projects'); // Default view
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [toast, setToast] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState('All');

  const showToast = (message, type = 'success') => setToast({ message, type });

  // --- Initial Load ---
  useEffect(() => {
    const savedUser = localStorage.getItem('jira_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      loadData();
    } else {
      setLoading(false);
    }
  }, []);

  // --- Persistence ---
  useEffect(() => {
    if (tasks.length > 0) localStorage.setItem('jira_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('jira_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('jira_columns', JSON.stringify(columns));
  }, [columns]);

  const loadData = () => {
    // 1. Load Projects
    const savedProjects = localStorage.getItem('jira_projects');
    if (savedProjects) setProjects(JSON.parse(savedProjects));

    // 2. Load Columns
    const savedCols = localStorage.getItem('jira_columns');
    if (savedCols) setColumns(JSON.parse(savedCols));

    // 3. Load Team
    fetch(`${API_URL}/users?limit=10`).then(res => res.json()).then(data => setTeam(data.users));

    // 4. Load Tasks
    const savedTasks = localStorage.getItem('jira_tasks');
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
      setLoading(false);
    } else {
      // First Time: Fetch Dummy Tasks and assign them to default projects
      fetch(`${API_URL}/todos?limit=12&skip=3`)
        .then(res => res.json())
        .then(data => {
          const formattedTasks = data.todos.map((t, index) => ({
            id: t.id,
            title: t.todo,
            status: 'Todo',
            userId: t.userId,
            priority: ['High', 'Medium', 'Low'][Math.floor(Math.random() * 3)],
            // Distribute dummy tasks between the two default projects
            projectId: index % 2 === 0 ? 101 : 102, 
            dueDate: '',
            comments: [],
            tags: [],
            subtasks: [],
            assignee: null,
            attachments: [],
            history: []
          }));
          setTasks(formattedTasks);
          setLoading(false);
        });
    }
  };

  // --- View Switching Logic ---
  const handleSelectProject = (project) => {
    setActiveProject(project);
    setCurrentView('board');
  };

  const handleSetView = (view) => {
    // If going to Projects list, clear active project
    if (view === 'projects') {
      setActiveProject(null);
    }
    setCurrentView(view);
  };

  // --- Project Management ---
  const handleAddProject = (project) => {
    const newProject = { ...project, id: Date.now() };
    setProjects([...projects, newProject]);
    showToast(`Project "${project.name}" created`);
  };

  const handleDeleteProject = (projectId) => {
    if(confirm('Delete this project? All associated tasks will be lost.')) {
       setProjects(projects.filter(p => p.id !== projectId));
       setTasks(tasks.filter(t => t.projectId !== projectId)); // Clean up tasks
       showToast('Project deleted', 'info');
    }
  };

  // --- Task CRUD ---
  const handleSaveTask = (taskData) => {
    if (editingTask) {
      // Update existing
      setTasks(tasks.map(t => t.id === editingTask.id ? { ...t, ...taskData } : t));
      showToast('Task updated');
    } else {
      // Create New - Assign to ACTIVE PROJECT
      const newTask = {
        id: Date.now(),
        status: columns[0],
        userId: user.id,
        projectId: activeProject.id, // <--- Key Change
        ...taskData,
        history: [{ id: Date.now(), action: 'Created task', user: { firstName: user.firstName }, timestamp: new Date().toLocaleString() }]
      };
      setTasks([newTask, ...tasks]);
      showToast('Task created');
    }
    closeModal();
  };

  const handleQuickAddTask = (title, status) => {
    const newTask = {
      id: Date.now(),
      title,
      status: status,
      userId: user.id,
      projectId: activeProject.id, // <--- Key Change
      priority: 'Medium',
      dueDate: '', comments: [], tags: [], subtasks: [], assignee: null, attachments: [], history: []
    };
    setTasks([newTask, ...tasks]);
    showToast('Card added');
  };

  const handleDeleteTask = (taskId) => {
    if (confirm('Delete task?')) {
      setTasks(tasks.filter(t => t.id !== taskId));
      showToast('Task deleted', 'error');
    }
  };

  const handleCloneTask = (task) => {
    const cloned = { ...task, id: Date.now(), title: `${task.title} (Copy)` };
    setTasks([cloned, ...tasks]);
    showToast('Task cloned');
  };

  // --- Filtering ---
  // Filter 1: Must match Active Project
  // Filter 2: Must match Search Query
  // Filter 3: Must match Priority
  const filteredTasks = tasks.filter(t => {
    if (!activeProject || t.projectId !== activeProject.id) return false;
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = filterPriority === 'All' || t.priority === filterPriority;
    return matchesSearch && matchesPriority;
  });

  // --- Auth Handlers ---
  const handleLogin = (u) => { setUser(u); localStorage.setItem('jira_user', JSON.stringify(u)); loadData(); };
  const handleLogout = () => { setUser(null); localStorage.removeItem('jira_user'); setCurrentView('projects'); setActiveProject(null); };
  
  // --- Drag & Drop ---
  const onDragStart = (e, id) => e.dataTransfer.setData("taskId", id);
  const onDragOver = (e) => e.preventDefault();
  const onDrop = (e, targetStatus) => {
    const id = parseInt(e.dataTransfer.getData("taskId"));
    setTasks(prev => prev.map(task => {
      if (task.id === id && task.status !== targetStatus) {
        if (targetStatus === 'Done') confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        return { ...task, status: targetStatus };
      }
      return task;
    }));
  };

  // --- Other Handlers ---
  const handleExportCSV = () => {
    // Export only visible tasks (filtered by project)
    const rows = filteredTasks.map(t => [t.id, `"${t.title}"`, t.status, t.priority, t.dueDate || ""]);
    const csvContent = ["ID,Title,Status,Priority,Due Date"].concat(rows.map(r => r.join(","))).join("\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([csvContent], { type: 'text/csv' }));
    link.download = `${activeProject?.key}_export.csv`;
    link.click();
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      {!user ? (
        <LoginPage onLogin={handleLogin} />
      ) : (
        <>
          <Header 
            user={user} 
            onLogout={handleLogout} 
            onCreateClick={() => { setEditingTask(null); setIsModalOpen(true); }}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            currentView={currentView}
            setView={handleSetView} // Use wrapper to handle project clearing
            activeProject={activeProject} // Pass active project
            filterPriority={filterPriority}
            setFilterPriority={setFilterPriority}
            onExport={handleExportCSV}
            onClearFilters={() => { setSearchQuery(''); setFilterPriority('All'); }}
          />

          <main className="flex-1 flex flex-col relative">
            {currentView === 'projects' && (
              <ProjectList 
                projects={projects} 
                onSelectProject={handleSelectProject}
                onAddProject={handleAddProject}
                onDeleteProject={handleDeleteProject}
              />
            )}

            {currentView === 'board' && (
              loading ? <div className="p-10 text-center text-slate-500">Loading board...</div> : (
                <TaskBoard 
                  tasks={filteredTasks} 
                  columns={columns} 
                  user={user} 
                  onDragStart={onDragStart} onDragOver={onDragOver} onDrop={onDrop}
                  onDelete={handleDeleteTask} onEdit={(t) => { setEditingTask(t); setIsModalOpen(true); }}
                  onQuickAdd={handleQuickAddTask} onClone={handleCloneTask}
                  onAddColumn={(name) => setColumns([...columns, name])}
                  onDeleteColumn={(col) => setColumns(columns.filter(c => c !== col))}
                />
              )
            )}
            
            {currentView === 'team' && <TeamMembers />}
            {currentView === 'profile' && <UserProfile user={user} tasks={tasks} onUpdateUser={(u) => { setUser(u); localStorage.setItem('jira_user', JSON.stringify(u)); }} />}
          </main>

          <Footer />
          {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
          
          <TaskModal 
            isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveTask}
            editingTask={editingTask} currentUser={user} team={team}
          />
        </>
      )}
    </div>
  );
}