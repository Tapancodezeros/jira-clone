import React, { useState, useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import { User, Mail, Shield, Clock, Camera, Save, Key, LogOut } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import api from '../utils/apiClient';

export default function UserProfile() {
    const { toast } = useToast();
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '' });

    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '' });
    const [activities, setActivities] = useState([]);

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
                setFormData({ name: stored.name, email: stored.email });
            }
        } catch (e) {
            console.error(e);
        }
    }, []);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            const res = await api.put('/users/profile', { name: formData.name });
            if (res) {
                const updated = { ...user, name: res.name };
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
        <>
            <Header />
            <div className="min-h-screen pt-24 pb-12 px-6">

                {/* Background Decor */}
                <div className="fixed inset-0 pointer-events-none -z-10 bg-slate-50 dark:bg-[#0f1117]">
                    <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px]" />
                    <div className="absolute bottom-[0%] left-[-10%] w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[120px]" />
                </div>

                <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

                    {/* Header Card */}
                    <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl shadow-glass flex flex-col md:flex-row items-center md:items-end gap-8 p-8 md:p-12">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 -z-10" />

                        <div className="relative group shrink-0">
                            <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-br from-blue-400 to-purple-500 shadow-xl">
                                <div className="w-full h-full rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden relative">
                                    {user.avatar ? (
                                        <img src={user.avatar} alt="User" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-blue-500 to-purple-600">
                                            {user.name?.[0]?.toUpperCase()}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <button className="absolute bottom-2 right-2 p-2 bg-slate-900 text-white rounded-full shadow-lg hover:bg-black transition-all hover:scale-110 border border-white/10">
                                <Camera size={16} />
                            </button>
                        </div>

                        <div className="text-center md:text-left flex-1 min-w-0">
                            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">{user.name}</h1>
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-slate-500 dark:text-slate-400 font-medium">
                                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 text-sm">
                                    <Mail size={14} /> {user.email}
                                </span>
                                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-sm border border-blue-200/20">
                                    <Shield size={14} /> Admin
                                </span>
                            </div>
                        </div>

                        <div className="flex gap-3 shrink-0">
                            <button
                                onClick={() => setIsEditing(!isEditing)}
                                className="px-6 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all active:scale-95"
                            >
                                {isEditing ? 'Cancel' : 'Edit Profile'}
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-8 items-start">

                        {/* Sidebar */}
                        <div className="sticky top-24 space-y-2">
                            <nav className="p-2 space-y-1 rounded-2xl bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border border-white/20 dark:border-slate-800/50 shadow-glass">
                                {['overview', 'security', 'activity'].map(tab => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${activeTab === tab
                                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20 '
                                            : 'text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
                                            }`}
                                    >
                                        {tab === 'overview' && <User size={18} />}
                                        {tab === 'security' && <Shield size={18} />}
                                        {tab === 'activity' && <Clock size={18} />}
                                        <span className="capitalize">{tab}</span>
                                    </button>
                                ))}
                            </nav>

                            <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-lg relative overflow-hidden group cursor-pointer">
                                <div className="absolute top-0 right-0 p-8 bg-white/10 rounded-full blur-xl group-hover:bg-white/20 transition-all" />
                                <h3 className="font-bold text-lg mb-1 relative z-10">Pro Plan</h3>
                                <p className="text-white/80 text-sm mb-4 relative z-10">Upgrade for more features</p>
                                <button className="w-full py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg text-sm font-semibold transition-colors relative z-10 border border-white/10">
                                    Upgrade Now
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="space-y-6">
                            {activeTab === 'overview' && (
                                <div className="rounded-2xl border border-white/20 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-8 shadow-sm animate-in fade-in slide-in-from-right-8 duration-500">
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                                        <div className="w-1 h-6 bg-blue-500 rounded-full" />
                                        Personal Information
                                    </h2>
                                    <form onSubmit={handleUpdateProfile} className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Full Name</label>
                                                <input
                                                    type="text"
                                                    disabled={!isEditing}
                                                    value={formData.name}
                                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                    className={`w-full p-3.5 rounded-xl border outline-none transition-all ${isEditing
                                                        ? 'bg-white dark:bg-slate-800 border-blue-500 ring-4 ring-blue-500/10'
                                                        : 'bg-slate-50 dark:bg-slate-900/50 border-transparent text-slate-500'
                                                        }`}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Email Address</label>
                                                <input
                                                    type="email"
                                                    disabled={!isEditing}   
                                                    value={formData.email}
                                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                                    className={`w-full p-3.5 rounded-xl border outline-none transition-all ${isEditing
                                                        ? 'bg-white dark:bg-slate-800 border-blue-500 ring-4 ring-blue-500/10'
                                                        : 'bg-slate-50 dark:bg-slate-900/50 border-transparent text-slate-500'
                                                        }`}
                                                />
                                            </div>
                                            <div className="space-y-2 md:col-span-2">
                                                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Bio</label>
                                                <textarea
                                                    rows="3"
                                                    disabled={!isEditing}
                                                    value={formData.bio}
                                                    onChange={e => setFormData({ ...formData, bio: e.target.value })}           
                                                    placeholder="Tell us a little about yourself..."
                                                    className={`w-full p-3.5 rounded-xl border outline-none resize-none transition-all ${isEditing
                                                        ? 'bg-white dark:bg-slate-800 border-blue-500 ring-4 ring-blue-500/10'
                                                        : 'bg-slate-50 dark:bg-slate-900/50 border-transparent text-slate-500'
                                                        }`}
                                                />
                                            </div>
                                        </div>

                                        {isEditing && (
                                            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => setIsEditing(false)}
                                                    className="px-6 py-2.5 text-slate-600 font-semibold hover:bg-slate-100 rounded-xl transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="submit"
                                                    className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-500/25 hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                                                >
                                                    <Save size={18} /> Save Changes
                                                </button>
                                            </div>
                                        )}
                                    </form>
                                </div>
                            )}

                            {activeTab === 'security' && (
                                <div className="rounded-2xl border border-white/20 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-8 shadow-sm animate-in fade-in slide-in-from-right-8 duration-500">
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                                        <div className="w-1 h-6 bg-purple-500 rounded-full" />
                                        Security Settings
                                    </h2>

                                    <div className="p-6 rounded-2xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30 flex gap-5">
                                        <div className="shrink-0 w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                                            <Key size={24} />
                                        </div>
                                        <div className="space-y-4 flex-1">
                                            <div>
                                                <h3 className="font-bold text-slate-900 dark:text-white">Change Password</h3>
                                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                                    Ensure your account uses a strong, random password.
                                                </p>
                                            </div>
                                            <div className="grid gap-3 max-w-sm">
                                                <input
                                                    type="password"
                                                    placeholder="Current Password"
                                                    value={passwordData.currentPassword}
                                                    onChange={e => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                                    className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:border-blue-500 transition-colors"
                                                />
                                                <input
                                                    type="password"
                                                    placeholder="New Password"
                                                    value={passwordData.newPassword}
                                                    onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                                    className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:border-blue-500 transition-colors"
                                                />
                                                <button
                                                    onClick={handleChangePassword}
                                                    className="px-4 py-2 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity w-fit"
                                                >
                                                    Update Password
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'activity' && (
                                <div className="rounded-2xl border border-white/20 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-8 shadow-sm animate-in fade-in slide-in-from-right-8 duration-500">
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                                        <div className="w-1 h-6 bg-amber-500 rounded-full" />
                                        Recent Activity
                                    </h2>
                                    <div className="relative border-l-2 border-slate-100 dark:border-slate-800 ml-3 space-y-8 pl-8 py-2">
                                        {activities.length === 0 ? (
                                            <p className="text-slate-500 text-sm">No recent activity.</p>
                                        ) : (
                                            activities.map((act) => (
                                                <div key={act.id} className="relative group">
                                                    <div className="absolute -left-[41px] top-1 w-5 h-5 rounded-full border-4 border-white dark:border-slate-900 bg-slate-200 dark:bg-slate-700 group-hover:bg-blue-500 group-hover:scale-125 transition-all duration-300 shadow-sm" />
                                                    <div className="p-4 rounded-xl hover:bg-white/50 dark:hover:bg-slate-800/50 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-700/50">
                                                        <p className="text-slate-800 dark:text-slate-200 font-medium text-sm">
                                                            {act.type === 'create' && 'Created task '}
                                                            {act.type === 'update' && 'Updated task '}
                                                            {act.type === 'status' && 'Changed status of '}
                                                            <span className="text-blue-600 font-semibold">{act.Task?.title || 'Unknown Task'}</span>
                                                            <span className="block mt-1 text-slate-500 font-normal">{act.description}</span>
                                                        </p>
                                                        <span className="text-xs text-slate-400 mt-1 block font-mono">
                                                            {new Date(act.createdAt).toLocaleString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                    {activities.length > 0 && (
                                        <button className="w-full py-3 mt-4 text-center text-sm font-semibold text-slate-500 hover:text-blue-600 transition-colors border-t border-slate-100 dark:border-slate-800/50">
                                            View Full History
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}