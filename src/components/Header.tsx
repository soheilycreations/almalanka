"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { useState, useEffect } from "react";

export default function Header() {
  const pathname = usePathname();
  const { lang, setLang } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Close menu on navigation
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  // Prevent scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isMenuOpen]);


  // Hide on Admin
  if (pathname.startsWith("/admin")) return null;

  const links = [
    { name: lang === "es" ? "Inicio" : "Home", href: "/" },
    { name: lang === "es" ? "Expediciones" : "Expeditions", href: "/tours" },
    { name: lang === "es" ? "Galería" : "Gallery", href: "/our-gallery" },
    { name: lang === "es" ? "Opiniones" : "Reviews", href: "/reviews" },
    { name: lang === "es" ? "Contacto" : "Contact", href: "/contact" }
  ];

  return (
    <>
      <div className="h-20 w-full shrink-0" />
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#E5E5E5] px-8 md:px-16 flex justify-between items-center h-20">
      <Link href="/" className="flex items-center gap-2 group">
  <img 
    src="https://www.almalanka.com/img/alma%20loo.jpg" 
    alt="AlmaLanka Logo" 
    className="w-32 h-auto object-contain" 
  />
</Link>

        <div className="flex items-center gap-8">
          <nav className="hidden md:flex gap-8 items-center">
            {links.map((link) => (
              <Link 
                key={link.name} 
                href={link.href}
                className="text-xs font-semibold uppercase tracking-widest text-brand-dark hover:text-brand-primary transition-colors"
              >
                {link.name}
              </Link>
            ))}
            <Link 
              href="/book"
              className="ml-4 bg-brand-primary text-white px-6 py-2.5 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-brand-dark transition-all shadow-md active:scale-95"
            >
              {lang === "es" ? "PLANEA TU VIAJE" : "PLAN YOUR TRIP"}
            </Link>
          </nav>

          {/* Global Language Switcher */}
          <div className="flex items-center gap-2 bg-brand-dark/5 px-3 py-1.5 rounded-full border border-brand-dark/10">
            <button 
              onClick={() => setLang("es")} 
              className={`text-[10px] font-bold uppercase tracking-widest transition-all ${lang === "es" ? "text-brand-primary" : "text-brand-dark/40 hover:text-brand-dark"}`}
            >
              ES
            </button>
            <span className="text-brand-dark/20 text-[10px]">|</span>
            <button 
              onClick={() => setLang("en")} 
              className={`text-[10px] font-bold uppercase tracking-widest transition-all ${lang === "en" ? "text-brand-primary" : "text-brand-dark/40 hover:text-brand-dark"}`}
            >
              EN
            </button>
          </div>
          
          <div className="flex md:hidden items-center gap-4">
             <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-brand-dark p-2"
                aria-label="Toggle menu"
              >

                {isMenuOpen ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"/></svg>
                )}
             </button>
          </div>
        </div>

        {/* Mobile Menu Drawer (Right Side) */}
        <div 
          className={`fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm transition-opacity duration-300 md:hidden ${isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
          onClick={() => setIsMenuOpen(false)}
        />
        
        <div className={`fixed inset-y-0 right-0 w-[80%] max-w-[300px] h-screen h-[100dvh] min-h-screen bg-white z-[70] shadow-2xl transition-transform duration-300 ease-in-out md:hidden flex flex-col ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
           <div className="h-20 shrink-0 flex items-center justify-between px-8 border-b border-gray-100 bg-white">
              <div className="flex items-center gap-4">
                <span className="font-serif font-bold text-brand-dark tracking-widest text-lg">Menu</span>
                <div className="flex gap-2 bg-gray-50 px-2 py-1 rounded-full border border-gray-100">
                  <button onClick={() => setLang("es")} className={`text-[9px] font-black tracking-widest transition-colors ${lang === "es" ? "text-brand-primary" : "text-gray-300 hover:text-brand-dark"}`}>ES</button>
                  <span className="text-gray-200 text-[9px]">|</span>
                  <button onClick={() => setLang("en")} className={`text-[9px] font-black tracking-widest transition-colors ${lang === "en" ? "text-brand-primary" : "text-gray-300 hover:text-brand-dark"}`}>EN</button>
                </div>
              </div>
              <button onClick={() => setIsMenuOpen(false)} className="text-brand-dark p-2 hover:bg-gray-50 rounded-full transition-colors">

                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
           </div>

           <div className="flex-1 overflow-y-auto flex flex-col bg-white">
             <nav className="flex flex-col p-8 gap-8">
                {links.map((link) => (
                  <Link 
                    key={link.name} 
                    href={link.href}
                    className={`text-xl font-serif font-bold tracking-tight transition-all duration-300 ${pathname === link.href ? 'text-brand-primary pl-4 border-l-2 border-brand-primary' : 'text-brand-dark hover:text-brand-primary hover:pl-2'}`}
                  >
                    {link.name}
                  </Link>
                ))}
                
                <Link 
                  href="/book"
                  className="mt-4 bg-brand-primary text-white py-4 text-center text-[11px] font-bold uppercase tracking-[0.3em] shadow-lg active:scale-95"
                >
                  {lang === "es" ? "PLANEA TU VIAJE" : "PLAN YOUR TRIP"}
                </Link>
                
                <div className="mt-8 pt-10 border-t border-gray-100">
                    <p className="text-[10px] uppercase tracking-[0.4em] font-black text-gray-300 mb-6">Connect</p>
                    <div className="space-y-5">
                      <a href="mailto:info@almalanka.com" className="text-sm font-medium text-brand-dark flex items-center gap-4 hover:text-brand-primary transition-colors">
                        <div className="w-8 h-8 rounded-full bg-brand-primary/5 flex items-center justify-center">
                          <svg className="w-4 h-4 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                        </div>
                        info@almalanka.com
                      </a>
                      <a href="tel:+34639962786" className="text-sm font-medium text-brand-dark flex items-center gap-4 hover:text-brand-primary transition-colors">
                      <div className="w-8 h-8 rounded-full bg-brand-primary/5 flex items-center justify-center">
                        <svg className="w-4 h-4 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                      </div>
                      +34 639 962 786
                    </a>
                    <a href="tel:+94766112948" className="text-sm font-medium text-brand-dark flex items-center gap-4 hover:text-brand-primary transition-colors">
                      <div className="w-8 h-8 rounded-full bg-brand-primary/5 flex items-center justify-center">
                        <svg className="w-4 h-4 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                      </div>
                      +94 76 611 2948
                    </a>
                    </div>
                </div>
             </nav>
           </div>

           <div className="shrink-0 p-8 border-t border-gray-100">
              <Link 
                href="/admin/login" 
                className="flex items-center justify-center gap-3 w-full py-4 bg-brand-dark text-white text-[11px] font-black uppercase tracking-[0.3em] hover:bg-brand-primary transition-all shadow-lg active:scale-95"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
                Login
              </Link>

              <p className="text-[9px] text-center text-gray-300 mt-4 uppercase tracking-widest">© 2026 AlmaLanka</p>
           </div>
        </div>



      </header>


    </>
  );
}
