import React from 'react';
import { ToastProvider } from './context/ToastContext';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import ProjectList from './components/ProjectList';
import CreateProject from './components/CreateProject';
import TaskBoard from './components/TaskBoard';
import UserProfile from './components/UserProfile';

function App() {
  const token = localStorage.getItem('token');

  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={!token ? <LoginPage /> : <Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={token ? <ProjectList /> : <Navigate to="/" />} />
          <Route path="/create-project" element={token ? <CreateProject /> : <Navigate to="/" />} />
          <Route path="/project/:id" element={token ? <TaskBoard /> : <Navigate to="/" />} />
          <Route path="/profile" element={token ? <UserProfile /> : <Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;