import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import api from '../utils/apiClient';

const ProjectList = () => {
    const [projects, setProjects] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProjects = async () => {
            const data = await api.get('/projects');
            if (data) setProjects(data);
        };
        fetchProjects();
    }, []);

    return (
        <>
            <Header />
            <div className="p-5">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Your Projects</h2>
                    <button onClick={() => navigate('/create-project')} className="px-3 py-2 bg-green-600 text-white rounded">+ Create Project</button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-5">
                    {projects.map(p => (
                        <div key={p.id} onClick={() => navigate(`/project/${p.id}`)} className="border p-4 cursor-pointer rounded hover:shadow">
                            <h3 className="text-lg font-medium">{p.name}</h3>
                            <p className="text-sm text-gray-600">{p.description}</p>
                            <small className="text-xs text-gray-500">Leader: {p.teamLeader?.name || 'None'}</small>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};
export default ProjectList;