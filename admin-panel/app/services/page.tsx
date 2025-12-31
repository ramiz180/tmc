"use client";

import Sidebar from "../../components/Sidebar";
import { useEffect, useState } from "react";

const ServiceCard = ({ s }: { s: any }) => (
  <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:shadow-green-500/10 transition-all duration-300 group">
    <div className="p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-green-50 text-green-600 text-[10px] font-black uppercase px-2 py-0.5 rounded-md border border-green-100">
              {s.category}
            </span>
          </div>
          <h3 className="text-xl font-bold text-gray-900 group-hover:text-green-600 transition-colors line-clamp-1">
            {s.name}
          </h3>
          <p className="text-gray-500 text-xs mt-1 line-clamp-2 leading-relaxed">
            {s.description || "No description provided."}
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-black text-green-600">₹{s.price}</p>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Starting Price</p>
        </div>
      </div>

      <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-gray-100 shadow-sm shrink-0">
            <span className="text-lg">👷</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Professional</p>
            <p className="text-sm font-bold text-gray-700 truncate">{s.workerName || s.workerId?.name || "Unknown"}</p>
          </div>
          <div className="flex flex-col items-end">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Contact</p>
            <p className="text-[11px] font-mono text-gray-600">{s.workerId?.phone || "N/A"}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-gray-100 shadow-sm shrink-0">
            <span className="text-lg">📍</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Service Area</p>
            <p className="text-xs font-semibold text-gray-600 truncate">{s.location?.address || "Location not set"}</p>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <div className="flex -space-x-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="w-7 h-7 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-[10px] font-bold text-gray-500">
              {String.fromCharCode(64 + i)}
            </div>
          ))}
          <div className="w-7 h-7 rounded-full bg-green-500 border-2 border-white flex items-center justify-center text-[8px] font-black text-black">
            +12
          </div>
        </div>
        <button className="px-5 py-2 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-all active:scale-95 shadow-lg shadow-gray-200">
          View Details
        </button>
      </div>
    </div>
  </div>
);

export default function Services() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/api/admin/services")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setServices(data.services);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching services:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 md:ml-64 p-4 sm:p-8 lg:p-12 transition-all duration-300">
        <div className="max-w-7xl mx-auto pt-16 md:pt-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
            <div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">Active Services</h1>
              <p className="text-gray-500 mt-1 font-medium">Manage all skill offerings across the platform</p>
            </div>
            <div className="bg-white p-2 rounded-2xl flex items-center gap-2 border border-gray-100 shadow-sm">
              <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse ml-2" />
              <span className="text-sm font-bold text-gray-700 pr-4">{services.length} Live Services</span>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 opacity-50 animate-pulse">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-white rounded-3xl h-[380px] border border-gray-100 shadow-xl shadow-gray-200/50" />
              ))}
            </div>
          ) : services.length === 0 ? (
            <div className="bg-white p-20 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 text-center">
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8">
                <span className="text-4xl text-gray-300">🛠️</span>
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">No Services Yet</h3>
              <p className="text-gray-500 max-w-sm mx-auto font-medium">
                When workers add their professional skills, they will appear here with pricing and provider details.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {services.map((s: any) => (
                <ServiceCard key={s._id} s={s} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
