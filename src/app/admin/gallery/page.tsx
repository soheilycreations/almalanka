"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

interface GalleryImage {
  id: string;
  src: string;
  title: string;
}

export default function GalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const res = await fetch("/api/gallery");
      const data = await res.json();
      setImages(data);
    } catch (err) {
      console.error("Failed to fetch images", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    
    setUploading(true);
    const formData = new FormData();
    formData.append("file", e.target.files[0]);

    try {
      const res = await fetch("/api/gallery", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        alert("Upload successful!");
        fetchImages();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(`Upload failed: ${data.error || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Upload error", err);
      alert("Upload failed: network error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-24 px-8">
      <header className="mb-12 flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-serif font-bold text-brand-dark mb-2">Media Gallery</h2>
          <p className="text-gray-500 font-sans text-sm">Manage and curate the visual storytelling of AlmaLanka.</p>
        </div>
        
        <div className="relative">
          <input 
            type="file" 
            id="gallery-upload" 
            className="hidden" 
            accept="image/*"
            onChange={handleUpload}
            disabled={uploading}
          />
          <label 
            htmlFor="gallery-upload"
            className={`cursor-pointer bg-brand-primary text-white px-8 py-3 uppercase tracking-widest text-[10px] font-bold hover:bg-brand-dark transition-all shadow-lg flex items-center gap-2 ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
          >
            {uploading ? "Uploading..." : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
                Upload Media
              </>
            )}
          </label>
        </div>
      </header>

      {loading ? (
        <div className="flex justify-center py-24">
           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {images.map((img) => (
            <div key={img.id} className="group relative h-64 bg-gray-100 overflow-hidden border border-[#E5E5E5] hover:shadow-xl transition-all duration-500">
              <Image src={img.src} alt={img.title} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute inset-0 bg-brand-dark/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-4">
                 <button 
                   onClick={() => { navigator.clipboard.writeText(img.src); alert('Image URL copied!'); }}
                   className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-sm text-white text-[10px] font-bold uppercase tracking-widest hover:bg-white/40 transition-colors"
                 >
                    Copy URL
                 </button>
                 <p className="text-white text-[9px] text-center px-4 font-mono truncate w-full">{img.src}</p>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-white/90 backdrop-blur-sm transform translate-y-full group-hover:translate-y-0 transition-transform">
                 <p className="text-brand-dark text-[10px] uppercase tracking-widest font-bold truncate">{img.title}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-16 bg-[#F8FDF9] p-12 border border-brand-primary/10 text-center">
         <div className="max-w-2xl mx-auto">
            <h3 className="text-2xl font-serif font-bold text-brand-dark mb-4">Gallery Management</h3>
            <p className="text-sm text-gray-500 mb-6">Uploaded images are automatically available in the public "Our Gallery" section and can be used in your tour itineraries by copying the source path.</p>
            <div className="w-full h-1 bg-gray-200 rounded-full mb-4 overflow-hidden">
               <div className="h-full bg-brand-primary transition-all duration-1000" style={{ width: `${Math.min((images.length / 100) * 100, 100)}%` }}></div>
            </div>
            <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">{images.length} Media Items Stored</p>
         </div>
      </div>
    </div>
  );
}
