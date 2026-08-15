"use client";

import React, { useState, useEffect } from "react";

interface Location {
  id: string;
  name: string;
  type: string;
}

export default function LocationsPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLoc, setEditingLoc] = useState<Location | null>(null);
  const [formData, setFormData] = useState({ name: "", type: "" });

  const [toast, setToast] = useState<{message: string, show: boolean}>({ message: "", show: false });

  const fetchLocations = async () => {
    try {
      const res = await fetch('/api/locations', { cache: 'no-store' });
      const data = await res.json();
      setLocations(data);
    } catch (err) {}
    setLoading(false);
  };

  useEffect(() => {
    fetchLocations();
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
    const method = editingLoc ? 'PUT' : 'POST';
    const body = editingLoc ? { ...formData, id: editingLoc.id } : formData;

    try {
      await fetch('/api/locations', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      const action = editingLoc ? "Updated Location" : "Added Location";
      await logAction(action, `Destination: ${formData.name} (${formData.type})`);
      
      setIsModalOpen(false);
      setEditingLoc(null);
      setFormData({ name: "", type: "" });
      fetchLocations();
      triggerToast(`${action} successfully!`);
    } catch (err) {
      alert("Error saving location");
    }
  };

  const handleDelete = async (id: string) => {
    const locToDelete = locations.find(l => l.id === id);
    if (!confirm(`Delete location "${locToDelete?.name}"?`)) return;
    
    try {
      const res = await fetch(`/api/locations?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error("Failed to delete");
      
      const data = await res.json();
      if (data.deleted === 0) {
        alert("Location not found on server or already deleted.");
      }

      await logAction("Deleted Location", `Destination: ${locToDelete?.name}`);
      
      fetchLocations();
      triggerToast("Location removed.");
    } catch (err) {
      console.error(err);
      alert("Error deleting location. Please check server logs.");
    }
  };

  const openEdit = (loc: Location) => {
    setEditingLoc(loc);
    setFormData({ name: loc.name, type: loc.type });
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
          <h2 className="text-4xl font-serif font-bold text-brand-dark mb-2">Destinations</h2>
          <p className="text-gray-500 font-sans text-sm">Manage the key locations in your tour portfolio.</p>
        </div>
        <button 
          onClick={() => { setEditingLoc(null); setFormData({name:"", type:""}); setIsModalOpen(true); }}
          className="bg-brand-primary text-white px-6 py-2 uppercase tracking-widest text-xs font-bold hover:bg-brand-dark transition-colors shadow-sm"
        >
          Add Location
        </button>
      </header>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {locations.map((loc) => (
            <div key={loc.id} className="bg-white border border-[#E5E5E5] p-6 rounded-sm shadow-sm hover:shadow-md transition-shadow group">
               <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-serif font-bold text-brand-dark">{loc.name}</h3>
                  <span className="text-[10px] uppercase tracking-widest font-bold text-brand-primary bg-brand-primary/10 px-2 py-1 rounded-sm">{loc.type}</span>
               </div>
               <div className="flex gap-4 border-t border-gray-100 pt-4">
                  <button onClick={() => openEdit(loc)} className="text-[10px] uppercase tracking-widest font-bold text-gray-400 hover:text-brand-primary transition-colors">Edit</button>
                  <button onClick={() => handleDelete(loc.id)} className="text-[10px] uppercase tracking-widest font-bold text-gray-400 hover:text-red-600 transition-colors">Delete</button>
               </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md p-8 rounded-sm shadow-2xl animate-in fade-in zoom-in duration-200">
            <h3 className="text-2xl font-serif font-bold text-brand-dark mb-6">{editingLoc ? 'Edit Location' : 'New Location'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 block mb-2">Location Name</label>
                <input 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full border-b border-[#E5E5E5] p-2 focus:outline-none focus:border-brand-primary font-sans"
                  placeholder="e.g. Sinharaja Forest"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 block mb-2">Category / Type</label>
                <select 
                  required
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="w-full border-b border-[#E5E5E5] p-2 focus:outline-none focus:border-brand-primary font-sans bg-transparent"
                >
                  <option value="">Select Type</option>
                  <option value="Rainforest">Rainforest</option>
                  <option value="Wildlife">Wildlife</option>
                  <option value="Highlands">Highlands</option>
                  <option value="Coastal">Coastal</option>
                  <option value="Ancient City">Ancient City</option>
                  <option value="Medieval City">Medieval City</option>
                  <option value="Hill Capital">Hill Capital</option>
                  <option value="Spiritual">Spiritual</option>
                  <option value="Wetlands">Wetlands</option>
                  <option value="Historic">Historic</option>
                  <option value="Tea Country">Tea Country</option>
                  <option value="Surfing">Surfing</option>
                  <option value="Marine">Marine</option>
                  <option value="Adventure">Adventure</option>
                  <option value="Village">Village Life</option>
                  <option value="Eco-Tourism">Eco-Tourism</option>
                </select>
              </div>
              <div className="flex gap-4 pt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 text-[10px] uppercase tracking-widest font-bold text-gray-400 hover:text-brand-dark">Cancel</button>
                <button type="submit" className="flex-1 bg-brand-primary text-white py-3 text-[10px] uppercase tracking-widest font-bold hover:bg-brand-dark transition-colors">Save Location</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
