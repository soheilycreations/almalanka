"use client";

import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import HCaptcha from '@hcaptcha/react-hcaptcha';
import ReviewsCarousel from "@/components/ReviewsCarousel";

const countryCodes = [
  { code: "+94", country: "LK", flag: "🇱🇰", name: "Sri Lanka" },
  { code: "+34", country: "ES", flag: "🇪🇸", name: "Spain" },
  { code: "+1", country: "US", flag: "🇺🇸", name: "USA" },
  { code: "+44", country: "GB", flag: "🇬🇧", name: "UK" },
  { code: "+33", country: "FR", flag: "🇫🇷", name: "France" },
  { code: "+49", country: "DE", flag: "🇩🇪", name: "Germany" },
  { code: "+61", country: "AU", flag: "🇦🇺", name: "Australia" },
];

const content = {
  es: {
    heroSub: "AlmaLanka, Agencia de Naturaleza Premium",
    heroDesc: "Creamos viajes a medida con más de una década de experiencia gestionando expediciones de lujo inolvidables en Sri Lanka.",
    btnTours: "Ver Tours",
    
    whyTitle: "Por qué reservar con nosotros",
    stat1: "Itinerarios de Lujo a Medida",
    stat2: "Guías Ornitólogos Expertos",
    stat3: "Alojamientos Exclusivos",
    stat4: "Años de Excelencia",

    catTitle: "Categorías de Tour",
    catSub: "Experiencias Curadas para Cada Alma",
    cats: ["Costa y Mar", "Cultura y Patrimonio", "Safari y Vida Silvestre", "Observación de Aves"],

    packagesTitle: "Paquetes de Tour",
    packagesSub: "Seleccionados meticulosamente por nuestros expertos, estos paquetes garantizan una experiencia de lujo incomparable en Sri Lanka.",
    packages: [
      { id: 1, title: "Expedición Endémica", loc: "Sinharaja", days: "7 Días", price: "Desde €1,200", image: "/img/nuzree-humming-bird-234649_1920.jpg" },
      { id: 2, title: "Aves de Tierras Altas", loc: "Nuwara Eliya", days: "5 Días", price: "Desde €950", image: "/img/nuzree-crane-248240_1920.jpg" }, 
      { id: 3, title: "Safari Fotográfico Lujo", loc: "Yala", days: "10 Días", price: "Desde €2,100", image: "/img/jansimons-elephants-5999125_1920.jpg" },
      { id: 4, title: "Tesoros Culturales", loc: "Sigiriya", days: "8 Días", price: "Desde €1,500", image: "/img/guciuksg-sri-lanka-334437_1920.jpg" },
      { id: 5, title: "Ballenas y Leopardos", loc: "Mirissa/Yala", days: "12 Días", price: "Desde €2,500", image: "/img/fransoopatrick-fisherman-4875855_1920.jpg" },
    ],

    brandsTitle: "El Ecosistema AlmaLanka",
    brandsSub: "Descubra nuestra extensa cartera curada bajo nuestras submarcas especializadas, diseñadas para brindar excelencia en cada aspecto.",
    brands: [
      { title: "Alma Luxury", desc: "La cúspide de alojamientos boutique suntuosos y viajes chárter aéreos privados." },
      { title: "Alma Adventure", desc: "Expediciones todoterreno avanzadas en reservas de vida silvestre remotas y bosques endémicos incontaminados." },
      { title: "Alma Wellness", desc: "Retiros de yoga restaurativos e inmersiones holísticas ayurvédicas curativas." }
    ],

    storiesTitle: "Historias Reales",
    storyQuote: "Nuestra expedición de observación de aves con AlmaLanka superó todas las expectativas. El nivel de exclusividad, conocimiento experto de la vida endémica y alojamientos perfectos no tuvieron paralelo. Verdaderamente el corazón de Ceilán.",
    storyAuthor: "- Familia Silva, España",

    faqTitle: "Viaja Inteligente",
    faqSub: "Todo lo que necesitas saber antes de tu expedición premium.",
    faqs: [
      { q: "¿Es seguro viajar a Sri Lanka?", a: "Absolutamente. Los circuitos turísticos y reservas de vida silvestre se gestionan con protocolos de seguridad globales." },
      { q: "¿Hay guías de habla hispana?", a: "Sí, todos nuestros guías principales para el mercado español son ornitólogos bilingües." },
      { q: "¿Qué incluye un paquete 'Premium'?", a: "Transporte privado, alojamiento 5 estrellas/boutique, y acceso VIP a parques nacionales." },
      { q: "¿Política de cancelación por clima?", a: "Proporcionamos itinerarios dinámicos que se adaptan a las condiciones locales para priorizar su experiencia." }
    ],

    visualTitle: "Historias Visuales",
    socialFooter: "Síguenos para más actualizaciones sobre @almalanka",

    footerLinks1: ["Sobre Nosotros", "Carreras", "Sostenibilidad", "Noticias"],
    footerLinks2: ["Tours", "Contáctanos", "Términos y Condiciones"],
    address: "123 Reserva Natural, Colombo, Sri Lanka",
    phone: "+94 11 234 5678",
    email: "info@almalanka.com",
    copyright: "© 2026 AlmaLanka Premium Nature Agency. Todos los derechos reservados."
  },
  en: {
    heroSub: "AlmaLanka, Premium Nature Agency",
    heroDesc: "We craft bespoke journeys with over a decade of expertise in managing unforgettable luxury expeditions across Sri Lanka.",
    btnTours: "View Tours",
    
    whyTitle: "Why Book with Us",
    stat1: "Bespoke Luxury Itineraries",
    stat2: "Expert Ornithologist Guides",
    stat3: "Exclusive Accommodations",
    stat4: "Years of Excellence",

    catTitle: "Tour Categories",
    catSub: "Curated Experiences for Every Soul",
    cats: ["Coastal & Marine", "Culture & Heritage", "Wildlife & Safari", "Endemic Bird Watching"],

    packagesTitle: "Tour Packages",
    packagesSub: "Meticulously selected by our experts, these packages guarantee an unparalleled luxury experience in Sri Lanka.",
    packages: [
      { id: 1, title: "Endemic Expedition", loc: "Sinharaja", days: "7 Days", price: "From €1,200", image: "/img/nuzree-humming-bird-234649_1920.jpg" },
      { id: 2, title: "Highlands Birds", loc: "Nuwara Eliya", days: "5 Days", price: "From €950", image: "/img/nuzree-crane-248240_1920.jpg" },
      { id: 3, title: "Luxury Photo Safari", loc: "Yala", days: "10 Days", price: "From €2,100", image: "/img/jansimons-elephants-5999125_1920.jpg" },
      { id: 4, title: "Cultural Treasures", loc: "Sigiriya", days: "8 Days", price: "From €1,500", image: "/img/guciuksg-sri-lanka-334437_1920.jpg" },
      { id: 5, title: "Whales & Leopards", loc: "Mirissa/Yala", days: "12 Days", price: "From €2,500", image: "/img/fransoopatrick-fisherman-4875855_1920.jpg" },
    ],

    brandsTitle: "The AlmaLanka Ecosystem",
    brandsSub: "Discover our extensive curated portfolio under our specialized sub-brands, designed to deliver excellence in every aspect.",
    brands: [
      { title: "Alma Luxury", desc: "The pinnacle of lavish boutique stays and private aerial charter travels." },
      { title: "Alma Adventure", desc: "Advanced off-road expeditions deep into remote wildlife reserves and pristine endemic forests." },
      { title: "Alma Wellness", desc: "Restorative yoga retreats and holistic immersive Ayurvedic healing journeys." }
    ],

    storiesTitle: "Real Stories",
    storyQuote: "Our bird watching expedition with AlmaLanka exceeded all bounds. The level of exclusivity, expert knowledge of endemic wildlife, and flawless accommodations were unrivaled. Truly the heart of Ceylon.",
    storyAuthor: "- The Silva Family, Spain",

    faqTitle: "Travel Smart",
    faqSub: "Everything you need to know prior to your premium expedition.",
    faqs: [
      { q: "Is traveling to Sri Lanka safe?", a: "Absolutely. Tourist circuits and wildlife reserves are managed with global safety protocols." },
      { q: "Are there Spanish speaking guides?", a: "Yes, all our premier guides for the Spanish market are bilingual ornithologists." },
      { q: "What does a 'Premium' package include?", a: "Private transportation, 5-star/boutique accommodations, and VIP access to national parks." },
      { q: "Cancellation policy for weather?", a: "We provide dynamic itineraries that adapt to local conditions to prioritize your experience." }
    ],

    visualTitle: "Visual Stories",
    socialFooter: "Follow us for more updates @almalanka",

    footerLinks1: ["About Us", "Careers", "Sustainability", "News"],
    footerLinks2: ["Tours", "Contact Us", "Terms & Conditions"],
    address: "123 Nature Reserve, Colombo, Sri Lanka",
    phone: "+94 11 234 5678",
    email: "info@almalanka.com",
    copyright: "© 2026 AlmaLanka Premium Nature Agency. All rights reserved."
  }
};

