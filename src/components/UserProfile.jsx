import React, { useState, useEffect } from 'react';
import { Mail, MapPin, Briefcase, Save, Edit2, CheckCircle, Clock, Layout, Camera, User } from 'lucide-react';

export default function UserProfile({ user, tasks, onUpdateUser, isDarkMode }) {
  const [isEditing, setIsEditing] = useState(false);
  
  // Local form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    title: '',
    image: '',
    city: ''
  });

  // Load user data into form on mount
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        title: user.company?.title || 'Team Member',
        image: user.image || '',
        city: user.address?.city || 'Remote'
      });
    }
  }, [user]);

  // Calculate Stats
  const userTasks = tasks.filter(t => t.userId === user.id);
  const completed = userTasks.filter(t => t.status === 'Done').length;
  const pending = userTasks.length - completed;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Create updated user object
    const updatedUser = {
      ...user,
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      image: formData.image,
      company: { ...user.company, title: formData.title },
      address: { ...user.address, city: formData.city }
    };
    onUpdateUser(updatedUser);
    setIsEditing(false);
  };

  const themeClasses = {
    card: isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200',
    text: isDarkMode ? 'text-slate-100' : 'text-slate-900',
    subText: isDarkMode ? 'text-slate-400' : 'text-slate-500',
    input: isDarkMode ? 'bg-slate-700 border-slate-600 text-white focus:ring-blue-500' : 'bg-slate-50 border-slate-200 text-slate-800 focus:ring-blue-200',
    label: isDarkMode ? 'text-slate-300' : 'text-slate-600',
  };

  return (
    <div className={`p-8 max-w-5xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4`}>
      
      {/* --- HEADER CARD --- */}
      <div className={`rounded-2xl shadow-sm border overflow-hidden mb-8 ${themeClasses.card}`}>
        {/* Banner */}
        <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
        
        <div className="px-8 pb-8 relative flex flex-col md:flex-row items-center md:items-end gap-6">
          {/* Avatar */}
          <div className="-mt-16 relative group">
            <img 
              src={formData.image || 'https://via.placeholder.com/150'} 
              alt="Profile" 
              className={`w-32 h-32 rounded-full border-4 shadow-md object-cover ${isDarkMode ? 'border-slate-800' : 'border-white'}`} 
            />
            {isEditing && (
              <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer">
                <Camera className="text-white" />
              </div>
            )}
          </div>
          
          {/* Name & Title */}
          <div className="flex-1 text-center md:text-left mb-2">
            <h1 className={`text-3xl font-bold ${themeClasses.text}`}>
              {formData.firstName} {formData.lastName}
            </h1>
            <p className={`font-medium flex items-center justify-center md:justify-start gap-2 ${themeClasses.subText}`}>
              <Briefcase size={16} /> {formData.title} 
              <span className="mx-1">•</span>
              <MapPin size={16} /> {formData.city}
            </p>
          </div>

          {/* Edit Button */}
          <button 
            onClick={() => isEditing ? handleSubmit({preventDefault:()=>{}}) : setIsEditing(true)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold transition shadow-sm ${
              isEditing 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : (isDarkMode ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-white border border-slate-300 hover:bg-slate-50 text-slate-700')
            }`}
          >
            {isEditing ? <><Save size={18} /> Save Changes</> : <><Edit2 size={18} /> Edit Profile</>}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* --- LEFT COL: STATS --- */}
        <div className="space-y-6">
          <div className={`p-6 rounded-2xl shadow-sm border ${themeClasses.card}`}>
            <h3 className={`font-bold text-sm uppercase tracking-wider mb-6 ${themeClasses.subText}`}>Performance</h3>
            
            <div className="space-y-4">
              {/* Total */}
              <div className={`flex items-center justify-between p-4 rounded-xl ${isDarkMode ? 'bg-slate-700/50' : 'bg-blue-50'}`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-slate-600 text-blue-400' : 'bg-blue-100 text-blue-600'}`}><Layout size={20} /></div>
                  <span className={`font-semibold ${themeClasses.text}`}>Total Tasks</span>
                </div>
                <span className={`text-xl font-bold ${themeClasses.text}`}>{userTasks.length}</span>
              </div>

              {/* Completed */}
              <div className={`flex items-center justify-between p-4 rounded-xl ${isDarkMode ? 'bg-slate-700/50' : 'bg-emerald-50'}`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-slate-600 text-emerald-400' : 'bg-emerald-100 text-emerald-600'}`}><CheckCircle size={20} /></div>
                  <span className={`font-semibold ${themeClasses.text}`}>Completed</span>
                </div>
                <span className={`text-xl font-bold ${themeClasses.text}`}>{completed}</span>
              </div>

              {/* Pending */}
              <div className={`flex items-center justify-between p-4 rounded-xl ${isDarkMode ? 'bg-slate-700/50' : 'bg-orange-50'}`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-slate-600 text-orange-400' : 'bg-orange-100 text-orange-600'}`}><Clock size={20} /></div>
                  <span className={`font-semibold ${themeClasses.text}`}>Pending</span>
                </div>
                <span className={`text-xl font-bold ${themeClasses.text}`}>{pending}</span>
              </div>
            </div>
          </div>
        </div>

        {/* --- RIGHT COL: EDIT FORM --- */}
        <div className="lg:col-span-2">
          <div className={`p-6 rounded-2xl shadow-sm border h-full ${themeClasses.card}`}>
            <h3 className={`font-bold text-sm uppercase tracking-wider mb-6 ${themeClasses.subText}`}>Personal Information</h3>
            
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="space-y-2">
                <label className={`text-sm font-bold ${themeClasses.label}`}>First Name</label>
                <input 
                  type="text" name="firstName" disabled={!isEditing}
                  value={formData.firstName} onChange={handleChange}
                  className={`w-full p-3 rounded-lg border outline-none transition ${themeClasses.input} ${!isEditing && 'opacity-60 cursor-not-allowed'}`}
                />
              </div>

              <div className="space-y-2">
                <label className={`text-sm font-bold ${themeClasses.label}`}>Last Name</label>
                <input 
                  type="text" name="lastName" disabled={!isEditing}
                  value={formData.lastName} onChange={handleChange}
                  className={`w-full p-3 rounded-lg border outline-none transition ${themeClasses.input} ${!isEditing && 'opacity-60 cursor-not-allowed'}`}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className={`text-sm font-bold ${themeClasses.label} flex items-center gap-2`}><Mail size={14}/> Email Address</label>
                <input 
                  type="email" name="email" disabled={!isEditing}
                  value={formData.email} onChange={handleChange}
                  className={`w-full p-3 rounded-lg border outline-none transition ${themeClasses.input} ${!isEditing && 'opacity-60 cursor-not-allowed'}`}
                />
              </div>

              <div className="space-y-2">
                <label className={`text-sm font-bold ${themeClasses.label} flex items-center gap-2`}><Briefcase size={14}/> Job Title</label>
                <input 
                  type="text" name="title" disabled={!isEditing}
                  value={formData.title} onChange={handleChange}
                  className={`w-full p-3 rounded-lg border outline-none transition ${themeClasses.input} ${!isEditing && 'opacity-60 cursor-not-allowed'}`}
                />
              </div>

              <div className="space-y-2">
                <label className={`text-sm font-bold ${themeClasses.label} flex items-center gap-2`}><MapPin size={14}/> Location</label>
                <input 
                  type="text" name="city" disabled={!isEditing}
                  value={formData.city} onChange={handleChange}
                  className={`w-full p-3 rounded-lg border outline-none transition ${themeClasses.input} ${!isEditing && 'opacity-60 cursor-not-allowed'}`}
                />
              </div>

              {isEditing && (
                <div className="space-y-2 md:col-span-2">
                   <label className={`text-sm font-bold ${themeClasses.label} flex items-center gap-2`}><Camera size={14}/> Avatar URL</label>
                   <input 
                    type="text" name="image"
                    value={formData.image} onChange={handleChange}
                    placeholder="https://example.com/my-photo.jpg"
                    className={`w-full p-3 rounded-lg border outline-none transition ${themeClasses.input}`}
                  />
                  <p className="text-xs text-slate-400">Paste a direct image link to update your avatar.</p>
                </div>
              )}
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}