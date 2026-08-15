"use client";

import React, { useState, useEffect } from "react";

interface Activity {
  id: string;
  name: string;
  category: string;
}

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAct, setEditingAct] = useState<Activity | null>(null);
  const [formData, setFormData] = useState({ name: "", category: "" });

  const [toast, setToast] = useState<{message: string, show: boolean}>({ message: "", show: false });

  const fetchActivities = async () => {
    try {
      const res = await fetch('/api/activities', { cache: 'no-store' });
      const data = await res.json();
      setActivities(data);
    } catch (err) {}
    setLoading(false);
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const triggerToast = (message: string) => {
    setToast({ message, show: true });
    setTimeout(() => setToast({ message: "", show: false }), 3000);
  };

  const logAction = async (action: string, details: string) => {
    // Basic prevention of duplicate logs in short time
    const lastLog = localStorage.getItem('last_log_check');
    const now = Date.now();
    if (lastLog && (now - parseInt(lastLog)) < 1000) return; // Ignore if less than 1 second
    localStorage.setItem('last_log_check', now.toString());

    await fetch('/api/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, details })
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingAct ? 'PUT' : 'POST';
    const body = editingAct ? { ...formData, id: editingAct.id } : formData;

    try {
      await fetch('/api/activities', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      const action = editingAct ? "Updated Activity" : "Added Activity";
      await logAction(action, `Experience: ${formData.name} (${formData.category})`);
      
      setIsModalOpen(false);
      setEditingAct(null);
      setFormData({ name: "", category: "" });
      fetchActivities();
      triggerToast(`${action} successfully!`);
    } catch (err) {
      alert("Error saving activity");
    }
  };

  const handleDelete = async (id: string) => {
    const actToDelete = activities.find(a => a.id === id);
    if (!confirm(`Delete activity "${actToDelete?.name}"?`)) return;
    
    try {
      await fetch(`/api/activities?id=${id}`, { method: 'DELETE' });
      await logAction("Deleted Activity", `Experience: ${actToDelete?.name}`);
      
      fetchActivities();
      triggerToast("Activity removed.");
    } catch (err) {
      alert("Error deleting activity");
    }
  };

  const openEdit = (act: Activity) => {
    setEditingAct(act);
    setFormData({ name: act.name, category: act.category });
    setIsModalOpen(true);
  };

  return (
    <div className="max-w-6xl mx-auto pb-24 px-4 sm:px-6 relative">
      
      {/* Toast Notification */}
      <div className={`fixed bottom-10 right-10 bg-brand-primary text-white px-8 py-4 shadow-2xl transition-all duration-500 z-[100] flex items-center gap-3 ${toast.show ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"}`}>
         <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
         <span className="text-xs font-bold uppercase tracking-widest">{toast.message}</span>
      </div>
      <header className="mb-10 flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-serif font-bold text-brand-dark mb-2">Activities & Experiences</h2>
          <p className="text-gray-500 font-sans text-sm">Manage the unique experiences you offer to your clients.</p>
        </div>
        <button 
          onClick={() => { setEditingAct(null); setFormData({name:"", category:""}); setIsModalOpen(true); }}
          className="bg-brand-primary text-white px-6 py-2 uppercase tracking-widest text-xs font-bold hover:bg-brand-dark transition-colors shadow-sm"
        >
          Add Activity
        </button>
      </header>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activities.map((act) => (
            <div key={act.id} className="bg-white border border-[#E5E5E5] p-6 rounded-sm shadow-sm hover:shadow-md transition-shadow group">
               <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-serif font-bold text-brand-dark">{act.name}</h3>
                  <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-sm">{act.category}</span>
               </div>
               <div className="flex gap-4 border-t border-gray-100 pt-4">
                  <button onClick={() => openEdit(act)} className="text-[10px] uppercase tracking-widest font-bold text-gray-400 hover:text-brand-primary transition-colors">Edit</button>
                  <button onClick={() => handleDelete(act.id)} className="text-[10px] uppercase tracking-widest font-bold text-gray-400 hover:text-red-600 transition-colors">Delete</button>
               </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md p-8 rounded-sm shadow-2xl animate-in fade-in zoom-in duration-200">
            <h3 className="text-2xl font-serif font-bold text-brand-dark mb-6">{editingAct ? 'Edit Activity' : 'New Activity'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 block mb-2">Activity Name</label>
                <input 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full border-b border-[#E5E5E5] p-2 focus:outline-none focus:border-brand-primary font-sans"
                  placeholder="e.g. Endemic Bird Watching"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 block mb-2">Category</label>
                <select 
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full border-b border-[#E5E5E5] p-2 focus:outline-none focus:border-brand-primary font-sans bg-transparent"
                >
                  <option value="">Select Category</option>
                  <option value="Nature">Nature</option>
                  <option value="Adventure">Adventure</option>
                  <option value="Cultural">Cultural</option>
                  <option value="Marine">Marine</option>
                  <option value="Luxury">Luxury</option>
                </select>
              </div>
              <div className="flex gap-4 pt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 text-[10px] uppercase tracking-widest font-bold text-gray-400 hover:text-brand-dark">Cancel</button>
                <button type="submit" className="flex-1 bg-brand-primary text-white py-3 text-[10px] uppercase tracking-widest font-bold hover:bg-brand-dark transition-colors">Save Activity</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
