"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";

const staticLabels = {
  es: {
    title: "Nuestras Expediciones",
    sub: "Itinerarios de Autor",
    desc: "Explore nuestra colección curada de expediciones premium. Utilice los filtros para encontrar su viaje perfecto al corazón de Ceilán.",
    filters: { type: "Tipo de Tour", duration: "Duración", budget: "Nivel de Lujo" },
    filterOptions: {
      types: ["Todos", "Aves Endémicas", "Safari Lujo", "Cultura", "Playa"],
      durations: ["Cualquiera", "1-5 Días", "6-10 Días", "Más de 10 Días"],
      budgets: ["Todos", "Premium", "Ultra Lujo"]
    },
    ctaTitle: "¿No encuentra lo que busca?",
    ctaDesc: "Nuestros planificadores expertos pueden diseñar un itinerario completamente a medida para usted.",
    ctaBtn: "Solicitar Itinerario Personalizado"
  },
  en: {
    title: "Our Expeditions",
    sub: "Signature Itineraries",
    desc: "Explore our curated collection of premium expeditions. Use the filters below to find your perfect journey to the heart of Ceylon.",
    filters: { type: "Tour Type", duration: "Duration", budget: "Luxury Level" },
    filterOptions: {
      types: ["All", "Endemic Birds", "Luxury Safari", "Culture", "Beach"],
      durations: ["Any", "1-5 Days", "6-10 Days", "10+ Days"],
      budgets: ["All", "Premium", "Ultra Luxury"]
    },
    ctaTitle: "Can't find exactly what you want?",
    ctaDesc: "Our expert concierges can design a completely bespoke itinerary tailored to your schedule and desires.",
    ctaBtn: "Request Custom Itinerary"
  }
};

