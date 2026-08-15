"use client";

import React, { useState, useEffect } from "react";

interface Feedback {
  id: string;
  author: string;
  content: string;
  rating: number;
  status: 'published' | 'pending';
}

export default function FeedbackPage() {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Omit<Feedback, 'id'>>({
    author: "",
    content: "",
    rating: 5,
    status: 'published'
  });

  const fetchFeedback = async () => {
    try {
      const res = await fetch('/api/feedback');
      const data = await res.json();
      setFeedback(data);
    } catch (err) {}
    setLoading(false);
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      setIsModalOpen(false);
      setFormData({ author: "", content: "", rating: 5, status: 'published' });
      fetchFeedback();
    } catch (err) {
      alert("Error saving feedback");
    }
  };

  const toggleStatus = async (item: Feedback) => {
    const newStatus = item.status === 'published' ? 'pending' : 'published';
    await fetch('/api/feedback', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...item, status: newStatus })
    });
    fetchFeedback();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this review?")) return;
    await fetch(`/api/feedback?id=${id}`, { method: 'DELETE' });
    fetchFeedback();
  };

  return (
    <div className="max-w-6xl mx-auto pb-24 px-4 sm:px-6">
      <header className="mb-12 flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-serif font-bold text-brand-dark mb-2">Customer Feedback</h2>
          <p className="text-gray-500 font-sans text-sm">Curate and manage testimonials for the public website.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-brand-primary text-white px-8 py-3 uppercase tracking-widest text-xs font-bold hover:bg-brand-dark transition-colors shadow-lg">
          Add Manual Feedback
        </button>
      </header>

      <div className="flex flex-col gap-6">
        {feedback.length === 0 ? (
          <div className="bg-white border border-[#E5E5E5] p-12 text-center text-gray-400 italic">No feedback entries yet.</div>
        ) : (
          feedback.map((rev) => (
            <div key={rev.id} className="bg-white border border-[#E5E5E5] p-8 rounded-sm shadow-sm hover:shadow-md transition-shadow group">
               <div className="flex justify-between items-start mb-6">
                  <div>
                     <h3 className="font-serif font-bold text-xl text-brand-dark">{rev.author}</h3>
                     <div className="flex gap-1 text-[#D4AF37] mt-1 text-xs">
                        {"★".repeat(rev.rating)}
                     </div>
                  </div>
                  <button onClick={() => toggleStatus(rev)} className={`text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full transition-colors ${
                     rev.status === 'published' ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                  }`}>
                     {rev.status}
                  </button>
               </div>
               <p className="text-gray-600 font-sans italic leading-relaxed mb-8">"{rev.content}"</p>
               <div className="flex gap-4 border-t border-gray-100 pt-6">
                  <button onClick={() => handleDelete(rev.id)} className="text-[10px] uppercase tracking-widest font-bold text-gray-400 hover:text-red-600 transition-colors">Delete Entry</button>
               </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md p-8 rounded-sm shadow-2xl animate-in fade-in zoom-in duration-200">
            <h3 className="text-2xl font-serif font-bold text-brand-dark mb-6">Add Feedback</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 block mb-2">Customer Name</label>
                <input required value={formData.author} onChange={e => setFormData({...formData, author: e.target.value})} className="w-full border-b border-[#E5E5E5] p-2 focus:border-brand-primary focus:outline-none" />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 block mb-2">Review Content</label>
                <textarea required value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} className="w-full border border-[#E5E5E5] p-3 focus:border-brand-primary focus:outline-none h-32 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 block mb-2">Rating (1-5)</label>
                  <input type="number" min="1" max="5" value={formData.rating} onChange={e => setFormData({...formData, rating: parseInt(e.target.value)})} className="w-full border-b border-[#E5E5E5] p-2 focus:border-brand-primary focus:outline-none" />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 block mb-2">Initial Status</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})} className="w-full border-b border-[#E5E5E5] p-2 focus:border-brand-primary focus:outline-none bg-transparent">
                    <option value="published">Published</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-4 pt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 text-[10px] uppercase tracking-widest font-bold text-gray-400">Cancel</button>
                <button type="submit" className="flex-1 bg-brand-primary text-white py-3 text-[10px] uppercase tracking-widest font-bold hover:bg-brand-dark transition-colors">Save Feedback</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
