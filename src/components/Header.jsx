import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Home } from 'lucide-react';

const Header = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = '/';
    };

    return (
        <header className="p-4 bg-blue-700 text-white flex justify-between items-center">
            <div className="flex items-center gap-3">
                <Home size={20} cursor="pointer" onClick={() => navigate('/dashboard')} />
                <h3 className="m-0 text-lg font-semibold">Jira Clone</h3>
            </div>
            <div className="flex items-center gap-4">
                <span className="text-sm">Welcome, {user?.name}</span>
                <button onClick={handleLogout} className="bg-transparent border-0 text-white cursor-pointer p-1">
                    <LogOut size={20} />
                </button>
            </div>
        </header>
    );
};
export default Header;