function ToursContent() {
  const { lang } = useLanguage();
  const [packages, setPackages] = useState<any[]>([]);
  const [filterType, setFilterType] = useState("All");
  const searchParams = useSearchParams();
  const typeParam = searchParams.get('type');

  useEffect(() => {
    fetch('/api/tour-plans', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        setPackages(data);
        if (typeParam) setFilterType(typeParam);
      });
  }, [typeParam]);

  const t = staticLabels[lang];

  // Dynamically generate types from packages
  const dynamicTypes = ["All", ...new Set(packages.map(p => p.type).filter(Boolean))];

  const filteredPackages = filterType === "All" 
    ? packages 
    : packages.filter(p => p.type === filterType);

  const slugify = (text: string) => text.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

  return (
    <main className="min-h-screen bg-brand-bg pt-20">
      
      {/* Cinematic Hero */}
      <section className="relative h-[40vh] min-h-[400px] flex flex-col justify-center items-center text-center px-4">
        
        <div className="absolute inset-0 z-0">
          <Image src="/img/jeroenketelhaven-sri-lanka-2726043_1920.jpg" alt="Tours Header" fill className="object-cover object-bottom opacity-80" />
          <div className="absolute inset-0 bg-brand-dark/60"></div>
        </div>
        <div className="relative z-10 max-w-3xl">
          <h2 className="text-xs font-bold tracking-[0.3em] uppercase text-brand-primary mb-4">{t.sub}</h2>
          <h1 className="text-5xl md:text-7xl font-serif text-white mb-6">{t.title}</h1>
          <p className="text-white/80 font-sans font-light text-lg">{t.desc}</p>
        </div>
      </section>

      {/* Horizontal Sticky Filter Bar */}
      <section className="sticky top-20 z-40 bg-white border-b border-[#E5E5E5] shadow-sm hidden md:block">
        <div className="max-w-7xl mx-auto px-8 py-4 flex gap-8 items-center justify-between">
           <div className="flex gap-8">
              <div className="flex flex-col">
                 <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">{t.filters.type}</label>
                 <select 
                    value={filterType} 
                    onChange={e => setFilterType(e.target.value)} 
                    className="bg-transparent font-serif text-lg text-brand-dark focus:outline-none cursor-pointer"
                 >
                    {dynamicTypes.map((type: any, i) => <option key={i} value={type}>{type}</option>)}
                 </select>
              </div>
              <div className="w-[1px] h-10 bg-[#E5E5E5]"></div>
              <div className="flex flex-col">
                 <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">{t.filters.duration}</label>
                 <select className="bg-transparent font-serif text-lg text-brand-dark focus:outline-none cursor-pointer">
                    {t.filterOptions.durations.map((dur, i) => <option key={i}>{dur}</option>)}
                 </select>
              </div>
              <div className="w-[1px] h-10 bg-[#E5E5E5]"></div>
              <div className="flex flex-col">
                 <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">{t.filters.budget}</label>
                 <select className="bg-transparent font-serif text-lg text-brand-dark focus:outline-none cursor-pointer">
                    {t.filterOptions.budgets.map((bud, i) => <option key={i}>{bud}</option>)}
                 </select>
              </div>
           </div>
           
           <div className="text-xs tracking-widest uppercase font-bold text-gray-400">
              {filteredPackages.length} {lang === "es" ? "Resultados" : "Results"}
           </div>
        </div>
      </section>

      {/* Tour Grid */}
      <section className="py-24 px-8 md:px-16 lg:px-24 max-w-[1600px] mx-auto min-h-[50vh]">
         {filteredPackages.length === 0 ? (
           <div className="text-center py-20">
             <p className="font-serif text-2xl text-gray-500 italic">No packages match your criteria.</p>
             <button onClick={() => setFilterType("All")} className="mt-6 text-brand-primary uppercase tracking-widest text-xs font-bold border-b border-brand-primary pb-1">Reset Filters</button>
           </div>
         ) : (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPackages.map((pkg, i) => (
                <Link href={`/tours/${pkg.id}/${slugify(pkg.title)}`} key={pkg.id} className="group relative h-[500px] overflow-hidden rounded-sm cursor-pointer shadow-sm hover:shadow-2xl transition-all duration-500 block">
                  <Image src={pkg.image} alt={pkg.title} fill className="object-cover group-hover:scale-105 transition-transform duration-1000" />
                  
                  {pkg.feat && <div className="absolute top-6 left-6 w-10 h-10 bg-brand-primary text-white flex items-center justify-center font-serif italic font-bold z-10">AL</div>}

                  <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/40 to-transparent"></div>
                  
                  <div className="absolute top-6 right-6 bg-white px-4 py-2 font-bold font-sans text-[10px] uppercase tracking-widest shadow-md text-brand-dark z-10">
                    {pkg.price}
                  </div>

                  <div className="absolute bottom-8 left-8 right-8 text-white z-10">
                    <div className="flex gap-2 mb-3">
                      <span className="text-brand-primary font-bold uppercase tracking-widest text-[10px] bg-white px-2 py-1 inline-block">{pkg.route?.[0]}</span>
                      <span className="text-white font-bold uppercase tracking-widest text-[10px] bg-brand-primary px-2 py-1 inline-block">{pkg.type}</span>
                    </div>
                    <h3 className="font-serif font-bold text-3xl leading-tight mb-2">{pkg.title}</h3>
                    <div className="flex justify-between items-end">
                      <p className="text-white/70 font-sans text-sm">{pkg.days}</p>
                      <span className="text-brand-primary font-serif italic group-hover:translate-x-2 transition-transform duration-300 text-sm">Ver &rarr;</span>
                    </div>
                  </div>
                </Link>
              ))}
           </div>
         )}
      </section>

      {/* Call to Action */}
      <section className="bg-[#EAF2ED] py-24 px-8 text-center border-t border-[#C5D2C9]">
         <h2 className="text-4xl font-serif font-bold text-brand-dark mb-6">{t.ctaTitle}</h2>
         <p className="text-gray-600 font-sans max-w-xl mx-auto mb-10">{t.ctaDesc}</p>
         <Link href="/#contact" className="inline-block bg-brand-primary text-white px-10 py-5 font-bold uppercase tracking-[0.2em] text-xs hover:bg-green-900 transition-colors shadow-lg">
           {t.ctaBtn}
         </Link>
      </section>
    </main>
  );
}
export default function ToursPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-serif text-2xl animate-pulse">Cargando...</div>}>
      <ToursContent />
    </Suspense>
  );
}
