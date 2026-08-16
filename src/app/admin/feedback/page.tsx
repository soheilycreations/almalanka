"use client";

import React, { useState, useEffect } from "react";

interface Review {
  id: string;
  authorName: string;
  country: string | null;
  message: string;
  rating: number;
  status: 'published' | 'pending';
  photoUrls: string[];
  videoUrls: string[];
  voiceUrl: string | null;
}

export default function FeedbackPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    authorName: "",
    message: "",
    rating: 5,
  });

  const fetchReviews = async () => {
    try {
      const res = await fetch('/api/reviews?all=true');
      const data = await res.json();
      setReviews(Array.isArray(data) ? data : []);
    } catch (err) {}
    setLoading(false);
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, status: 'published' })
      });
      setIsModalOpen(false);
      setFormData({ authorName: "", message: "", rating: 5 });
      fetchReviews();
    } catch (err) {
      alert("Error saving feedback");
    }
  };

  const toggleStatus = async (item: Review) => {
    const newStatus = item.status === 'published' ? 'pending' : 'published';
    await fetch(`/api/reviews/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
    fetchReviews();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this review?")) return;
    await fetch(`/api/reviews/${id}`, { method: 'DELETE' });
    fetchReviews();
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
        {loading ? (
          <div className="flex justify-center py-24">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
          </div>
        ) : reviews.length === 0 ? (
          <div className="bg-white border border-[#E5E5E5] p-12 text-center text-gray-400 italic">No feedback entries yet.</div>
        ) : (
          reviews.map((rev) => (
            <div key={rev.id} className="bg-white border border-[#E5E5E5] p-8 rounded-sm shadow-sm hover:shadow-md transition-shadow group">
               <div className="flex justify-between items-start mb-6">
                  <div>
                     <h3 className="font-serif font-bold text-xl text-brand-dark">{rev.authorName}{rev.country ? ` · ${rev.country}` : ''}</h3>
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
               <p className="text-gray-600 font-sans italic leading-relaxed mb-6">"{rev.message}"</p>

               {(rev.photoUrls?.length > 0 || rev.videoUrls?.length > 0 || rev.voiceUrl) && (
                 <div className="flex flex-wrap gap-3 mb-6">
                    {rev.photoUrls?.map((url, i) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={`p-${i}`} src={url} alt="" className="w-20 h-20 object-cover rounded-sm border border-[#E5E5E5]" />
                    ))}
                    {rev.videoUrls?.map((url, i) => (
                      <video key={`v-${i}`} src={url} muted className="w-20 h-20 object-cover rounded-sm border border-[#E5E5E5]" />
                    ))}
                    {rev.voiceUrl && (
                      <audio src={rev.voiceUrl} controls className="h-10" />
                    )}
                 </div>
               )}

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
                <input required value={formData.authorName} onChange={e => setFormData({...formData, authorName: e.target.value})} className="w-full border-b border-[#E5E5E5] p-2 focus:border-brand-primary focus:outline-none" />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 block mb-2">Review Content</label>
                <textarea required value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} className="w-full border border-[#E5E5E5] p-3 focus:border-brand-primary focus:outline-none h-32 text-sm" />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 block mb-2">Rating (1-5)</label>
                <input type="number" min="1" max="5" value={formData.rating} onChange={e => setFormData({...formData, rating: parseInt(e.target.value)})} className="w-full border-b border-[#E5E5E5] p-2 focus:border-brand-primary focus:outline-none" />
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
