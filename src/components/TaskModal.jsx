import React, { useState, useEffect } from 'react';
import { X, Calendar, Send, MessageSquare, Tag, CheckSquare, Trash2, History, Paperclip, File } from 'lucide-react';

export default function TaskModal({ isOpen, onClose, onSave, editingTask, currentUser, team }) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [dueDate, setDueDate] = useState('');
  const [comments, setComments] = useState([]);
  const [tags, setTags] = useState([]);
  const [subtasks, setSubtasks] = useState([]);
  const [assignee, setAssignee] = useState(null);
  const [history, setHistory] = useState([]);
  
  // New: Attachments State
  const [attachments, setAttachments] = useState([]);

  const [tagInput, setTagInput] = useState('');
  const [subtaskInput, setSubtaskInput] = useState('');
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setPriority(editingTask.priority);
      setDueDate(editingTask.dueDate || '');
      setComments(editingTask.comments || []);
      setTags(editingTask.tags || []);
      setSubtasks(editingTask.subtasks || []);
      setAssignee(editingTask.assignee || null);
      setHistory(editingTask.history || []);
      setAttachments(editingTask.attachments || []); // Load Attachments
    } else {
      setTitle('');
      setPriority('Medium');
      setDueDate('');
      setComments([]);
      setTags([]);
      setSubtasks([]);
      setAssignee(null);
      setHistory([]);
      setAttachments([]);
    }
    setNewComment('');
    setTagInput('');
    setSubtaskInput('');
  }, [editingTask, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({ title, priority, dueDate, comments, tags, subtasks, assignee, attachments });
  };

  // --- Attachment Logic ---
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const newAttachment = {
        id: Date.now(),
        name: file.name,
        size: (file.size / 1024).toFixed(1) + ' KB',
        type: file.type,
        date: new Date().toLocaleDateString()
      };
      setAttachments([...attachments, newAttachment]);
    }
  };

  const deleteAttachment = (id) => {
    setAttachments(attachments.filter(a => a.id !== id));
  };

  // ... (Previous helpers: handleAddSubtask, etc. - ensure these are present)
  const handleAddSubtask = (e) => { e.preventDefault(); if (subtaskInput.trim()) { setSubtasks([...subtasks, { id: Date.now(), title: subtaskInput, completed: false }]); setSubtaskInput(''); } };
  const toggleSubtask = (id) => { setSubtasks(subtasks.map(s => s.id === id ? { ...s, completed: !s.completed } : s)); };
  const deleteSubtask = (id) => { setSubtasks(subtasks.filter(s => s.id !== id)); };
  const handleTagKeyDown = (e) => { if (e.key === 'Enter') { e.preventDefault(); if (tagInput.trim() && !tags.includes(tagInput.trim())) { setTags([...tags, tagInput.trim()]); setTagInput(''); } } };
  const removeTag = (tagToRemove) => setTags(tags.filter(t => t !== tagToRemove));
  const handleAddComment = (e) => { e.preventDefault(); if (!newComment.trim()) return; setComments([...comments, { id: Date.now(), text: newComment, user: currentUser, createdAt: new Date().toLocaleString() }]); setNewComment(''); };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh]">
        
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">{editingTask ? 'Edit Issue' : 'Create New Issue'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          <form id="taskForm" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* LEFT COLUMN */}
            <div className="md:col-span-2 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Summary</label>
                <input autoFocus type="text" className="w-full p-2.5 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Task title..." value={title} onChange={(e) => setTitle(e.target.value)}/>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  <Tag size={14} /> Tags</label>
                <div className="flex flex-wrap gap-2 p-2 border border-slate-300 rounded min-h-[42px]">
                  {tags.map(tag => (
                    <span key={tag} className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold flex items-center gap-1">{tag} <button type="button" onClick={() => removeTag(tag)}><X size={12}/></button></span>
                  ))}
                  <input type="text" className="flex-1 outline-none text-sm min-w-[60px]" placeholder="Add tag..." value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={handleTagKeyDown} />
                </div>
              </div>

              {/* Attachments Section (NEW) */}
              <div className="bg-slate-50 p-4 rounded border border-slate-200">
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-semibold text-slate-700 flex items-center gap-2"><Paperclip size={14} /> Attachments</label>
                  <label className="cursor-pointer bg-slate-200 hover:bg-slate-300 px-2 py-1 rounded text-xs font-bold text-slate-600 transition">
                    Upload
                    <input type="file" className="hidden" onChange={handleFileUpload} />
                  </label>
                </div>
                
                {attachments.length === 0 && <p className="text-xs text-slate-400 italic">No files attached.</p>}
                
                <div className="space-y-2">
                  {attachments.map(file => (
                    <div key={file.id} className="flex items-center justify-between bg-white p-2 rounded border border-slate-200">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <File size={16} className="text-blue-500 shrink-0" />
                        <div className="flex flex-col overflow-hidden">
                           <span className="text-sm font-medium text-slate-700 truncate">{file.name}</span>
                           <span className="text-[10px] text-slate-400">{file.size} • {file.date}</span>
                        </div>
                      </div>
                      <button type="button" onClick={() => deleteAttachment(file.id)} className="text-slate-300 hover:text-red-500"><X size={14} /></button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Subtasks */}
              <div className="bg-slate-50 p-4 rounded border border-slate-200">
                 <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2"><CheckSquare size={14} /> Subtasks</label>
                 {subtasks.length > 0 && (
                   <div className="w-full bg-slate-200 rounded-full h-2 mb-3">
                     <div className="bg-blue-500 h-2 rounded-full transition-all duration-300" style={{ width: `${(subtasks.filter(s => s.completed).length / subtasks.length) * 100}%` }}></div>
                   </div>
                 )}
                 <div className="space-y-2 mb-3">
                   {subtasks.map(st => (
                     <div key={st.id} className="flex items-center gap-2 group">
                       <input type="checkbox" checked={st.completed} onChange={() => toggleSubtask(st.id)} className="cursor-pointer"/>
                       <span className={`text-sm flex-1 ${st.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>{st.title}</span>
                       <button type="button" onClick={() => deleteSubtask(st.id)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"><Trash2 size={14}/></button>
                     </div>
                   ))}
                 </div>
                 <div className="flex gap-2">
                   <input type="text" placeholder="Add a step..." className="flex-1 p-2 text-sm border border-slate-300 rounded" value={subtaskInput} onChange={(e) => setSubtaskInput(e.target.value)} />
                   <button type="button" onClick={handleAddSubtask} className="bg-slate-200 px-3 rounded text-sm font-bold text-slate-600 hover:bg-slate-300">Add</button>
                 </div>
              </div>

              {/* Comments */}
              <div className="pt-4 border-t border-slate-100">
                <h3 className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2"><MessageSquare size={16} /> Comments</h3>
                <div className="bg-slate-50 p-3 rounded mb-2 max-h-32 overflow-y-auto space-y-3">
                  {comments.length === 0 ? <p className="text-xs text-slate-400 italic">No comments.</p> : comments.map(c => (
                    <div key={c.id} className="flex gap-2 text-sm">
                       <span className="font-bold text-slate-700">{c.user?.firstName}:</span>
                       <span className="text-slate-600">{c.text}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input type="text" placeholder="Write comment..." className="flex-1 p-2 border rounded text-sm" value={newComment} onChange={(e) => setNewComment(e.target.value)} />
                  <button type="button" onClick={handleAddComment} className="p-2 bg-slate-100 rounded hover:bg-slate-200"><Send size={16} /></button>
                </div>
              </div>

              {/* History */}
              {history.length > 0 && (
                <div className="pt-4 border-t border-slate-100">
                   <h3 className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2"><History size={16} /> Activity Log</h3>
                   <div className="text-xs text-slate-500 space-y-1 max-h-24 overflow-y-auto">
                     {history.slice().reverse().map((h) => (
                       <div key={h.id} className="flex justify-between border-b border-slate-50 pb-1">
                         <span><strong>{h.user?.firstName}</strong> {h.action}</span>
                         <span className="text-slate-400">{h.timestamp}</span>
                       </div>
                     ))}
                   </div>
                </div>
              )}
            </div>

            {/* RIGHT COLUMN */}
            <div className="space-y-6 border-l border-slate-100 pl-6 h-full">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Assignee</label>
                <select className="w-full p-2 border border-slate-300 rounded bg-white" value={assignee ? assignee.id : ''} onChange={(e) => { const selectedUser = team.find(u => u.id === parseInt(e.target.value)); setAssignee(selectedUser || null); }}>
                  <option value="">Unassigned</option>
                  {team.map(u => (<option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>))}
                </select>
                {assignee && <div className="mt-2 flex items-center gap-2 bg-blue-50 p-2 rounded border border-blue-100"><img src={assignee.image} alt="assignee" className="w-8 h-8 rounded-full border border-white" /><span className="text-sm font-medium text-blue-800">{assignee.firstName}</span></div>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Priority</label>
                <select value={priority} onChange={(e) => setPriority(e.target.value)} className="w-full p-2 border border-slate-300 rounded bg-white">
                  <option value="High">🔴 High</option>
                  <option value="Medium">🟠 Medium</option>
                  <option value="Low">🟢 Low</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Due Date</label>
                <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full p-2 border border-slate-300 rounded text-slate-600" />
              </div>
            </div>

          </form>
        </div>

        <div className="p-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50 rounded-b-lg">
          <button onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded font-medium">Cancel</button>
          <button form="taskForm" type="submit" className="px-4 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700">Save Task</button>
        </div>
      </div>
    </div>
  );
}