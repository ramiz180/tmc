"use client";

import Sidebar from "../../components/Sidebar";
import GoogleMapReact from "google-map-react";
import { useEffect, useState, useRef } from "react";
import {
  MoreVertical,
  Trash2,
  UserMinus,
  UserCheck,
  Phone,
  MapPin,
  Star,
  Briefcase,
  ShoppingBag,
  Home,
  Building,
  Navigation,
  X,
  ExternalLink,
  Eye,
  Play
} from "lucide-react";

const VideoPlayerModal = ({ url, onClose }: { url: string; onClose: () => void }) => (
  <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 transition-all duration-300">
    <div className="absolute inset-0 bg-black/95 backdrop-blur-md" onClick={onClose} />
    <div className="relative w-full max-w-5xl aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in duration-300">
      <button
        onClick={onClose}
        className="absolute top-6 right-6 z-10 p-3 bg-white/10 hover:bg-white/20 rounded-2xl text-white backdrop-blur-md transition-all active:scale-95"
      >
        <X size={24} />
      </button>
      <video src={url} controls autoPlay className="w-full h-full" />
    </div>
  </div>
);

const ImageViewerModal = ({ url, onClose }: { url: string; onClose: () => void }) => (
  <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 transition-all duration-300">
    <div className="absolute inset-0 bg-black/95 backdrop-blur-md" onClick={onClose} />
    <div className="relative w-full max-w-5xl h-full flex items-center justify-center pointer-events-none">
      <div className="relative max-h-[90vh] max-w-full pointer-events-auto animate-in zoom-in duration-300">
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 md:top-4 md:right-4 z-10 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md transition-all active:scale-95"
        >
          <X size={24} />
        </button>
        <img src={url} alt="Full view" className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl" />
      </div>
    </div>
  </div>
);

const MapMarker = ({ text }: { text: string; lat: number; lng: number }) => (
  <div className="flex flex-col items-center justify-center transform -translate-x-1/2 -translate-y-full hover:scale-110 transition-transform cursor-pointer drop-shadow-md" title={text}>
    <div className="bg-white p-1 rounded-full border-2 border-green-500 shadow-lg">
      <div className="text-xl">📍</div>
    </div>
    <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-green-500 -mt-1" />
  </div>
);

