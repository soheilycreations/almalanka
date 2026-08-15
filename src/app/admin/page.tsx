"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  interest: string;
  message: string;
  timestamp: string;
}

interface Booking {
  id: string;
  customerName: string;
  tourName: string;
  date: string;
  status: string;
  participants: number;
}

export default function AdminDashboardPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [user, setUser] = useState<{name: string, role: string} | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const localUser = JSON.parse(localStorage.getItem("admin_user") || "{}");
      const [leadsRes, bookingsRes, logsRes, userRes] = await Promise.all([
        fetch('/api/leads', { cache: 'no-store' }),
        fetch('/api/bookings', { cache: 'no-store' }),
        fetch('/api/logs', { cache: 'no-store' }),
        fetch(`/api/user?id=${localUser.id}`, { cache: 'no-store' })
      ]);
      
      setLeads(await leadsRes.json());
      const data = await bookingsRes.json();
      const today = new Date();
      today.setHours(0,0,0,0);
      const upcoming = data.filter((b: any) => new Date(b.date) >= today)
                           .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
      const past = data.filter((b: any) => new Date(b.date) < today)
                       .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      setBookings([...upcoming, ...past]);
      setLogs(await logsRes.json());
      setUser(await userRes.json());
    } catch (err) {
      console.error("Dashboard fetch error", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const stats = {
    total: bookings.length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    pending: bookings.filter(b => b.status === 'pending').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const formatDate = (isoString: string) => {
    if (!isoString) return "N/A";
    const date = new Date(isoString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-brand-primary"></div>
        <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-gray-400">Synchronizing Dashboard</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-4 pb-24 font-sans animate-in fade-in duration-700">
      
      {/* 1. Header & Greeting */}
      <header className="mb-14 flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <h2 className="text-[11px] uppercase tracking-[0.4em] font-black text-brand-primary mb-3">
             {getGreeting()}, {user?.role || "Administrator"}
          </h2>
          <h1 className="text-6xl font-serif font-bold text-brand-dark tracking-tight leading-none">
             Dashboard
          </h1>
        </div>
        <div className="flex items-center gap-3 bg-white p-3 border border-gray-100 rounded-sm shadow-sm">
           <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
           <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Live Operation Mode</span>
        </div>
      </header>

      {/* 2. Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
         {[
            { label: 'Confirmed Tours', value: stats.confirmed, icon: 'M5 13l4 4L19 7', color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Pending Hold', value: stats.pending, icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', color: 'text-orange-500', bg: 'bg-orange-50' },
            { label: 'Total Reservations', value: stats.total, icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01', color: 'text-brand-primary', bg: 'bg-brand-primary/5' },
            { label: 'Cancelled', value: stats.cancelled, icon: 'M6 18L18 6M6 6l12 12', color: 'text-red-500', bg: 'bg-red-50' }
         ].map((card, i) => (
            <div key={i} className="bg-white p-8 border border-gray-100 shadow-sm rounded-sm hover:shadow-xl transition-all duration-300 group">
               <div className={`w-12 h-12 ${card.bg} rounded-sm mb-6 flex items-center justify-center ${card.color} group-hover:scale-110 transition-transform`}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={card.icon}/></svg>
               </div>
               <h4 className="text-[10px] uppercase font-bold text-gray-400 tracking-[0.2em] mb-2">{card.label}</h4>
               <p className="text-4xl font-serif font-bold text-brand-dark">{card.value}</p>
            </div>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
         
         {/* 3. Growth Chart & Recent Activity */}
         <div className="lg:col-span-2 space-y-16">
            
            {/* Visual Growth Mockup */}
            <section className="bg-brand-dark p-10 rounded-sm shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
               <div className="relative z-10">
                  <div className="flex justify-between items-center mb-10">
                     <div>
                        <h3 className="text-xl font-serif font-bold text-white mb-1">Booking Velocity</h3>
                        <p className="text-brand-primary/60 text-[10px] uppercase tracking-widest font-bold">Growth metrics over the last 30 days</p>
                     </div>
                     <div className="text-right">
                        <span className="text-brand-primary text-2xl font-bold font-serif">+24%</span>
                        <p className="text-white/40 text-[9px] uppercase tracking-widest font-medium">vs Last Month</p>
                     </div>
                  </div>
                  
                  {/* Custom SVG Chart */}
                  <div className="h-48 w-full flex items-end gap-4 px-2">
                     {[30, 45, 35, 60, 85, 70, 95].map((h, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-3 group">
                           <div 
                              className="w-full bg-brand-primary/20 rounded-t-sm relative transition-all duration-1000 ease-out hover:bg-brand-primary"
                              style={{ height: `${h}%` }}
                           >
                              <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-brand-primary text-white text-[10px] font-bold px-2 py-1 rounded-sm whitespace-nowrap">
                                 Week {i+1}
                              </div>
                           </div>
                           <span className="text-[9px] text-white/30 font-bold uppercase tracking-tighter">W{i+1}</span>
                        </div>
                     ))}
                  </div>
               </div>
            </section>

            {/* Detailed Tables */}
            <section>
               <div className="flex justify-between items-end mb-8">
                  <h3 className="text-3xl font-serif font-bold text-brand-dark">Latest Operations</h3>
                  <Link href="/admin/bookings" className="text-[10px] font-bold uppercase tracking-widest text-brand-primary border-b border-brand-primary/20 pb-1 hover:border-brand-primary transition-all">Go to Management &rarr;</Link>
               </div>
               <div className="bg-white border border-gray-100 shadow-sm rounded-sm overflow-hidden">
                  <table className="w-full text-left">
                     <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400">
                           <th className="p-6">Client</th>
                           <th className="p-6">Package</th>
                           <th className="p-6 text-right">Status</th>
                        </tr>
                     </thead>
                     <tbody className="text-sm">
                        {bookings.slice(0, 5).map((b) => (
                           <tr key={b.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                              <td className="p-6">
                                 <div className="font-serif font-bold text-brand-dark text-base">{b.customerName}</div>
                                 <div className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5">#{b.id.slice(-4)}</div>
                              </td>
                              <td className="p-6 font-medium text-gray-600 italic">{b.tourName}</td>
                              <td className="p-6 text-right">
                                 <span className={`text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-sm border ${
                                    b.status === 'confirmed' ? 'bg-green-50 text-green-700 border-green-100' : 
                                    b.status === 'cancelled' ? 'bg-red-50 text-red-700 border-red-100' :
                                    'bg-orange-50 text-orange-700 border-orange-100'
                                 }`}>
                                    {b.status}
                                 </span>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </section>
         </div>

         {/* 4. Activity Logs (Right Sidebar) */}
         <div className="lg:col-span-1">
            <section className="sticky top-12">
               <div className="flex justify-between items-center mb-8">
                  <h3 className="text-2xl font-serif font-bold text-brand-dark">Audit Trail</h3>
                  <Link href="/admin/logs" className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-brand-primary transition-colors">History</Link>
               </div>
               <div className="bg-white border border-gray-100 shadow-lg rounded-sm p-8 space-y-10 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-2 h-full bg-brand-primary/5"></div>
                  {logs.slice(0, 8).map((log: any, i) => (
                     <div key={i} className="relative pl-8 border-l border-brand-primary/10">
                        <div className="absolute -left-[5px] top-0 w-2.5 h-2.5 bg-brand-primary rounded-sm shadow-sm"></div>
                        <p className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em] mb-2">{log.action}</p>
                        <p className="text-sm text-gray-600 mb-3 leading-relaxed font-medium">{log.details}</p>
                        <p className="text-[10px] text-gray-400 font-bold italic">{formatDate(log.timestamp)}</p>
                     </div>
                  ))}
                  <div className="pt-6">
                     <Link href="/admin/logs" className="block text-center py-4 bg-gray-50 border border-gray-100 text-[10px] font-black uppercase tracking-widest text-brand-dark hover:bg-brand-primary hover:text-white transition-all shadow-sm">
                        View Full System Log
                     </Link>
                  </div>
               </div>
            </section>
         </div>

      </div>
    </div>
  );
}
