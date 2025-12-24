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
            <div className="min-h-screen bg-gray-50 dark:bg-slate-900 p-8">
                <div className="max-w-4xl mx-auto">
                    {/* Hero / Header Card */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden mb-8">
                        <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
                        <div className="px-8 pb-8 flex flex-col md:flex-row items-end md:items-end gap-6 -mt-12">
                            <div className="relative group">
                                <div className="w-24 h-24 rounded-full border-4 border-white dark:border-slate-800 bg-white dark:bg-slate-700 flex items-center justify-center text-3xl font-bold text-gray-400 shadow-md">
                                    {user.name ? user.name[0].toUpperCase() : <User />}
                                </div>
                                <button className="absolute bottom-0 right-0 p-1.5 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors" title="Change Avatar">
                                    <Camera size={14} />
                                </button>
                            </div>
                            <div className="flex-1 mb-2">
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{user.name}</h1>
                                <p className="text-gray-500 dark:text-gray-400 text-sm flex items-center gap-2">
                                    <Mail size={14} /> {user.email}
                                </p>
                            </div>
                            <div className="mb-2 flex gap-3">
                                <button
                                    onClick={() => setIsEditing(!isEditing)}
                                    className="px-4 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors"
                                >
                                    {isEditing ? 'Cancel Edit' : 'Edit Profile'}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-8">
                        {/* Sidebar Navigation */}
                        <div className="w-full md:w-64 flex-shrink-0">
                            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
                                <nav className="flex flex-col p-2">
                                    <button
                                        onClick={() => setActiveTab('overview')}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'overview' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700'}`}
                                    >
                                        <User size={18} /> Overview
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('security')}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'security' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700'}`}
                                    >
                                        <Shield size={18} /> Security
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('activity')}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'activity' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700'}`}
                                    >
                                        <Clock size={18} /> Activity Log
                                    </button>
                                </nav>
                            </div>
                        </div>

                        {/* Main Content Area */}
                        <div className="flex-1">
                            {activeTab === 'overview' && (
                                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Profile Information</h2>
                                    </div>
                                    <form onSubmit={handleUpdateProfile}>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                                                <input
                                                    type="text"
                                                    disabled={!isEditing}
                                                    value={formData.name}
                                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                    className="w-full p-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                                                <input
                                                    type="email"
                                                    disabled={true} // Usually email change requires verify
                                                    value={formData.email}
                                                    className="w-full p-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none opacity-60 cursor-not-allowed"
                                                />
                                            </div>
                                            {/* Additional fields could go here */}
                                        </div>
                                        {isEditing && (
                                            <div className="mt-6 flex justify-end">
                                                <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                                                    <Save size={16} /> Save Changes
                                                </button>
                                            </div>
                                        )}
                                    </form>
                                </div>
                            )}

                            {activeTab === 'security' && (
                                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
                                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Security Settings</h2>
                                    <div className="space-y-6">
                                        <div className="p-4 border border-blue-100 bg-blue-50 dark:bg-blue-900/10 dark:border-blue-800 rounded-lg">
                                            <div className="flex items-start gap-3">
                                                <Key className="text-blue-600 mt-1" size={20} />
                                                <div>
                                                    <h4 className="font-semibold text-blue-900 dark:text-blue-300">Change Password</h4>
                                                    <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                                                        Ensure your account is using a long, random password to stay secure.
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="mt-4 grid gap-3 max-w-md ml-auto mr-auto md:ml-8">
                                                <input type="password" placeholder="Current Password" className="p-2 border rounded text-sm" />
                                                <input type="password" placeholder="New Password" className="p-2 border rounded text-sm" />
                                                <button className="px-3 py-2 bg-blue-600 text-white rounded text-sm w-fit">Update Password</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'activity' && (
                                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
                                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Recent Activity</h2>
                                    <div className="space-y-4">
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className="flex gap-4 items-start pb-4 border-b last:border-0 border-gray-100 dark:border-slate-700">
                                                <div className="mt-1 w-2 h-2 rounded-full bg-blue-500"></div>
                                                <div>
                                                    <p className="text-sm text-gray-800 dark:text-gray-200">
                                                        Updated task <span className="font-mono bg-gray-100 dark:bg-slate-700 px-1 rounded">PROJ-{100 + i}</span> status to "In Progress"
                                                    </p>
                                                    <span className="text-xs text-gray-400">2 hours ago</span>
                                                </div>
                                            </div>
                                        ))}
                                        <div className="text-center pt-2">
                                            <button className="text-sm text-blue-600 hover:text-blue-700">View all activity</button>
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