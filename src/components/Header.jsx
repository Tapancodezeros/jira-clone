import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Home, Bell, Search, Moon, Sun, User, CheckCheck, Trash2 } from 'lucide-react';
import api, { fetchNotifications, markNotificationRead, markAllNotificationsRead, deleteNotification } from '../utils/apiClient';
import { toggleTheme, initTheme } from '../utils/theme';
import { useToast } from '../context/ToastContext';

const Header = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    let parsedUser;
    try { parsedUser = JSON.parse(localStorage.getItem('user')); } catch { parsedUser = null; }
    const user = parsedUser;

    const [notifications, setNotifications] = useState([]);
    const [showNotifs, setShowNotifs] = useState(false);
    const [theme, setTheme] = useState('light');
    const notifRef = useRef();

    useEffect(() => {
        initTheme();
        // Check if dark mode is already active
        if (document.documentElement.classList.contains('dark')) setTheme('dark');

        // load notifications (best-effort)
        let mounted = true;
        fetchNotifications()
            .then((data) => {
                if (!mounted) return;
                if (Array.isArray(data)) setNotifications(data);
            })
            .catch((err) => {
                // non-fatal
                if (err?.message) showToast({ msg: `Notifications: ${err.message}` });
            });
        return () => { mounted = false; };
    }, [showToast]);

    useEffect(() => {
        function handleDocClick(e) {
            if (notifRef.current && !notifRef.current.contains(e.target)) {
                setShowNotifs(false);
            }
        }
        document.addEventListener('click', handleDocClick);
        return () => document.removeEventListener('click', handleDocClick);
    }, []);

    const handleLogout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (e) {
            // ignore, still clear
        }
        localStorage.clear();
        window.location.href = '/';
    };

    const handleToggleTheme = () => {
        try {
            const t = toggleTheme();
            setTheme(t);
            showToast({ msg: `Switched to ${t} theme` });
        } catch (e) {
            showToast({ msg: 'Could not toggle theme' });
        }
    };

    const handleMarkRead = async (id) => {
        try {
            await markNotificationRead(id);
        } catch (err) {
            // best-effort: still update UI
        }
        setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    };

    const handleNotificationClick = (n) => {
        if (!n.read) {
            handleMarkRead(n.id || n._id);
        }
        if (n.link) {
            navigate(n.link);
            setShowNotifs(false);
        }

    };

    const handleMarkAllRead = async () => {
        try {
            await markAllNotificationsRead();
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            showToast({ msg: 'All marked as read' });
        } catch (error) {
            showToast({ msg: 'Failed to mark all read' });
        }
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        try {
            await deleteNotification(id);
            setNotifications(prev => prev.filter(n => (n.id || n._id) !== id));
            showToast({ msg: 'Notification removed' });
        } catch (error) {
            showToast({ msg: 'Failed to remove' });
        }
    };

    return (
        <header className="px-6 py-4 glass-panel border-b border-slate-200/50 dark:border-slate-800/50 flex justify-between items-center sticky top-0 z-40 transition-all duration-300">
            {/* Logo Section */}
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/dashboard')}>
                <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30 group-hover:scale-105 group-hover:rotate-3 transition-all duration-300">
                    <Home size={20} className="drop-shadow-sm" />
                </div>
                <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-300 tracking-tight">
                    Jira Clone
                </h3>
            </div>

            {/* Search Bar (Middle) */}
            <div className="hidden md:flex flex-1 max-w-lg mx-8 relative group">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <input
                    type="text"
                    placeholder="Search tasks, projects..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800/50 border border-transparent focus:border-blue-500/30 rounded-full text-sm focus:ring-4 focus:ring-blue-500/10 focus:bg-white dark:focus:bg-slate-900 transition-all outline-none"
                />
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-4">
                <button onClick={handleToggleTheme} className="text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 p-2.5 rounded-full transition-all hover:scale-110 active:scale-95">
                    {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
                </button>

                <div className="relative" ref={notifRef}>
                    <button
                        onClick={() => setShowNotifs((s) => !s)}
                        className="relative text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 p-2.5 rounded-full transition-all hover:scale-110 active:scale-95"
                        aria-label="Notifications"
                    >
                        <Bell size={20} />
                        {notifications.filter((n) => !n.read).length > 0 && (
                            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse"></span>
                        )}
                    </button>

                    {showNotifs && (
                        <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                            <div className="p-4 border-b dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                                <h4 className="font-semibold text-slate-800 dark:text-slate-100">Notifications</h4>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-slate-500">{notifications.filter(n => !n.read).length} new</span>
                                    {notifications.some(n => !n.read) && (
                                        <button
                                            onClick={handleMarkAllRead}
                                            title="Mark all as read"
                                            className="text-slate-400 hover:text-blue-600 transition-colors"
                                        >
                                            <CheckCheck size={16} />
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className="max-h-[300px] overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <div className="p-8 text-center text-slate-400 text-sm flex flex-col items-center gap-2">
                                        <Bell size={24} className="opacity-20" />
                                        No notifications yet
                                    </div>
                                ) : (
                                    notifications.map((n) => (
                                        <div
                                            key={n.id || n._id || Math.random()}
                                            onClick={() => handleNotificationClick(n)}
                                            className={`p-4 border-b dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer ${n.read ? 'opacity-60' : 'bg-blue-50/30'}`}
                                        >
                                            <div className="text-sm text-slate-800 dark:text-slate-200 font-medium mb-1">{n.title || n.msg || 'Notification'}</div>
                                            <div className="flex justify-between items-center mt-2">
                                                <span className="text-xs text-slate-400">{n.time ? new Date(n.time).toLocaleString() : 'Just now'}</span>
                                                <div className="flex gap-2">
                                                    {!n.read && (
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleMarkRead(n.id || n._id); }}
                                                            className="text-xs font-medium text-blue-600 hover:text-blue-700"
                                                        >
                                                            Mark as read
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={(e) => handleDelete(e, n.id || n._id)}
                                                        className="text-slate-400 hover:text-red-500 transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-700 mx-1"></div>

                <div className="flex items-center gap-3 relative group cursor-pointer">
                    {user?.avatar ? (
                        <img src={user.avatar} alt="User" className="w-9 h-9 rounded-full object-cover shadow-md" />
                    ) : (
                        <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                            {user?.name?.[0] || <User size={18} />}
                        </div>
                    )}
                    <div className="hidden sm:block text-sm">
                        <div className="font-semibold text-slate-700 dark:text-slate-200 leading-tight">{user?.name || 'Guest'}</div>
                        <div className="text-xs text-slate-400">View Profile</div>
                    </div>

                    {/* User Dropdown */}
                    <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right">
                        <div className="p-1">
                            <button onClick={() => navigate('/profile')} className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg flex items-center gap-2">
                                <User size={16} /> Profile
                            </button>
                            <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg flex items-center gap-2">
                                <LogOut size={16} /> Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};
export default Header;