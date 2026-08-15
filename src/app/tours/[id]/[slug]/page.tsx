"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import HCaptcha from '@hcaptcha/react-hcaptcha';

const staticLabels = {
  es: {
    back: "Volver",
    loading: "Cargando expedición...",
    notFound: "Expedición no encontrada.",
    duration: "Duración",
    difficulty: "Dificultad",
    guide: "Guía",
    price: "Precio Estimado",
    journey: "El Viaje",
    overview: "Visión General",
    highlights: "Lo más destacado",
    itinerary: "Itinerario Día a Día",
    startTitle: "Comienza tu viaje",
    startSub: "Un consultor especializado contactará contigo en menos de 24 horas.",
    selectedTour: "Tour Seleccionado",
    accommodation: "Acomodación",
    accommodationVal: "Lujo 5-Estrellas",
    assistance: "Asistencia",
    assistanceVal: "VIP 24/7",
    investment: "Inversión Estimada",
    requestBtn: "Solicitar Reserva",
    days: "Días",
    relatedTitle: "Otras Expediciones",
    viewTour: "Ver Detalles",
    modalTitle: "Solicitud de Reserva",
    modalSub: "Complete los detalles para su propuesta personalizada.",
    fullName: "Nombre Completo",
    email: "Correo Electrónico",
    phone: "Teléfono",
    adults: "Adultos",
    children: "Niños",
    arrival: "Fecha de Llegada",
    departure: "Fecha de Salida",
    message: "Solicitud Especial",
    submit: "ENVIAR SOLICITUD",
    sending: "ENVIANDO...",
    close: "Cerrar"
  },
  en: {
    back: "Back",
    loading: "Loading expedition...",
    notFound: "Expedition not found.",
    duration: "Duration",
    difficulty: "Difficulty",
    guide: "Guide",
    price: "Estimated Price",
    journey: "The Journey",
    overview: "Overview",
    highlights: "Highlights",
    itinerary: "Day-by-Day Itinerary",
    startTitle: "Start Your Journey",
    startSub: "A specialized consultant will contact you in less than 24 hours.",
    selectedTour: "Selected Tour",
    accommodation: "Accommodation",
    accommodationVal: "5-Star Luxury",
    assistance: "Assistance",
    assistanceVal: "VIP 24/7",
    investment: "Estimated Investment",
    requestBtn: "Request Booking",
    days: "Days",
    relatedTitle: "Other Expeditions",
    viewTour: "View Details",
    modalTitle: "Booking Request",
    modalSub: "Fill in the details for your personalized proposal.",
    fullName: "Full Name",
    email: "Email Address",
    phone: "Phone Number",
    adults: "Adults",
    children: "Children",
    arrival: "Arrival Date",
    departure: "Departure Date",
    message: "Special Request",
    submit: "SEND REQUEST",
    sending: "SENDING...",
    close: "Close"
  }
};

