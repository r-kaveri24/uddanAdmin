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

export const initialNotifications: NotificationItem[] = [
  {
    id: "1",
    title: "New Banner Uploaded",
    message: "A new hero section banner image was uploaded by Admin.",
    timestamp: "10 mins ago",
    isRead: false,
    category: "Hero Section",
  },
  {
    id: "2",
    title: "System Update Complete",
    message: "The backend donation tracking system has been updated successfully.",
    timestamp: "1 hour ago",
    isRead: false,
    category: "System",
  },
  {
    id: "3",
    title: "New Team Member Added",
    message: "A new member profile was added to the Truddan Foundation team tab.",
    timestamp: "Yesterday",
    isRead: true,
    category: "Team",
  },
  {
    id: "4",
    title: "Database Backup Completed",
    message: "Routine automated database backup completed without errors.",
    timestamp: "2 days ago",
    isRead: true,
    category: "Database",
  },
  {
    id: "5",
    title: "Event Registered",
    message: "A new upcoming community drive was published under News & Events.",
    timestamp: "3 days ago",
    isRead: true,
    category: "News & Events",
  },
];

interface NotificationsContentProps {
  notifications: NotificationItem[];
  onMarkAsRead: (id: string) => void;
}

export default function NotificationsContent({
  notifications,
  onMarkAsRead,
}: NotificationsContentProps) {
  const [selectedNotification, setSelectedNotification] =
    useState<NotificationItem | null>(null);

  const handleNotificationClick = (item: NotificationItem) => {
    if (!item.isRead) {
      onMarkAsRead(item.id);
    }
    setSelectedNotification(item);
  };

  // ---------------------------------------------------------------------------
  // 1. DETAIL VIEW (Matches w-full max-w-5xl exactly)
  // ---------------------------------------------------------------------------
  if (selectedNotification) {
    return (
      <div className="w-full max-w-5xl bg-white rounded-xl border border-gray-100 p-8 shadow-xs min-h-[500px]">
        {/* Back Button */}
        <button
          onClick={() => setSelectedNotification(null)}
          className="flex items-center gap-2 text-sm text-[#FB7820] font-semibold hover:underline mb-6 cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Notifications
        </button>

        {/* Header Metadata */}
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

        {/* Main Body */}
        <div className="text-gray-600 leading-relaxed text-base">
          <p>{selectedNotification.message}</p>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // 2. LIST VIEW (Matches w-full max-w-5xl exactly)
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

      {/* Scrollable Container */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-3 max-h-[500px]">
        {notifications.length === 0 ? (
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