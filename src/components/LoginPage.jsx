import React, { useState } from 'react';
import { KanbanSquare, UserPlus, LogIn, AlertCircle } from 'lucide-react';

const API_URL = 'https://dummyjson.com';

export default function LoginPage({ onLogin }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '' // Note: In a real app, never store plain text passwords!
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- 1. HANDLE REGISTRATION ---
  const handleRegister = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    // Get existing local users
    const existingUsers = JSON.parse(localStorage.getItem('jira_local_users') || '[]');

    // Check duplicate
    if (existingUsers.find(u => u.email === formData.email)) {
      setError('User with this email already exists');
      setLoading(false);
      return;
    }

    // Create User Object (Mimic DummyJSON structure)
    const newUser = {
      id: Date.now(), // Random ID
      username: formData.email.split('@')[0],
      email: formData.email,
      firstName: formData.firstName,
      lastName: formData.lastName,
      password: formData.password,
      // Generate initials avatar
      image: `https://ui-avatars.com/api/?name=${formData.firstName}+${formData.lastName}&background=0D8ABC&color=fff`,
      company: { title: 'Local User' }
    };

    // Save to Local Storage
    localStorage.setItem('jira_local_users', JSON.stringify([...existingUsers, newUser]));

    // Auto Login
    setTimeout(() => {
      onLogin(newUser);
      setLoading(false);
    }, 800);
  };

  // --- 2. HANDLE LOGIN ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { email, password } = formData;

    // A. Check Local Storage First
    const localUsers = JSON.parse(localStorage.getItem('jira_local_users') || '[]');
    const localUser = localUsers.find(u => 
      (u.email === email || u.username === email) && u.password === password
    );

    if (localUser) {
      setTimeout(() => {
        onLogin(localUser);
        setLoading(false);
      }, 500); // Fake delay for realism
      return;
    }

    // B. Fallback to API (if not found locally)
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: email, password: password }), // API expects 'username'
      });

      if (!res.ok) throw new Error('Invalid credentials');
      const data = await res.json();
      onLogin(data);
    } catch (err) {
      setError('Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gradient-to-br from-blue-600 to-indigo-800">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md animate-in fade-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <KanbanSquare size={40} className="text-blue-600" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">
            {isRegistering ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p className="text-slate-500 mt-2">
            {isRegistering ? 'Get started with your free account' : 'Enter your details to access your board'}
          </p>
        </div>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6 flex items-center gap-2 text-sm">
            <AlertCircle size={18} /> {error}
          </div>
        )}
        
        <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-4">
          
          {isRegistering && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">First Name</label>
                <input 
                  type="text" name="firstName" placeholder="John"
                  className="w-full p-3 border border-slate-200 rounded focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
                  value={formData.firstName} onChange={handleChange}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Last Name</label>
                <input 
                  type="text" name="lastName" placeholder="Doe"
                  className="w-full p-3 border border-slate-200 rounded focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
                  value={formData.lastName} onChange={handleChange}
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">
              {isRegistering ? 'Email Address' : 'Username or Email'}
            </label>
            <input 
              type="text" name="email" 
              placeholder={isRegistering ? "john@example.com" : "emilys"}
              className="w-full p-3 border border-slate-200 rounded focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
              value={formData.email} onChange={handleChange}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Password</label>
            <input 
              type="password" name="password" 
              placeholder="••••••••"
              className="w-full p-3 border border-slate-200 rounded focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
              value={formData.password} onChange={handleChange}
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded shadow-lg shadow-blue-500/30 transition transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
          >
            {loading ? 'Processing...' : (isRegistering ? 'Sign Up' : 'Log In')}
          </button>
        </form>

        {/* Toggle Footer */}
        <div className="mt-6 text-center pt-6 border-t border-slate-100">
          <p className="text-sm text-slate-600">
            {isRegistering ? 'Already have an account?' : "Don't have an account?"}
          </p>
          <button 
            onClick={() => { setIsRegistering(!isRegistering); setError(''); setFormData({ firstName:'', lastName:'', email:'', password:'' }); }}
            className="text-blue-600 font-bold hover:underline mt-1 flex items-center justify-center gap-2 mx-auto"
          >
            {isRegistering ? <><LogIn size={16}/> Log In</> : <><UserPlus size={16}/> Create Account</>}
          </button>
        </div>

        {!isRegistering && (
          <div className="mt-4 p-3 bg-slate-50 rounded text-center text-xs text-slate-400">
            Demo: <strong>emilys</strong> / <strong>emilyspass</strong>
          </div>
        )}
      </div>
    </div>
  );
}