import React, { useState } from 'react';
import api from '../utils/apiClient';
import { useToast } from '../context/ToastContext';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isRegister, setIsRegister] = useState(false);
    const [name, setName] = useState('');

    const { showToast } = useToast();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const endpoint = isRegister ? 'register' : 'login';
        const body = isRegister ? { name, email, password } : { email, password };

        try {
            const data = await api.post(`/users/${endpoint}`, body);
            if (data) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data));
                window.location.href = '/dashboard';
            }
        } catch (err) {
            const msg = err?.data?.message || err.message || 'Server Error';
            showToast({ msg });
        }
    };

    return (
        <div className="flex justify-center mt-12">
            <form onSubmit={handleSubmit} className="p-6 border rounded-md w-full max-w-sm bg-white">
                <h2 className="text-xl font-semibold mb-4">{isRegister ? 'Register' : 'Login'}</h2>
                {isRegister && (
                    <input type="text" placeholder="Name" value={name} onChange={e => setName(e.target.value)} required className="block w-full mb-3 p-2 border rounded" />
                )}
                <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required className="block w-full mb-3 p-2 border rounded" />
                <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required className="block w-full mb-3 p-2 border rounded" />
                <button type="submit" className="cursor-pointer px-3 py-2 bg-blue-600 text-white rounded">{isRegister ? 'Sign Up' : 'Log In'}</button>
                <p onClick={() => setIsRegister(!isRegister)} className="mt-3 cursor-pointer text-blue-600">
                    {isRegister ? 'Already have account? Login' : 'No account? Register'}
                </p>
            </form>
            {/* Toasts shown via global ToastProvider */}
        </div>
    );
};
export default LoginPage;