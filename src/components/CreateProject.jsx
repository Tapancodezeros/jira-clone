import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import api from '../utils/apiClient';
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

    const createProject = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        setLoading(true);
        try {
            await api.post('/projects', { name, description, teamLeaderId });
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
            <div className="p-5 max-w-md mx-auto">
                <h2 className="text-2xl font-semibold mb-4">Create New Project</h2>
                <form onSubmit={createProject}>
                    <div className="mb-3">
                        <label className="block mb-1">Name:</label>
                        <input type="text" value={name} onChange={e=>setName(e.target.value)} required className="w-full p-2 border rounded" />
                    </div>
                    <div className="mb-3">
                        <label className="block mb-1">Description:</label>
                        <textarea value={description} onChange={e=>setDescription(e.target.value)} className="w-full p-2 border rounded" />
                    </div>
                    <div className="mb-3">
                        <label className="block mb-1">Team Leader:</label>
                        <select value={teamLeaderId} onChange={e=>setTeamLeaderId(e.target.value)} className="w-full p-2 border rounded">
                            <option value="">Select User</option>
                            {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                        </select>
                    </div>
                    <button type="submit" disabled={loading} className={`px-4 py-2 text-white rounded ${loading ? 'bg-blue-300' : 'bg-blue-600'}`}>
                        {loading ? 'Creating...' : 'Create'}
                    </button>
                </form>
            </div>
            {/* Toasts shown via global ToastProvider */}
        </>
    );
};
export default CreateProject;