import React from 'react';
import { RefreshCcw } from 'lucide-react';

export default function Footer() {
  const handleReset = () => {
    if(confirm("This will wipe ALL data (tasks, settings, and local accounts). Are you sure?")) {
      localStorage.removeItem('jira_tasks');
      localStorage.removeItem('jira_user');
      localStorage.removeItem('jira_columns');
      localStorage.removeItem('jira_local_users'); // <--- ADD THIS LINE
      window.location.reload();
    }
  }

  return (
    <footer className="bg-white border-t border-slate-200 py-6 mt-auto">
      <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-slate-500 text-sm">
          &copy; {new Date().getFullYear()} Jira Clone App.
        </p>
        
        <button 
          onClick={handleReset}
          className="flex items-center gap-2 text-xs text-red-400 hover:text-red-600 transition"
        >
          <RefreshCcw size={12} /> Reset Demo Data
        </button>

        <div className="flex gap-4 text-sm text-slate-400">
          <span className="hover:text-blue-600 cursor-pointer transition">Privacy</span>
          <span>•</span>
          <span className="hover:text-blue-600 cursor-pointer transition">Terms</span>
        </div>
      </div>
    </footer>
  );
}