const FAQItem = ({ q, a }: { q: string, a: string }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-brand-dark/10">
      <button 
        onClick={() => setOpen(!open)}
        className="w-full text-left py-6 flex justify-between items-center hover:text-brand-primary transition-colors focus:outline-none"
      >
        <span className="font-serif font-bold text-xl">{q}</span>
        <span className="text-2xl font-light text-brand-primary">{open ? "−" : "+"}</span>
      </button>
      <div className={`overflow-hidden transition-all duration-500 ease-in-out ${open ? "max-h-40 pb-6 opacity-100" : "max-h-0 opacity-0"}`}>
        <p className="font-sans font-light leading-relaxed">{a}</p>
      </div>
    </div>
  );
};

function HomeContent() {
  const { lang } = useLanguage();
  const [stats, setStats] = useState({ stat1: "50+", stat2: "15+", stat3: "20+", stat4: "10+" });
  const [packages, setPackages] = useState<any[]>([]);
  const [heroImages, setHeroImages] = useState<string[]>([
    "/hero/01.jpg",
    "/hero/02.jpg",
    "/hero/03.jpg",
    "/hero/04.jpg",
    "/hero/05.jpg",
    "/hero/06.jpg",
    "/hero/07.jpg",
    "/hero/08.jpg"
  ]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedCountry, setSelectedCountry] = useState(countryCodes[0]);
  const [submitting, setSubmitting] = useState(false);
  const t = content[lang];
  const searchParams = useSearchParams();
  const initialTour = searchParams.get('tour') || "";
  const [tourName, setTourName] = useState(initialTour);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const slugify = (text: string) => text.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

  useEffect(() => {
    // Fetch stats
    fetch('/api/stats', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (data && data.stat1) setStats(data);
      })
      .catch(() => {});

    // Fetch packages
    fetch('/api/tour-plans', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setPackages(data.slice(0, 5));
      })
      .catch(() => {});

    // Fetch hero images from public/hero
    fetch('/api/hero-images', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setHeroImages(data);
        }
      })
      .catch(() => {});
    // Detect tour from URL
    if (initialTour) setTourName(initialTour);
  }, [initialTour]);

  useEffect(() => {
    if (heroImages.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [heroImages]);

  const handleContactSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!captchaToken) {
      alert(lang === "es" ? "Por favor, complete el captcha." : "Please complete the captcha.");
      return;
    }
    setSubmitting(true);
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
      participants: 1,
      tourName: "Website Inquiry",
      status: "pending",
      notes: data.message
    };
    
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        alert(lang === "es" ? "Solicitud enviada con éxito. Nos pondremos en contacto pronto." : "Request sent successfully. We will be in touch soon.");
        e.currentTarget.reset();
      } else {
        throw new Error("Failed to send");
      }
    } catch (err) {
      alert(lang === "es" ? "Error al enviar. Por favor intente de nuevo." : "Error sending request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: "AlmaLanka Premium Nature Agency",
  };

  return (
    <main className="w-full bg-brand-bg relative overflow-hidden">
      <Script id="homepage-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* 1. Extended Hero (Image Slider) */}
      <header className="relative w-full h-[90vh] min-h-[600px] flex flex-col justify-center items-start px-8 md:px-16 lg:px-24">
        
        {/* Slider Background */}
        <div className="absolute inset-0 z-0 bg-brand-dark overflow-hidden">
          {heroImages.map((img, i) => (
            <div 
              key={i}
              className={`absolute inset-0 transition-all duration-[1500ms] cubic-bezier(0.4, 0, 0.2, 1) ${i === currentSlide ? "opacity-100 scale-100 z-10" : "opacity-0 scale-105 z-0"}`}
            >
              <img 
                src={img} 
                alt={`Hero ${i}`} 
                className={`w-full h-full object-cover ${i === currentSlide ? "animate-ken-burns" : ""}`}
              />
            </div>
          ))}
          {/* Dark Overlay for better text readability */}
          <div className="absolute inset-0 bg-black/40 z-20"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-brand-dark/90 via-brand-dark/60 to-transparent z-25"></div>
        </div>

        {/* Slider Indicators */}
        <div className="absolute bottom-12 right-12 z-30 flex gap-3">
          {heroImages.length > 1 && heroImages.map((_, i) => (
            <button 
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`h-1 transition-all duration-500 ${i === currentSlide ? "w-12 bg-brand-primary" : "w-6 bg-white/30"}`}
            />
          ))}
        </div>

        <div className="relative z-10 max-w-2xl mt-20">
          <h2 className="text-[10px] md:text-xs font-bold tracking-[0.2em] md:tracking-[0.3em] uppercase text-white mb-6 whitespace-nowrap overflow-visible flex items-center">
            <span className="w-6 md:w-8 h-[1px] bg-brand-primary inline-block mr-3 md:mr-4 shrink-0"></span>
            {t.heroSub}
          </h2>
          <h1 className="text-5xl md:text-7xl font-serif text-white mb-6 !leading-[1.1]">
            {lang === "es" ? <>Descubre el Alma <br/><span className="italic text-gray-300">de Ceilán</span></> : <>Discover the Soul <br/><span className="italic text-gray-300">of Ceylon</span></>}
          </h1>
          <p className="text-lg text-white/80 font-sans font-light mb-10 max-w-lg">
            {t.heroDesc}
          </p>
          <Link href="/tours" className="inline-block px-10 py-4 bg-brand-primary text-white font-semibold tracking-widest uppercase text-xs hover:bg-green-900 transition-colors shadow-lg">
            {t.btnTours}
          </Link>
        </div>
      </header>

      {/* 1b. Why Book With Us Bar */}
      <section className="bg-white border-b border-[#E5E5E5] px-8 md:px-16 lg:px-24 py-12 relative z-20 -mt-10 mx-4 md:mx-16 lg:mx-24 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-center">
           <div className="md:col-span-1 border-b md:border-b-0 md:border-r border-[#E5E5E5] pb-6 md:pb-0 pr-6">
             <h3 className="text-2xl font-serif font-bold text-brand-dark leading-tight">{t.whyTitle}</h3>
           </div>
           <div className="md:col-span-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center md:text-left">
             {[
               { n: stats.stat1, l: t.stat1 }, 
               { n: stats.stat2, l: t.stat2 }, 
               { n: stats.stat3, l: t.stat3 }, 
               { n: stats.stat4, l: t.stat4 }
             ].map((stat, i) => (
               <div key={i} className="flex flex-col gap-2">
                 <span className="text-4xl font-serif text-brand-primary font-bold">{stat.n}</span>
                 <span className="text-xs uppercase tracking-widest text-gray-500 font-semibold">{stat.l}</span>
               </div>
             ))}
           </div>
        </div>
      </section>

      {/* 2. Tour Categories (Fixed Images) */}
      <section className="py-24 px-8 md:px-16 lg:px-24 text-center bg-[#F8FDF9]">
        <h4 className="text-xs font-semibold tracking-[0.2em] uppercase text-brand-primary mb-3">{t.catSub}</h4>
        <h2 className="text-4xl font-serif font-bold text-brand-dark mb-16">{t.catTitle}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {t.cats.map((cat, i) => {
            const imgs = [
              "/img/nadild08-beach-5812300_1920.jpg",
              "/img/chathuraanuradha-anuradhapura-7475663_1920.jpg",
              "/img/darshanadm-peacock-7393879_1920.jpg",
              "/img/nuzree-humming-bird-234649_1920.jpg"
            ];
            return (
              <Link 
                href={`/tours?type=${encodeURIComponent(content['en'].cats[i])}`} 
                key={i} 
                className="flex flex-col items-center group cursor-pointer"
              >
                <div className="w-40 h-40 md:w-48 md:h-48 rounded-full overflow-hidden mb-6 relative shadow-lg group-hover:shadow-2xl transition-all duration-500">
                   <Image src={imgs[i]} alt={cat} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                   <div className="absolute inset-0 bg-brand-dark/20 group-hover:bg-brand-dark/0 transition-colors duration-500"></div>
                </div>
                <h3 className="text-xl font-serif font-bold text-brand-dark group-hover:text-brand-primary transition-colors">{cat}</h3>
              </Link>
            )
          })}
        </div>
      </section>

      {/* 3. Featured Packages (Fixed Grids & Overlays) */}
      <section className="py-32 px-8 md:px-16 lg:px-24 relative bg-white">
        {/* Large background typography pushed to extremely low opacity */}
        <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-full text-center z-0 pointer-events-none select-none">
          <h2 className="text-[7rem] md:text-[12rem] xl:text-[15rem] leading-none font-serif text-brand-dark opacity-5 whitespace-nowrap">unforgettable</h2>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="max-w-2xl">
              <h2 className="text-4xl font-serif font-bold text-brand-dark mb-4">{t.packagesTitle}</h2>
              <p className="text-gray-500 font-sans font-light leading-relaxed">{t.packagesSub}</p>
            </div>
            <Link href="/tours" className="flex items-center gap-2 text-brand-primary font-bold uppercase tracking-widest text-xs hover:text-brand-dark transition-colors border-b border-brand-primary pb-1">
              {t.btnTours} <span className="text-lg">&rarr;</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 lg:grid-rows-2 auto-rows-fr gap-6 h-auto">
             {packages.map((pkg, i) => (
                <Link href={`/tours/${pkg.id}/${slugify(pkg.title)}`} key={pkg.id} className={`group relative min-h-[400px] overflow-hidden rounded-sm cursor-pointer block ${i === 0 ? "lg:col-span-2 lg:row-span-2" : ""}`}>
                  <Image src={pkg.image} alt={pkg.title} fill className="object-cover group-hover:scale-105 transition-transform duration-1000" />
                  
                  {i===0 && <div className="absolute top-6 left-6 w-10 h-10 bg-brand-primary text-white flex items-center justify-center font-serif italic font-bold z-10">AL</div>}

                  <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/90 via-brand-dark/20 to-transparent"></div>
                  
                  <div className="absolute top-6 right-6 bg-white px-4 py-2 font-bold font-sans text-[10px] uppercase tracking-widest shadow-md text-brand-dark z-10">
                    {pkg.price}
                  </div>

                  <div className="absolute bottom-8 left-8 right-8 text-white z-10">
                    <span className="text-brand-primary font-bold uppercase tracking-widest text-[10px] bg-white px-2 py-1 mb-3 inline-block">{pkg.route?.[0] || pkg.loc}</span>
                    <h3 className={`font-serif font-bold leading-tight mb-2 ${i===0 ? "text-4xl" : "text-2xl"}`}>{pkg.title}</h3>
                    <div className="flex justify-between items-end">
                      <p className="text-white/70 font-sans text-sm">{pkg.days}</p>
                      <span className="text-brand-primary font-serif italic group-hover:translate-x-2 transition-transform duration-300 text-sm">Ver &rarr;</span>
                    </div>
                  </div>
                </Link>
             ))}
          </div>
        </div>
      </section>

      {/* 4. Brand Showcase */}
      <section className="py-24 px-8 md:px-16 lg:px-24 bg-[#EAF2ED]">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 items-center">
           <div className="lg:w-1/3">
             <h4 className="text-xs font-semibold tracking-[0.2em] uppercase text-brand-primary mb-3">Portfolio</h4>
             <h2 className="text-4xl font-serif font-bold text-brand-dark mb-6">{t.brandsTitle}</h2>
             <p className="text-gray-600 font-sans font-light leading-relaxed mb-8">{t.brandsSub}</p>
             <Link href="/tours" className="inline-block border border-brand-primary px-8 py-3 text-brand-primary uppercase tracking-widest text-xs font-bold hover:bg-brand-primary hover:text-white transition-colors">Descubrir</Link>
           </div>
           <div className="lg:w-2/3 grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
              {t.brands.map((brand, i) => (
                <div key={i} className="bg-white p-8 border border-[#C5D2C9] hover:-translate-y-2 transition-transform duration-300 shadow-sm hover:shadow-md">
                  <div className="w-12 h-12 bg-[#F5F8F6] rounded-full flex items-center justify-center mb-6 text-brand-primary">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/></svg>
                  </div>
                  <h3 className="text-xl font-serif font-bold text-brand-dark mb-4">{brand.title}</h3>
                  <p className="text-gray-500 font-sans font-light text-sm leading-relaxed">{brand.desc}</p>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* 5. Social Proof (Live Reviews Carousel) */}
      <ReviewsCarousel title={t.storiesTitle} fallbackQuote={t.storyQuote} fallbackAuthor={t.storyAuthor} />

      {/* 6. FAQ & Contact */}
      <section id="contact" className="bg-[#FAF9F5] border-t border-[#E5E5E5] text-brand-dark">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          <div className="p-12 md:p-24 border-r border-[#E5E5E5]">
             <h2 className="text-4xl font-serif font-bold mb-4">{t.faqTitle}</h2>
             <p className="text-gray-500 font-sans mb-12">{t.faqSub}</p>
             <div className="flex flex-col">
               {t.faqs.map((faq, i) => <FAQItem key={i} q={faq.q} a={faq.a} />)}
             </div>
          </div>
          <div className="p-12 md:p-24 bg-white flex flex-col justify-center shadow-inner">
             <h2 className="text-4xl font-serif font-bold mb-4">{lang === "es" ? "Consulta con un Experto" : "Discuss with an Expert"}</h2>
             <p className="text-gray-500 font-sans mb-12">{lang === "es" ? "Contacta a nuestro concierge de planificación premium." : "Contact our premium planning concierge."}</p>
             
             <form onSubmit={handleContactSubmit} className="grid grid-cols-1 gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col">
                    <label className="text-xs font-semibold text-gray-700 mb-2">{lang === "es" ? "Nombre Completo" : "Full Name"} <span className="text-red-500">*</span></label>
                    <input required name="name" type="text" placeholder="John Doe" className="border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-1 focus:ring-brand-primary bg-transparent text-sm" />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-xs font-semibold text-gray-700 mb-2">{lang === "es" ? "Correo Electrónico" : "Email Address"} <span className="text-red-500">*</span></label>
                    <input required name="email" type="email" placeholder="john@example.com" className="border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-1 focus:ring-brand-primary bg-transparent text-sm" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col">
                    <label className="text-xs font-semibold text-gray-700 mb-2">{lang === "es" ? "Teléfono" : "Phone Number"} <span className="text-red-500">*</span></label>
                    <div className="flex gap-2">
                       <select 
                         className="border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-1 focus:ring-brand-primary bg-transparent text-sm w-24"
                         onChange={(e) => setSelectedCountry(countryCodes.find(c => c.code === e.target.value) || countryCodes[0])}
                       >
                         {countryCodes.map(c => <option key={c.code} value={c.code}>{c.flag} {c.code}</option>)}
                       </select>
                       <input required name="phone" type="tel" className="flex-1 border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-1 focus:ring-brand-primary bg-transparent text-sm" />
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <label className="text-xs font-semibold text-gray-700 mb-2">{lang === "es" ? "Tour de Interés" : "Tour of Interest"}</label>
                    <input 
                      name="tourName" 
                      type="text" 
                      value={tourName}
                      onChange={(e) => setTourName(e.target.value)}
                      placeholder="e.g. Endemic Birds Expedition" 
                      className="border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-1 focus:ring-brand-primary bg-transparent text-sm font-bold text-brand-primary" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div className="flex flex-col">
                    <label className="text-xs font-semibold text-gray-700 mb-2">{lang === "es" ? "Llegada" : "Arrival"} <span className="text-red-500">*</span></label>
                    <input required name="arrival" type="date" className="border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-1 focus:ring-brand-primary bg-transparent text-sm" />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-xs font-semibold text-gray-700 mb-2">{lang === "es" ? "Salida" : "Departure"} <span className="text-red-500">*</span></label>
                    <input required name="departure" type="date" className="border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-1 focus:ring-brand-primary bg-transparent text-sm" />
                  </div>
                </div>

                <div className="flex flex-col">
                  <label className="text-xs font-semibold text-gray-700 mb-2">{lang === "es" ? "Solicitud Especial" : "Special Request"}</label>
                  <textarea name="message" rows={4} placeholder="Enter your requirements..." className="border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-1 focus:ring-brand-primary bg-transparent text-sm resize-none"></textarea>
                </div>

                <div className="flex items-start gap-3 py-2">
                  <input required type="checkbox" className="mt-1 w-4 h-4 text-brand-primary border-gray-300 rounded" id="home-gdpr" />
                  <label htmlFor="home-gdpr" className="text-[10px] leading-relaxed text-gray-400">
                    I agree that the information collected by this form will be stored in a database...
                  </label>
                </div>

                <div className="flex justify-start mt-2">
                  <HCaptcha
                    sitekey="ff2c03fc-f3e0-416e-b60e-1e1a2502aff8"
                    onVerify={(token) => setCaptchaToken(token)}
                  />
                </div>

                <button disabled={submitting} type="submit" className="bg-[#D4A017] text-white py-5 mt-4 uppercase tracking-[0.2em] text-xs font-bold hover:bg-[#B8860B] transition-all shadow-lg active:scale-95 disabled:opacity-50">
                  {submitting ? (lang === "es" ? "ENVIANDO..." : "SENDING...") : (lang === "es" ? "ENVIAR SOLICITUD" : "SEND REQUEST")}
                </button>
             </form>
          </div>
        </div>
      </section>

      {/* 7. Comprehensive Footer */}
      <footer className="relative bg-[#111111] text-white pt-24 md:pt-32 pb-16 overflow-hidden border-t-4 border-brand-primary">
        {/* Background AL watermark */}
        <div className="absolute -bottom-24 right-0 opacity-[0.03] pointer-events-none z-0 select-none">
           <h2 className="text-[30rem] font-serif italic leading-none">AL</h2>
        </div>
        
        <div className="max-w-7xl mx-auto px-8 relative">
          {/* Top Row: Brand & Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 lg:gap-12">
            
            {/* Column 1: Brand Identity */}
            <div className="flex flex-col">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-brand-primary flex items-center justify-center text-white font-bold font-serif italic text-lg">AL</div>
                <span className="font-serif text-2xl tracking-[0.2em] uppercase text-white">AlmaLanka</span>
              </div>
              <p className="text-gray-400 font-sans font-light text-sm leading-relaxed mb-8">
                {t.heroDesc}
              </p>
              <div className="flex gap-4">
                <Link href="#" className="w-9 h-9 border border-gray-800 flex items-center justify-center hover:bg-brand-primary hover:border-brand-primary transition-all rounded-sm text-white opacity-70 hover:opacity-100">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                </Link>
                <Link href="#" className="w-9 h-9 border border-gray-800 flex items-center justify-center hover:bg-brand-primary hover:border-brand-primary transition-all rounded-sm text-white opacity-70 hover:opacity-100">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
                </Link>
              </div>
            </div>

            {/* Column 2: Experiences */}
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-white mb-8 opacity-50">Experiences</h4>
              <ul className="flex flex-col gap-4">
                <li><Link href="/tours" className="text-gray-400 font-light text-sm hover:text-brand-primary transition-colors">Curated Expeditions</Link></li>
                <li><Link href="/our-gallery" className="text-gray-400 font-light text-sm hover:text-brand-primary transition-colors">Visual Stories</Link></li>
                <li><Link href="/contact" className="text-gray-400 font-light text-sm hover:text-brand-primary transition-colors">Bespoke Itinerary</Link></li>
                <li><Link href="#" className="text-gray-400 font-light text-sm hover:text-brand-primary transition-colors">Terms & Conditions</Link></li>
              </ul>
            </div>

            {/* Column 3: Global Presence */}
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-white mb-8 opacity-50">Global Presence</h4>
              <div className="flex flex-col gap-6 text-sm">
                <div>
                  <span className="text-brand-primary text-[9px] font-bold uppercase tracking-widest block mb-1">Spain Office</span>
                  <p className="text-gray-400 font-light leading-relaxed">Carrer de Ferlandina 41, Barcelona 08001<br/><span className="text-white/60">+34 639 9627 86</span></p>
                </div>
                <div>
                  <span className="text-brand-primary text-[9px] font-bold uppercase tracking-widest block mb-1">Sri Lanka Office</span>
                  <p className="text-gray-400 font-light leading-relaxed">119/B, Wathugedara, Ambalangoda<br/><span className="text-white/60">+94 766 112 948</span></p>
                </div>
              </div>
            </div>

            {/* Column 4: Newsletter */}
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-white mb-8 opacity-50">Stay Inspired</h4>
              <p className="text-gray-400 font-light text-sm mb-6 leading-relaxed">Join our private circle for exclusive expedition early access and field notes.</p>
              <form className="flex group" onSubmit={(e) => { e.preventDefault(); alert('Subscribed to newsletter.'); }}>
                <input type="email" placeholder="Email address" className="bg-transparent border-b border-gray-800 p-2 text-sm focus:outline-none focus:border-brand-primary flex-1 text-white transition-colors" required />
                <button type="submit" className="border-b border-gray-800 p-2 text-brand-primary hover:text-white transition-colors font-bold">→</button>
              </form>
              <div className="mt-8 flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                 <span className="text-[9px] text-gray-500 uppercase tracking-widest">Global Support Online</span>
              </div>
            </div>

          </div>


          {/* Bottom Row */}
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-xs text-gray-500 tracking-widest font-sans uppercase">{t.copyright}</p>
            <div className="flex gap-8 opacity-40 hover:opacity-100 transition-all items-center">
              <div className="flex items-center gap-2">
                 <svg className="w-5 h-5 text-gray-100" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0l3.09 6.26L22 7.27l-5 4.87 1.18 6.88L12 15.77l-6.18 3.25L7 12.14 2 7.27l6.91-1.01L12 0z"/></svg>
                 <span className="text-xs font-bold font-serif uppercase tracking-[0.2em] text-white">Top Agency 2026</span>
              </div>
              <div className="flex items-center gap-2">
                 <span className="text-xs font-bold font-serif uppercase tracking-[0.3em] text-white">WATA APPROVED</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-brand-bg flex items-center justify-center font-serif text-2xl animate-pulse text-brand-primary">AL...</div>}>
      <HomeContent />
    </Suspense>
  );
}
