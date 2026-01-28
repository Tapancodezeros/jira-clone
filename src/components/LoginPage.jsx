import React, { useState } from 'react';
import api from '../utils/apiClient';
import { useToast } from '../context/ToastContext';
import { Mail, Lock, User, ArrowRight, Layout, CheckCircle, Shield } from 'lucide-react';

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
            showToast({ msg, type: 'error' });
        }
    };

    return (
        <div className="min-h-screen flex bg-slate-50 dark:bg-slate-900">
            {/* Left Side - Brand & Visuals */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-blue-600 overflow-hidden items-center justify-center p-12">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-900"></div>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>

                {/* Abstract Shapes */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
                    <div className="absolute -top-[20%] -left-[10%] w-[600px] h-[600px] bg-blue-400/20 rounded-full blur-[100px] animate-pulse-slow"></div>
                    <div className="absolute bottom-[0%] right-[-10%] w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[120px] animate-pulse-slow delay-1000"></div>
                </div>

                <div className="relative z-10 text-white max-w-lg">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center mb-8 border border-white/30 shadow-xl">
                        <Layout size={32} className="text-white" />
                    </div>
                    <h1 className="text-5xl font-bold mb-6 leading-tight">Manage your projects with clarify and focus.</h1>
                    <p className="text-blue-100 text-lg mb-8 leading-relaxed">
                        Join thousands of teams who use our platform to plan, track, and release great software. Experience the new standard in project management.
                    </p>

                    <div className="space-y-4">
                        <div className="flex items-center gap-4 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10">
                            <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-300"><CheckCircle size={20} /></div>
                            <div>
                                <h3 className="font-bold">Track Progress</h3>
                                <p className="text-sm text-blue-200">Visual boards and real-time reports</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10">
                            <div className="p-2 bg-purple-500/20 rounded-lg text-purple-300"><Shield size={20} /></div>
                            <div>
                                <h3 className="font-bold">Enterprise Security</h3>
                                <p className="text-sm text-blue-200">Bank-grade data protection</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12 relative">
                <div className="absolute top-0 right-0 p-8 hidden md:block">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        {isRegister ? 'Already check in?' : "New here?"}{' '}
                        <button
                            onClick={() => setIsRegister(!isRegister)}
                            className="font-bold text-blue-600 hover:text-blue-700 ml-1 transition-colors"
                        >
                            {isRegister ? 'Log in' : 'Create an account'}
                        </button>
                    </p>
                </div>

                <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
                            {isRegister ? 'Create an account' : 'Welcome back'}
                        </h2>
                        <p className="text-slate-500 mt-2">
                            {isRegister ? 'Start your journey with us today.' : 'Please enter your details.'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {isRegister && (
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Full Name</label>
                                <div className="relative group">
                                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                                    <input
                                        type="text"
                                        placeholder="John Doe"
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        required
                                        className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none font-medium text-slate-900 dark:text-white"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Email</label>
                            <div className="relative group">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                                <input
                                    type="email"
                                    placeholder="name@company.com"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none font-medium text-slate-900 dark:text-white"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none font-medium text-slate-900 dark:text-white"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                                <span className="text-sm text-slate-500">Remember for 30 days</span>
                            </label>
                            {!isRegister && (
                                <button type="button" className="text-sm font-semibold text-blue-600 hover:text-blue-700">Forgot password?</button>
                            )}
                        </div>

                        <button
                            type="submit"
                            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2"
                        >
                            {isRegister ? 'Sign up' : 'Sign in'}
                            <ArrowRight size={20} />
                        </button>
                    </form>

                    <div className="pt-6 text-center lg:hidden">
                        <p className="text-sm text-slate-500">
                            {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
                            <button
                                onClick={() => setIsRegister(!isRegister)}
                                className="text-blue-600 font-bold hover:underline"
                            >
                                {isRegister ? 'Log in' : 'Sign up'}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;