const AccordionItem = ({ day, title, desc, isOpen, onClick }: any) => {
  return (
    <div className="border-b border-gray-200">
      <button 
        onClick={onClick}
        className="w-full text-left py-6 pr-4 flex justify-between items-center hover:bg-gray-50 transition-colors focus:outline-none"
      >
        <div className="flex gap-6 items-center">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-primary w-16">{day}</span>
          <span className="font-serif font-bold text-xl text-brand-dark">{title}</span>
        </div>
        <span className="text-2xl font-light text-brand-primary">{isOpen ? "−" : "+"}</span>
      </button>
      <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? "max-h-60 pb-6 opacity-100" : "max-h-0 opacity-0"}`}>
        <p className="font-sans font-light leading-relaxed text-gray-500 pl-22 pr-8">{desc}</p>
      </div>
    </div>
  );
};

export default function TourDetails() {
  const { lang } = useLanguage();
  const params = useParams();
  const id = params?.id;
  const [tour, setTour] = useState<any>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDay, setOpenDay] = useState<number>(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  
  const t = staticLabels[lang];

  useEffect(() => {
    // Scroll to top on load
    window.scrollTo(0, 0);

    fetch('/api/tour-plans', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        const found = data.find((p: any) => p.id === id);
        setTour(found);
        
        const others = data.filter((p: any) => p.id !== id).sort(() => 0.5 - Math.random()).slice(0, 4);
        setRelated(others);
        
        setLoading(false);
      });
  }, [id]);

  const handleBookingSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!captchaToken) {
      alert(lang === "es" ? "Por favor, complete el captcha." : "Please complete the captcha.");
      return;
    }
    setSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          tourId: id,
          tourName: tour.title,
          price: tour.price
        })
      });

      if (res.ok) {
        alert(lang === "es" ? "Solicitud enviada con éxito. Nos contactaremos pronto." : "Request sent successfully. We will contact you soon.");
        setIsModalOpen(false);
      } else {
        alert("Error sending request. Please try again.");
      }
    } catch (err) {
      alert("Error sending request.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-serif text-2xl animate-pulse">{t.loading}</div>;
  if (!tour) return <div className="min-h-screen flex items-center justify-center font-serif text-2xl">{t.notFound}</div>;

  const highlights = tour.highlights || [];
  const itinerary = tour.itinerary || [];
  const slugify = (text: string) => text.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

  return (
    <main className="min-h-screen relative pb-32 bg-brand-bg">
      {/* 1. Dynamic Hero */}
      <section className="relative h-[65vh] min-h-[500px] w-full overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image 
            src={tour.image} 
            alt={tour.title} 
            fill 
            className="object-cover" 
            priority 
          />
          <div className="absolute inset-0 bg-black/40 z-10"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-brand-bg via-transparent to-brand-dark/60 z-20"></div>
        </div>
        
        <div className="relative z-30 h-full flex flex-col justify-end max-w-7xl mx-auto px-8 pb-20">
          <Link href="/tours" className="text-white/60 hover:text-white uppercase tracking-widest text-[10px] font-bold mb-6 flex items-center gap-2">
            &larr; {t.back}
          </Link>
          <div className="flex items-center gap-4 mb-4">
             <span className="bg-brand-primary text-white text-[10px] uppercase font-bold tracking-widest px-3 py-1">{tour.type}</span>
             <span className="text-white/80 font-serif italic">{tour.route?.join(" / ")}</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-serif text-white leading-tight">{tour.title}</h1>
        </div>
      </section>

      {/* 2. Quick Facts Bar */}
      <section className="bg-white border-y border-[#E5E5E5] relative z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-8 py-6 grid grid-cols-2 md:grid-cols-4 gap-8">
           <div className="flex flex-col gap-1 border-r border-[#E5E5E5]">
             <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400">{t.duration}</span>
             <span className="font-serif text-2xl text-brand-dark">{tour.days} {t.days}</span>
           </div>
           <div className="flex flex-col gap-1 border-r border-[#E5E5E5]">
             <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400">{t.difficulty}</span>
             <span className="font-serif text-2xl text-brand-dark">{tour.difficulty}</span>
           </div>
           <div className="flex flex-col gap-1 border-r border-[#E5E5E5] md:border-r-0 lg:border-r">
             <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400">{t.guide}</span>
             <span className="font-serif text-xl text-brand-dark">{tour.guide}</span>
           </div>
           <div className="flex flex-col gap-1">
             <span className="text-[10px] uppercase tracking-widest font-bold text-brand-primary">{t.price}</span>
             <span className="font-serif text-2xl text-brand-primary font-bold">{tour.price}</span>
           </div>
        </div>
      </section>

      {/* 3. Main Split Content */}
      <section className="w-full bg-brand-bg relative z-40 pt-20 pb-20">
        <div className="max-w-7xl mx-auto px-8 flex flex-col lg:flex-row gap-16 items-start">
          
          <div className="w-full lg:w-2/3">
            <h2 className="text-sm uppercase tracking-[0.2em] font-bold text-brand-primary mb-4">{t.journey}</h2>
            <h3 className="text-4xl font-serif font-bold text-brand-dark mb-6">{t.overview}</h3>
            <p className="font-sans font-light text-gray-600 leading-relaxed text-lg mb-12">
              {tour.overview}
            </p>

            <h4 className="text-2xl font-serif font-bold text-brand-dark mb-6">{t.highlights}</h4>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-16">
              {highlights.map((h: string, i: number) => (
                <li key={i} className="flex items-center gap-4 text-gray-600 font-sans">
                  <div className="w-5 h-5 bg-brand-primary/10 flex items-center justify-center rounded-full text-brand-primary shrink-0">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
                  </div>
                  <span className="text-sm">{h}</span>
                </li>
              ))}
            </ul>

            <h3 className="text-4xl font-serif font-bold text-brand-dark mb-8">{t.itinerary}</h3>
            <div className="border-t border-gray-200">
               {itinerary.map((it: any, i: number) => (
                 <AccordionItem 
                    key={i} 
                    day={it.day} 
                    title={it.title} 
                    desc={it.desc} 
                    isOpen={openDay === i}
                    onClick={() => setOpenDay(openDay === i ? -1 : i)}
                 />
               ))}
            </div>
          </div>

          <div className="w-full lg:w-1/3 sticky top-32">
            <div className="bg-white p-8 border border-[#E5E5E5] shadow-xl pb-10">
               <h3 className="font-serif text-3xl font-bold text-brand-dark mb-2">{t.startTitle}</h3>
               <p className="text-sm font-sans text-gray-500 mb-8 border-b border-[#E5E5E5] pb-6">{t.startSub}</p>

               <div className="flex flex-col gap-6 font-sans mb-8">
                 <div className="flex justify-between items-center text-sm">
                   <span className="text-gray-500 uppercase tracking-widest font-bold text-[10px]">{t.selectedTour}</span>
                   <span className="font-bold text-brand-dark text-right">{tour.title}</span>
                 </div>
                 <div className="flex justify-between items-center text-sm">
                   <span className="text-gray-500 uppercase tracking-widest font-bold text-[10px]">{t.accommodation}</span>
                   <span className="font-bold text-brand-dark text-right">{t.accommodationVal}</span>
                 </div>
                 <div className="flex justify-between items-center text-sm">
                   <span className="text-gray-500 uppercase tracking-widest font-bold text-[10px]">{t.assistance}</span>
                   <span className="font-bold text-brand-dark text-right">{t.assistanceVal}</span>
                 </div>
               </div>

               <div className="bg-[#FAF9F5] p-6 mb-8 text-center flex flex-col items-center border border-[#E5E5E5]">
                 <span className="text-[10px] uppercase font-bold tracking-widest text-brand-primary mb-1">{t.investment}</span>
                 <span className="font-serif text-3xl font-bold text-brand-dark">{tour.price}</span>
               </div>

               <button 
                onClick={() => setIsModalOpen(true)}
                className="w-full bg-[#D4A017] text-white py-5 flex justify-center items-center gap-3 uppercase font-bold tracking-[0.2em] text-xs hover:bg-[#B8860B] transition-colors shadow-lg"
               >
                 {t.requestBtn} &rarr;
               </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Related Tours Section */}
      <section className="w-full py-20 bg-white border-t border-[#E5E5E5]">
        <div className="max-w-7xl mx-auto px-8">
          <h3 className="text-3xl font-serif font-bold text-brand-dark mb-12 text-center">{t.relatedTitle}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {related.map((item: any) => (
              <Link 
                key={item.id} 
                href={`/tours/${item.id}/${slugify(item.title)}`}
                className="group flex flex-col h-full bg-brand-bg border border-[#E5E5E5] hover:shadow-xl transition-all duration-500"
              >
                <div className="relative h-48 overflow-hidden">
                  <Image 
                    src={item.image} 
                    alt={item.title} 
                    fill 
                    className="object-cover transition-transform duration-700 group-hover:scale-110" 
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors"></div>
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <span className="text-[9px] uppercase tracking-widest font-bold text-brand-primary mb-2">{item.type}</span>
                  <h4 className="font-serif text-xl font-bold text-brand-dark mb-4 group-hover:text-brand-primary transition-colors">{item.title}</h4>
                  <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{item.days} {t.days}</span>
                    <span className="text-[10px] font-bold text-brand-primary uppercase tracking-widest">{t.viewTour} &rarr;</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Booking Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto relative p-8 md:p-12 shadow-2xl rounded-sm">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-brand-dark transition-colors text-2xl font-light"
            >
              &times;
            </button>

            <header className="mb-10 text-center">
               <h3 className="text-3xl font-serif font-bold text-brand-dark mb-2">{t.modalTitle}</h3>
               <p className="text-sm font-sans text-gray-500">{t.modalSub}</p>
            </header>

            <form onSubmit={handleBookingSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="flex flex-col">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2">{t.fullName} *</label>
                  <input required name="customerName" type="text" className="border-b border-gray-200 py-2 focus:border-brand-primary outline-none text-sm font-serif" />
               </div>
               <div className="flex flex-col">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2">{t.email} *</label>
                  <input required name="email" type="email" className="border-b border-gray-200 py-2 focus:border-brand-primary outline-none text-sm font-serif" />
               </div>
               <div className="flex flex-col">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2">{t.phone} *</label>
                  <input required name="phone" type="tel" className="border-b border-gray-200 py-2 focus:border-brand-primary outline-none text-sm font-serif" />
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col">
                     <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2">{t.adults} *</label>
                     <input required name="adults" type="number" min="1" defaultValue="1" className="border-b border-gray-200 py-2 focus:border-brand-primary outline-none text-sm font-serif" />
                  </div>
                  <div className="flex flex-col">
                     <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2">{t.children}</label>
                     <input name="children" type="number" min="0" defaultValue="0" className="border-b border-gray-200 py-2 focus:border-brand-primary outline-none text-sm font-serif" />
                  </div>
               </div>
               <div className="flex flex-col">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2">{t.arrival} *</label>
                  <input required name="date" type="date" className="border-b border-gray-200 py-2 focus:border-brand-primary outline-none text-sm font-serif" />
               </div>
               <div className="flex flex-col">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2">{t.departure} *</label>
                  <input required name="departureDate" type="date" className="border-b border-gray-200 py-2 focus:border-brand-primary outline-none text-sm font-serif" />
               </div>
               <div className="md:col-span-2 flex flex-col">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2">{t.message}</label>
                  <textarea name="specialRequest" rows={3} className="border-b border-gray-200 py-2 focus:border-brand-primary outline-none text-sm font-serif resize-none"></textarea>
               </div>
               
               <div className="md:col-span-2 flex justify-center mt-2">
                 <HCaptcha
                   sitekey="ff2c03fc-f3e0-416e-b60e-1e1a2502aff8"
                   onVerify={(token) => setCaptchaToken(token)}
                 />
               </div>

               <button 
                disabled={submitting}
                type="submit" 
                className="md:col-span-2 bg-[#D4A017] text-white py-5 uppercase font-bold tracking-[0.2em] text-xs hover:bg-[#B8860B] transition-colors shadow-lg mt-4 disabled:opacity-50"
               >
                 {submitting ? t.sending : t.submit}
               </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
