"use client";

import React, { useState } from "react";
import { Bell, ChevronLeft, CheckCircle, Clock } from "lucide-react";

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  category?: string;
}

export default function NotificationsContent() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [selectedNotification, setSelectedNotification] =
    useState<NotificationItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const supabase = createClient();

  // Helper to format timestamps dynamically
  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  useEffect(() => {
    // 1. Fetch initial notifications from database
    const fetchNotifications = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching notifications:", error);
      } else if (data) {
        const mapped = data.map((item: any) => ({
          id: item.id.toString(),
          title: item.title,
          message: item.message,
          timestamp: item.created_at ? formatTimestamp(item.created_at) : "Just now",
          isRead: item.is_read ?? false,
          category: item.category || "General",
        }));
        setNotifications(mapped);
      }
      setLoading(false);
    };

    fetchNotifications();

    // 2. Subscribe to Real-time database updates
    const channel = supabase
      .channel("realtime-notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
        },
        (payload) => {
          const newNotif = payload.new;
          const newItem: NotificationItem = {
            id: newNotif.id.toString(),
            title: newNotif.title,
            message: newNotif.message,
            timestamp: newNotif.created_at
              ? formatTimestamp(newNotif.created_at)
              : "Just now",
            isRead: newNotif.is_read ?? false,
            category: newNotif.category || "General",
          };

          // Prepend new item to list
          setNotifications((prev) => [newItem, ...prev]);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notifications",
        },
        (payload) => {
          const updatedNotif = payload.new;
          setNotifications((prev) =>
            prev.map((item) =>
              item.id === updatedNotif.id.toString()
                ? { ...item, isRead: updatedNotif.is_read }
                : item
            )
          );
        }
      )
      .subscribe();

    // Clean up channel on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Handle Mark as Read in DB
  const handleMarkAsRead = async (id: string) => {
    // Optimistic UI update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id);

    if (error) {
      console.error("Failed to mark as read in Supabase:", error);
    }
  };

  const handleNotificationClick = (item: NotificationItem) => {
    if (!item.isRead) {
      handleMarkAsRead(item.id);
    }
    setSelectedNotification(item);
  };

  // ---------------------------------------------------------------------------
  // 1. DETAIL VIEW (Matches w-full max-w-5xl exactly)
  // ---------------------------------------------------------------------------
  if (selectedNotification) {
    return (
      <div className="w-full max-w-5xl bg-white rounded-xl border border-gray-100 p-8 shadow-xs min-h-[500px]">
        <button
          onClick={() => setSelectedNotification(null)}
          className="flex items-center gap-2 text-sm text-[#FB7820] font-semibold hover:underline mb-6 cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Notifications
        </button>

        <div className="border-b border-gray-100 pb-4 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-semibold rounded-full">
              {selectedNotification.category || "General"}
            </span>
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {selectedNotification.timestamp}
            </span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">
            {selectedNotification.title}
          </h2>
        </div>

        <div className="text-gray-600 leading-relaxed text-base">
          <p>{selectedNotification.message}</p>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // 2. LIST VIEW
  // ---------------------------------------------------------------------------
  return (
    <div className="w-full max-w-5xl bg-white rounded-xl border border-gray-100 p-8 shadow-xs min-h-[500px] flex flex-col">
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-gray-100 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-50 rounded-lg text-[#FB7820]">
            <Bell className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-gray-800">Notifications</h2>
        </div>
        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          {notifications.filter((n) => !n.isRead).length} unread
        </span>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-3 max-h-[500px]">
        {loading ? (
          <div className="text-center py-16 text-gray-400">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            No notifications available.
          </div>
        ) : (
          notifications.map((item) => (
            <div
              key={item.id}
              onClick={() => handleNotificationClick(item)}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-4 ${
                item.isRead
                  ? "bg-white border-gray-100 hover:border-gray-200"
                  : "bg-amber-50/40 border-amber-200 hover:bg-amber-50/80"
              }`}
            >
              <div className="mt-1">
                {item.isRead ? (
                  <CheckCircle className="w-4 h-4 text-gray-300" />
                ) : (
                  <span className="w-2.5 h-2.5 bg-[#FB7820] rounded-full block" />
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4
                    className={`text-sm font-semibold ${
                      item.isRead ? "text-gray-700" : "text-gray-900"
                    }`}
                  >
                    {item.title}
                  </h4>
                  <span className="text-xs text-gray-400">{item.timestamp}</span>
                </div>
                <p className="text-xs text-gray-500 line-clamp-2">
                  {item.message}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}