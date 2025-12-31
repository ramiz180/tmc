"use client";

import Sidebar from "../../components/Sidebar";
import { useEffect, useState, useRef } from "react";

const ChatListItem = ({ b, active, onClick }: { b: any, active: boolean, onClick: () => void }) => {
  const lastMsg = b.chatMessages?.length > 0 ? b.chatMessages[b.chatMessages.length - 1] : null;

  return (
    <div
      onClick={onClick}
      className={`p-4 cursor-pointer transition-all border-b border-gray-100 ${active ? "bg-green-50/50 border-r-4 border-r-green-500" : "hover:bg-gray-50"
        }`}
    >
      <div className="flex justify-between items-start mb-1">
        <h4 className="font-bold text-gray-900 truncate flex-1">{b.serviceId?.name || "Service Chat"}</h4>
        <span className="text-[9px] font-black text-gray-400 ml-2 uppercase tracking-tighter">
          {b.status}
        </span>
      </div>
      <div className="flex items-center gap-2 mb-2 text-xs text-gray-500 font-medium">
        <span className="truncate">{b.customerId?.name || "Customer"}</span>
        <span>•</span>
        <span className="truncate">{b.workerId?.name || "Worker"}</span>
      </div>
      {lastMsg && (
        <p className="text-xs text-gray-400 line-clamp-1 italic">
          "{lastMsg.text}"
        </p>
      )}
    </div>
  );
};

export default function Chats() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchBookings();
    const interval = setInterval(fetchBookings, 10000); // Fresh data every 10s
    return () => clearInterval(interval);
  }, []);

  const fetchBookings = () => {
    fetch("http://localhost:5000/api/admin/bookings")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setBookings(data.bookings);
          if (selectedBooking) {
            const updated = data.bookings.find((b: any) => b._id === selectedBooking._id);
            if (updated) setSelectedBooking(updated);
          }
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching chats:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedBooking]);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 md:ml-64 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="p-8 pb-4">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Chat Monitor</h1>
          <p className="text-gray-500 mt-1 font-medium">Real-time surveillance of platform communications</p>
        </header>

        <div className="flex-1 flex overflow-hidden p-8 pt-4 gap-8">
          {/* List Pane */}
          <div className="w-80 bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-100 font-black text-[10px] uppercase tracking-widest text-gray-400">
              Active Conversations
            </div>
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center animate-pulse text-gray-300">Loading...</div>
              ) : bookings.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-sm">No chats found.</div>
              ) : (
                bookings.map(b => (
                  <ChatListItem
                    key={b._id}
                    b={b}
                    active={selectedBooking?._id === b._id}
                    onClick={() => setSelectedBooking(b)}
                  />
                ))
              )}
            </div>
          </div>

          {/* Chat Pane */}
          <div className="flex-1 bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden flex flex-col relative">
            {selectedBooking ? (
              <>
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                  <div>
                    <h3 className="font-bold text-gray-900">{selectedBooking.serviceId?.name}</h3>
                    <p className="text-xs text-gray-500 font-medium">
                      {selectedBooking.customerId?.name} (Customer) & {selectedBooking.workerId?.name} (Worker)
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="bg-white px-3 py-1 rounded-lg border border-gray-200 text-[10px] font-black uppercase text-gray-400 shadow-sm">
                      ID: {selectedBooking._id.slice(-6)}
                    </span>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-opacity-5">
                  {selectedBooking.chatMessages?.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center opacity-30 italic">
                      <span className="text-4xl mb-4">🤐</span>
                      <p>No messages exchanged yet.</p>
                    </div>
                  ) : (
                    selectedBooking.chatMessages.map((msg: any, i: number) => {
                      const isCustomer = msg.senderId === selectedBooking.customerId?._id;
                      return (
                        <div key={i} className={`flex flex-col ${isCustomer ? "items-start" : "items-end"}`}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-tight">
                              {isCustomer ? selectedBooking.customerId?.name : selectedBooking.workerId?.name}
                            </span>
                            <span className="text-[9px] text-gray-300">
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <div className={`max-w-[80%] p-4 rounded-2xl shadow-sm text-sm leading-relaxed ${isCustomer
                              ? "bg-gray-100 text-gray-800 rounded-tl-none"
                              : "bg-green-500 text-white rounded-tr-none"
                            }`}>
                            {msg.text}
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={chatEndRef} />
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-12 opacity-30 grayscale">
                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                  <span className="text-5xl">💬</span>
                </div>
                <h3 className="text-xl font-black text-gray-900 tracking-tight">Select a conversation</h3>
                <p className="max-w-xs mx-auto text-sm mt-2">Pick a chat from the left pane to monitor the messages between the customer and provider.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
