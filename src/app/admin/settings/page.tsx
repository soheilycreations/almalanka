"use client";

import React, { useState, useEffect } from "react";

export default function SettingsPage() {
  const [stats, setStats] = useState({ stat1: "50+", stat2: "15+", stat3: "20+", stat4: "10+" });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{message: string, show: boolean}>({ message: "", show: false });

  useEffect(() => {
    fetch('/api/stats', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (data && data.stat1) setStats(data);
        setLoading(false);
      });
  }, []);

  const triggerToast = (message: string) => {
    setToast({ message, show: true });
    setTimeout(() => setToast({ message: "", show: false }), 3000);
  };

  const handleSaveStats = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await fetch('/api/stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stats)
      });
      
      // Log action
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: "Updated Settings", 
          details: "Homepage stats bar values were updated." 
        })
      });

      triggerToast("Global settings updated!");
    } catch (err) {
      alert('Failed to save stats.');
    }
    setSaving(false);
  };

  if (loading) return <div className="p-12 text-center font-serif text-xl animate-pulse">Loading settings...</div>;

  return (
    <div className="max-w-4xl mx-auto py-4 pb-24 relative">
      
      {/* Toast Notification */}
      <div className={`fixed bottom-10 right-10 bg-brand-primary text-white px-8 py-4 shadow-2xl transition-all duration-500 z-[100] flex items-center gap-3 ${toast.show ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"}`}>
         <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
         <span className="text-xs font-bold uppercase tracking-widest">{toast.message}</span>
      </div>

      <header className="mb-12">
        <h2 className="text-4xl font-serif font-bold text-brand-dark mb-2">Global Settings</h2>
        <p className="text-gray-500 font-sans text-sm">Configure global parameters and homepage elements.</p>
      </header>

      <section className="space-y-12">
        <div className="bg-white border border-[#E5E5E5] shadow-sm rounded-sm overflow-hidden">
          <div className="bg-gray-50/50 p-6 border-b border-[#E5E5E5]">
             <h3 className="font-serif font-bold text-lg text-brand-dark">Homepage Stats Bar</h3>
             <p className="text-xs text-gray-400 uppercase tracking-widest mt-1">Numerical highlights shown on the landing page</p>
          </div>
          
          <form onSubmit={handleSaveStats} className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
               <div className="flex flex-col">
                 <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-2">Bespoke Luxury (Stat 1)</label>
                 <input value={stats.stat1} onChange={(e) => setStats({...stats, stat1: e.target.value})} className="border-b border-[#E5E5E5] p-3 focus:outline-none focus:border-brand-primary text-brand-dark font-serif text-xl" />
               </div>
               <div className="flex flex-col">
                 <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-2">Ornithologist Guides (Stat 2)</label>
                 <input value={stats.stat2} onChange={(e) => setStats({...stats, stat2: e.target.value})} className="border-b border-[#E5E5E5] p-3 focus:outline-none focus:border-brand-primary text-brand-dark font-serif text-xl" />
               </div>
               <div className="flex flex-col">
                 <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-2">Exclusive Stays (Stat 3)</label>
                 <input value={stats.stat3} onChange={(e) => setStats({...stats, stat3: e.target.value})} className="border-b border-[#E5E5E5] p-3 focus:outline-none focus:border-brand-primary text-brand-dark font-serif text-xl" />
               </div>
               <div className="flex flex-col">
                 <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-2">Years of Excellence (Stat 4)</label>
                 <input value={stats.stat4} onChange={(e) => setStats({...stats, stat4: e.target.value})} className="border-b border-[#E5E5E5] p-3 focus:outline-none focus:border-brand-primary text-brand-dark font-serif text-xl" />
               </div>
            </div>
            
            <div className="flex justify-end pt-6 border-t border-gray-100">
               <button disabled={saving} type="submit" className="bg-brand-primary text-white px-10 py-3 uppercase tracking-widest text-xs font-bold hover:bg-brand-dark transition-all shadow-lg disabled:opacity-50">
                 {saving ? "Processing..." : "Commit Changes"}
               </button>
            </div>
          </form>
        </div>

        {/* Placeholder for more settings */}
        <div className="bg-[#FAF9F5] p-8 border border-dashed border-gray-300 rounded-sm text-center">
           <p className="text-gray-400 font-serif italic">More configuration options coming soon...</p>
        </div>
      </section>
    </div>
  );
}
