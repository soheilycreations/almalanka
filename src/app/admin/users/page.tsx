"use client";

import React, { useState, useEffect } from "react";

export default function UsersManagementPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", password: "", role: "Editor" });
  const [toast, setToast] = useState<{message: string, show: boolean}>({ message: "", show: false });

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users', { cache: 'no-store' });
      const data = await res.json();
      setUsers(data);
    } catch (err) {}
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const triggerToast = (message: string) => {
    setToast({ message, show: true });
    setTimeout(() => setToast({ message: "", show: false }), 3000);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      // Log action
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: "Created User", 
          details: `Account created for ${formData.name} (${formData.role})` 
        })
      });

      setIsModalOpen(false);
      setFormData({ name: "", email: "", password: "", role: "Editor" });
      fetchUsers();
      triggerToast("New account created!");
    } catch (err) {
      alert("Error creating user");
    }
  };

  const handleDeleteUser = async (id: string, name: string) => {
    const currentUser = JSON.parse(localStorage.getItem("admin_user") || "{}");
    if (id === currentUser.id) return alert("You cannot delete your own account!");
    
    if (!confirm(`Are you sure you want to delete the account for "${name}"?`)) return;
    
    try {
      await fetch(`/api/users?id=${id}`, { method: 'DELETE' });
      
      // Log action
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: "Deleted User", 
          details: `Account removed: ${name}` 
        })
      });

      fetchUsers();
      triggerToast("Account removed.");
    } catch (err) {
      alert("Error deleting user");
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-4 pb-24 relative font-sans">
      
      {/* Toast Notification */}
      <div className={`fixed bottom-10 right-10 bg-brand-primary text-white px-8 py-4 shadow-2xl transition-all duration-500 z-[100] flex items-center gap-3 ${toast.show ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"}`}>
         <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
         <span className="text-xs font-bold uppercase tracking-widest">{toast.message}</span>
      </div>

      <header className="mb-12 flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-serif font-bold text-brand-dark mb-2">User Management</h2>
          <p className="text-gray-500 text-sm tracking-wide">Manage access and roles for the AlmaLanka platform.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-brand-primary text-white px-8 py-3 uppercase tracking-widest text-xs font-bold hover:bg-brand-dark transition-all shadow-lg active:scale-95"
        >
          Create New User
        </button>
      </header>

      {loading ? (
         <div className="text-center py-20 font-serif text-2xl animate-pulse">Loading users...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {users.map(u => (
             <div key={u.id} className="bg-white border border-[#E5E5E5] p-8 rounded-sm shadow-sm hover:shadow-md transition-shadow group relative">
                <div className="flex items-center gap-4 mb-6">
                   <div className="w-12 h-12 rounded-full bg-brand-primary/10 overflow-hidden border border-brand-primary/20 flex items-center justify-center text-xl font-serif font-bold text-brand-primary italic">
                      {u.image ? <img src={u.image} alt={u.name} className="w-full h-full object-cover" /> : u.name.charAt(0)}
                   </div>
                   <div>
                      <h3 className="font-serif font-bold text-brand-dark text-lg">{u.name}</h3>
                      <p className="text-[10px] uppercase font-bold tracking-widest text-brand-primary">{u.role}</p>
                   </div>
                </div>
                <p className="text-xs text-gray-500 mb-6 font-medium break-all">{u.email}</p>
                <div className="flex justify-between items-center pt-6 border-t border-gray-100">
                   <span className="text-[9px] uppercase font-bold text-gray-400 tracking-widest">Added {new Date().toLocaleDateString()}</span>
                   <button 
                     onClick={() => handleDeleteUser(u.id, u.name)}
                     className="text-[9px] uppercase font-bold text-red-400 hover:text-red-600 tracking-[0.2em] transition-colors"
                   >
                     Remove
                   </button>
                </div>
             </div>
           ))}
        </div>
      )}

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
           <div className="bg-white w-full max-w-lg p-10 rounded-sm shadow-2xl animate-in fade-in zoom-in duration-200">
              <header className="mb-8">
                 <h3 className="text-3xl font-serif font-bold text-brand-dark mb-2">New Account</h3>
                 <p className="text-gray-400 text-xs tracking-wide">Grant access to a new team member.</p>
              </header>
              <form onSubmit={handleCreateUser} className="space-y-6">
                 <div>
                    <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 block mb-2">Full Name</label>
                    <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border-b border-[#E5E5E5] p-3 focus:outline-none focus:border-brand-primary font-medium" />
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                       <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 block mb-2">Email</label>
                       <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full border-b border-[#E5E5E5] p-3 focus:outline-none focus:border-brand-primary font-medium" />
                    </div>
                    <div>
                       <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 block mb-2">Password</label>
                       <input required type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full border-b border-[#E5E5E5] p-3 focus:outline-none focus:border-brand-primary font-medium" />
                    </div>
                 </div>
                 <div>
                    <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 block mb-2">Assign Role</label>
                    <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full border-b border-[#E5E5E5] p-3 focus:outline-none focus:border-brand-primary font-medium bg-transparent">
                       <option value="Editor">Editor (Content Management)</option>
                       <option value="Sales">Sales (Inquiries & Bookings)</option>
                       <option value="Administrator">Administrator (Full Access)</option>
                    </select>
                 </div>
                 <div className="flex gap-4 pt-8">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400 hover:text-brand-dark transition-colors">Cancel</button>
                    <button type="submit" className="flex-1 bg-brand-primary text-white py-4 uppercase tracking-[0.2em] text-[10px] font-bold hover:bg-brand-dark transition-all shadow-lg">Activate Account</button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
}
