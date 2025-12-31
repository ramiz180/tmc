"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Header (Only visible on small screens) */}
      <div className="md:hidden fixed top-0 w-full bg-gray-900 text-white p-4 z-50 flex justify-between items-center shadow-lg">
        <h1 className="text-lg font-bold tracking-tight">MakeConnect</h1>
        <button className="p-2 bg-gray-800 rounded-lg">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
        </button>
      </div>

      {/* Sidebar Desktop */}
      <div className="fixed left-0 top-0 h-screen w-0 md:w-64 bg-gray-950 p-0 md:p-8 text-white transition-all duration-300 z-40 overflow-hidden md:overflow-y-auto border-r border-gray-800">
        <div className="hidden md:block">
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="w-8 h-8 bg-green-500 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20">
              <span className="text-black font-black text-xs">MC</span>
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">MakeConnect</h1>
          </div>

          <nav className="space-y-1.5">
            {[
              { name: "Dashboard", href: "/dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
              { name: "Users", href: "/users", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" },
              { name: "Services", href: "/services", icon: "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
              { name: "Categories", href: "/categories", icon: "M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" },
              { name: "Bookings", href: "/bookings", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
              { name: "Chats", href: "/chats", icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" },
              { name: "Tracking", href: "/tracking", icon: "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L16 4m0 13V4m0 0L9 7" },
            ].map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive ? "bg-green-500/10 text-green-400 border border-green-500/20" : "text-gray-400 hover:text-white hover:bg-white/5"
                    }`}
                >
                  <svg className={`w-5 h-5 ${isActive ? "text-green-400" : "text-gray-500 group-hover:text-white"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon}></path>
                  </svg>
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  );
}
