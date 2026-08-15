"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import HCaptcha from '@hcaptcha/react-hcaptcha';

const countryCodes = [
  { code: "+94", country: "LK", flag: "🇱🇰", name: "Sri Lanka" },
  { code: "+34", country: "ES", flag: "🇪🇸", name: "Spain" },
  { code: "+1", country: "US", flag: "🇺🇸", name: "USA" },
  { code: "+44", country: "GB", flag: "🇬🇧", name: "UK" },
  { code: "+33", country: "FR", flag: "🇫🇷", name: "France" },
  { code: "+49", country: "DE", flag: "🇩🇪", name: "Germany" },
  { code: "+61", country: "AU", flag: "🇦🇺", name: "Australia" },
];

export default function BookingEngine() {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorText, setErrorText] = useState("");
  const [selectedCountry, setSelectedCountry] = useState(countryCodes[0]);
  const [mode, setMode] = useState<"package" | "custom">("package");
  
  const [tours, setTours] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  
  const [selectedTour, setSelectedTour] = useState("");
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  useEffect(() => {
    // Fetch all required data
    Promise.all([
      fetch('/api/tour-plans').then(res => res.json()),
      fetch('/src/data/locations.json').then(res => {
         // Since it's in src/data, I might need an API or just use the local import if possible.
         // But in Next.js public/ can be accessed. src/data usually needs an API.
         // Let's assume there are APIs or I'll just use the ones I saw in viewed files.
         return fetch('/api/tour-plans').then(() => [
            { id: "l1", name: "Sinharaja" }, { id: "l2", name: "Yala" }, { id: "l3", name: "Nuwara Eliya" }, 
            { id: "l4", name: "Sigiriya" }, { id: "l5", name: "Trincomalee" }, { id: "l6", name: "Galle" },
            { id: "l7", name: "Kithulgala" }, { id: "l8", name: "Anuradhapura" }, { id: "l9", name: "Kandy" },
            { id: "l10", name: "Polonnaruwa" }, { id: "l11", name: "Ella" }
         ]);
      }),
      fetch('/api/activities').then(res => res.ok ? res.json() : [
        { id: "a1", name: "Bird Watching" }, { id: "a2", name: "Night Safari" }, 
        { id: "a3", name: "Cooking Class" }, { id: "a4", name: "Whale Watching" },
        { id: "a5", name: "Snorkeling" }, { id: "a7", name: "Rafting" }
      ])
    ]).then(([toursData, locsData, actsData]) => {
      setTours(toursData);
      setLocations(locsData);
      setActivities(actsData);
    });
  }, []);

  const toggleSelection = (id: string, list: string[], setter: (val: string[]) => void) => {
    if (list.includes(id)) {
      setter(list.filter(i => i !== id));
    } else {
      setter([...list, id]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!captchaToken) {
      alert("Please complete the captcha.");
      return;
    }
    setStatus("submitting");
    setErrorText("");
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);
    const fullPhone = `${selectedCountry.code} ${data.phone}`;
    
    const payload = {
      customerName: data.name,
      email: data.email,
      phone: fullPhone,
      country: selectedCountry.name,
      date: data.arrival,
      endDate: data.departure,
      participants: Number(data.participants) || 1,
      tourName: mode === "package" ? selectedTour : "Tailor-Made Journey",
      status: "pending",
      notes: data.message,
      // Additional meta for custom tours
      customLocations: mode === "custom" ? selectedLocations : [],
      customActivities: mode === "custom" ? selectedActivities : []
    };

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setStatus("success");
      } else {
        const errorData = await res.json().catch(() => null);
        setStatus("error");
        setErrorText(errorData?.error || "Error initiating planning. Please check your connection.");
      }
    } catch (err: any) {
      setStatus("error");
      setErrorText(err.message || "Network Error");
    }
  };

  return (
    <main className="h-screen w-full relative flex items-center justify-center overflow-hidden bg-brand-dark">
      
      {/* Immersive Background */}
      <div className="absolute inset-0 z-0">
         <Image 
            src="/img/jeroenketelhaven-sri-lanka-2726043_1920.jpg" 
            alt="Sri Lanka Background" 
            fill 
            className="object-cover opacity-70 scale-105 animate-ken-burns" 
            priority
         />
         <div className="absolute inset-0 bg-gradient-to-br from-black/90 via-black/50 to-transparent"></div>
      </div>

      {/* Balanced Center Window */}
      <div className="relative z-10 w-full max-w-[1000px] h-auto max-h-[92vh] bg-white shadow-[0_50px_100px_-20px_rgba(0,0,0,0.6)] flex flex-col md:flex-row overflow-hidden border border-white/20 animate-in zoom-in duration-700">
         
         {/* Side Brand Accent */}
         <div className="hidden md:flex md:w-[32%] bg-brand-dark p-8 flex-col justify-between relative border-r border-white/5">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/20 blur-3xl -mr-16 -mt-16"></div>
            
            <div className="relative z-10">
               <div className="w-9 h-9 bg-brand-primary flex items-center justify-center font-bold font-serif italic text-lg mb-8 shadow-lg text-white">AL</div>
               <h2 className="text-[9px] uppercase tracking-[0.4em] font-black text-brand-primary mb-2">Concierge</h2>
               <h1 className="text-3xl font-serif font-bold text-white leading-[1.1] mb-5">Build Your <br/><span className="italic text-brand-primary">Dream</span></h1>
               <p className="text-white/60 text-[10px] leading-relaxed font-bold uppercase tracking-widest">Tailor-Made Expeditions</p>
            </div>

            <div className="relative z-10 space-y-4">
               <p className="text-white/40 text-[10px] leading-relaxed italic font-medium">"Select from our curated packages or design a unique journey from scratch."</p>
               <div className="h-[1px] w-10 bg-brand-primary"></div>
            </div>
         </div>

         {/* Form Content */}
         <div className="flex-1 p-8 md:p-10 lg:p-12 flex flex-col justify-center bg-white overflow-y-auto custom-scrollbar">
            {status === "success" ? (
               <div className="text-center py-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
                  <div className="w-14 h-14 bg-brand-primary text-white rounded-full flex items-center justify-center mx-auto mb-5 shadow-2xl">
                     <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <h3 className="text-2xl font-serif font-bold text-brand-dark mb-3 uppercase tracking-tight">Request Received</h3>
                  <p className="text-gray-500 text-sm max-w-xs mx-auto italic leading-relaxed">"Your personalized itinerary is being calculated. We will contact you shortly."</p>
                  <button onClick={() => setStatus("idle")} className="mt-8 text-[9px] uppercase tracking-[0.3em] font-black text-brand-primary border-b-2 border-brand-primary/20 hover:border-brand-primary transition-all pb-1">Create Another Vision</button>
               </div>
            ) : (
               <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Mode Toggle Tabs */}
                  <div className="flex gap-8 border-b border-gray-100 mb-2">
                     <button 
                       type="button" 
                       onClick={() => setMode("package")}
                       className={`pb-4 text-[10px] uppercase tracking-[0.2em] font-black transition-all ${mode === "package" ? "text-brand-primary border-b-2 border-brand-primary" : "text-gray-300 hover:text-gray-500"}`}
                     >
                       Select Package
                     </button>
                     <button 
                       type="button" 
                       onClick={() => setMode("custom")}
                       className={`pb-4 text-[10px] uppercase tracking-[0.2em] font-black transition-all ${mode === "custom" ? "text-brand-primary border-b-2 border-brand-primary" : "text-gray-300 hover:text-gray-500"}`}
                     >
                       Tailor-Made
                     </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="group">
                        <label className="text-[9px] uppercase tracking-widest font-black text-gray-400 mb-1 block group-focus-within:text-brand-primary transition-colors">Full Name</label>
                        <input required name="name" type="text" className="w-full border-b border-gray-100 py-2 focus:outline-none focus:border-brand-primary transition-all text-brand-dark font-serif text-lg placeholder:text-gray-200" placeholder="Alexander Mitchell" />
                     </div>
                     <div className="group">
                        <label className="text-[9px] uppercase tracking-widest font-black text-gray-400 mb-1 block group-focus-within:text-brand-primary transition-colors">Email Address</label>
                        <input required name="email" type="email" className="w-full border-b border-gray-100 py-2 focus:outline-none focus:border-brand-primary transition-all text-brand-dark font-serif text-lg placeholder:text-gray-200" placeholder="alex@mitchell.com" />
                     </div>
                  </div>

                  {mode === "package" ? (
                     <div className="group animate-in fade-in duration-500">
                        <label className="text-[9px] uppercase tracking-widest font-black text-gray-400 mb-2 block">Choose Your Expedition Package</label>
                        <div className="relative">
                           <select 
                             required
                             value={selectedTour}
                             onChange={(e) => setSelectedTour(e.target.value)}
                             className="w-full border-b border-gray-100 py-3 focus:outline-none focus:border-brand-primary transition-all text-brand-dark font-serif text-xl bg-transparent appearance-none"
                           >
                              <option value="">Select a Curated Package</option>
                              {tours.map(t => <option key={t.id} value={t.title}>{t.title} ({t.days} Days)</option>)}
                           </select>
                           <div className="absolute right-0 bottom-4 pointer-events-none text-gray-300">▼</div>
                        </div>
                     </div>
                  ) : (
                     <div className="space-y-6 animate-in fade-in duration-500">
                        <div className="group">
                           <label className="text-[9px] uppercase tracking-widest font-black text-gray-400 mb-3 block">Target Locations (Select Multiple)</label>
                           <div className="flex flex-wrap gap-2">
                              {locations.map(l => (
                                 <button 
                                   key={l.id} 
                                   type="button"
                                   onClick={() => toggleSelection(l.name, selectedLocations, setSelectedLocations)}
                                   className={`px-3 py-1 text-[9px] font-bold border transition-all rounded-full uppercase tracking-tighter ${selectedLocations.includes(l.name) ? "bg-brand-primary border-brand-primary text-white" : "border-gray-200 text-gray-400 hover:border-brand-primary/50"}`}
                                 >
                                    {l.name}
                                 </button>
                              ))}
                           </div>
                        </div>
                        <div className="group">
                           <label className="text-[9px] uppercase tracking-widest font-black text-gray-400 mb-3 block">Desired Activities (Select Multiple)</label>
                           <div className="flex flex-wrap gap-2">
                              {activities.map(a => (
                                 <button 
                                   key={a.id} 
                                   type="button"
                                   onClick={() => toggleSelection(a.name, selectedActivities, setSelectedActivities)}
                                   className={`px-3 py-1 text-[9px] font-bold border transition-all rounded-full uppercase tracking-tighter ${selectedActivities.includes(a.name) ? "bg-brand-primary border-brand-primary text-white" : "border-gray-200 text-gray-400 hover:border-brand-primary/50"}`}
                                 >
                                    {a.name}
                                 </button>
                              ))}
                           </div>
                        </div>
                     </div>
                  )}

                  <div className="group">
                     <label className="text-[9px] uppercase tracking-widest font-black text-gray-400 mb-3 block">Global Communication</label>
                     <div className="flex gap-4 items-end">
                        <div className="relative">
                           <select 
                              value={selectedCountry.country} 
                              onChange={(e) => {
                                 const found = countryCodes.find(c => c.country === e.target.value);
                                 if (found) setSelectedCountry(found);
                              }}
                              className="bg-transparent border-b border-gray-100 py-2 focus:outline-none focus:border-brand-primary font-serif text-lg cursor-pointer appearance-none min-w-[90px] text-brand-dark"
                           >
                              {countryCodes.map(c => <option key={c.country} value={c.country}>{c.flag} {c.code}</option>)}
                           </select>
                           <div className="absolute right-0 bottom-3 pointer-events-none text-gray-400 text-xs">▼</div>
                        </div>
                        <input required name="phone" type="tel" className="flex-1 border-b border-gray-100 py-2 focus:outline-none focus:border-brand-primary transition-all text-brand-dark font-serif text-lg placeholder:text-gray-200" placeholder="000 0000 000" />
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     <div className="group">
                        <label className="text-[9px] uppercase tracking-widest font-black text-gray-400 mb-1 block group-focus-within:text-brand-primary transition-colors">Arrival</label>
                        <input required name="arrival" type="date" className="w-full border-b border-gray-100 py-2 focus:outline-none focus:border-brand-primary text-brand-dark font-serif text-base" />
                     </div>
                     <div className="group">
                        <label className="text-[9px] uppercase tracking-widest font-black text-gray-400 mb-1 block group-focus-within:text-brand-primary transition-colors">Departure</label>
                        <input required name="departure" type="date" className="w-full border-b border-gray-100 py-2 focus:outline-none focus:border-brand-primary text-brand-dark font-serif text-base" />
                     </div>
                     <div className="group">
                        <label className="text-[9px] uppercase tracking-widest font-black text-gray-400 mb-1 block group-focus-within:text-brand-primary transition-colors">Pax Count</label>
                        <input required name="participants" type="number" min="1" defaultValue="2" className="w-full border-b border-gray-100 py-2 focus:outline-none focus:border-brand-primary text-brand-dark font-serif text-base" />
                     </div>
                  </div>

                  <div className="pt-4 flex flex-col md:flex-row items-center justify-between gap-6">
                     <HCaptcha
                       sitekey="ff2c03fc-f3e0-416e-b60e-1e1a2502aff8"
                       onVerify={(token) => setCaptchaToken(token)}
                     />
                     <button 
                        disabled={status === "submitting"}
                        type="submit" 
                        className="w-full md:w-auto bg-brand-primary text-white px-12 py-4 font-black uppercase tracking-[0.4em] text-[9px] hover:bg-brand-dark transition-all shadow-xl active:scale-95 disabled:opacity-50"
                     >
                        {status === "submitting" ? "Transmitting..." : "Initiate Planning"}
                     </button>
                  </div>
                  {errorText && (
                    <div className="text-red-500 text-xs text-center font-bold tracking-widest uppercase mt-4">
                      {errorText}
                    </div>
                  )}
               </form>
            )}
         </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #D4AF37; border-radius: 10px; }
        @keyframes ken-burns {
           0% { transform: scale(1); }
           100% { transform: scale(1.1) translate(-10px, -5px); }
        }
        .animate-ken-burns {
           animation: ken-burns 30s infinite alternate ease-in-out;
        }
      `}</style>
    </main>
  )
}
