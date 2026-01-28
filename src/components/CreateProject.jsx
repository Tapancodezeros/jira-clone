import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import api from '../utils/apiClient';
import { ArrowLeft } from 'lucide-react';

import { useToast } from '../context/ToastContext';

const CreateProject = () => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [teamLeaderId, setTeamLeaderId] = useState('');

    const [users, setUsers] = useState([]);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const { showToast } = useToast();

    useEffect(() => {
        const fetchUsers = async () => {
            const data = await api.get('/users');
            if (data) setUsers(data);
        };
        fetchUsers();
    }, []);

    const validateForm = () => {
        if (!name.trim()) {
            showToast({ msg: 'Project name is required' });
            return false;
        }
        return true;
    };

    const [template, setTemplate] = useState('Kanban');

    const templates = [
        { id: 'Kanban', label: 'Kanban', desc: 'Visualize work with a simple board.' },
        { id: 'Scrum', label: 'Scrum', desc: 'Sprint-based project management.' },
        { id: 'Bug Tracking', label: 'Bug Tracking', desc: 'Manage and track software bugs.' }
    ];

    const createProject = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        setLoading(true);
        try {
            await api.post('/projects', { name, description, teamLeaderId, template, members: [] });
            showToast({ msg: 'Project created' });
            setTimeout(() => navigate('/dashboard'), 700);
        } catch (err) {
            showToast({ msg: err?.data?.message || err.message || 'Failed to create project' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Header />
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pt-8 pb-20">
                <div className="p-8 max-w-2xl mx-auto bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <button onClick={() => navigate(-1)} className="mb-4 flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors">
                        <ArrowLeft size={16} /> Back
                    </button>
                    <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-white">Create New Project</h2>
                    <form onSubmit={createProject}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Project Name</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        required
                                        className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-slate-900 dark:text-white"
                                        placeholder="e.g. Website Redesign"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Team Leader</label>
                                    <select
                                        value={teamLeaderId}
                                        onChange={e => setTeamLeaderId(e.target.value)}
                                        className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
                                    >
                                        <option value="">Select User</option>
                                        {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                                <textarea
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg h-[124px] resize-none focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
                                    placeholder="Briefly describe your project..."
                                />
                            </div>
                        </div>

                        <div className="mb-8">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Select Template</label>
                            <div className="grid grid-cols-3 gap-3">
                                {templates.map(t => (
                                    <div
                                        key={t.id}
                                        onClick={() => setTemplate(t.id)}
                                        className={`p-3 border rounded-lg cursor-pointer transition-all ${template === t.id ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-500 ring-offset-1 dark:ring-offset-slate-800' : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}
                                    >
                                        <div className={`font-semibold text-sm mb-1 ${template === t.id ? 'text-blue-700 dark:text-blue-400' : 'text-slate-900 dark:text-white'}`}>{t.label}</div>
                                        <div className={`text-xs leading-tight ${template === t.id ? 'text-blue-600 dark:text-blue-300' : 'text-slate-500 dark:text-slate-400'}`}>{t.desc}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button type="submit" disabled={loading} className={`px-4 py-2 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}>
                            {loading ? 'Creating Project...' : 'Create Project'}
                        </button>
                    </form>
                </div>
            </div>
            <Footer />
        </>
    );
};
export default CreateProject;