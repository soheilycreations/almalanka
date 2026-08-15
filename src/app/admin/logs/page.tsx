"use client";

import React, { useState, useEffect } from "react";

export default function LogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/logs', { cache: 'no-store' });
      const data = await res.json();
      setLogs(data);
    } catch (err) {}
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="max-w-6xl mx-auto py-4 pb-24">
      <header className="mb-10 flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-serif font-bold text-brand-dark mb-2">Activity Log</h2>
          <p className="text-gray-500 font-sans text-sm">A complete audit trail of all administrative actions.</p>
        </div>
        <button 
          onClick={fetchLogs}
          className="bg-brand-primary text-white px-6 py-2 uppercase tracking-widest text-[10px] font-bold hover:bg-brand-dark transition-colors"
        >
          Refresh Logs
        </button>
      </header>

      <div className="bg-white border border-[#E5E5E5] shadow-sm rounded-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#E5E5E5] text-xs font-semibold text-gray-500 uppercase tracking-widest bg-gray-50/50">
              <th className="p-6 font-medium">Timestamp</th>
              <th className="p-6 font-medium">Action</th>
              <th className="p-6 font-medium">Details</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {loading ? (
               <tr>
                 <td colSpan={3} className="p-20 text-center text-gray-400 animate-pulse font-serif text-xl">Loading audit trail...</td>
               </tr>
            ) : logs.length === 0 ? (
               <tr>
                 <td colSpan={3} className="p-20 text-center text-gray-400 italic">No activity recorded yet.</td>
               </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="border-b border-[#E5E5E5] hover:bg-gray-50/50 transition-colors">
                  <td className="p-6 text-gray-400 font-mono text-xs w-48">{formatDate(log.timestamp)}</td>
                  <td className="p-6">
                    <span className="text-[10px] font-bold uppercase tracking-widest bg-brand-primary/10 text-brand-primary px-3 py-1 rounded-full border border-brand-primary/20">
                      {log.action}
                    </span>
                  </td>
                  <td className="p-6 text-brand-dark font-medium leading-relaxed max-w-xl">{log.details}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
