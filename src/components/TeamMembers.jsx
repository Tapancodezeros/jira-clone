import React, { useState, useEffect } from 'react';
import { Mail, MapPin, Briefcase } from 'lucide-react';

const API_URL = 'https://dummyjson.com';

export default function TeamMembers() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/users?limit=8`)
      .then(res => res.json())
      .then(data => {
        setMembers(data.users);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-10 text-center text-slate-500">Loading team...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Team Members</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {members.map((user) => (
          <div key={user.id} className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition">
            <div className="h-20 bg-blue-600"></div>
            <div className="px-6 pb-6 relative">
              <div className="w-20 h-20 rounded-full border-4 border-white overflow-hidden -mt-10 mb-3 bg-white">
                <img src={user.image} alt={user.firstName} className="w-full h-full object-cover" />
              </div>
              
              <h3 className="font-bold text-lg text-slate-800">{user.firstName} {user.lastName}</h3>
              <p className="text-blue-600 text-sm font-medium mb-4 flex items-center gap-1">
                <Briefcase size={14} /> {user.company.title}
              </p>

              <div className="space-y-2 text-sm text-slate-500">
                <div className="flex items-center gap-2">
                  <Mail size={16} className="text-slate-400" />
                  <span className="truncate">{user.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-slate-400" />
                  <span>{user.address.city}, {user.address.stateCode}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}