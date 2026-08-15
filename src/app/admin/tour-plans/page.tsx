"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

interface Location { id: string; name: string; }
interface Activity { id: string; name: string; }
interface TourPlan {
  id: string;
  title: string;
  type: string;
  days: number;
  route: string[];
  activities: string[];
  price: string;
  image: string;
  overview: string;
  highlights: string[];
  difficulty: string;
  guide: string;
  gallery?: string[];
  itinerary?: { day: string; title: string; desc: string }[];
}

export default function TourPlansPage() {
  const [plans, setPlans] = useState<TourPlan[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<TourPlan | null>(null);
  const [activeTab, setActiveTab] = useState<'basic' | 'content' | 'media' | 'route'>('basic');
  
  const [formData, setFormData] = useState<Omit<TourPlan, 'id'>>({
    title: "",
    type: "Signature Expedition",
    days: 1,
    route: [],
    activities: [],
    price: "",
    image: "/img/nuzree-humming-bird-234649_1920.jpg",
    overview: "",
    highlights: [],
    difficulty: "Easy",
    guide: "",
    gallery: [],
    itinerary: []
  });

  const [toast, setToast] = useState<{message: string, show: boolean}>({ message: "", show: false });

  const fetchData = async () => {
    try {
      const [plansRes, locRes, actRes] = await Promise.all([
        fetch('/api/tour-plans', { cache: 'no-store' }),
        fetch('/api/locations', { cache: 'no-store' }),
        fetch('/api/activities', { cache: 'no-store' })
      ]);
      setPlans(await plansRes.json());
      setLocations(await locRes.json());
      setActivities(await actRes.json());
    } catch (err) {}
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const triggerToast = (message: string) => {
    setToast({ message, show: true });
    setTimeout(() => setToast({ message: "", show: false }), 3000);
  };

  const logAction = async (action: string, details: string) => {
    await fetch('/api/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, details })
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingPlan ? 'PUT' : 'POST';
    const body = editingPlan ? { ...formData, id: editingPlan.id } : formData;

    try {
      await fetch('/api/tour-plans', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      const action = editingPlan ? "Updated Tour" : "Created Tour";
      await logAction(action, `Plan: ${formData.title}`);
      
      setIsModalOpen(false);
      setEditingPlan(null);
      fetchData();
      triggerToast(`${action} successfully!`);
    } catch (err) {
      alert("Error saving tour plan");
    }
  };

  const handleDelete = async (id: string) => {
    const planToDelete = plans.find(p => p.id === id);
    if (!confirm(`Permanently delete "${planToDelete?.title}"?`)) return;
    
    await fetch(`/api/tour-plans?id=${id}`, { method: 'DELETE' });
    await logAction("Deleted Tour", `Plan: ${planToDelete?.title}`);
    
    fetchData();
    triggerToast("Tour plan removed.");
  };

  const toggleSelection = (list: string[], item: string, field: 'route' | 'activities') => {
    const newList = list.includes(item) 
      ? list.filter(i => i !== item) 
      : [...list, item];
    setFormData({ ...formData, [field]: newList });
  };

  const openEdit = (plan: TourPlan) => {
    setEditingPlan(plan);
    setFormData({
      title: plan.title,
      type: plan.type || "Signature Expedition",
      days: plan.days,
      route: plan.route || [],
      activities: plan.activities || [],
      price: plan.price,
      image: plan.image,
      overview: plan.overview || "",
      highlights: plan.highlights || [],
      difficulty: plan.difficulty || "Easy",
      guide: plan.guide || "",
      gallery: plan.gallery || [],
      itinerary: plan.itinerary || []
    });
    setActiveTab('basic');
    setIsModalOpen(true);
  };

  const addItineraryDay = () => {
     const nextDay = (formData.itinerary?.length || 0) + 1;
     const newIt = [...(formData.itinerary || []), { day: `Day ${nextDay}`, title: "", desc: "" }];
     setFormData({ ...formData, itinerary: newIt });
  };

  const updateItinerary = (index: number, field: string, value: string) => {
     const newIt = [...(formData.itinerary || [])];
     newIt[index] = { ...newIt[index], [field]: value };
     setFormData({ ...formData, itinerary: newIt });
  };

  return (
    <div className="max-w-7xl mx-auto pb-24 px-4 font-sans animate-in fade-in duration-500">
      
      {/* Toast */}
      <div className={`fixed bottom-10 right-10 bg-brand-primary text-white px-8 py-4 shadow-2xl transition-all duration-500 z-[100] flex items-center gap-3 ${toast.show ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"}`}>
         <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
         <span className="text-xs font-bold uppercase tracking-widest">{toast.message}</span>
      </div>

      <header className="mb-12 flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <h2 className="text-[11px] uppercase tracking-[0.4em] font-black text-brand-primary mb-3">Product Catalog</h2>
          <h1 className="text-5xl font-serif font-bold text-brand-dark tracking-tight">Tour Plan Builder</h1>
          <p className="text-gray-400 text-sm italic mt-2">Design luxury expeditions with granular control over every day of the journey.</p>
        </div>
        <button 
          onClick={() => { 
            setEditingPlan(null); 
            setFormData({title:"", type:"Signature Expedition", days:1, route:[], activities:[], price:"", image:"/img/nuzree-humming-bird-234649_1920.jpg", overview:"", highlights:[], difficulty:"Easy", guide:"", gallery: [], itinerary: []}); 
            setActiveTab('basic');
            setIsModalOpen(true); 
          }}
          className="bg-brand-primary text-white px-10 py-4 uppercase tracking-[0.2em] text-[10px] font-black hover:bg-brand-dark transition-all shadow-xl active:scale-95"
        >
          Create New Itinerary
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div key={plan.id} className="bg-white border border-gray-100 overflow-hidden rounded-sm shadow-sm hover:shadow-2xl transition-all duration-700 group">
             <div className="relative h-64 w-full">
                <Image src={plan.image} alt={plan.title} fill className="object-cover group-hover:scale-105 transition-transform duration-1000" />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/80 via-transparent to-transparent flex items-end p-8">
                   <div>
                      <span className="text-[9px] uppercase tracking-[0.3em] font-black text-brand-primary mb-2 block">{plan.type}</span>
                      <h3 className="text-2xl font-serif font-bold text-white">{plan.title}</h3>
                   </div>
                </div>
             </div>
             <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                   <div className="flex flex-col">
                      <span className="text-[9px] uppercase tracking-widest font-bold text-gray-400">Duration</span>
                      <span className="text-sm font-serif font-bold text-brand-dark">{plan.days} Days</span>
                   </div>
                   <div className="flex flex-col items-end">
                      <span className="text-[9px] uppercase tracking-widest font-bold text-gray-400">Estimate</span>
                      <span className="text-lg font-serif font-bold text-brand-primary">{plan.price}</span>
                   </div>
                </div>
                
                <p className="text-sm text-gray-500 leading-relaxed mb-8 line-clamp-3 italic font-medium">"{plan.overview}"</p>

                <div className="flex justify-between items-center pt-6 border-t border-gray-50">
                   <button onClick={() => openEdit(plan)} className="text-[10px] uppercase tracking-widest font-black text-brand-primary hover:tracking-[0.2em] transition-all">Edit Itinerary</button>
                   <button onClick={() => handleDelete(plan.id)} className="text-[10px] uppercase tracking-widest font-black text-red-300 hover:text-red-600 transition-colors">Delete</button>
                </div>
             </div>
          </div>
        ))}
      </div>

      {/* Modern Multi-Tab Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-brand-dark/90 backdrop-blur-xl z-[150] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-5xl h-[90vh] flex flex-col rounded-sm shadow-2xl animate-in zoom-in slide-in-from-bottom-8 duration-500 overflow-hidden">
            
            <header className="p-8 border-b border-gray-100 flex justify-between items-center bg-[#FDFDFD]">
               <div>
                  <h3 className="text-4xl font-serif font-bold text-brand-dark">{editingPlan ? 'Refine Itinerary' : 'New Expedition'}</h3>
                  <p className="text-gray-400 text-xs tracking-widest uppercase font-bold mt-1">AlmaLanka Product Builder</p>
               </div>
               <button onClick={() => setIsModalOpen(false)} className="text-gray-300 hover:text-brand-dark transition-transform hover:rotate-90">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
               </button>
            </header>

            {/* Tab Navigation */}
            <nav className="flex px-8 border-b border-gray-100 bg-white gap-8 overflow-x-auto no-scrollbar">
               {[
                  { id: 'basic', label: '1. Basic Info' },
                  { id: 'content', label: '2. Itinerary & Details' },
                  { id: 'media', label: '3. Media Assets' },
                  { id: 'route', label: '4. Routes & Activities' }
               ].map(tab => (
                  <button 
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-4 text-[10px] uppercase tracking-[0.2em] font-black border-b-2 transition-all whitespace-nowrap ${activeTab === tab.id ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-300 hover:text-gray-500'}`}
                  >
                     {tab.label}
                  </button>
               ))}
            </nav>
            
            <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
               <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                  
                  {/* Basic Info Tab */}
                  {activeTab === 'basic' && (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-12 animate-in fade-in slide-in-from-left-4 duration-500">
                        <div className="space-y-8">
                           <div>
                              <label className="text-[10px] uppercase tracking-widest font-black text-gray-400 block mb-3">Expedition Title</label>
                              <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full border-b border-gray-100 p-3 focus:border-brand-primary focus:outline-none font-serif text-2xl text-brand-dark" placeholder="The Grand Endemic Trail" />
                           </div>
                           <div>
                              <label className="text-[10px] uppercase tracking-widest font-black text-gray-400 block mb-3">Tour Category</label>
                              <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full border-b border-gray-100 p-3 focus:border-brand-primary focus:outline-none bg-transparent font-bold text-brand-dark">
                                 <option>Signature Expedition</option>
                                 <option>Endemic Birds</option>
                                 <option>Luxury Safari</option>
                                 <option>Cultural Heritage</option>
                                 <option>Adventure & Rafting</option>
                              </select>
                           </div>
                        </div>
                        <div className="space-y-8">
                           <div className="grid grid-cols-2 gap-8">
                              <div>
                                 <label className="text-[10px] uppercase tracking-widest font-black text-gray-400 block mb-3">Duration (Days)</label>
                                 <input type="number" required value={formData.days} onChange={e => setFormData({...formData, days: parseInt(e.target.value)})} className="w-full border-b border-gray-100 p-3 focus:border-brand-primary focus:outline-none font-bold text-brand-dark" />
                              </div>
                              <div>
                                 <label className="text-[10px] uppercase tracking-widest font-black text-gray-400 block mb-3">Price Label</label>
                                 <input required value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full border-b border-gray-100 p-3 focus:border-brand-primary focus:outline-none font-bold text-brand-primary" placeholder="From €1,200" />
                              </div>
                           </div>
                           <div>
                              <label className="text-[10px] uppercase tracking-widest font-black text-gray-400 block mb-3">Difficulty Level</label>
                              <div className="flex gap-4">
                                 {['Easy', 'Moderate', 'Challenging'].map(lv => (
                                    <button 
                                       key={lv}
                                       type="button"
                                       onClick={() => setFormData({...formData, difficulty: lv})}
                                       className={`flex-1 py-3 text-[9px] uppercase tracking-widest font-black border rounded-sm transition-all ${formData.difficulty === lv ? 'bg-brand-primary border-brand-primary text-white shadow-lg' : 'bg-white border-gray-100 text-gray-400 hover:border-brand-primary/30'}`}
                                    >
                                       {lv}
                                    </button>
                                 ))}
                              </div>
                           </div>
                        </div>
                     </div>
                  )}

                  {/* Content & Itinerary Tab */}
                  {activeTab === 'content' && (
                     <div className="space-y-12 animate-in fade-in slide-in-from-left-4 duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                           <div>
                              <label className="text-[10px] uppercase tracking-widest font-black text-gray-400 block mb-3">Short Overview</label>
                              <textarea required value={formData.overview} onChange={e => setFormData({...formData, overview: e.target.value})} className="w-full border border-gray-100 p-5 focus:border-brand-primary focus:outline-none h-40 text-sm leading-relaxed italic" placeholder="Summarize the expedition highlight..." />
                           </div>
                           <div>
                              <label className="text-[10px] uppercase tracking-widest font-black text-gray-400 block mb-3">Highlights (One per line)</label>
                              <textarea 
                                value={formData.highlights.join("\n")} 
                                onChange={e => setFormData({...formData, highlights: e.target.value.split("\n").filter(l => l.trim() !== "")})} 
                                className="w-full border border-gray-100 p-5 focus:border-brand-primary focus:outline-none h-40 text-sm leading-relaxed" 
                                placeholder="• Top selling point 1&#10;• Unique experience 2..." 
                              />
                           </div>
                        </div>

                        <div className="pt-8 border-t border-gray-50">
                           <div className="flex justify-between items-center mb-8">
                              <h4 className="text-xl font-serif font-bold text-brand-dark tracking-tight">Day-by-Day Journey</h4>
                              <button type="button" onClick={addItineraryDay} className="text-[10px] uppercase tracking-widest font-black text-brand-primary hover:tracking-[0.2em] transition-all bg-brand-primary/5 px-6 py-2 rounded-full">+ Add Journey Day</button>
                           </div>
                           <div className="space-y-6">
                              {formData.itinerary?.map((it, idx) => (
                                 <div key={idx} className="flex gap-6 items-start bg-gray-50/50 p-6 rounded-sm border border-gray-100 group">
                                    <div className="w-16 flex-shrink-0">
                                       <span className="text-[9px] uppercase tracking-widest font-black text-brand-primary">Day {idx + 1}</span>
                                    </div>
                                    <div className="flex-1 grid grid-cols-1 gap-4">
                                       <input 
                                          value={it.title} 
                                          onChange={e => updateItinerary(idx, 'title', e.target.value)} 
                                          className="bg-transparent border-b border-gray-200 p-2 focus:border-brand-primary focus:outline-none font-bold text-brand-dark" 
                                          placeholder="Arrival & Briefing"
                                       />
                                       <textarea 
                                          value={it.desc} 
                                          onChange={e => updateItinerary(idx, 'desc', e.target.value)} 
                                          className="bg-transparent border-none p-2 focus:outline-none text-xs text-gray-500 leading-relaxed min-h-[60px]" 
                                          placeholder="Describe the day's activities and logistics..."
                                       />
                                    </div>
                                    <button 
                                       type="button" 
                                       onClick={() => {
                                          const newIt = formData.itinerary?.filter((_, i) => i !== idx);
                                          setFormData({ ...formData, itinerary: newIt });
                                       }}
                                       className="opacity-0 group-hover:opacity-100 transition-opacity text-red-300 hover:text-red-500 pt-2"
                                    >
                                       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                                    </button>
                                 </div>
                              ))}
                           </div>
                        </div>
                     </div>
                  )}

                  {/* Media Tab */}
                  {activeTab === 'media' && (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-12 animate-in fade-in slide-in-from-left-4 duration-500">
                        <div className="space-y-8">
                           <div className="bg-[#FDFCF9] p-8 border border-brand-primary/10 rounded-sm">
                              <label className="text-[10px] uppercase tracking-[0.3em] font-black text-brand-dark block mb-6">Hero Visual Asset</label>
                              <div className="relative h-48 w-full border border-gray-100 rounded-sm overflow-hidden mb-6 shadow-inner group">
                                 <Image src={formData.image} alt="Preview" fill className="object-cover" />
                                 <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-[9px] uppercase tracking-widest font-bold text-white">Visual Preview</span>
                                 </div>
                              </div>
                              <input 
                                 value={formData.image} 
                                 onChange={e => setFormData({...formData, image: e.target.value})}
                                 className="w-full bg-white border border-gray-100 p-4 text-[10px] font-mono focus:border-brand-primary focus:outline-none shadow-sm"
                                 placeholder="Paste direct image URL..." 
                              />
                           </div>
                        </div>
                        <div className="space-y-8">
                           <div>
                              <label className="text-[10px] uppercase tracking-widest font-black text-gray-400 block mb-3">Gallery Collection (One URL per line)</label>
                              <textarea 
                                value={formData.gallery?.join("\n")} 
                                onChange={e => setFormData({...formData, gallery: e.target.value.split("\n").filter(l => l.trim() !== "")})} 
                                className="w-full border border-gray-100 p-6 focus:border-brand-primary focus:outline-none h-64 text-[10px] font-mono leading-relaxed" 
                                placeholder="https://almalanka.com/img/safari-1.jpg&#10;https://almalanka.com/img/safari-2.jpg..." 
                              />
                              <p className="text-[10px] text-gray-400 italic mt-4 font-medium italic">💎 Open Gallery in another tab, copy direct links and paste here for immediate sync.</p>
                           </div>
                        </div>
                     </div>
                  )}

                  {/* Route Tab */}
                  {activeTab === 'route' && (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-12 animate-in fade-in slide-in-from-left-4 duration-500">
                        <div>
                           <label className="text-[10px] uppercase tracking-[0.3em] font-black text-gray-400 block mb-6">Execution Route (Locations)</label>
                           <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto p-4 bg-gray-50 rounded-sm custom-scrollbar">
                              {locations.sort((a,b) => a.name.localeCompare(b.name)).map(loc => (
                                <button 
                                   key={loc.id} 
                                   type="button" 
                                   onClick={() => toggleSelection(formData.route, loc.name, 'route')} 
                                   className={`px-4 py-3 text-[9px] font-black uppercase rounded-sm border transition-all text-left flex justify-between items-center ${formData.route.includes(loc.name) ? 'bg-brand-primary text-white border-brand-primary shadow-md' : 'bg-white text-gray-400 border-gray-100 hover:border-brand-primary/30'}`}
                                >
                                   {loc.name}
                                   {formData.route.includes(loc.name) && <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>}
                                </button>
                              ))}
                           </div>
                        </div>
                        <div>
                           <label className="text-[10px] uppercase tracking-[0.3em] font-black text-gray-400 block mb-6">Field Activities</label>
                           <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto p-4 bg-gray-50 rounded-sm custom-scrollbar">
                              {activities.sort((a,b) => a.name.localeCompare(b.name)).map(act => (
                                <button 
                                   key={act.id} 
                                   type="button" 
                                   onClick={() => toggleSelection(formData.activities, act.name, 'activities')} 
                                   className={`px-4 py-3 text-[9px] font-black uppercase rounded-sm border transition-all text-left flex justify-between items-center ${formData.activities.includes(act.name) ? 'bg-brand-primary text-white border-brand-primary shadow-md' : 'bg-white text-gray-400 border-gray-100 hover:border-brand-primary/30'}`}
                                >
                                   {act.name}
                                   {formData.activities.includes(act.name) && <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>}
                                </button>
                              ))}
                           </div>
                        </div>
                     </div>
                  )}

               </div>

               {/* Sticky Footer */}
               <footer className="p-8 bg-[#FDFDFD] border-t border-gray-100 flex justify-between items-center flex-shrink-0">
                  <div className="flex gap-4">
                     <button type="button" onClick={() => setIsModalOpen(false)} className="px-10 py-4 text-[10px] uppercase tracking-[0.2em] font-black text-gray-300 hover:text-brand-dark transition-colors">Discard changes</button>
                  </div>
                  <div className="flex items-center gap-8">
                     <p className="text-[10px] text-gray-400 font-bold italic hidden md:block">Ready to synchronize with production catalog?</p>
                     <button type="submit" className="bg-brand-primary text-white px-16 py-4 text-[10px] uppercase tracking-[0.3em] font-black hover:bg-brand-dark transition-all shadow-2xl active:scale-95">
                        {editingPlan ? 'Commit Updates' : 'Launch Expedition'}
                     </button>
                  </div>
               </footer>
            </form>
          </div>
        </div>
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f9f9f9; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #D4AF37; border-radius: 10px; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
