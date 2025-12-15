import React, { useState, useEffect } from 'react';
import LoginPage from './components/LoginPage';
import Header from './components/Header';
import TaskBoard from './components/TaskBoard';
import TaskModal from './components/TaskModal';
import TeamMembers from './components/TeamMembers';
import UserProfile from './components/UserProfile'; // Import Profile
import Footer from './components/Footer';
import Toast from './components/Toast';

const API_URL = 'https://dummyjson.com';

export default function App() {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState('All');
  const [toast, setToast] = useState(null); 
  const [currentView, setCurrentView] = useState('board');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('jira_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      loadTasks();
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tasks.length > 0) {
      localStorage.setItem('jira_tasks', JSON.stringify(tasks));
    }
  }, [tasks]);

  const loadTasks = () => {
    const savedTasks = localStorage.getItem('jira_tasks');
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
      setLoading(false);
    } else {
      fetch(`${API_URL}/todos?limit=8&skip=3`)
        .then(res => res.json())
        .then(data => {
          const formattedTasks = data.todos.map(t => ({
            id: t.id,
            title: t.todo,
            status: t.completed ? 'Done' : (Math.random() > 0.5 ? 'In Progress' : 'Todo'),
            userId: t.userId,
            priority: ['High', 'Medium', 'Low'][Math.floor(Math.random() * 3)]
          }));
          setTasks(formattedTasks);
          setLoading(false);
        });
    }
  };

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('jira_user', JSON.stringify(userData));
    loadTasks();
    showToast(`Welcome back, ${userData.firstName}!`, 'info');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('jira_user');
    setCurrentView('board');
  };

  // --- Update User Logic ---
  const handleUpdateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('jira_user', JSON.stringify(updatedUser));
    showToast('Profile updated successfully!', 'success');
  };

  const handleSaveTask = (title, priority) => {
    if (editingTask) {
      setTasks(tasks.map(t => 
        t.id === editingTask.id ? { ...t, title, priority } : t
      ));
      showToast('Task updated successfully', 'success');
    } else {
      const newTask = {
        id: Date.now(),
        title,
        status: 'Todo',
        userId: user.id,
        priority
      };
      setTasks([newTask, ...tasks]);
      showToast('New task created', 'success');
    }
    closeModal();
  };

  const handleDeleteTask = (taskId) => {
    if (confirm('Are you sure you want to delete this task?')) {
      setTasks(tasks.filter(t => t.id !== taskId));
      showToast('Task deleted', 'error');
    }
  };

  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = filterPriority === 'All' || t.priority === filterPriority;
    return matchesSearch && matchesPriority;
  });

  const openCreateModal = () => { setEditingTask(null); setIsModalOpen(true); };
  const openEditModal = (task) => { setEditingTask(task); setIsModalOpen(true); };
  const closeModal = () => { setIsModalOpen(false); setEditingTask(null); };

  const onDragStart = (e, id) => e.dataTransfer.setData("taskId", id);
  const onDragOver = (e) => e.preventDefault();
  const onDrop = (e, targetStatus) => {
    const id = parseInt(e.dataTransfer.getData("taskId"));
    setTasks(prev => prev.map(task => 
      task.id === id ? { ...task, status: targetStatus } : task
    ));
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
            onCreateClick={openCreateModal}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            currentView={currentView}
            setView={setCurrentView}
            filterPriority={filterPriority}
            setFilterPriority={setFilterPriority}
          />

          <main className="flex-1 flex flex-col">
            {currentView === 'board' && (
              loading ? (
                <div className="flex justify-center items-center flex-1 text-slate-500">Loading board...</div>
              ) : (
                <TaskBoard 
                  tasks={filteredTasks} 
                  user={user} 
                  onDragStart={onDragStart}
                  onDragOver={onDragOver}
                  onDrop={onDrop}
                  onDelete={handleDeleteTask}
                  onEdit={openEditModal} 
                />
              )
            )}

            {currentView === 'team' && <TeamMembers />}
            
            {/* --- NEW PROFILE VIEW --- */}
            {currentView === 'profile' && (
              <UserProfile 
                user={user} 
                tasks={tasks}
                onUpdateUser={handleUpdateUser} 
              />
            )}
          </main>

          <Footer />

          {toast && (
            <Toast 
              message={toast.message} 
              type={toast.type} 
              onClose={() => setToast(null)} 
            />
          )}

          <TaskModal 
            isOpen={isModalOpen} 
            onClose={closeModal} 
            onSave={handleSaveTask}
            editingTask={editingTask}
          />
        </>
      )}
    </div>
  );
}