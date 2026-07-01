"use client";

import React, { useState } from "react";
import { LayoutDashboard, Image, ImagePlay, Users, ChevronDown } from "lucide-react";

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState("Hero Section");

  const navItems = [
    { name: "Dashboard" },
    { name: "Hero Section"},
    { name: "News & Events", hasDropdown: true },
    { name: "Team"},
  ];

  // Dynamically renders completely clean, blank pages with headings
  const renderBlankPage = (title: string) => {
    return (
      <div className="w-full max-w-5xl bg-white rounded-xl border border-gray-100 p-8 shadow-xs min-h-[500px]">
        <h2 className="text-xl font-bold text-gray-800 border-b pb-4 mb-4">{title} Workspace</h2>
        <p className="text-gray-400 text-sm italic">This is a clean, blank page container. Start adding your {title} specific components or forms here.</p>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case "Dashboard":
        return renderBlankPage("Dashboard");
      case "Hero Section":
        return renderBlankPage("Hero Section");
      case "News & Events":
        return renderBlankPage("News & Events");
      case "Team":
        return renderBlankPage("Team");
      default:
        return renderBlankPage("Hero Section");
    }
  };

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
            <div
              className="w-[68px] h-[68px] rounded-full overflow-hidden flex items-center justify-center bg-white shrink-0 relative"
            >
              <img
                src="/logo.png"
                alt="Logo"
                // Option A: Use "object-contain p-1" if your logo has text/details that shouldn't be cropped.
                // Option B: Change to "object-cover" if you want the image to completely fill out the circle.
                className="w-full h-full object-cover absolute inset-0 m-auto"
                onError={(e) => {
                  e.currentTarget.src = "https://via.placeholder.com/68?text=Logo";
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
                  className={`w-full flex items-center justify-between py-3 px-6 text-left font-semibold text-sm transition-all relative ${isActive
                      ? "bg-white text-[#FB7820] rounded-l-full translate-x-1"
                      : "text-white hover:bg-[#e0ad10]"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    {/* {item.icon} */}
                    <span>{item.name}</span>
                  </div>
                  {item.hasDropdown && (
                    <ChevronDown size={16} className={isActive ? "text-[#FB7820]" : "text-white"} />
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
          <button className="w-full flex items-center gap-3 py-3 px-6 font-semibold text-white hover:bg-[#e0ad10] text-left">
            <img src="/logout-icon.png" alt="Logout" className="w-5 h-5 object-contain invert" onError={(e) => { e.currentTarget.style.display = 'none' }} />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* RIGHT SIDE MAIN MAIN VIEWPORTS */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-[#FDFBF7]">

        {/* HEADER SECTION */}
        <header className="w-full h-[72px] bg-white flex items-center justify-between px-10 border-b border-gray-200/80 shrink-0 sticky top-0 z-20 shadow-sm">
          <h1 className="text-[22px] font-semibold text-[#FB7820] leading-none tracking-normal">
            {activeTab}
          </h1>

          {/* Custom Extracted Image Utility Icons (30x30 Dimensions) */}
          <div className="flex items-center gap-[21px] h-[30px]">
            <button className="w-[30px] h-[30px] flex items-center justify-center hover:opacity-80 transition-opacity" title="Profile">
              <img src="/profile-icon.png" alt="Profile" className="w-[30px] h-[30px] object-contain" onError={(e) => { e.currentTarget.src = "https://via.placeholder.com/30?text=P" }} />
            </button>
            <button className="w-[30px] h-[30px] flex items-center justify-center hover:opacity-80 transition-opacity" title="Information">
              <img src="/info-icon.png" alt="Info" className="w-[30px] h-[30px] object-contain" onError={(e) => { e.currentTarget.src = "https://via.placeholder.com/30?text=I" }} />
            </button>
            <button className="w-[30px] h-[30px] flex items-center justify-center hover:opacity-80 transition-opacity" title="Logout Quicklink">
              <img src="/logout-icon.png" alt="Action" className="w-[30px] h-[30px] object-contain" onError={(e) => { e.currentTarget.src = "https://via.placeholder.com/30?text=L" }} />
            </button>
          </div>
        </header>

        {/* MAIN DISPLAY REGION */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto flex justify-center items-start">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}