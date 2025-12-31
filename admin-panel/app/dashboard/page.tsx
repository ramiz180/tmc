"use client";

import Sidebar from "../../components/Sidebar";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const [stats, setStats] = useState({
    users: 0,
    services: 0,
    bookings: 0
  });

  useEffect(() => {
    // Fetch stats for the dashboard
    const fetchStats = async () => {
      try {
        const [usersRes, servicesRes, bookingsRes] = await Promise.all([
          fetch("http://localhost:5000/api/admin/users"),
          fetch("http://localhost:5000/api/admin/services"),
          fetch("http://localhost:5000/api/admin/bookings")
        ]);

        const users = await usersRes.json();
        const servicesData = await servicesRes.json();
        const bookingsData = await bookingsRes.json();

        setStats({
          users: users.length || 0,
          services: servicesData.services?.length || 0,
          bookings: bookingsData.bookings?.length || 0
        });
      } catch (err) {
        console.error("Error fetching dashboard stats:", err);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <main className="flex-1 md:ml-64 p-4 sm:p-8 lg:p-12 transition-all duration-300">
        <div className="max-w-7xl mx-auto pt-16 md:pt-0">
          <header className="mb-12">
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">System Overview</h1>
            <p className="text-gray-500 mt-1 font-medium">Real-time platform metrics and management</p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {[
              { label: "Total Users", value: stats.users, icon: "👥", color: "blue" },
              { label: "Active Services", value: stats.services, icon: "🛠️", color: "green" },
              { label: "Total Bookings", value: stats.bookings, icon: "📅", color: "purple" }
            ].map((stat, i) => (
              <div key={i} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 hover:shadow-2xl transition-all duration-300 group">
                <div className={`w-14 h-14 bg-${stat.color}-50 rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform`}>
                  {stat.icon}
                </div>
                <h3 className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mb-2">{stat.label}</h3>
                <p className="text-4xl font-black text-gray-900">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50">
              <h2 className="text-xl font-black text-gray-900 mb-6">Recent Activity</h2>
              <div className="space-y-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex gap-4 items-start">
                    <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />
                    <div>
                      <p className="text-sm font-bold text-gray-800">New Service Added</p>
                      <p className="text-xs text-gray-400">2 hours ago</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                <span className="text-3xl text-gray-300">📈</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Platform Growth</h3>
              <p className="text-gray-500 text-sm max-w-xs">Detailed analytics and growth charts will be integrated in the next update.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
