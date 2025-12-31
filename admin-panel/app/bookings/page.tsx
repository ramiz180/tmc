"use client";

import Sidebar from "../../components/Sidebar";
import { useEffect, useState } from "react";

const BookingRow = ({ b }: { b: any }) => {
  const getStatusStyle = (status: string) => {
    switch (status) {
      case "accepted":
        return "bg-green-50 text-green-600 border-green-100";
      case "pending":
        return "bg-amber-50 text-amber-600 border-amber-100";
      case "rejected":
        return "bg-red-50 text-red-600 border-red-100";
      default:
        return "bg-gray-50 text-gray-600 border-gray-100";
    }
  };

  return (
    <tr className="group hover:bg-gray-50/50 transition-colors border-b border-gray-100 last:border-0">
      <td className="py-5 px-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-lg">
            🛠️
          </div>
          <div>
            <p className="font-bold text-gray-900 line-clamp-1">{b.serviceId?.name || "Deleted Service"}</p>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{b.serviceId?.category || "N/A"}</p>
          </div>
        </div>
      </td>
      <td className="py-5 px-6">
        <div>
          <p className="font-bold text-gray-800">{b.customerId?.location?.contactName || b.customerId?.name || "Unknown"}</p>
          <p className="text-xs font-mono text-gray-500">{b.customerId?.location?.contactPhone || b.customerId?.phone}</p>
        </div>
      </td>
      <td className="py-5 px-6">
        <div>
          <p className="font-bold text-gray-800">{b.workerId?.location?.contactName || b.workerId?.name || "Unknown"}</p>
          <p className="text-xs font-mono text-gray-500">{b.workerId?.location?.contactPhone || b.workerId?.phone}</p>
        </div>
      </td>
      <td className="py-5 px-6 text-center">
        <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black tracking-widest uppercase border ${getStatusStyle(b.status)}`}>
          {b.status}
        </span>
      </td>
      <td className="py-5 px-6 text-right font-mono text-xs text-gray-500">
        {new Date(b.createdAt).toLocaleDateString()}
      </td>
    </tr>
  );
};

export default function Bookings() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/api/admin/bookings")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setBookings(data.bookings);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching bookings:", err);
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
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">Booking Management</h1>
              <p className="text-gray-500 mt-1 font-medium">Monitor all platform transactions and job statuses</p>
            </div>
            <div className="bg-white p-2 rounded-2xl flex items-center gap-2 border border-gray-100 shadow-sm">
              <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse ml-2" />
              <span className="text-sm font-bold text-gray-700 pr-4">{bookings.length} Total Bookings</span>
            </div>
          </div>

          {loading ? (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden opacity-50 animate-pulse h-[600px]" />
          ) : bookings.length === 0 ? (
            <div className="bg-white p-20 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 text-center">
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8">
                <span className="text-4xl text-gray-300">📅</span>
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">No Bookings Yet</h3>
              <p className="text-gray-500 max-w-sm mx-auto font-medium">
                Once customers start booking services from workers, the full record will appear here.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-950 text-white">
                    <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest">Service Details</th>
                    <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest">Customer</th>
                    <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest">Provider</th>
                    <th className="py-4 px-6 text-center text-[10px] font-black uppercase tracking-widest">Status</th>
                    <th className="py-4 px-6 text-right text-[10px] font-black uppercase tracking-widest">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <BookingRow key={b._id} b={b} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
