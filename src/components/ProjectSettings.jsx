import React, { useState } from 'react';
import { User, Trash2, Shield, Search } from 'lucide-react';

const ProjectSettings = ({ project, members, allUsers, onAddMember, onRemoveMember, currentUserId }) => {
    const [searchUser, setSearchUser] = useState('');
    const isOwner = project && (String(project.ownerId) === String(currentUserId) || String(project.teamLeaderId) === String(currentUserId));

    const nonMembers = allUsers.filter(u => !members.find(m => String(m.id) === String(u.id)));
    const filteredNonMembers = nonMembers.filter(u => u.name.toLowerCase().includes(searchUser.toLowerCase()));

    return (
        <div className="flex-1 h-full overflow-y-auto custom-scrollbar p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Project Settings</h1>
                    <p className="text-gray-500 text-sm">Manage details and team members for {project?.name}</p>
                </div>

                {/* Project Details */}
                <div className="bg-white dark:bg-slate-900/50 rounded-xl border border-gray-200 dark:border-slate-800 p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-700 dark:text-gray-200 mb-4">Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Project Name</label>
                            <div className="w-full p-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-700 dark:text-gray-300 font-medium">
                                {project?.name}
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Project Key</label>
                            <div className="w-full p-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-700 dark:text-gray-300 font-medium">
                                {project?.name?.substring(0, 3).toUpperCase()}-{project?.id}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Team Access */}
                <div className="bg-white dark:bg-slate-900/50 rounded-xl border border-gray-200 dark:border-slate-800 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-gray-700 dark:text-gray-200">Access Management</h3>
                            <p className="text-sm text-gray-500">Control who has access to this project</p>
                        </div>
                        <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">{members.length} Members</span>
                    </div>

                    {isOwner && (
                        <div className="mb-8 p-4 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-gray-100 dark:border-slate-800">
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Add People</label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    <input
                                        type="text"
                                        placeholder="Search Project to add..."
                                        className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 text-sm"
                                        value={searchUser}
                                        onChange={e => setSearchUser(e.target.value)}
                                    />
                                    {searchUser && filteredNonMembers.length > 0 && (
                                        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl shadow-xl z-20 max-h-48 overflow-y-auto">
                                            {filteredNonMembers.map(u => (
                                                <div
                                                    key={u.id}
                                                    onClick={() => { onAddMember(u.id); setSearchUser(''); }}
                                                    className="p-3 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center justify-between cursor-pointer transition-colors"
                                                >
                                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{u.name}</span>
                                                    <PlusButton />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="space-y-1">
                        {members.map(member => (
                            <div key={member.id} className="group flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                                        {member.name[0]}
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-gray-800 dark:text-gray-100">{member.name}</div>
                                        <div className="text-xs text-gray-500 flex items-center gap-1">
                                            {String(project.ownerId) === String(member.id) ? (
                                                <span className="text-amber-500 flex items-center gap-1"><Shield size={10} fill="currentColor" /> Owner</span>
                                            ) : 'Member'}
                                            {String(currentUserId) === String(member.id) && <span className="text-blue-500 ml-1">(You)</span>}
                                        </div>
                                    </div>
                                </div>
                                {isOwner && String(member.id) !== String(project.ownerId) && (
                                    <button
                                        onClick={() => onRemoveMember(member.id)}
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                        title="Remove from project"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const PlusButton = () => (
    <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
    </div>
)

export default ProjectSettings;
