import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import api from '../utils/apiClient';
import TeamMembers from './TeamMembers';

import { useToast } from '../context/ToastContext';

const CreateProject = () => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [teamLeaderId, setTeamLeaderId] = useState('');

    const [users, setUsers] = useState([]);
    const [members, setMembers] = useState([]);
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

    // ... existing ...

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
            await api.post('/projects', { name, description, teamLeaderId, template, members });
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
            <div className="p-8 max-w-2xl mx-auto bg-white rounded-xl shadow-sm border mt-8">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">Create New Project</h2>
                <form onSubmit={createProject}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    required
                                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    placeholder="e.g. Website Redesign"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Team Leader</label>
                                <select
                                    value={teamLeaderId}
                                    onChange={e => setTeamLeaderId(e.target.value)}
                                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="">Select User</option>
                                    {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                className="w-full p-2.5 border border-gray-300 rounded-lg h-[124px] resize-none focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="Briefly describe your project..."
                            />
                        </div>
                    </div>

                    <div className="mb-8">
                        <label className="block text-sm font-medium text-gray-700 mb-3">Select Template</label>
                        <div className="grid grid-cols-3 gap-3">
                            {templates.map(t => (
                                <div
                                    key={t.id}
                                    onClick={() => setTemplate(t.id)}
                                    className={`p-3 border rounded-lg cursor-pointer transition-all ${template === t.id ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-500 ring-offset-1' : 'hover:bg-gray-50'}`}
                                >
                                    <div className="font-semibold text-sm mb-1">{t.label}</div>
                                    <div className="text-xs text-gray-500 leading-tight">{t.desc}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mb-8">
                        <label className="block text-sm font-medium text-gray-700 mb-3">Team Members</label>
                        <TeamMembers onChange={setMembers} />
                    </div>

                    <button type="submit" disabled={loading} className={`px-4 py-2 text-white rounded ${loading ? 'bg-blue-300' : 'bg-blue-600'}`}>
                        {loading ? 'Creating...' : 'Create'}
                    </button>
                </form>
            </div>
            {/* Toasts shown via global ToastProvider */}
            <Footer />
        </>
    );
};
export default CreateProject;