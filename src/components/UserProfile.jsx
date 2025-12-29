import React, { useState, useEffect } from 'react';
import Header from './Header';
import { User, Mail, Shield, Clock, Camera, Save, Key } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import api from '../utils/apiClient';

export default function UserProfile() {
    const { showToast } = useToast();
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', currentPassword: '', newPassword: '' });

    useEffect(() => {
        try {
            const stored = JSON.parse(localStorage.getItem('user'));
            if (stored) {
                setUser(stored);
                setFormData(prev => ({ ...prev, name: stored.name, email: stored.email }));
            }
        } catch (e) {
            console.error(e);
        }
    }, []);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        // This would connect to an endpoint like PUT /users/:id or PUT /auth/profile
        // For now, we'll simulate a local update
        try {
            // Mock API call
            await new Promise(r => setTimeout(r, 800));

            const updated = { ...user, name: formData.name };
            localStorage.setItem('user', JSON.stringify(updated));
            setUser(updated);
            setIsEditing(false);
            showToast({ msg: 'Profile updated successfully' });
        } catch (err) {
            showToast({ msg: 'Failed to update profile' });
        }
    };

    if (!user) return <div className="p-10 text-center">Loading profile...</div>;

    return (
        <>
            <Header />
            <div className="min-h-screen p-8 animate-in fade-in duration-500">
                <div className="max-w-4xl mx-auto">
                    {/* Hero / Header Card */}
                    <div className="glass-panel rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden mb-8">
                        <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600 animate-gradient-xy"></div>
                        <div className="px-8 pb-8 flex flex-col md:flex-row items-end md:items-end gap-6 -mt-12">
                            <div className="relative group">
                                <div className="w-24 h-24 rounded-2xl border-4 border-white dark:border-slate-900 bg-white dark:bg-slate-700 flex items-center justify-center text-3xl font-bold text-gray-400 shadow-lg overflow-hidden">
                                    {user.name ? <span className="bg-gradient-to-br from-blue-500 to-indigo-500 w-full h-full flex items-center justify-center text-white">{user.name[0].toUpperCase()}</span> : <User />}
                                </div>
                                <button className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-xl shadow-lg hover:bg-blue-700 hover:scale-105 transition-all" title="Change Avatar">
                                    <Camera size={16} />
                                </button>
                            </div>
                            <div className="flex-1 mb-2">
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">{user.name}</h1>
                                <p className="text-gray-500 dark:text-gray-400 text-sm flex items-center gap-2 mt-1">
                                    <Mail size={14} /> {user.email}
                                </p>
                            </div>
                            <div className="mb-2 flex gap-3">
                                <button
                                    onClick={() => setIsEditing(!isEditing)}
                                    className="px-5 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-semibold hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
                                >
                                    {isEditing ? 'Cancel Edit' : 'Edit Profile'}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-8">
                        {/* Sidebar Navigation */}
                        <div className="w-full md:w-64 flex-shrink-0">
                            <div className="glass-panel rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden p-2">
                                <nav className="flex flex-col space-y-1">
                                    {['overview', 'security', 'activity'].map(tab => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveTab(tab)}
                                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === tab
                                                ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 shadow-sm'
                                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800'
                                                }`}
                                        >
                                            {tab === 'overview' && <User size={18} />}
                                            {tab === 'security' && <Shield size={18} />}
                                            {tab === 'activity' && <Clock size={18} />}
                                            <span className="capitalize">{tab}</span>
                                        </button>
                                    ))}
                                </nav>
                            </div>
                        </div>

                        {/* Main Content Area */}
                        <div className="flex-1">
                            {activeTab === 'overview' && (
                                <div className="glass-panel rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-8 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <div className="flex items-center justify-between mb-8">
                                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Profile Information</h2>
                                    </div>
                                    <form onSubmit={handleUpdateProfile}>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
                                                <input
                                                    type="text"
                                                    disabled={!isEditing}
                                                    value={formData.name}
                                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                    className="w-full p-3 bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
                                                <input
                                                    type="email"
                                                    disabled={true}
                                                    value={formData.email}
                                                    className="w-full p-3 bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-xl text-sm opacity-60 cursor-not-allowed"
                                                />
                                            </div>
                                        </div>
                                        {isEditing && (
                                            <div className="mt-8 flex justify-end">
                                                <button type="submit" className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg hover:shadow-blue-500/30">
                                                    <Save size={18} /> Save Changes
                                                </button>
                                            </div>
                                        )}
                                    </form>
                                </div>
                            )}

                            {activeTab === 'security' && (
                                <div className="glass-panel rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-8 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Security Settings</h2>
                                    <div className="space-y-6">
                                        <div className="p-6 border border-blue-100 bg-blue-50/50 dark:bg-blue-900/10 dark:border-blue-800 rounded-2xl">
                                            <div className="flex items-start gap-4">
                                                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                                                    <Key size={24} />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-blue-900 dark:text-blue-300 text-lg">Change Password</h4>
                                                    <p className="text-sm text-blue-700 dark:text-blue-400/80 mt-1 max-w-lg leading-relaxed">
                                                        Ensure your account is using a long, random password to stay secure. We recommend using a password manager.
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="mt-6 grid gap-4 max-w-md ml-auto mr-auto md:ml-14">
                                                <input type="password" placeholder="Current Password" className="p-3 border border-blue-200 dark:border-blue-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
                                                <input type="password" placeholder="New Password" className="p-3 border border-blue-200 dark:border-blue-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
                                                <button className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium w-fit shadow-md hover:bg-blue-700 transition-colors">Update Password</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'activity' && (
                                <div className="glass-panel rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-8 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Recent Activity</h2>
                                    <div className="space-y-1">
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className="flex gap-4 items-start p-4 hover:bg-gray-50/50 dark:hover:bg-slate-800/50 rounded-xl transition-colors group cursor-default">
                                                <div className="mt-1.5 w-2 h-2 rounded-full bg-blue-500 ring-4 ring-blue-100 dark:ring-blue-900/30"></div>
                                                <div>
                                                    <p className="text-sm text-gray-800 dark:text-gray-200 font-medium">
                                                        Updated task <span className="font-mono text-xs bg-gray-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-gray-600 dark:text-gray-300">PROJ-{100 + i}</span> status to "In Progress"
                                                    </p>
                                                    <span className="text-xs text-gray-400 mt-1 block">2 hours ago</span>
                                                </div>
                                            </div>
                                        ))}
                                        <div className="text-center pt-4">
                                            <button className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline">View all activity</button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}