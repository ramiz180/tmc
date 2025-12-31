"use client";

import Sidebar from "../../components/Sidebar";
import GoogleMapReact from "google-map-react";
import { useEffect, useState } from "react";

const MapMarker = ({ user }: { user: any, lat: number, lng: number }) => (
  <div className="group relative flex flex-col items-center justify-center -translate-x-1/2 -translate-y-full hover:z-50 transition-all cursor-pointer">
    {/* Label on Hover */}
    <div className="absolute bottom-full mb-3 hidden group-hover:flex flex-col items-center animate-in fade-in slide-in-from-bottom-2 duration-200">
      <div className="bg-gray-900 text-white px-3 py-1.5 rounded-xl text-[10px] font-black whitespace-nowrap shadow-2xl border border-gray-800 flex flex-col items-center gap-0.5">
        <span className="uppercase tracking-widest">{user.name || "Anonymous"}</span>
        <span className="text-gray-400 font-mono">{user.phone}</span>
        <div className={`mt-1 px-2 py-0.5 rounded-md text-[8px] border ${user.role === "worker" ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-blue-500/20 text-blue-400 border-blue-500/30"
          }`}>
          {user.role?.toUpperCase()}
        </div>
      </div>
      <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-gray-900" />
    </div>

    {/* Marker Pulse */}
    <div className={`absolute w-10 h-10 rounded-full animate-ping opacity-20 ${user.role === "worker" ? "bg-green-500" : "bg-blue-500"
      }`} />

    {/* Marker Body */}
    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg border-2 transition-transform group-hover:scale-125 ${user.role === "worker"
        ? "bg-white border-green-500 text-green-600 shadow-green-500/20"
        : "bg-white border-blue-500 text-blue-600 shadow-blue-500/20"
      }`}>
      <span className="text-xl">{user.role === "worker" ? "👷" : "🤝"}</span>
    </div>
    <div className={`w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] -mt-1 ${user.role === "worker" ? "border-t-green-500" : "border-t-blue-500"
      }`} />
  </div>
);

export default function Tracking() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [center, setCenter] = useState({ lat: 28.6139, lng: 77.2090 }); // Default Delhi
  const [zoom, setZoom] = useState(12);

  useEffect(() => {
    fetchUsers();
    const interval = setInterval(fetchUsers, 5000); // Live sync every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchUsers = () => {
    fetch("http://localhost:5000/api/admin/users")
      .then((r) => r.json())
      .then((data) => {
        setUsers(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching live tracking data:", err);
        setLoading(false);
      });
  };

  const focusUser = (u: any) => {
    if (u.location?.latitude && u.location?.longitude) {
      setCenter({ lat: u.location.latitude, lng: u.location.longitude });
      setZoom(15);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex overflow-hidden">
      <Sidebar />
      <div className="flex-1 md:ml-64 flex flex-col h-screen overflow-hidden">
        {/* Header Stats */}
        <header className="p-8 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Live Movement</h1>
            <p className="text-gray-500 mt-1 font-medium italic">Global tracking of active platform participants</p>
          </div>
          <div className="flex gap-4">
            <div className="bg-white px-5 py-3 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Workers</span>
              <span className="text-xl font-black text-gray-900">{users.filter(u => u.role === "worker").length}</span>
            </div>
            <div className="bg-white px-5 py-3 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Customers</span>
              <span className="text-xl font-black text-gray-900">{users.filter(u => u.role === "customer").length}</span>
            </div>
          </div>
        </header>

        <div className="flex-1 p-8 pt-4 flex gap-8 overflow-hidden">
          {/* Map Area */}
          <div className="flex-1 bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden relative border-4 border-white">
            <GoogleMapReact
              bootstrapURLKeys={{ key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || "" }}
              center={center}
              zoom={zoom}
              onChange={({ center, zoom }) => {
                setCenter(center);
                setZoom(zoom);
              }}
              options={{
                styles: [
                  { "featureType": "all", "elementType": "labels.text.fill", "stylers": [{ "color": "#7c93a3" }, { "lightness": "-10" }] },
                  { "featureType": "administrative.country", "elementType": "geometry", "stylers": [{ "visibility": "on" }] },
                  { "featureType": "administrative.country", "elementType": "geometry.stroke", "stylers": [{ "color": "#a0a4a5" }] },
                  { "featureType": "landscape", "elementType": "geometry.fill", "stylers": [{ "color": "#f1f1f1" }] },
                  { "featureType": "poi", "elementType": "all", "stylers": [{ "visibility": "off" }] },
                  { "featureType": "road", "elementType": "all", "stylers": [{ "saturation": "-100" }] },
                  { "featureType": "road.highway", "elementType": "geometry.fill", "stylers": [{ "color": "#ffffff" }] },
                  { "featureType": "road.highway", "elementType": "geometry.stroke", "stylers": [{ "visibility": "off" }] },
                  { "featureType": "water", "elementType": "geometry.fill", "stylers": [{ "color": "#d2d2d2" }] }
                ],
                disableDefaultUI: true,
                zoomControl: true,
              }}
            >
              {users.map((u) => u.location?.latitude && (
                <MapMarker
                  key={u._id}
                  lat={u.location.latitude}
                  lng={u.location.longitude}
                  user={u}
                />
              ))}
            </GoogleMapReact>

            {/* Float Overlay Info */}
            <div className="absolute top-6 left-6 bg-gray-900/90 backdrop-blur-md text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 border border-gray-800 shadow-2xl">
              <span className="flex items-center gap-1.5 text-green-400">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping" />
                Live Sync Active
              </span>
              <span className="w-px h-3 bg-gray-700" />
              <span className="text-gray-400">Updates every 5s</span>
            </div>
          </div>

          {/* User List Pane */}
          <div className="w-80 bg-white rounded-3xl border border-gray-100 shadow-xl flex flex-col overflow-hidden">
            <div className="p-5 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Active Participants</span>
              <span className="text-[10px] bg-green-500 text-white px-2 py-0.5 rounded-md font-black">{users.length}</span>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {users.map((u) => (
                <button
                  key={u._id}
                  onClick={() => focusUser(u)}
                  className="w-full text-left p-4 rounded-2xl hover:bg-gray-50 transition-all group flex items-center gap-4 active:scale-[0.98]"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 border transition-colors ${u.role === "worker" ? "bg-green-50 border-green-100 text-green-600 group-hover:bg-green-500 group-hover:text-white" : "bg-blue-50 border-blue-100 text-blue-600 group-hover:bg-blue-500 group-hover:text-white"
                    }`}>
                    {u.role === "worker" ? "👷" : "🤝"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 text-sm truncate">{u.name || "Untitled"}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight truncate">
                      {u.location?.label || u.location?.apartment || "No Signal"}
                    </p>
                  </div>
                  {u.location?.latitude ? (
                    <div className="w-2 h-2 rounded-full bg-green-500 shadow-lg shadow-green-500/50" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-gray-200" />
                  )}
                </button>
              ))}
            </div>
            <div className="p-4 bg-gray-950 text-center">
              <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em]">Select user to focus map</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
