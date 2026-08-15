"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuth, setIsAuth] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Close sidebar on navigation
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);


  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    const localUser = JSON.parse(localStorage.getItem("admin_user") || "{}");
    
    if (!token && pathname !== "/admin/login") {
      router.push("/admin/login");
    } else {
      setIsAuth(true);
      if (localUser.id) {
        // Fetch fresh user data with ID
        fetch(`/api/user?id=${localUser.id}`, { cache: 'no-store' })
          .then(res => res.json())
          .then(data => setUserData(data));
      }
    }
  }, [pathname, router]);

  if (!isAuth && pathname !== "/admin/login") {
    return <div className="min-h-screen bg-brand-bg flex items-center justify-center font-serif text-2xl animate-pulse">Authenticating...</div>;
  }

  // Don't show sidebar on login page
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-brand-bg text-brand-dark relative overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 w-64 bg-white border-r border-[#E5E5E5] flex flex-col p-6 shadow-xl z-30 transition-transform duration-300 lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>

        <div className="mb-10 flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-primary rounded-sm flex items-center justify-center text-white font-bold font-serif italic">
            AL
          </div>
          <h1 className="text-xl font-serif font-bold text-brand-primary tracking-wide">
            AlmaLanka
          </h1>
          <span className="text-xs uppercase tracking-widest text-gray-400 mt-1 ml-1">Admin</span>
        </div>

        <nav className="flex flex-col gap-6 text-sm font-medium">
          {/* Business Core */}
          {(userData?.role === "Administrator" || userData?.role === "Sales") && (
            <div>
              <h4 className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold mb-3 px-3">Business</h4>
              <div className="flex flex-col gap-1">
                <Link href="/admin" className="text-brand-dark hover:text-brand-primary p-3 rounded-sm transition-colors flex items-center gap-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
                  Dashboard
                </Link>
                <Link href="/admin/calendar" className="text-brand-dark hover:text-brand-primary p-3 rounded-sm transition-colors flex items-center gap-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                  Calendar
                </Link>
                <Link href="/admin/bookings" className="text-brand-dark hover:text-brand-primary p-3 rounded-sm transition-colors flex items-center gap-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                  Bookings
                </Link>
              </div>
            </div>
          )}

          {/* Resources & Content */}
          {(userData?.role === "Administrator" || userData?.role === "Editor") && (
            <div>
              <h4 className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold mb-3 px-3">Content</h4>
              <div className="flex flex-col gap-1">
                {userData?.role === "Editor" && (
                   <Link href="/admin" className="text-brand-dark hover:text-brand-primary p-3 rounded-sm transition-colors flex items-center gap-3">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
                    Dashboard
                  </Link>
                )}
                <Link href="/admin/locations" className="text-brand-dark hover:text-brand-primary p-3 rounded-sm transition-colors flex items-center gap-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                  Locations
                </Link>
                <Link href="/admin/activities" className="text-brand-dark hover:text-brand-primary p-3 rounded-sm transition-colors flex items-center gap-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  Activities
                </Link>
                <Link href="/admin/gallery" className="text-brand-dark hover:text-brand-primary p-3 rounded-sm transition-colors flex items-center gap-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                  Gallery
                </Link>
              </div>
            </div>
          )}

          {/* Sales & Marketing */}
          {(userData?.role === "Administrator" || userData?.role === "Sales" || userData?.role === "Editor") && (
            <div>
              <h4 className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold mb-3 px-3">Sales</h4>
              <div className="flex flex-col gap-1">
                <Link href="/admin/tour-plans" className="text-brand-dark hover:text-brand-primary p-3 rounded-sm transition-colors flex items-center gap-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>
                  Tour Plans
                </Link>
                {(userData?.role === "Administrator" || userData?.role === "Sales") && (
                  <Link href="/admin/feedback" className="text-brand-dark hover:text-brand-primary p-3 rounded-sm transition-colors flex items-center gap-3">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"/></svg>
                    Feedback
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* System & Audit */}
          <div>
            <h4 className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold mb-3 px-3">System</h4>
            <div className="flex flex-col gap-1">
              <Link href="/admin/profile" className="text-brand-dark hover:text-brand-primary p-3 rounded-sm transition-colors flex items-center gap-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                My Profile
              </Link>
              {userData?.role === "Administrator" && (
                <>
                  <Link href="/admin/logs" className="text-brand-dark hover:text-brand-primary p-3 rounded-sm transition-colors flex items-center gap-3">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    Activity Log
                  </Link>
                  <Link href="/admin/users" className="text-brand-dark hover:text-brand-primary p-3 rounded-sm transition-colors flex items-center gap-3">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                    User Management
                  </Link>
                  <Link href="/admin/settings" className="text-brand-dark hover:text-brand-primary p-3 rounded-sm transition-colors flex items-center gap-3">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                    Settings
                  </Link>
                </>
              )}
            </div>
          </div>
        </nav>
        
        <div className="mt-auto pt-10">
          <div className="flex items-center gap-3 p-3 bg-gray-50/50 rounded-sm mb-4 border border-gray-100">
             <div className="w-8 h-8 rounded-full bg-brand-primary/10 overflow-hidden border border-brand-primary/20">
                {userData?.image ? (
                  <img src={userData.image} alt="Admin" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-brand-primary text-white text-[10px] font-bold">
                    {userData?.name?.charAt(0) || "A"}
                  </div>
                )}
             </div>
             <div className="flex flex-col">
                <span className="text-xs font-bold text-brand-dark">{userData?.name || "Administrator"}</span>
                <span className="text-[9px] uppercase tracking-widest text-brand-primary font-bold">{userData?.role || "Admin"}</span>
             </div>
          </div>
          <button 
            onClick={() => { localStorage.removeItem("admin_token"); window.location.href = "/admin/login"; }}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-brand-dark transition-colors px-3 py-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 flex flex-col bg-brand-bg">
        {/* Mobile Header for Admin */}
        <div className="lg:hidden h-16 bg-white border-b border-[#E5E5E5] flex items-center justify-between px-6 shrink-0 z-10">
           <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-brand-primary rounded-sm flex items-center justify-center text-white font-bold font-serif italic text-[10px]">
                AL
              </div>
              <span className="font-serif font-bold text-brand-primary text-sm tracking-tight">Admin</span>
           </div>
           <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-brand-dark"
           >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"/></svg>
           </button>
        </div>

        <div className="flex-1 p-4 md:p-8 lg:p-12 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>

  );
}
