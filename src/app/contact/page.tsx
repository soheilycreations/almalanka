"use client";
import React, { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import { useSearchParams } from "next/navigation";
import HCaptcha from '@hcaptcha/react-hcaptcha';

const labels = {
  es: {
    title: "Conéctate con AlmaLanka",
    desc: "Operamos globalmente con oficinas dedicadas en Europa y Asia para asegurar que su experiencia de viaje premium se gestione con absoluta precisión.",
    spainOffice: "Oficina en España",
    slOffice: "Oficina en Sri Lanka",
    address: "Dirección",
    phone: "Teléfono",
    paymentTitle: "Métodos de Pago Aceptados",
    paymentDesc: "Ofrecemos múltiples opciones de pago seguras para facilitar su reserva de expedición de lujo.",
    methods: ["Tarjetas Visa", "MasterCard", "Transferencias Online", "PayPal"],
    supportTitle: "Soporte Directo de Conserjería",
    supportDesc: "Disponible 24/7 para nuestros huéspedes que viajan para asegurar que cada detalle de su expedición sea perfecto.",
    formTitle: "Solicitud de Información",
    formSub: "Complete los detalles para que nuestro concierge prepare su propuesta personalizada.",
    fullName: "Nombre Completo",
    email: "Correo Electrónico",
    phoneNum: "Número de Teléfono",
    tourInterest: "Tour de Interés",
    arrival: "Llegada",
    departure: "Salida",
    special: "Mensaje / Consulta",
    agree: "Acepto que la información recogida se guarde para gestionar mi reserva.",
    submit: "ENVIAR CONSULTA",
    sending: "ENVIANDO..."
  },
  en: {
    title: "Connect with AlmaLanka",
    desc: "We operate globally with dedicated offices in Europe and Asia to ensure your premium travel experience is managed with absolute precision.",
    spainOffice: "Spain Office",
    slOffice: "Sri Lanka Office",
    address: "Address",
    phone: "Phone",
    paymentTitle: "Accepted Payment Methods",
    paymentDesc: "We offer multiple secure payment options to facilitate your luxury expedition booking.",
    methods: ["Visa Cards", "MasterCard", "Online Transfers", "PayPal"],
    supportTitle: "Direct Concierge Support",
    supportDesc: "Available 24/7 for our traveling guests to ensure every detail of your expedition is perfect.",
    formTitle: "General Inquiry",
    formSub: "Fill in the details below for our concierge to prepare your personalized response.",
    fullName: "Full Name",
    email: "Email Address",
    phoneNum: "Phone Number",
    tourInterest: "Tour of Interest",
    arrival: "Arrival",
    departure: "Departure",
    special: "Message / Inquiry",
    agree: "I agree that the information collected will be stored to manage my booking.",
    submit: "SEND INQUIRY",
    sending: "SENDING..."
  }
};

const countryCodes = [
  { code: "+34", flag: "🇪🇸", country: "ES", name: "Spain" },
  { code: "+44", flag: "🇬🇧", country: "GB", name: "United Kingdom" },
  { code: "+1", flag: "🇺🇸", country: "US", name: "USA" },
  { code: "+94", flag: "🇱🇰", country: "LK", name: "Sri Lanka" },
  { code: "+49", flag: "🇩🇪", country: "DE", name: "Germany" },
  { code: "+33", flag: "🇫🇷", country: "FR", name: "France" },
  { code: "+39", flag: "🇮🇹", country: "IT", name: "Italy" },
  { code: "+41", flag: "🇨🇭", country: "CH", name: "Switzerland" }
];

function ContactContent() {
  const { lang } = useLanguage();
  const searchParams = useSearchParams();
  const t = labels[lang];
  
  const [selectedCountry, setSelectedCountry] = useState(countryCodes[0]);
  const [tourName, setTourName] = useState(searchParams.get('tour') || "");
  const [submitting, setSubmitting] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!captchaToken) {
      alert(lang === 'es' ? 'Por favor, complete el captcha.' : 'Please complete the captcha.');
      return;
    }
    setSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, country: selectedCountry.name })
      });
      if (res.ok) alert(lang === 'es' ? '¡Iniciación de planificación enviada!' : 'Inquiry sent successfully!');
    } catch (err) {
      alert('Error sending request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-brand-bg pt-32 pb-24 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-16 text-center">
          <h1 className="text-5xl md:text-7xl font-serif text-brand-dark mb-6 italic">{t.title}</h1>
          <p className="text-xl text-gray-500 font-sans max-w-2xl mx-auto">{t.desc}</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Offices Info */}
          <div className="flex flex-col gap-8">
            {/* Spain Office */}
            <div className="relative bg-white p-10 border border-gray-100 shadow-xl rounded-sm group hover:border-brand-primary transition-all overflow-hidden">
               <div className="absolute -bottom-10 -right-10 w-64 h-64 opacity-[0.1] group-hover:opacity-[0.2] transition-opacity pointer-events-none grayscale group-hover:grayscale-0 duration-1000 rotate-12">
                  <img src="https://flagcdn.com/es.svg" alt="" className="w-full h-full object-contain" />
               </div>
               <h2 className="text-3xl font-serif font-bold text-brand-dark mb-8 relative z-10">{t.spainOffice}</h2>
               <div className="space-y-6 font-sans relative z-10">
                  <div className="flex flex-col gap-1">
                     <span className="text-[10px] uppercase tracking-widest font-bold text-brand-primary">{t.address}</span>
                     <p className="text-gray-600">Carrer de Ferlandina 41, Barcelona 08001</p>
                  </div>
                  <div className="flex flex-col gap-1">
                     <span className="text-[10px] uppercase tracking-widest font-bold text-brand-primary">{t.phone}</span>
                     <p className="text-gray-600">+34 639 962 786</p>
                  </div>
               </div>
            </div>

            {/* SL Office */}
            <div className="relative bg-white p-10 border border-gray-100 shadow-xl rounded-sm group hover:border-brand-primary transition-all overflow-hidden">
               <div className="absolute -bottom-10 -right-10 w-64 h-64 opacity-[0.1] group-hover:opacity-[0.2] transition-opacity pointer-events-none grayscale group-hover:grayscale-0 duration-1000 rotate-12">
                  <img src="https://flagcdn.com/lk.svg" alt="" className="w-full h-full object-contain" />
               </div>
               <h2 className="text-3xl font-serif font-bold text-brand-dark mb-8 relative z-10">{t.slOffice}</h2>
               <div className="space-y-6 font-sans relative z-10">
                  <div className="flex flex-col gap-1">
                     <span className="text-[10px] uppercase tracking-widest font-bold text-brand-primary">{t.address}</span>
                     <p className="text-gray-600">119/B, 2nd Mile Post, Baduwatha, Wathugedara, Sri Lanka</p>
                  </div>
                  <div className="flex flex-col gap-1">
                     <span className="text-[10px] uppercase tracking-widest font-bold text-brand-primary">{t.phone}</span>
                     <p className="text-gray-600">+94 76 611 2948</p>
                  </div>
               </div>
            </div>

            {/* Social Media Buttons */}
            <div className="flex flex-col gap-4 mt-2">
              <a 
                href="https://www.facebook.com/profile.php?id=61590153891814" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 w-full py-4 bg-[#1877F2] text-white font-bold uppercase tracking-widest text-xs hover:bg-[#1558b5] transition-all shadow-md rounded-sm"
              >
                Facebook
              </a>
              <a 
                href="https://www.instagram.com/alma_lanka_/" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)' }}
                className="flex items-center justify-center gap-3 w-full py-4 text-white font-bold uppercase tracking-widest text-xs hover:opacity-90 transition-all shadow-md rounded-sm"
              >
                Instagram
              </a>
            </div>

          </div>

          {/* Contact Form */}
          <div className="bg-white p-10 border border-gray-100 shadow-2xl rounded-sm h-fit">
             <h3 className="text-3xl font-serif font-bold text-brand-dark mb-2">{t.formTitle}</h3>
             <p className="text-sm text-gray-500 font-sans mb-8 border-b pb-6 border-gray-100">{t.formSub}</p>
             
             <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="flex flex-col">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2">{t.fullName} *</label>
                      <input required name="name" type="text" className="border-b border-gray-200 py-2 focus:border-brand-primary outline-none text-sm" />
                   </div>
                   <div className="flex flex-col">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2">{t.email} *</label>
                      <input required name="email" type="email" className="border-b border-gray-200 py-2 focus:border-brand-primary outline-none text-sm" />
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="flex flex-col">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2">{t.phoneNum} *</label>
                      <div className="flex gap-2 border-b border-gray-200 py-2">
                         <select onChange={(e) => setSelectedCountry(countryCodes.find(c => c.code === e.target.value) || countryCodes[0])} className="bg-transparent text-sm outline-none">
                            {countryCodes.map(c => <option key={c.code} value={c.code}>{c.flag} {c.code}</option>)}
                         </select>
                         <input required name="phone" type="tel" className="flex-1 bg-transparent text-sm outline-none" />
                      </div>
                   </div>
                   <div className="flex flex-col">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2">{t.tourInterest}</label>
                      <input 
                        name="interest" 
                        type="text" 
                        value={tourName} 
                        onChange={(e) => setTourName(e.target.value)}
                        className="border-b border-gray-200 py-2 focus:border-brand-primary outline-none text-sm font-bold text-brand-primary" 
                      />
                   </div>
                </div>

                <div className="flex flex-col">
                   <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2">{t.special}</label>
                   <textarea name="message" rows={4} className="border-b border-gray-200 py-2 focus:border-brand-primary outline-none text-sm resize-none"></textarea>
                </div>

                <div className="mt-4 flex justify-center md:justify-start">
                   <HCaptcha
                     sitekey="ff2c03fc-f3e0-416e-b60e-1e1a2502aff8"
                     onVerify={(token) => setCaptchaToken(token)}
                   />
                </div>

                <button disabled={submitting} type="submit" className="bg-[#D4A017] text-white py-5 uppercase tracking-[0.2em] text-xs font-bold hover:bg-[#B8860B] transition-all shadow-lg active:scale-95 disabled:opacity-50 mt-4">
                   {submitting ? t.sending : t.submit}
                </button>
             </form>
          </div>
        </div>

        {/* Payment Methods Section */}
        <div className="mb-16 bg-white p-12 border border-gray-100 shadow-xl rounded-sm">
           <div className="flex flex-col md:flex-row justify-between items-center gap-12">
              <div className="max-w-md">
                 <h2 className="text-3xl font-serif font-bold text-brand-dark mb-4">{t.paymentTitle}</h2>
                 <p className="text-gray-500 font-sans">{t.paymentDesc}</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full md:w-auto">
                 {t.methods.map((method: string, i: number) => (
                    <div key={i} className="flex flex-col items-center justify-center p-6 bg-[#FAF9F5] border border-gray-100 rounded-sm hover:border-brand-primary transition-colors group">
                       <div className="w-20 h-12 mb-4 flex items-center justify-center transition-all duration-300 group-hover:scale-110">
                          {method.includes("Visa") && (
                             <img src="https://cdn.jsdelivr.net/gh/datatrans/payment-logos@master/assets/cards/visa.svg" alt="Visa" className="h-6 w-auto object-contain" />
                          )}
                          {method.includes("MasterCard") && (
                             <img src="https://cdn.jsdelivr.net/gh/datatrans/payment-logos@master/assets/cards/mastercard.svg" alt="MasterCard" className="h-10 w-auto object-contain" />
                          )}
                          {method.includes("PayPal") && (
                             <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-8 w-auto object-contain" />
                          )}
                          {method.includes("Transfer") && (
                             <svg className="w-12 h-12 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                             </svg>
                          )}
                       </div>
                       <span className="text-[9px] font-bold uppercase tracking-widest text-brand-dark text-center group-hover:text-brand-primary transition-colors">{method}</span>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </main>
  );
}

export default function ContactPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-serif text-2xl animate-pulse">Loading...</div>}>
      <ContactContent />
    </Suspense>
  );
}