const UserCard = ({ u, onToggleStatus, onDelete, onViewServices }: { u: any; onToggleStatus: (id: string) => void; onDelete: (id: string) => void; onViewServices: (user: any) => void }) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:shadow-green-500/10 transition-all duration-300 group ${!u.isActive ? "opacity-75 grayscale-[0.5]" : ""}`}>
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-gray-900 group-hover:text-green-600 transition-colors">
                {u.name || "Unnamed User"}
              </h3>
              {!u.isActive && (
                <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase">Disabled</span>
              )}
            </div>
            <p className="text-gray-500 font-medium text-sm flex items-center gap-1.5 mt-0.5">
              <Phone size={14} className="text-gray-400" />
              {u.phone}
            </p>
          </div>

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400 hover:text-gray-600"
            >
              <MoreVertical size={20} />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in duration-200">
                <button
                  onClick={() => { onToggleStatus(u._id); setShowMenu(false); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  {u.isActive ? <UserMinus size={18} className="text-amber-500" /> : <UserCheck size={18} className="text-green-500" />}
                  {u.isActive ? "Disable User" : "Enable User"}
                </button>
                <button
                  onClick={() => { if (confirm("Are you sure?")) onDelete(u._id); setShowMenu(false); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={18} />
                  Delete User
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100 flex flex-col justify-center">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
              {u.role === "worker" ? "Services Provided" : "Services Used"}
            </p>
            <div className="flex items-center gap-2 text-gray-800">
              {u.role === "worker" ? <Briefcase size={16} className="text-green-500" /> : <ShoppingBag size={16} className="text-blue-500" />}
              <span className="text-lg font-black">{u.count || 0}</span>
            </div>
          </div>

          {u.role === "worker" && (
            <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100 flex flex-col justify-center">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Services Added</p>
              <div className="flex items-center gap-2 text-gray-800">
                <ShoppingBag size={16} className="text-green-500" />
                <span className="text-lg font-black">{u.serviceCount || 0}</span>
              </div>
            </div>
          )}

          {u.role === "worker" && (
            <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100 flex flex-col justify-center">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Rating</p>
              <div className="flex items-center gap-2 text-gray-800">
                <Star size={16} className="text-amber-400 fill-amber-400" />
                <span className="text-lg font-black">{u.rating || 0}</span>
              </div>
            </div>
          )}

          {u.location?.label && (
            <div className={`col-span-${u.role === "worker" ? "2" : "1"} bg-gray-50 p-3 rounded-2xl border border-gray-100`}>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Location Tag</p>
              <div className="flex items-center gap-2 text-gray-800">
                <MapPin size={16} className="text-red-500" />
                <span className="text-sm font-bold uppercase italic">{u.location.label}</span>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-3 mb-6 bg-gray-50 p-4 rounded-2xl border border-gray-100">
          <div className="flex flex-col gap-2">
            {/* Display Location Contact Info if available, else standard user info is at top but user asked for list here */}
            {(u.location?.contactName || u.location?.contactPhone) && (
              <div className="mb-1 border-b border-gray-200 pb-2">
                {u.location?.contactName && <p className="font-bold text-sm text-gray-900">{u.location.contactName}</p>}
                {u.location?.contactPhone && <p className="text-xs font-mono text-gray-500">{u.location.contactPhone}</p>}
              </div>
            )}

            {u.location?.houseNo && (
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">House/Flat/Street</p>
                <p className="text-sm font-semibold text-gray-700 leading-tight">{u.location.houseNo}</p>
              </div>
            )}

            {u.location?.apartment && (
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Landmark</p>
                <p className="text-sm font-semibold text-gray-700 leading-tight">{u.location.apartment}</p>
              </div>
            )}

            {u.location?.directions && (
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Directions</p>
                <p className="text-xs text-gray-600 italic">"{u.location.directions}"</p>
              </div>
            )}
          </div>
        </div>

        {u.role === "worker" && (
          <button
            onClick={() => onViewServices(u)}
            className="w-full mb-4 flex items-center justify-center gap-2 py-3 bg-green-50 hover:bg-green-100 text-green-700 font-black text-sm rounded-2xl transition-all border border-green-100 active:scale-[0.98]"
          >
            <Eye size={18} />
            View All Services
          </button>
        )}
      </div>

      <div className="h-[220px] w-full relative border-t border-gray-50 grayscale group-hover:grayscale-0 transition-all duration-500">
        <GoogleMapReact
          bootstrapURLKeys={{ key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || "" }}
          defaultCenter={{
            lat: u.location?.latitude || 28.6139,
            lng: u.location?.longitude || 77.2090
          }}
          defaultZoom={12}
        >
          {u.location?.latitude && (
            <MapMarker
              lat={u.location.latitude}
              lng={u.location.longitude}
              text="User Location"
            />
          )}
        </GoogleMapReact>
      </div>
    </div>
  );
};

const ServicesModal = ({ worker, onClose, onPlayVideo, onViewImage }: { worker: any; onClose: () => void; onPlayVideo: (url: string) => void; onViewImage: (url: string) => void }) => {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (worker) {
      fetch(`http://localhost:5000/api/services/worker/${worker._id}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) setServices(data.services);
          setLoading(false);
        })
        .catch(err => {
          console.error("Error fetching services:", err);
          setLoading(false);
        });
    }
  }, [worker]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-4xl max-h-[90vh] rounded-[40px] shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300">
        <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Services by {worker.name}</h2>
            <p className="text-gray-500 font-medium">{worker.phone} • {services.length} Services Added</p>
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-gray-100 rounded-2xl transition-colors text-gray-400 hover:text-gray-900"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 bg-gray-50/50">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white rounded-3xl h-64 animate-pulse border border-gray-100 shadow-sm" />
              ))}
            </div>
          ) : services.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">📭</div>
              <h3 className="text-xl font-bold text-gray-900">No services found</h3>
              <p className="text-gray-500">This worker hasn't added any services yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {services.map((s) => (
                <div key={s._id} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow group shrink-0 h-fit flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="bg-green-50 text-green-600 text-[10px] font-black uppercase px-2 py-0.5 rounded-md border border-green-100 inline-block mb-1">
                        {s.category}
                      </span>
                      <h4 className="text-lg font-bold text-gray-900 line-clamp-1">{s.name}</h4>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-black text-green-600">₹{s.price}{s.priceType === 'hourly' ? '/hr' : ''}</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                        {s.priceType === 'hourly' ? 'Hourly Rate' : 'Fixed Price'}
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-500 text-xs mb-4 line-clamp-2 leading-relaxed">
                    {s.description || "No description provided."}
                  </p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <MapPin size={14} className="text-red-500" />
                      <span className="font-medium truncate">{s.location?.address}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-wider ml-1">
                      <Navigation size={12} className="text-green-500" />
                      <span>{s.coverageRadius || 5}km Radius</span>
                    </div>
                  </div>

                  {/* Media Grid */}
                  {(s.images?.length > 0 || s.videos?.length > 0) && (
                    <div className="grid grid-cols-4 gap-2 mb-4 mt-auto">
                      {s.images?.slice(0, 4).map((img: string, idx: number) => (
                        <div
                          key={`img-${idx}`}
                          className="aspect-square rounded-xl overflow-hidden border border-gray-100 relative group/media cursor-pointer hover:opacity-90 transition-opacity active:scale-95"
                          onClick={() => onViewImage(img)}
                        >
                          <img src={img} alt="" className="w-full h-full object-cover" />
                        </div>
                      ))}
                      {/* Show Videos */}
                      {s.videos?.slice(0, 4 - (s.images?.length > 4 ? 4 : s.images?.length || 0)).map((vid: string, idx: number) => (
                        <div
                          key={`vid-${idx}`}
                          onClick={() => onPlayVideo(vid)}
                          className="aspect-square rounded-xl overflow-hidden border border-gray-100 relative bg-black cursor-pointer group/vid active:scale-95"
                        >
                          <video src={vid} className="w-full h-full object-cover opacity-60 group-hover/vid:opacity-80 transition-opacity" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30 group-hover/vid:scale-110 transition-transform">
                              <Play size={10} className="text-white fill-white ml-0.5" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function Users() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<"customer" | "worker" | "hirer">("customer");
  const [selectedWorker, setSelectedWorker] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    setLoading(true);
    fetch("http://localhost:5000/api/admin/users")
      .then((r) => r.json())
      .then((data) => {
        setUsers(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching users:", err);
        setLoading(false);
      });
  };

  const handleToggleStatus = (id: string) => {
    fetch(`http://localhost:5000/api/admin/users/${id}/toggle-status`, { method: 'PATCH' })
      .then(res => res.json())
      .then(() => fetchUsers())
      .catch(err => console.error("Toggle error:", err));
  };

  const handleDelete = (id: string) => {
    fetch(`http://localhost:5000/api/admin/users/${id}`, { method: 'DELETE' })
      .then(res => res.json())
      .then(() => fetchUsers())
      .catch(err => console.error("Delete error:", err));
  };

  const filteredUsers = users.filter(u =>
    activeSubTab === "worker" ? u.role === "worker" : (u.role === "customer" || u.role === "hirer")
  );

  const openServicesModal = (worker: any) => {
    setSelectedWorker(worker);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 md:ml-64 p-4 sm:p-8 lg:p-12 transition-all duration-300">
        <div className="max-w-7xl mx-auto pt-16 md:pt-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
            <div>
              <h1 className="text-4xl font-black text-gray-900 tracking-tight">Platform Users</h1>
              <p className="text-gray-500 mt-1 font-medium">Manage and monitor all platform participants</p>
            </div>

            <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100">
              <button
                onClick={() => setActiveSubTab("customer")}
                className={`px-8 py-3 rounded-xl text-sm font-black transition-all ${activeSubTab === "customer"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                  : "text-gray-400 hover:text-gray-600"
                  }`}
              >
                Customers ({users.filter(u => (u.role === "customer" || u.role === "hirer")).length})
              </button>
              <button
                onClick={() => setActiveSubTab("worker")}
                className={`px-8 py-3 rounded-xl text-sm font-black transition-all ${activeSubTab === "worker"
                  ? "bg-green-600 text-white shadow-lg shadow-green-200"
                  : "text-gray-400 hover:text-gray-600"
                  }`}
              >
                Workers ({users.filter(u => u.role === "worker").length})
              </button>
            </div>
          </div>

          <div className="mb-10 flex flex-wrap gap-4">
            <div className="bg-white px-6 py-4 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                <ShoppingBag size={24} />
              </div>
              <div>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Active Customers</p>
                <p className="text-2xl font-black text-gray-900">{users.filter(u => (u.role === "customer" || u.role === "hirer") && u.isActive).length}</p>
              </div>
            </div>

            <div className="bg-white px-6 py-4 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center">
                <Briefcase size={24} />
              </div>
              <div>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Active Workers</p>
                <p className="text-2xl font-black text-gray-900">{users.filter(u => u.role === "worker" && u.isActive).length}</p>
              </div>
            </div>

            <div className="bg-white px-6 py-4 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center">
                <UserMinus size={24} />
              </div>
              <div>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Disabled Accounts</p>
                <p className="text-2xl font-black text-gray-900">{users.filter(u => !u.isActive).length}</p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 opacity-50 animate-pulse">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-3xl h-[450px] border border-gray-100 shadow-xl shadow-gray-200/50" />
              ))}
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="bg-white p-20 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 text-center max-w-2xl mx-auto">
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8">
                {activeSubTab === "worker" ? <Briefcase size={40} className="text-gray-300" /> : <ShoppingBag size={40} className="text-gray-300" />}
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-2">No {activeSubTab}s Found</h3>
              <p className="text-gray-500 font-medium">There are currently no registered {activeSubTab}s on the platform.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredUsers.map((u: any) => (
                <UserCard
                  key={u._id}
                  u={u}
                  onToggleStatus={handleToggleStatus}
                  onDelete={handleDelete}
                  onViewServices={openServicesModal}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {isModalOpen && selectedWorker && (
        <ServicesModal
          worker={selectedWorker}
          onClose={() => { setIsModalOpen(false); setSelectedWorker(null); }}
          onPlayVideo={setActiveVideo}
          onViewImage={setActiveImage}
        />
      )}
      {activeVideo && <VideoPlayerModal url={activeVideo} onClose={() => setActiveVideo(null)} />}
      {activeImage && <ImageViewerModal url={activeImage} onClose={() => setActiveImage(null)} />}
    </div>
  );
}
