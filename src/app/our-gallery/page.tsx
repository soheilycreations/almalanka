"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";

const labels = {
  es: {
    title: "Nuestra Galería de Expediciones",
    desc: "Un viaje visual a través de nuestras aventuras pasadas, capturando la belleza cruda de la vida silvestre y los paisajes de Sri Lanka a través de los lentes de nuestros guías expertos y huéspedes.",
    loading: "Cargando galería...",
    videoLabel: "Lo más destacado de la expedición (Video)",
    viewFull: "Ver tamaño completo",
    ctaTitle: "¿Quieres ser parte de nuestra próxima historia?",
    ctaDesc: "Nuestras próximas expediciones se están llenando rápido. Reserve su lugar hoy y capturemos momentos inolvidables juntos.",
    ctaBtn: "Comienza tu viaje"
  },
  en: {
    title: "Our Expedition Gallery",
    desc: "A visual journey through our past adventures, capturing the raw beauty of Sri Lanka's wildlife and landscapes through the lenses of our expert guides and guests.",
    loading: "Loading gallery...",
    videoLabel: "Expedition Highlights (Video)",
    viewFull: "View Full Size",
    ctaTitle: "Want to be part of our next story?",
    ctaDesc: "Our upcoming expeditions are filling fast. Book your spot today and let's capture unforgettable moments together.",
    ctaBtn: "Start Your Journey"
  }
};

export default function GalleryPage() {
  const { lang } = useLanguage();
  const t = labels[lang];
  const [selectedImg, setSelectedImg] = useState<string | null>(null);
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/gallery")
      .then(res => res.json())
      .then(data => {
        setImages(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load gallery", err);
        setLoading(false);
      });
  }, []);

  return (
    <main className="min-h-screen bg-brand-bg pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <header className="mb-20 text-center">
          <h1 className="text-5xl md:text-7xl font-serif text-brand-dark mb-6 italic">{t.title}</h1>
          <p className="text-lg text-gray-500 font-sans max-w-2xl mx-auto">{t.desc}</p>
        </header>

        {loading ? (
          <div className="flex justify-center py-24">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
            {/* Featured Video */}
            <div className="relative break-inside-avoid overflow-hidden rounded-sm group shadow-md hover:shadow-2xl transition-all duration-500 border border-gray-100">
               <video 
                  src="/Our Gallery/WhatsApp Video 2026-05-01 at 1.02.56 PM.mp4" 
                  controls 
                  className="w-full h-auto"
                  poster="/img/jansimons-elephants-5999125_1920.jpg"
               />
               <div className="p-4 bg-white text-[10px] uppercase tracking-widest font-bold text-brand-primary">{t.videoLabel}</div>
            </div>

            {images.map((img, i) => (
              <div 
                key={img.id} 
                className="relative break-inside-avoid overflow-hidden rounded-sm cursor-pointer group shadow-md hover:shadow-2xl transition-all duration-500 border border-gray-100"
                onClick={() => setSelectedImg(img.src)}
              >
                <img 
                  src={img.src} 
                  alt={img.title} 
                  className="w-full h-auto object-cover group-hover:scale-110 transition-transform duration-700"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-brand-dark/20 group-hover:bg-brand-dark/0 transition-colors duration-500"></div>
                <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <span className="text-[10px] text-white uppercase tracking-widest font-bold bg-brand-primary px-2 py-1">{t.viewFull}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {selectedImg && (
        <div 
          className="fixed inset-0 bg-brand-dark/95 backdrop-blur-xl z-[200] flex items-center justify-center p-4 md:p-12 cursor-zoom-out"
          onClick={() => setSelectedImg(null)}
        >
          <button className="absolute top-8 right-8 text-white text-4xl font-light hover:text-brand-primary transition-colors">&times;</button>
          <div className="relative w-full h-full max-w-5xl max-h-[85vh]">
             <img 
                src={`/Our Gallery/${selectedImg}`} 
                alt="Selected" 
                className="w-full h-full object-contain shadow-2xl"
             />
          </div>
        </div>
      )}

      {/* CTA Section */}
      <section className="mt-32 bg-white py-24 border-y border-gray-100 text-center">
         <h2 className="text-3xl font-serif text-brand-dark mb-6">{t.ctaTitle}</h2>
         <p className="text-gray-500 mb-10 max-w-lg mx-auto">{t.ctaDesc}</p>
         <a href="/book" className="inline-block px-12 py-4 bg-[#D4A017] text-white font-bold uppercase tracking-widest text-xs hover:bg-[#B8860B] transition-all shadow-lg">{t.ctaBtn}</a>
      </section>
    </main>
  );
}
