<<<<<<< Updated upstream
export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <h1 className="text-4xl font-bold">Uddan Admin Panel</h1>
        <p className="text-xl">Welcome to the admin panel. Your project structure is ready!</p>
      </main>
=======
"use client";

import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";
import HeroSectionContent from "./heroSectionContent";
import ProfileContent from "./ProfileContent";
import NotificationsContent, {
  initialNotifications,
  NotificationItem,
} from "./NotificationsContent";
import DashboardContent from "./DashboardContent";

import React, { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import NewsContent from "./NewsContent";

export default function AdminPanel() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Dashboard");

  useEffect(() => {
  const checkAuth = async () => {
   
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      router.replace("/login"); 
    } else {
      setLoading(false); 
    }
  };

  checkAuth();
}, [router]);
  
  // Notification State Management
  const [notifications, setNotifications] =
    useState<NotificationItem[]>(initialNotifications);

 const handleLogout = async () => {
  await supabase.auth.signOut();
  router.replace("/login");
};

  // Calculate unread badge counter
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isRead: true } : item))
    );
  };

  const navItems = [
    { name: "Dashboard" },
    { name: "Hero Section" },
    { name: "News & Events", hasDropdown: true },
    { name: "Team" },
  ];

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FDFBF7]">
        <p className="text-lg font-semibold text-gray-700">Loading...</p>
      </div>
    );
  }
  // Dynamically renders completely clean, blank pages with headings
  const renderBlankPage = (title: string) => {
    return (
      <div className="w-full max-w-5xl bg-white rounded-xl border border-gray-100 p-8 shadow-xs min-h-[500px]">
        <h2 className="text-xl font-bold text-gray-800 border-b pb-4 mb-4">
          {title} Workspace
        </h2>
        <p className="text-gray-400 text-sm italic">
          This is a clean, blank page container. Start adding your {title} specific
          components or forms here.
        </p>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case "Dashboard":
        return <DashboardContent/>;
      case "Hero Section":
        return <HeroSectionContent />;
      case "Profile": 
        return <ProfileContent />;
      case "News & Events":
        return <NewsContent/>;
      case "Team":
        return renderBlankPage("Team");
      case "Notifications":
        return (
          <NotificationsContent
            notifications={notifications}
            onMarkAsRead={handleMarkAsRead}
          />
        );
      default:
        return <DashboardContent />;
    }
  };
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FDFBF7]">
        <p className="text-lg font-semibold text-gray-700">Loading...</p>
      </div>
    );
  }
  return (
    <div className="flex h-screen bg-[#FDFBF7] font-['Lato'] overflow-hidden">
      {/* LEFT SIDEBAR - Strict Full Height Layout */}
      <aside
        className="w-[240px] h-screen shrink-0 bg-[#FBC212] flex flex-col justify-between z-10 sticky top-0"
        style={{ boxShadow: "8px 0px 20px 0px #00000026" }}
      >
        {/* Top Section: Logo & Links */}
        <div className="w-full">
          {/* Logo Holding Section (Fixed Height: 72px) */}
          <div className="w-[240px] h-[72px] bg-white flex items-center justify-center border-b border-gray-100">
            <div className="w-[68px] h-[68px] rounded-full overflow-hidden flex items-center justify-center bg-white shrink-0 relative">
              <img
                src="/logo.png"
                alt="Logo"
                className="w-full h-full object-cover absolute inset-0 m-auto"
                onError={(e) => {
                  e.currentTarget.src =
                    "https://via.placeholder.com/68?text=Logo";
                  e.currentTarget.className = "w-full h-full object-contain p-1";
                }}
              />
            </div>
          </div>

          {/* Navigation Items Links */}
          <nav className="mt-8 flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.name;
              return (
                <button
                  key={item.name}
                  onClick={() => setActiveTab(item.name)}
                  className={`w-full flex items-center justify-between py-3 px-6 text-left font-semibold text-sm transition-all relative ${
                    isActive
                      ? "bg-white text-[#FB7820] rounded-l-full translate-x-1"
                      : "text-white hover:bg-[#e0ad10]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span>{item.name}</span>
                  </div>
                  {item.hasDropdown && (
                    <ChevronDown
                      size={16}
                      className={isActive ? "text-[#FB7820]" : "text-white"}
                    />
                  )}
                  {isActive && (
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FB7820] absolute right-4"></span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: Pinned Log Out Option */}
        <div className="mb-6 border-t border-[#e0ad10] pt-4">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 py-3 px-6 font-semibold text-white hover:bg-[#e0ad10] text-left">
            <img
              src="/logout-icon.png"
              alt="Logout"
              className="w-5 h-5 object-contain invert"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* RIGHT SIDE MAIN VIEWPORTS */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-[#FDFBF7]">
        {/* HEADER SECTION */}
        <header className="w-full h-[72px] bg-white flex items-center justify-between px-10 border-b border-gray-200/80 shrink-0 sticky top-0 z-20 shadow-sm">
          <h1 className="text-[22px] font-semibold text-[#FB7820] leading-none tracking-normal">
            {activeTab}
          </h1>

          {/* Custom Extracted Image Utility Icons (30x30 Dimensions) */}
          <div className="flex items-center gap-[21px] h-[30px]">
            <button
              onClick={() => setActiveTab("Profile")}
              className="w-[30px] h-[30px] flex items-center justify-center hover:opacity-80 transition-opacity"
              title="Profile"
            >
              <img
                src="/profile-icon.png"
                alt="Profile"
                className="w-[30px] h-[30px] object-contain"
                onError={(e) => {
                  e.currentTarget.src =
                    "https://via.placeholder.com/30?text=P";
                }}
              />
            </button>

            {/* Notifications Button (Info Icon with Badge Counter) */}
            <button
              onClick={() => setActiveTab("Notifications")}
              className="w-[30px] h-[30px] flex items-center justify-center hover:opacity-80 transition-opacity relative"
              title="Notifications"
            >
              <img
                src="/info-icon.png"
                alt="Info"
                className="w-[30px] h-[30px] object-contain"
                onError={(e) => {
                  e.currentTarget.src =
                    "https://via.placeholder.com/30?text=I";
                }}
              />
              {/* Unread Badge Counter */}
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            <button
              onClick={handleLogout}
              className="w-[30px] h-[30px] flex items-center justify-center hover:opacity-80 transition-opacity"
              title="Logout Quicklink"
            >
              <img
                src="/logout-icon.png"
                alt="Action"
                className="w-[30px] h-[30px] object-contain"
                onError={(e) => {
                  e.currentTarget.src =
                    "https://via.placeholder.com/30?text=L";
                }}
              />
            </button>
          </div>
        </header>

        {/* MAIN DISPLAY REGION */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto flex justify-center items-start">
          {renderContent()}
        </main>
      </div>
>>>>>>> Stashed changes
    </div>
  );
}
