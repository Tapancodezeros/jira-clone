import React, { useState, useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import { User, Mail, Shield, Clock, Camera, Save, Key, Briefcase, CheckCircle, TrendingUp, Calendar } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import api from '../utils/apiClient';

export default function UserProfile() {
    const { toast } = useToast();
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', bio: '' });

    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '' });
    const [activities, setActivities] = useState([]);
    const [stats, setStats] = useState({ completed: 0, ongoing: 0, efficiency: 92 });

    useEffect(() => {
        if (activeTab === 'activity') {
            fetchActivity();
        }
    }, [activeTab]);

    const fetchActivity = async () => {
        try {
            const res = await api.get('/users/activity');
            setActivities(res);
        } catch (error) {
            console.error('Failed to fetch activity', error);
        }
    };

    useEffect(() => {
        try {
            const stored = JSON.parse(localStorage.getItem('user'));
            if (stored) {
                setUser(stored);
                setFormData({ name: stored.name, email: stored.email, bio: stored.bio || '' });
            }
            // Mock stats - in real app fetch from API
            setStats({ completed: 124, ongoing: 8, efficiency: 94 });
        } catch (e) {
            console.error(e);
        }
    }, []);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            const res = await api.put('/users/profile', { name: formData.name, bio: formData.bio });
            if (res) {
                const updated = { ...user, name: res.name, bio: res.bio };
                localStorage.setItem('user', JSON.stringify(updated));
                setUser(updated);
                setIsEditing(false);
                if (toast && toast.success) toast.success('Profile updated successfully');
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to update profile';
            if (toast && toast.error) toast.error(msg);
        }
    };

    const handleChangePassword = async () => {
        const { currentPassword, newPassword } = passwordData;
        if (!currentPassword || !newPassword) {
            if (toast && toast.error) toast.error('Please fill in both fields');
            return;
        }

        try {
            await api.put('/users/profile', { currentPassword, newPassword });
            if (toast && toast.success) toast.success('Password changed successfully');
            setPasswordData({ currentPassword: '', newPassword: '' });
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to change password';
            if (toast && toast.error) toast.error(msg);
        }
    };

    if (!user) return <div className="min-h-screen flex items-center justify-center text-slate-400">Loading profile...</div>;

    return (
        <div className="bg-slate-50 dark:bg-[#0f1117] min-h-screen flex flex-col font-sans">
            <Header />

            <main className="flex-1">
                {/* Hero Banner Section */}
                <div className="relative h-64 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                    <div className="absolute inset-0 bg-black/10"></div>
                </div>

                <div className="max-w-6xl mx-auto px-6 pb-12">
                    {/* Floating Profile Info */}
                    <div className="relative -mt-20 mb-8 flex flex-col md:flex-row items-end gap-6">
                        <div className="relative group">
                            <div className="w-40 h-40 rounded-3xl border-4 border-white dark:border-[#0f1117] shadow-2xl overflow-hidden bg-white dark:bg-slate-800">
                                {user.avatar ? (
                                    <img src={user.avatar} alt="User" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center text-5xl font-bold text-slate-400">
                                        {user.name?.[0]?.toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <button className="absolute bottom-3 right-3 p-2 bg-slate-900/80 text-white rounded-xl backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all hover:bg-black shadow-lg">
                                <Camera size={18} />
                            </button>
                        </div>

                        <div className="flex-1 pb-2">
                            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2">{user.name}</h1>
                            <div className="flex flex-wrap gap-4 text-slate-600 dark:text-slate-400 text-sm font-medium">
                                <span className="flex items-center gap-1.5"><Mail size={16} className="text-blue-500" /> {user.email}</span>
                                <span className="flex items-center gap-1.5"><Briefcase size={16} className="text-purple-500" /> Software Engineer</span>
                                <span className="flex items-center gap-1.5"><Shield size={16} className="text-emerald-500" /> Admin</span>
                            </div>
                        </div>

                        <div className="flex gap-3 pb-2">
                            <button
                                onClick={() => setIsEditing(!isEditing)}
                                className="px-5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all"
                            >
                                {isEditing ? 'Cancel Edit' : 'Edit Profile'}
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
                        {/* Sidebar Navigation */}
                        <aside className="space-y-6">
                            <nav className="flex flex-col gap-1">
                                {[
                                    { id: 'overview', label: 'Overview', icon: User },
                                    { id: 'activity', label: 'Activity Log', icon: Clock },
                                    { id: 'security', label: 'Security & Login', icon: Key },
                                ].map(item => (
                                    <button
                                        key={item.id}
                                        onClick={() => setActiveTab(item.id)}
                                        className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all ${activeTab === item.id
                                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20 translate-x-1'
                                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                            }`}
                                    >
                                        <item.icon size={18} />
                                        {item.label}
                                    </button>
                                ))}
                            </nav>

                            {/* Mini Stats Grid */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm flex flex-col items-center justify-center text-center">
                                    <div className="text-2xl font-bold text-emerald-500">{stats.completed}</div>
                                    <div className="text-[10px] uppercase font-bold text-slate-400 mt-1">Done</div>
                                </div>
                                <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm flex flex-col items-center justify-center text-center">
                                    <div className="text-2xl font-bold text-blue-500">{stats.ongoing}</div>
                                    <div className="text-[10px] uppercase font-bold text-slate-400 mt-1">Active</div>
                                </div>
                            </div>
                        </aside>

                        {/* Content Area */}
                        <div className="space-y-6">
                            {activeTab === 'overview' && (
                                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/50 p-8 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Profile Details</h2>
                                        {isEditing && <span className="text-xs font-bold text-blue-500 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-md">Editing Mode</span>}
                                    </div>

                                    <form onSubmit={handleUpdateProfile}>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Full Name</label>
                                                <input
                                                    type="text"
                                                    disabled={!isEditing}
                                                    value={formData.name}
                                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                    className={`w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-medium text-slate-700 dark:text-slate-200 transition-all ${isEditing ? 'focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400' : 'opacity-70'}`}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Email Address</label>
                                                <input
                                                    type="email"
                                                    disabled={true}
                                                    value={formData.email}
                                                    className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-medium text-slate-500 cursor-not-allowed"
                                                />
                                            </div>
                                            <div className="space-y-2 md:col-span-2">
                                                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Bio / About</label>
                                                <textarea
                                                    rows="4"
                                                    disabled={!isEditing}
                                                    value={formData.bio}
                                                    onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                                    placeholder="Write a short bio..."
                                                    className={`w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-medium text-slate-700 dark:text-slate-200 resize-none transition-all ${isEditing ? 'focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400' : 'opacity-70'}`}
                                                ></textarea>
                                            </div>
                                        </div>

                                        {isEditing && (
                                            <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-700/50">
                                                <button type="submit" className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all active:scale-95 flex items-center gap-2">
                                                    <Save size={18} /> Save Changes
                                                </button>
                                            </div>
                                        )}
                                    </form>
                                </div>
                            )}

                            {activeTab === 'security' && (
                                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/50 p-8 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Security Settings</h2>

                                    <div className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 mb-8">
                                        <div className="flex items-start gap-4">
                                            <div className="p-3 bg-white dark:bg-slate-800 rounded-lg shadow-sm text-blue-600">
                                                <Key size={24} />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-bold text-slate-800 dark:text-white mb-1">Change Password</h3>
                                                <p className="text-sm text-slate-500 mb-4">Update your password to keep your account secure.</p>

                                                <div className="space-y-3 max-w-md">
                                                    <input
                                                        type="password"
                                                        placeholder="Current Password"
                                                        value={passwordData.currentPassword}
                                                        onChange={e => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                                        className="w-full p-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg outline-none focus:border-blue-500 text-sm"
                                                    />
                                                    <input
                                                        type="password"
                                                        placeholder="New Password"
                                                        value={passwordData.newPassword}
                                                        onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                                        className="w-full p-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg outline-none focus:border-blue-500 text-sm"
                                                    />
                                                    <button
                                                        onClick={handleChangePassword}
                                                        disabled={!passwordData.currentPassword || !passwordData.newPassword}
                                                        className="px-4 py-2 bg-slate-900 dark:bg-white dark:text-slate-900 text-white text-sm font-bold rounded-lg disabled:opacity-50 hover:bg-black transition-colors"
                                                    >
                                                        Update Password
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between p-4 border-t border-slate-100 dark:border-slate-700/50 pt-6">
                                        <div>
                                            <h4 className="font-bold text-slate-800 dark:text-white text-sm">Two-Factor Authentication</h4>
                                            <p className="text-xs text-slate-500 mt-0.5">Add an extra layer of security to your account.</p>
                                        </div>
                                        <button className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Setup 2FA</button>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'activity' && (
                                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/50 p-8 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Recent Activity</h2>

                                    <div className="relative pl-6 space-y-8 before:absolute before:left-2 before:top-2 before:bottom-0 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-700">
                                        {activities.length > 0 ? activities.map(act => (
                                            <div key={act.id} className="relative">
                                                <div className="absolute -left-[25px] top-1.5 w-4 h-4 rounded-full bg-blue-500 ring-4 ring-white dark:ring-slate-800"></div>
                                                <div>
                                                    <p className="text-sm font-medium text-slate-800 dark:text-white">
                                                        {act.type === 'create' && 'Created task '}
                                                        {act.type === 'update' && 'Updated task '}
                                                        {act.type === 'status' && 'Changed status of '}
                                                        <span className="text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer">{act.Task?.title || 'Unknown Task'}</span>
                                                    </p>
                                                    <p className="text-sm text-slate-500 mt-1">{act.description}</p>
                                                    <span className="text-xs text-slate-400 mt-2 block flex items-center gap-1">
                                                        <Calendar size={12} /> {new Date(act.createdAt).toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>
                                        )) : (
                                            <div className="text-center py-10 text-slate-400 italic">No recent activity to show.</div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}