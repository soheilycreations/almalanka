"use client";

import React, { useState, useEffect } from "react";

export default function ProfilePage() {
  const [user, setUser] = useState({ name: "", email: "", role: "", image: "", password: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{message: string, show: boolean}>({ message: "", show: false });

  const fetchUser = async () => {
    try {
      const localUser = JSON.parse(localStorage.getItem("admin_user") || "{}");
      const url = localUser.id ? `/api/user?id=${localUser.id}` : '/api/user';
      const res = await fetch(url, { cache: 'no-store' });
      const data = await res.json();
      setUser({ ...data, password: "" }); // Reset password field for security
    } catch (err) {}
    setLoading(false);
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const triggerToast = (message: string) => {
    setToast({ message, show: true });
    setTimeout(() => setToast({ message: "", show: false }), 3000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: any = { name: user.name, email: user.email, role: user.role, image: user.image };
      if (user.password) payload.password = user.password;

      await fetch('/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      // Update localStorage
      const localUser = JSON.parse(localStorage.getItem("admin_user") || "{}");
      localStorage.setItem("admin_user", JSON.stringify({ ...localUser, name: user.name, image: user.image }));

      triggerToast("Profile updated successfully!");
      setUser({ ...user, password: "" });
    } catch (err) {
      alert("Error saving profile");
    }
    setSaving(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUser({ ...user, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) return <div className="p-20 text-center font-serif text-2xl animate-pulse">Loading Profile...</div>;

  return (
    <div className="max-w-4xl mx-auto py-4 pb-24 relative font-sans">
      
      {/* Toast Notification */}
      <div className={`fixed bottom-10 right-10 bg-brand-primary text-white px-8 py-4 shadow-2xl transition-all duration-500 z-[100] flex items-center gap-3 ${toast.show ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"}`}>
         <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
         <span className="text-xs font-bold uppercase tracking-widest">{toast.message}</span>
      </div>

      <header className="mb-12">
        <h2 className="text-4xl font-serif font-bold text-brand-dark mb-2">My Profile</h2>
        <p className="text-gray-500 text-sm tracking-wide">Manage your personal details and account security.</p>
      </header>

      <div className="bg-white border border-[#E5E5E5] shadow-sm rounded-sm overflow-hidden">
        <form onSubmit={handleSave} className="divide-y divide-gray-100">
          
          {/* Header/Photo Section */}
          <div className="p-10 flex flex-col md:flex-row items-center gap-10">
            <div className="relative group">
               <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-xl bg-gray-100">
                  {user.image ? (
                    <img src={user.image} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl text-gray-300 font-serif font-bold italic">
                       {user.name.charAt(0)}
                    </div>
                  )}
               </div>
               <label className="absolute bottom-0 right-0 bg-brand-primary text-white p-2 rounded-full shadow-lg cursor-pointer hover:bg-brand-dark transition-colors border-2 border-white">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
               </label>
            </div>
            <div className="text-center md:text-left">
               <h3 className="text-2xl font-serif font-bold text-brand-dark">{user.name || "Administrator"}</h3>
               <p className="text-brand-primary font-bold uppercase tracking-widest text-[10px] mt-1">{user.role}</p>
               <p className="text-gray-400 text-xs mt-2">{user.email}</p>
            </div>
          </div>

          {/* Details Section */}
          <div className="p-10 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 block mb-2">Display Name</label>
                  <input 
                    required 
                    value={user.name} 
                    onChange={e => setUser({...user, name: e.target.value})} 
                    className="w-full border-b border-[#E5E5E5] p-3 focus:outline-none focus:border-brand-primary font-medium" 
                  />
               </div>
               <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 block mb-2">Email Address</label>
                  <input 
                    required 
                    type="email" 
                    value={user.email} 
                    onChange={e => setUser({...user, email: e.target.value})} 
                    className="w-full border-b border-[#E5E5E5] p-3 focus:outline-none focus:border-brand-primary font-medium" 
                  />
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 block mb-2">Access Role</label>
                  <input 
                    disabled 
                    value={user.role} 
                    className="w-full border-b border-[#E5E5E5] p-3 focus:outline-none bg-gray-50 text-gray-400 font-medium cursor-not-allowed" 
                  />
               </div>
               <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 block mb-2">Change Password</label>
                  <input 
                    type="password" 
                    placeholder="Leave blank to keep current" 
                    value={user.password} 
                    onChange={e => setUser({...user, password: e.target.value})} 
                    className="w-full border-b border-[#E5E5E5] p-3 focus:outline-none focus:border-brand-primary font-medium" 
                  />
               </div>
            </div>
          </div>

          <div className="p-10 bg-gray-50/50 flex justify-end">
             <button 
               disabled={saving} 
               type="submit" 
               className="bg-brand-primary text-white px-10 py-3 uppercase tracking-widest text-xs font-bold hover:bg-brand-dark transition-all shadow-lg active:scale-95 disabled:opacity-50"
             >
               {saving ? "Updating..." : "Save Profile"}
             </button>
          </div>
        </form>
      </div>
    </div>
  );
}
