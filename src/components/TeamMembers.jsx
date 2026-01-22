import React, { useState, useEffect, useMemo } from 'react';
import api from '../utils/apiClient';
import { User, Check, Search, Users, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '../context/ToastContext';

/**
 * TeamMembers Component
 * Allows selecting up to 8 team members from the user list.
 * 
 * @param {Object} props
 * @param {Array<string>} props.initialSelected - Array of initially selected user IDs
 * @param {Function} props.onChange - Callback when selection changes (receives array of user objects or IDs)
 * @param {boolean} props.returnObjects - If true, onChange returns user objects instead of IDs. Default false (IDs).
 */
export default function TeamMembers({ initialSelected = [], onChange, returnObjects = false }) {
    const [users, setUsers] = useState([]);
    const [selectedIds, setSelectedIds] = useState(initialSelected);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();

    // Configurable limit
    const MAX_SELECTION = 8;

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const data = await api.get('/users');
                if (Array.isArray(data)) {
                    setUsers(data);
                }
            } catch (error) {
                console.error("Failed to fetch users", error);
                showToast({ msg: 'Failed to load team members', type: 'error' });
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, [showToast]);

    // specific to this component's isolated usage if needed, 
    // but typically controlled via props. using local state to allow standalone usage.
    useEffect(() => {
        // Sync props to state if they change significantly? 
        // Usually we avoid this pattern to keep single source of truth,
        // but for now we initialize state from props.
    }, []);

    const filteredUsers = useMemo(() => {
        return users.filter(user =>
            user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }, [users, searchQuery]);

    const toggleSelection = (user) => {
        const isSelected = selectedIds.includes(user.id);
        let newSelection;

        if (isSelected) {
            newSelection = selectedIds.filter(id => id !== user.id);
        } else {
            if (selectedIds.length >= MAX_SELECTION) {
                showToast({ msg: `You can only select up to ${MAX_SELECTION} team members.`, type: 'warning' });
                return;
            }
            newSelection = [...selectedIds, user.id];
        }

        setSelectedIds(newSelection);

        if (onChange) {
            if (returnObjects) {
                const selectedUsers = users.filter(u => newSelection.includes(u.id));
                onChange(selectedUsers);
            } else {
                onChange(newSelection);
            }
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-6 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Users className="text-blue-600" />
                        Team Selection
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                        Select up to {MAX_SELECTION} members for your team.
                    </p>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search team members..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/30 w-full md:w-64 transition-all text-sm"
                    />
                </div>
            </div>

            {/* Selection Counter / Status */}
            <div className={`mb-6 p-4 rounded-xl flex items-center justify-between transition-colors ${selectedIds.length >= MAX_SELECTION ? 'bg-amber-50 border border-amber-200 text-amber-800 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-200' : 'bg-blue-50 border border-blue-100 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200'}`}>
                <div className="flex items-center gap-2 font-semibold">
                    {selectedIds.length >= MAX_SELECTION && <AlertCircle size={20} />}
                    <span>{selectedIds.length} / {MAX_SELECTION} Selected</span>
                </div>
                {selectedIds.length > 0 && (
                    <button
                        onClick={() => {
                            setSelectedIds([]);
                            if (onChange) onChange([]);
                        }}
                        className="text-xs font-bold uppercase tracking-wider hover:opacity-75 transition-opacity"
                    >
                        Clear All
                    </button>
                )}
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <Loader2 className="animate-spin text-blue-600" size={40} />
                </div>
            ) : filteredUsers.length === 0 ? (
                <div className="text-center py-16 text-gray-500 dark:text-gray-400">
                    <p>{searchQuery ? 'No members found matching your search.' : 'No members available.'}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-h-[600px] overflow-y-auto custom-scrollbar pr-1">
                    {filteredUsers.map(user => {
                        const isSelected = selectedIds.includes(user.id);
                        const isLimitReached = !isSelected && selectedIds.length >= MAX_SELECTION;

                        return (
                            <div
                                key={user.id}
                                onClick={() => !isLimitReached && toggleSelection(user)}
                                className={`
                                    relative p-4 rounded-xl border cursor-pointer transition-all duration-200 group
                                    ${isSelected
                                        ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/30 transform scale-[1.02]'
                                        : isLimitReached
                                            ? 'bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700 opacity-50 cursor-not-allowed'
                                            : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-slate-600 hover:shadow-md'
                                    }
                                `}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`
                                        w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 overflow-hidden
                                        ${isSelected
                                            ? 'bg-white text-blue-600'
                                            : 'bg-gradient-to-br from-gray-100 to-gray-200 dark:from-slate-700 dark:to-slate-600 text-gray-600 dark:text-gray-300'
                                        }
                                    `}>
                                        {user.avatar ? (
                                            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                        ) : (
                                            user.name.charAt(0).toUpperCase()
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className={`font-semibold text-sm truncate ${isSelected ? 'text-white' : 'text-gray-900 dark:text-gray-100'}`}>
                                            {user.name}
                                        </h3>
                                        <p className={`text-xs truncate ${isSelected ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'}`}>
                                            {user.email || 'No email'}
                                        </p>
                                    </div>
                                    <div className={`
                                        w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all
                                        ${isSelected
                                            ? 'border-white bg-white text-blue-600'
                                            : 'border-gray-300 dark:border-slate-600 group-hover:border-blue-400'
                                        }
                                    `}>
                                        {isSelected && <Check size={14} strokeWidth={4} />}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}