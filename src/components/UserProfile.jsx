import React, { useState } from 'react';
import { Mail, Phone, MapPin, Briefcase, Save, Edit2, CheckCircle, Clock, Layout } from 'lucide-react';

export default function UserProfile({ user, tasks, onUpdateUser }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    company: user.company?.title || 'Unknown',
    address: `${user.address?.address}, ${user.address?.city}`
  });

  // Calculate User Stats
  const userTasks = tasks.filter(t => t.userId === user.id);
  const completed = userTasks.filter(t => t.status === 'Done').length;
  const pending = userTasks.filter(t => t.status !== 'Done').length;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    // In a real app, you would make a PUT request to the API here.
    // For this clone, we update the local state immediately.
    onUpdateUser({
      ...user,
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      company: { ...user.company, title: formData.company },
      // Note: Address structure in dummyjson is complex, simplifying for demo
    });
    setIsEditing(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 w-full">
      {/* --- Header Section --- */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden mb-6">
        <div className="h-32 bg-gradient-to-r from-blue-600 to-blue-400"></div>
        <div className="px-8 pb-8 relative flex flex-col sm:flex-row items-center sm:items-end gap-6">
          <div className="-mt-16 relative">
            <img 
              src={user.image} 
              alt="Profile" 
              className="w-32 h-32 rounded-full border-4 border-white bg-white shadow-md object-cover" 
            />
          </div>
          
          <div className="flex-1 text-center sm:text-left mb-2">
            <h1 className="text-2xl font-bold text-slate-800">
              {user.firstName} {user.lastName}
            </h1>
            <p className="text-slate-500 font-medium flex items-center justify-center sm:justify-start gap-1">
              <Briefcase size={16} /> {user.company?.title || 'Developer'}
            </p>
          </div>

          <button 
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition ${
              isEditing 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {isEditing ? <><Save size={18} /> Save Changes</> : <><Edit2 size={18} /> Edit Profile</>}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* --- Left Column: Stats --- */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-700 mb-4 text-sm uppercase tracking-wider">Workload</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-md">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-full"><Layout size={18} /></div>
                  <span className="text-sm font-medium text-slate-700">Total Tasks</span>
                </div>
                <span className="text-xl font-bold text-slate-800">{userTasks.length}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 rounded-md">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 text-green-600 rounded-full"><CheckCircle size={18} /></div>
                  <span className="text-sm font-medium text-slate-700">Completed</span>
                </div>
                <span className="text-xl font-bold text-slate-800">{completed}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-md">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 text-orange-600 rounded-full"><Clock size={18} /></div>
                  <span className="text-sm font-medium text-slate-700">Pending</span>
                </div>
                <span className="text-xl font-bold text-slate-800">{pending}</span>
              </div>
            </div>
          </div>
        </div>

        {/* --- Right Column: Details Form --- */}
        <div className="md:col-span-2">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 h-full">
            <h3 className="font-bold text-slate-700 mb-6 text-sm uppercase tracking-wider">Contact Information</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-500">First Name</label>
                <input 
                  type="text" 
                  name="firstName"
                  disabled={!isEditing}
                  value={formData.firstName}
                  onChange={handleChange}
                  className={`w-full p-2.5 rounded border ${isEditing ? 'border-blue-300 bg-white focus:ring-2 focus:ring-blue-200' : 'border-slate-200 bg-slate-50 text-slate-600'}`}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-500">Last Name</label>
                <input 
                  type="text" 
                  name="lastName"
                  disabled={!isEditing}
                  value={formData.lastName}
                  onChange={handleChange}
                  className={`w-full p-2.5 rounded border ${isEditing ? 'border-blue-300 bg-white focus:ring-2 focus:ring-blue-200' : 'border-slate-200 bg-slate-50 text-slate-600'}`}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-500 flex items-center gap-2"><Mail size={14}/> Email Address</label>
                <input 
                  type="email" 
                  name="email"
                  disabled={!isEditing}
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full p-2.5 rounded border ${isEditing ? 'border-blue-300 bg-white focus:ring-2 focus:ring-blue-200' : 'border-slate-200 bg-slate-50 text-slate-600'}`}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-500 flex items-center gap-2"><Phone size={14}/> Phone Number</label>
                <input 
                  type="text" 
                  name="phone"
                  disabled={!isEditing}
                  value={formData.phone}
                  onChange={handleChange}
                  className={`w-full p-2.5 rounded border ${isEditing ? 'border-blue-300 bg-white focus:ring-2 focus:ring-blue-200' : 'border-slate-200 bg-slate-50 text-slate-600'}`}
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-semibold text-slate-500 flex items-center gap-2"><MapPin size={14}/> Address</label>
                <input 
                  type="text" 
                  name="address"
                  disabled={!isEditing}
                  value={formData.address}
                  onChange={handleChange}
                  className={`w-full p-2.5 rounded border ${isEditing ? 'border-blue-300 bg-white focus:ring-2 focus:ring-blue-200' : 'border-slate-200 bg-slate-50 text-slate-600'}`}
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-semibold text-slate-500 flex items-center gap-2"><Briefcase size={14}/> Job Title</label>
                <input 
                  type="text" 
                  name="company"
                  disabled={!isEditing}
                  value={formData.company}
                  onChange={handleChange}
                  className={`w-full p-2.5 rounded border ${isEditing ? 'border-blue-300 bg-white focus:ring-2 focus:ring-blue-200' : 'border-slate-200 bg-slate-50 text-slate-600'}`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}