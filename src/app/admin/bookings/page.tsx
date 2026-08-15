"use client";

import React, { useState, useEffect } from "react";

interface Booking {
  id: string;
  customerName: string;
  tourName: string;
  date: string;
  endDate?: string;
  status: string;
  participants: number;
  phone?: string;
  country?: string;
  notes?: string;
  customLocations?: string[];
  customActivities?: string[];
}

interface TourPlan {
  id: string;
  title: string;
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tourPlans, setTourPlans] = useState<TourPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [editData, setEditData] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{message: string, show: boolean}>({ message: "", show: false });

  const [newBooking, setNewBooking] = useState({
    customerName: "",
    tourName: "",
    date: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    status: "pending",
    participants: 2
  });

  const fetchData = async () => {
    try {
      const [bookingsRes, toursRes] = await Promise.all([
        fetch('/api/bookings', { cache: 'no-store' }),
        fetch('/api/tour-plans', { cache: 'no-store' }) // Assuming this endpoint exists or reading from file if needed
      ]);
      
      const data = await bookingsRes.json();
      const today = new Date();
      today.setHours(0,0,0,0);
      
      const upcoming = data.filter((b: any) => new Date(b.date) >= today)
                           .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
      const past = data.filter((b: any) => new Date(b.date) < today)
                       .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      setBookings([...upcoming, ...past]);
      const tours = await toursRes.json();
      setTourPlans(tours);
      
      // Pre-select first tour if available for new booking
      if (tours.length > 0) {
        setNewBooking(prev => ({ ...prev, tourName: tours[0].title }));
      }
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

  const openManageModal = (booking: Booking) => {
    setSelectedBooking(booking);
    setEditData({ ...booking });
    setIsModalOpen(true);
  };

  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await fetch('/api/bookings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData)
      });
      
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: "Modified Booking", 
          details: `Details updated for #${editData.id.slice(-4)} (${editData.customerName})` 
        })
      });

      setIsModalOpen(false);
      fetchData();
      triggerToast("Booking details updated and saved!");
    } catch (err) {
      alert("Error saving booking");
    }
    setSaving(false);
  };

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBooking)
      });
      const data = await res.json();

      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: "Created Booking", 
          details: `Manual entry created for ${newBooking.customerName} (#${data.booking.id.slice(-4)})` 
        })
      });

      setIsCreateModalOpen(false);
      setNewBooking({
        customerName: "",
        tourName: tourPlans[0]?.title || "",
        date: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        status: "pending",
        participants: 2
      });
      fetchData();
      triggerToast("New booking created successfully!");
    } catch (err) {
      alert("Error creating booking");
    }
    setSaving(false);
  };

  const handleDeleteBooking = async () => {
    if (!editData) return;
    if (!confirm("Are you sure you want to cancel and remove this booking?")) return;
    
    setSaving(true);
    try {
      await fetch(`/api/bookings?id=${editData.id}`, { method: 'DELETE' });
      
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: "Deleted Booking", 
          details: `Booking #${editData.id.slice(-4)} removed by admin` 
        })
      });

      setIsModalOpen(false);
      fetchData();
      triggerToast("Booking successfully removed.");
    } catch (err) {
      alert("Error deleting booking");
    }
    setSaving(false);
  };

  if (loading) return <div className="animate-pulse p-12 text-center text-gray-400 font-serif text-2xl">Loading operations...</div>;

  return (
    <div className="max-w-6xl mx-auto pb-24 font-sans">
      
      {/* Toast Notification */}
      <div className={`fixed bottom-10 right-10 bg-brand-primary text-white px-8 py-4 shadow-2xl transition-all duration-500 z-[100] flex items-center gap-3 ${toast.show ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"}`}>
         <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
         <span className="text-xs font-bold uppercase tracking-widest">{toast.message}</span>
      </div>

      <header className="mb-10 flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-serif font-bold text-brand-dark mb-2">Booking Management</h2>
          <p className="text-gray-500 text-sm tracking-wide font-medium">Review, edit, and manage all your tour reservations in one place.</p>
        </div>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-brand-primary text-white px-8 py-3 uppercase tracking-widest text-[10px] font-bold hover:bg-brand-dark transition-all shadow-lg active:scale-95"
        >
          Create Manual Entry
        </button>
      </header>

      <div className="bg-white border border-[#E5E5E5] shadow-sm overflow-x-auto rounded-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#E5E5E5] text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400 bg-gray-50/10">
              <th className="p-6">ID</th>
              <th className="p-6">Customer</th>
              <th className="p-6">Package</th>
              <th className="p-6">Timeline</th>
              <th className="p-6">Pax</th>
              <th className="p-6">Status</th>
              <th className="p-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {bookings.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-12 text-center text-gray-400 italic">No bookings found.</td>
              </tr>
            ) : (
              bookings.map((booking) => (
                <tr key={booking.id} className="border-b border-[#E5E5E5] hover:bg-brand-primary/[0.01] transition-colors">
                  <td className="p-6 font-mono text-[10px] text-gray-400">#{booking.id.slice(-4)}</td>
                  <td className="p-6 font-serif font-bold text-brand-dark">{booking.customerName}</td>
                  <td className="p-6">
                     <div className="flex flex-col">
                        <span className="text-brand-primary font-bold italic">{booking.tourName}</span>
                        {booking.tourName.includes("Tailor-Made") && (
                           <span className="text-[8px] uppercase tracking-tighter text-gray-400 font-bold">Custom Request</span>
                        )}
                     </div>
                  </td>
                  <td className="p-6 text-gray-500 font-medium">
                     {new Date(booking.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} 
                     <span className="mx-2 text-gray-300">→</span>
                     {new Date(booking.endDate || booking.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </td>
                  <td className="p-6 text-gray-500 font-bold">{booking.participants}</td>
                  <td className="p-6">
                    <span className={`text-[9px] uppercase tracking-widest px-3 py-1 font-bold rounded-sm border ${
                      booking.status === 'confirmed' ? 'bg-green-50 text-green-700 border-green-100' : 
                      booking.status === 'cancelled' ? 'bg-red-50 text-red-700 border-red-100' :
                      'bg-orange-50 text-orange-700 border-orange-100'
                    }`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="p-6 text-right">
                    <button 
                      onClick={() => openManageModal(booking)}
                      className="text-brand-primary hover:text-brand-dark text-[10px] font-bold uppercase tracking-widest transition-colors underline decoration-brand-primary/30"
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100] flex items-center justify-center p-4">
           <div className="bg-white w-full max-w-2xl rounded-sm shadow-2xl animate-in fade-in zoom-in duration-200">
              <form onSubmit={handleCreateBooking}>
                <header className="p-8 border-b border-gray-100 flex justify-between items-start">
                   <div>
                      <h3 className="text-3xl font-serif font-bold text-brand-dark">Manual Entry</h3>
                      <p className="text-gray-400 text-xs tracking-wide">Enter customer and tour details to create a new reservation.</p>
                   </div>
                   <button type="button" onClick={() => setIsCreateModalOpen(false)} className="text-gray-400 hover:text-brand-dark">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                   </button>
                </header>

                <div className="p-8 space-y-8">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                         <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 block mb-2">Customer Name</label>
                         <input required placeholder="Enter full name" value={newBooking.customerName} onChange={e => setNewBooking({...newBooking, customerName: e.target.value})} className="w-full border-b border-[#E5E5E5] p-3 focus:outline-none focus:border-brand-primary font-medium" />
                      </div>
                      <div>
                         <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 block mb-2">Tour Package</label>
                         <select 
                            required 
                            value={newBooking.tourName} 
                            onChange={e => setNewBooking({...newBooking, tourName: e.target.value})} 
                            className="w-full border-b border-[#E5E5E5] p-3 focus:outline-none focus:border-brand-primary font-medium bg-white appearance-none"
                         >
                            {tourPlans.map(plan => <option key={plan.id} value={plan.title}>{plan.title}</option>)}
                         </select>
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                         <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 block mb-2">Arrival Date</label>
                         <input required type="date" value={newBooking.date} onChange={e => setNewBooking({...newBooking, date: e.target.value})} className="w-full border-b border-[#E5E5E5] p-3 focus:outline-none focus:border-brand-primary font-medium" />
                      </div>
                      <div>
                         <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 block mb-2">Departure Date</label>
                         <input required type="date" value={newBooking.endDate} onChange={e => setNewBooking({...newBooking, endDate: e.target.value})} className="w-full border-b border-[#E5E5E5] p-3 focus:outline-none focus:border-brand-primary font-medium" />
                      </div>
                      <div>
                         <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 block mb-2">Participants (Pax)</label>
                         <input required type="number" min="1" value={newBooking.participants} onChange={e => setNewBooking({...newBooking, participants: parseInt(e.target.value)})} className="w-full border-b border-[#E5E5E5] p-3 focus:outline-none focus:border-brand-primary font-medium" />
                      </div>
                   </div>

                   <div>
                      <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 block mb-4">Initial Status</label>
                      <div className="flex gap-4">
                         {['pending', 'confirmed'].map((st) => (
                           <button 
                             key={st}
                             type="button"
                             onClick={() => setNewBooking({...newBooking, status: st})}
                             className={`flex-1 py-4 text-[9px] uppercase tracking-widest font-bold border rounded-sm transition-all ${newBooking.status === st ? 'bg-brand-dark text-white border-brand-dark shadow-md' : 'bg-white text-gray-400 border-gray-100 hover:border-brand-primary'}`}
                           >
                             {st}
                           </button>
                         ))}
                      </div>
                   </div>
                </div>

                <footer className="p-8 bg-gray-50 flex justify-end items-center gap-6">
                   <button type="button" onClick={() => setIsCreateModalOpen(false)} className="text-[10px] uppercase tracking-widest font-bold text-gray-400 hover:text-brand-dark">Cancel</button>
                   <button 
                     type="submit" 
                     disabled={saving}
                     className="bg-brand-primary text-white px-12 py-4 text-[10px] uppercase tracking-widest font-bold hover:bg-brand-dark transition-all shadow-xl disabled:opacity-50"
                   >
                     {saving ? "Creating..." : "Save New Booking"}
                   </button>
                </footer>
              </form>
           </div>
        </div>
      )}

      {/* Edit Modal (Manage) */}
      {isModalOpen && editData && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100] flex items-center justify-center p-4">
           <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-sm shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
              <form onSubmit={handleSaveAll}>
                <header className="p-8 border-b border-gray-100 flex justify-between items-start sticky top-0 bg-white z-10">
                   <div>
                      <h3 className="text-3xl font-serif font-bold text-brand-dark mb-1">Reservation Editor</h3>
                      <p className="text-gray-400 text-xs tracking-wide">Editing Booking: <span className="font-mono">#{editData.id}</span></p>
                   </div>
                   <button type="button" onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-brand-dark">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                   </button>
                </header>

                <div className="p-8 space-y-10">
                   <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                         <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 block mb-2">Customer Name</label>
                         <input required value={editData.customerName} onChange={e => setEditData({...editData, customerName: e.target.value})} className="w-full border-b border-[#E5E5E5] p-3 focus:outline-none focus:border-brand-primary font-medium" />
                      </div>
                      <div>
                         <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 block mb-2">{editData.tourName.includes("Tailor-Made") ? "Custom Journey Type" : "Tour Package"}</label>
                         <select 
                            required 
                            value={editData.tourName} 
                            onChange={e => setEditData({...editData, tourName: e.target.value})} 
                            className="w-full border-b border-[#E5E5E5] p-3 focus:outline-none focus:border-brand-primary font-medium bg-white appearance-none"
                         >
                            {tourPlans.map(plan => <option key={plan.id} value={plan.title}>{plan.title}</option>)}
                         </select>
                      </div>
                   </section>

                   <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                         <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 block mb-2">Arrival Date</label>
                         <input required type="date" value={editData.date.split('T')[0]} onChange={e => setEditData({...editData, date: e.target.value})} className="w-full border-b border-[#E5E5E5] p-3 focus:outline-none focus:border-brand-primary font-medium" />
                      </div>
                      <div>
                         <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 block mb-2">Departure Date</label>
                         <input required type="date" value={editData.endDate?.split('T')[0] || ""} onChange={e => setEditData({...editData, endDate: e.target.value})} className="w-full border-b border-[#E5E5E5] p-3 focus:outline-none focus:border-brand-primary font-medium" />
                      </div>
                      <div>
                         <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 block mb-2">Participants (Pax)</label>
                         <input required type="number" value={editData.participants} onChange={e => setEditData({...editData, participants: parseInt(e.target.value)})} className="w-full border-b border-[#E5E5E5] p-3 focus:outline-none focus:border-brand-primary font-medium" />
                      </div>
                   </section>

                   {/* Tailor-Made Details */}
                   {(editData.customLocations?.length > 0 || editData.customActivities?.length > 0) && (
                      <section className="bg-gray-50 p-6 border border-gray-100 rounded-sm">
                         <h4 className="text-[10px] uppercase tracking-[0.2em] font-black text-brand-primary mb-6">Tailor-Made Vision</h4>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {editData.customLocations?.length > 0 && (
                               <div>
                                  <label className="text-[9px] uppercase tracking-widest font-bold text-gray-400 mb-3 block">Target Locations</label>
                                  <div className="flex flex-wrap gap-2">
                                     {editData.customLocations.map((l: string, i: number) => (
                                        <span key={i} className="bg-white border border-gray-200 px-3 py-1 rounded-full text-[9px] font-bold text-brand-dark uppercase">{l}</span>
                                     ))}
                                  </div>
                               </div>
                            )}
                            {editData.customActivities?.length > 0 && (
                               <div>
                                  <label className="text-[9px] uppercase tracking-widest font-bold text-gray-400 mb-3 block">Desired Activities</label>
                                  <div className="flex flex-wrap gap-2">
                                     {editData.customActivities.map((a: string, i: number) => (
                                        <span key={i} className="bg-brand-primary/10 border border-brand-primary/20 px-3 py-1 rounded-full text-[9px] font-bold text-brand-primary uppercase">{a}</span>
                                     ))}
                                  </div>
                               </div>
                            )}
                         </div>
                      </section>
                   )}

                   {editData.notes && (
                      <section>
                         <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 block mb-2">Customer Field Notes</label>
                         <p className="bg-white border border-gray-100 p-4 text-sm text-gray-600 italic font-serif leading-relaxed">"{editData.notes}"</p>
                      </section>
                   )}

                   <section>
                      <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 block mb-4">Reservation Status</label>
                      <div className="flex gap-4">
                         {[
                           {id: 'pending', label: 'Pending / Hold', active: 'bg-orange-50 border-orange-200 text-orange-600 shadow-sm', inactive: 'bg-white text-gray-400 border-gray-100 hover:border-orange-200'},
                           {id: 'confirmed', label: 'Confirmed', active: 'bg-green-50 border-green-200 text-green-600 shadow-sm', inactive: 'bg-white text-gray-400 border-gray-100 hover:border-green-200'},
                           {id: 'cancelled', label: 'Cancelled', active: 'bg-red-50 border-red-200 text-red-600 shadow-sm', inactive: 'bg-white text-gray-400 border-gray-100 hover:border-red-200'}
                         ].map((st) => (
                           <button 
                             key={st.id}
                             type="button"
                             onClick={() => setEditData({...editData, status: st.id})}
                             className={`flex-1 py-4 text-[9px] uppercase tracking-widest font-bold border rounded-sm transition-all duration-300 ${editData.status === st.id ? st.active : st.inactive}`}
                           >
                             {st.label}
                           </button>
                         ))}
                      </div>
                   </section>
                </div>

                <footer className="p-8 bg-gray-50 flex justify-between items-center sticky bottom-0">
                   <button 
                     type="button" 
                     onClick={handleDeleteBooking}
                     disabled={saving}
                     className="text-red-400 hover:text-red-600 text-[10px] font-bold uppercase tracking-widest transition-colors disabled:opacity-50"
                   >
                     Cancel Booking
                   </button>
                   <div className="flex gap-4">
                      <button type="button" onClick={() => setIsModalOpen(false)} className="px-8 py-3 text-[10px] uppercase tracking-widest font-bold text-gray-400 hover:text-brand-dark">Discard</button>
                      <button 
                        type="submit" 
                        disabled={saving}
                        className="bg-brand-primary text-white px-10 py-3 text-[10px] uppercase tracking-widest font-bold hover:bg-brand-dark transition-all shadow-xl disabled:opacity-50"
                      >
                        {saving ? "Saving Changes..." : "Apply & Update"}
                      </button>
                   </div>
                </footer>
              </form>
           </div>
        </div>
      )}
    </div>
  );
}
