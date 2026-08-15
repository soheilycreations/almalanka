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

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tourPlans, setTourPlans] = useState<TourPlan[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [editData, setEditData] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{message: string, show: boolean}>({ message: "", show: false });

  const fetchData = async () => {
    try {
      const [bookingsRes, toursRes] = await Promise.all([
        fetch('/api/bookings', { cache: 'no-store' }),
        fetch('/api/tour-plans', { cache: 'no-store' })
      ]);
      setBookings(await bookingsRes.json());
      setTourPlans(await toursRes.json());
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
      setIsModalOpen(false);
      fetchData();
      triggerToast("Timeline updated!");
    } catch (err) {
      alert("Error saving");
    }
    setSaving(false);
  };

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  const isBookingOnDate = (booking: Booking, checkDateStr: string) => {
    const checkDate = new Date(checkDateStr + "T00:00:00");
    const startDate = new Date(booking.date + "T00:00:00");
    let endDateStr = booking.endDate || booking.date;
    if (new Date(endDateStr) < startDate) endDateStr = booking.date;
    const endDate = new Date(endDateStr + "T00:00:00");
    return checkDate >= startDate && checkDate <= endDate;
  };

  const sortedBookings = [...bookings].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  // Assign slots but filter out cancelled for better spacing? No, user wants to see them.
  const bookingSlots = sortedBookings.map((b, index) => ({ ...b, slot: index }));

  const totalDaysInMonth = daysInMonth(year, month);
  const offset = firstDayOfMonth(year, month);
  
  const days = [];
  for (let i = 0; i < offset; i++) {
    days.push(<div key={`empty-${i}`} className="border border-gray-100 bg-gray-50/5 min-h-[120px]"></div>);
  }

  for (let d = 1; d <= totalDaysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    
    days.push(
      <div key={d} className="border border-gray-100 bg-white flex flex-col min-h-[120px] group transition-all hover:shadow-lg hover:z-20">
        <div className="p-2 flex justify-between items-center border-b border-gray-50 bg-gray-50/10">
           <span className="text-sm font-serif font-black text-gray-300 group-hover:text-brand-primary transition-colors">{d}</span>
           {d === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear() && (
             <span className="px-2 py-0.5 bg-brand-primary text-white text-[8px] font-bold rounded-full uppercase tracking-widest">Today</span>
           )}
        </div>
        <div className="flex-1 flex flex-col gap-1 p-1 overflow-y-auto custom-scrollbar">
          {bookingSlots.map((b) => {
             const isOnThisDate = isBookingOnDate(b, dateStr);
             if (!isOnThisDate) return null;

             const isStart = b.date === dateStr;
             const realEndDate = (b.endDate && new Date(b.endDate) >= new Date(b.date)) ? b.endDate : b.date;
             const isEnd = realEndDate === dateStr;
             
             return (
              <div 
                key={b.id} 
                onClick={() => openManageModal(b)}
                className={`h-7 text-[9px] flex items-center px-3 truncate cursor-pointer transition-all font-bold uppercase tracking-wide shadow-sm hover:scale-[1.02] active:scale-95 ${
                  b.status === 'confirmed' ? 'bg-green-600 text-white shadow-green-100' : 
                  b.status === 'cancelled' ? 'bg-gray-100 text-gray-400 border border-gray-200 line-through' :
                  'bg-orange-500 text-white shadow-orange-100'
                } ${isStart ? 'rounded-l-md ml-1 border-l-2 border-white/20' : ''} ${isEnd ? 'rounded-r-md mr-1 border-r-2 border-white/20' : ''}`}
              >
                {isStart ? (
                  <div className="flex items-center gap-2">
                    <span className="opacity-60">#{b.id.slice(-3)}</span>
                    <span className="truncate">{b.customerName} - {b.tourName.includes("Tailor-Made") ? "CUSTOM" : b.tourName.split(' ')[0]}</span>
                  </div>
                ) : (
                  <span className="opacity-40">→</span>
                )}
              </div>
             );
          })}
        </div>
      </div>
    );
  }

  if (loading) return <div className="p-24 text-center font-serif text-3xl animate-pulse text-brand-primary tracking-widest uppercase">Loading Timeline</div>;

  return (
    <div className="max-w-[1600px] mx-auto p-4 lg:p-8 flex flex-col font-sans">
      {/* Toast Notification */}
      <div className={`fixed bottom-10 right-10 bg-brand-primary text-white px-8 py-4 shadow-2xl transition-all duration-500 z-[110] flex items-center gap-3 ${toast.show ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"}`}>
         <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
         <span className="text-xs font-bold uppercase tracking-widest">{toast.message}</span>
      </div>

      <header className="mb-10 flex flex-col lg:flex-row justify-between items-center gap-6">
        <div>
          <h2 className="text-[10px] uppercase tracking-[0.4em] font-black text-brand-primary mb-2">Expedition Schedule</h2>
          <h1 className="text-5xl font-serif font-bold text-brand-dark tracking-tight">Operation Calendar</h1>
        </div>
        <div className="flex items-center gap-6 bg-white p-3 border border-gray-100 rounded-md shadow-xl">
          <button onClick={prevMonth} className="w-12 h-12 flex items-center justify-center text-gray-400 hover:text-brand-primary transition-all font-bold text-2xl hover:bg-gray-50 rounded-full">←</button>
          <span className="font-serif font-bold text-3xl min-w-[220px] text-center text-brand-dark">{monthName} {year}</span>
          <button onClick={nextMonth} className="w-12 h-12 flex items-center justify-center text-gray-400 hover:text-brand-primary transition-all font-bold text-2xl hover:bg-gray-50 rounded-full">→</button>
        </div>
      </header>

      <div className="bg-white border border-gray-200 shadow-2xl rounded-sm overflow-hidden flex flex-col">
        <div className="grid grid-cols-7 bg-brand-dark text-white text-[10px] uppercase tracking-[0.3em] font-bold text-center py-5 shadow-lg relative z-10">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => <div key={day}>{day}</div>)}
        </div>
        <div className="grid grid-cols-7 bg-gray-50">
          {days}
        </div>
      </div>

      <footer className="mt-12 flex flex-col md:flex-row justify-between items-center gap-8 bg-white p-6 border border-gray-100 rounded-sm shadow-sm">
         <div className="flex gap-12">
            <div className="flex items-center gap-4">
               <div className="w-5 h-5 bg-green-600 rounded-sm shadow-sm"></div>
               <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Confirmed Expedition</span>
            </div>
            <div className="flex items-center gap-4">
               <div className="w-5 h-5 bg-orange-500 rounded-sm shadow-sm"></div>
               <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Pending Reservation</span>
            </div>
            <div className="flex items-center gap-4">
               <div className="w-5 h-5 bg-gray-100 border border-gray-200 rounded-sm shadow-sm"></div>
               <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest line-through">Cancelled</span>
            </div>
         </div>
         <p className="text-xs text-gray-400 font-medium italic">
            Visual interface for high-intensity tour management. Click any record to edit.
         </p>
      </footer>

      {/* Timeline Editor Modal */}
      {isModalOpen && editData && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-2xl z-[200] flex items-center justify-center p-4">
           <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-sm shadow-2xl animate-in zoom-in slide-in-from-bottom-12 duration-500">
              <form onSubmit={handleSaveAll}>
                <header className="p-10 border-b border-gray-100 flex justify-between items-start sticky top-0 bg-white z-10">
                   <div>
                      <h3 className="text-4xl font-serif font-bold text-brand-dark mb-1">Timeline Editor</h3>
                      <p className="text-gray-400 text-sm tracking-wide font-medium">Updating details for <span className="text-brand-primary">{editData.customerName}</span></p>
                   </div>
                   <button type="button" onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-brand-dark transition-all hover:rotate-90">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                   </button>
                </header>

                <div className="p-10 space-y-12">
                   <section className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div>
                         <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 block mb-3">Client Name</label>
                         <input required value={editData.customerName} onChange={e => setEditData({...editData, customerName: e.target.value})} className="w-full border-b border-gray-200 p-3 focus:outline-none focus:border-brand-primary font-medium text-xl" />
                      </div>
                      <div>
                         <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 block mb-3">{editData.tourName.includes("Tailor-Made") ? "Custom Journey Type" : "Tour Package"}</label>
                         <select 
                            required 
                            value={editData.tourName} 
                            onChange={e => setEditData({...editData, tourName: e.target.value})} 
                            className="w-full border-b border-gray-200 p-3 focus:outline-none focus:border-brand-primary font-medium bg-white text-xl appearance-none"
                         >
                            {tourPlans.map(plan => <option key={plan.id} value={plan.title}>{plan.title}</option>)}
                         </select>
                      </div>
                   </section>

                   <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div>
                         <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 block mb-3">Arrival Date</label>
                         <input required type="date" value={editData.date.split('T')[0]} onChange={e => setEditData({...editData, date: e.target.value})} className="w-full border-b border-gray-200 p-3 focus:outline-none focus:border-brand-primary font-medium" />
                      </div>
                      <div>
                         <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 block mb-3">Departure Date</label>
                         <input required type="date" value={editData.endDate?.split('T')[0] || ""} onChange={e => setEditData({...editData, endDate: e.target.value})} className="w-full border-b border-gray-200 p-3 focus:outline-none focus:border-brand-primary font-medium" />
                      </div>
                      <div>
                         <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 block mb-3">Total Pax</label>
                         <input required type="number" value={editData.participants} onChange={e => setEditData({...editData, participants: parseInt(e.target.value)})} className="w-full border-b border-gray-200 p-3 focus:outline-none focus:border-brand-primary font-medium" />
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
                      <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 block mb-6">Execution Status</label>
                      <div className="flex gap-6">
                         {[
                           {id: 'pending', label: 'Hold (Inquiry)', active: 'bg-orange-50 border-orange-200 text-orange-600 shadow-inner', inactive: 'bg-white text-gray-400 border-gray-100 hover:border-orange-200'},
                           {id: 'confirmed', label: 'Confirmed (Active)', active: 'bg-green-50 border-green-200 text-green-600 shadow-inner', inactive: 'bg-white text-gray-400 border-gray-100 hover:border-green-200'},
                           {id: 'cancelled', label: 'Cancelled', active: 'bg-red-50 border-red-200 text-red-600 shadow-inner', inactive: 'bg-white text-gray-400 border-gray-100 hover:border-red-200'}
                         ].map((st) => (
                           <button 
                             key={st.id}
                             type="button"
                             onClick={() => setEditData({...editData, status: st.id})}
                             className={`flex-1 py-5 text-[10px] uppercase tracking-widest font-bold border rounded-md transition-all duration-500 ${editData.status === st.id ? st.active : st.inactive}`}
                           >
                             {st.label}
                           </button>
                         ))}
                      </div>
                   </section>
                </div>

                <footer className="p-10 bg-gray-50 flex justify-end gap-6 sticky bottom-0">
                   <button type="button" onClick={() => setIsModalOpen(false)} className="px-10 py-4 text-[10px] uppercase tracking-widest font-bold text-gray-400 hover:text-brand-dark transition-all">Discard Changes</button>
                   <button type="submit" disabled={saving} className="bg-brand-primary text-white px-14 py-4 text-[10px] uppercase tracking-widest font-bold hover:bg-brand-dark transition-all shadow-xl active:scale-95">
                     {saving ? "Processing..." : "Commit Update"}
                   </button>
                </footer>
              </form>
           </div>
        </div>
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f9f9f9; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #D4AF37; border-radius: 10px; }
      `}</style>
    </div>
  );
}
