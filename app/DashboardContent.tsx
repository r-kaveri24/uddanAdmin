"use client";

import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Users, IndianRupee, MessageSquareQuote, Loader2, LogOut  } from "lucide-react";
import { supabase } from "../lib/supabase"; // Import your Supabase client

type TimeFilter = "daily" | "monthly" | "yearly";

interface GraphDataPoint {
  label: string;
  visits: number;
}

export default function DashboardContent() {
  const [filter, setFilter] = useState<TimeFilter>("daily");
  const [loading, setLoading] = useState<boolean>(true);
  
  // Real dynamic counts from database
  const [graphData, setGraphData] = useState<GraphDataPoint[]>([]);
  const [donationCount, setDonationCount] = useState<number>(0);
  const [contactCount, setContactCount] = useState<number>(0);

  useEffect(() => {
    fetchDashboardMetrics();
  }, [filter]);

  const fetchDashboardMetrics = async () => {
    setLoading(true);

    try {
      // 1. Calculate Date Range based on selected Filter
      const now = new Date();
      const startDate = new Date();

      if (filter === "daily") {
        startDate.setDate(now.getDate() - 7); // Last 7 days
      } else if (filter === "monthly") {
        startDate.setMonth(now.getMonth() - 6); // Last 6 months
      } else if (filter === "yearly") {
        startDate.setFullYear(now.getFullYear() - 5); // Last 5 years
      }

      const isoStartDate = startDate.toISOString();

      // 2. Fetch Actual Contact Submissions Count
      const { count: fetchedContactCount, error: contactErr } = await supabase
        .from("contact_submissions")
        .select("*", { count: "exact", head: true })
        .gte("created_at", isoStartDate);

      if (!contactErr && fetchedContactCount !== null) {
        setContactCount(fetchedContactCount);
      }

      // 3. Fetch Actual Donations Count
      const { count: fetchedDonationCount, error: donationErr } = await supabase
        .from("donations")
        .select("*", { count: "exact", head: true })
        .gte("created_at", isoStartDate);

      if (!donationErr && fetchedDonationCount !== null) {
        setDonationCount(fetchedDonationCount);
      }

      // 4. Fetch Traffic / Visits Data for Chart
      const { data: visitsData, error: visitsErr } = await supabase
        .from("page_views")
        .select("created_at")
        .gte("created_at", isoStartDate)
        .order("created_at", { ascending: true });

      if (!visitsErr && visitsData) {
        // Group raw timestamp records into daily/monthly/yearly chart points
        const processedGraphData = processVisitsForChart(visitsData, filter);
        setGraphData(processedGraphData);
      }
    } catch (error) {
      console.error("Error fetching live metrics:", error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to bucket raw database rows into aggregated chart points
  const processVisitsForChart = (
    rawData: { created_at: string }[],
    activeFilter: TimeFilter
  ): GraphDataPoint[] => {
    const countsMap: Record<string, number> = {};

    rawData.forEach((item) => {
      const date = new Date(item.created_at);
      let label = "";

      if (activeFilter === "daily") {
        label = date.toLocaleDateString("en-US", { weekday: "short" }); // e.g., Mon, Tue
      } else if (activeFilter === "monthly") {
        label = date.toLocaleDateString("en-US", { month: "short" }); // e.g., Jan, Feb
      } else {
        label = date.getFullYear().toString(); // e.g., 2024, 2025
      }

      countsMap[label] = (countsMap[label] || 0) + 1;
    });

    return Object.keys(countsMap).map((key) => ({
      label: key,
      visits: countsMap[key],
    }));
  };

  const totalVisits = graphData.reduce((acc, curr) => acc + curr.visits, 0);

  return (
    <div className="w-full max-w-5xl bg-white rounded-xl border border-gray-100 p-8 shadow-xs min-h-[500px] flex flex-col gap-8">
      {/* HEADER & FILTER CONTROLS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Users className="w-5 h-5 text-[#FB7820]" /> Visitor Analytics & Metrics
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Live database tracking for site traffic, donations, and form submissions.
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-1 bg-gray-100/80 p-1 rounded-xl w-fit">
          {(["daily", "monthly", "yearly"] as TimeFilter[]).map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all cursor-pointer ${
                filter === type
                  ? "bg-white text-[#FB7820] shadow-xs"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              {type === "daily" ? "Days" : type}
            </button>
          ))}
        </div>
      </div>

      {/* GLOBAL LOGOUT TRIGGER BUTTON */}
    <button
      onClick={() => window.dispatchEvent(new Event('open-logout-modal'))}
      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors cursor-pointer border border-red-200"
    >
      <LogOut className="w-4 h-4" />
      Log Out
    </button>

      {/* LINE GRAPH SECTION */}
      <div className="bg-[#FAF9F5] p-6 rounded-2xl border border-gray-100 relative">
        {loading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-xs flex items-center justify-center z-10 rounded-2xl">
            <Loader2 className="w-6 h-6 text-[#FB7820] animate-spin" />
          </div>
        )}

        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Total Traffic ({filter}):{" "}
            <strong className="text-gray-900 text-sm">
              {totalVisits.toLocaleString()}
            </strong>
          </span>
          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            ▲ Live Supabase Sync
          </span>
        </div>

        <div className="h-[280px] w-full">
          {graphData.length === 0 && !loading ? (
            <div className="h-full flex items-center justify-center text-xs text-gray-400">
              No page visit entries logged for this period.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={graphData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#6B7280", fontSize: 12 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#6B7280", fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: "12px",
                    border: "1px solid #E5E7EB",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="visits"
                  stroke="#FB7820"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#FB7820" }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* DYNAMIC METRIC CARDS CONNECTED TO DB */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Donation Count Card */}
        <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-200/60 flex items-center gap-4 transition-all hover:shadow-xs">
          <div className="p-3 bg-[#FBC212] text-white rounded-xl shadow-xs">
            <IndianRupee className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Donation Entries ({filter})
            </span>
            <h3 className="text-2xl font-bold text-gray-900">
              {loading ? "..." : donationCount.toLocaleString()}
            </h3>
          </div>
        </div>

        {/* Contact Form Submissions Count Card */}
        <div className="p-5 rounded-2xl bg-orange-50/50 border border-orange-200/60 flex items-center gap-4 transition-all hover:shadow-xs">
          <div className="p-3 bg-[#FB7820] text-white rounded-xl shadow-xs">
            <MessageSquareQuote className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Contact Form Submissions ({filter})
            </span>
            <h3 className="text-2xl font-bold text-gray-900">
              {loading ? "..." : contactCount.toLocaleString()}
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
}



// "use client";

// import React, { useState } from "react";
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   ResponsiveContainer,
// } from "recharts";
// import { Users, IndianRupee, MessageSquareQuote } from "lucide-react";

// // Types for data and time filter
// type TimeFilter = "daily" | "monthly" | "yearly";

// interface DataPoint {
//   label: string;
//   visits: number;
//   donations: number;
//   contactRequests: number;
// }

// // Dummy Datasets mapped to the three filters
// const dummyData: Record<TimeFilter, DataPoint[]> = {
//   daily: [
//     { label: "Mon", visits: 120, donations: 15, contactRequests: 8 },
//     { label: "Tue", visits: 230, donations: 28, contactRequests: 12 },
//     { label: "Wed", visits: 180, donations: 22, contactRequests: 10 },
//     { label: "Thu", visits: 310, donations: 45, contactRequests: 18 },
//     { label: "Fri", visits: 290, donations: 38, contactRequests: 15 },
//     { label: "Sat", visits: 420, donations: 60, contactRequests: 25 },
//     { label: "Sun", visits: 380, donations: 52, contactRequests: 20 },
//   ],
//   monthly: [
//     { label: "Jan", visits: 3200, donations: 410, contactRequests: 180 },
//     { label: "Feb", visits: 4100, donations: 520, contactRequests: 220 },
//     { label: "Mar", visits: 3800, donations: 480, contactRequests: 195 },
//     { label: "Apr", visits: 5400, donations: 730, contactRequests: 310 },
//     { label: "May", visits: 6200, donations: 890, contactRequests: 380 },
//     { label: "Jun", visits: 5900, donations: 810, contactRequests: 340 },
//   ],
//   yearly: [
//     { label: "2022", visits: 28000, donations: 3500, contactRequests: 1200 },
//     { label: "2023", visits: 45000, donations: 5800, contactRequests: 2100 },
//     { label: "2024", visits: 68000, donations: 8900, contactRequests: 3400 },
//     { label: "2025", visits: 92000, donations: 12400, contactRequests: 4800 },
//     { label: "2026", visits: 115000, donations: 16200, contactRequests: 6100 },
//   ],
// };

// export default function DashboardContent() {
//   const [filter, setFilter] = useState<TimeFilter>("daily");

//   const currentData = dummyData[filter];

//   // Dynamically calculate metrics based on the active time filter
//   const totalVisits = currentData.reduce((acc, curr) => acc + curr.visits, 0);
//   const totalDonations = currentData.reduce((acc, curr) => acc + curr.donations, 0);
//   const totalContactRequests = currentData.reduce(
//     (acc, curr) => acc + curr.contactRequests,
//     0
//   );

//   return (
//     <div className="w-full max-w-5xl bg-white rounded-xl border border-gray-100 p-8 shadow-xs min-h-[500px] flex flex-col gap-8">
//       {/* -----------------------------------------------------------------
//           1. HEADER & FILTER CONTROLS
//          ----------------------------------------------------------------- */}
//       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
//         <div>
//           <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
//             <Users className="w-5 h-5 text-[#FB7820]" /> Visitor Analytics & Metrics
//           </h2>
//           <p className="text-xs text-gray-400 mt-0.5">
//             Real-time visual tracking for user traffic, donations, and inquiries.
//           </p>
//         </div>

//         {/* Filter Buttons */}
//         <div className="flex items-center gap-1 bg-gray-100/80 p-1 rounded-xl w-fit">
//           {(["daily", "monthly", "yearly"] as TimeFilter[]).map((type) => (
//             <button
//               key={type}
//               onClick={() => setFilter(type)}
//               className={`px-4 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all cursor-pointer ${
//                 filter === type
//                   ? "bg-white text-[#FB7820] shadow-xs"
//                   : "text-gray-500 hover:text-gray-800"
//               }`}
//             >
//               {type === "daily" ? "Days" : type}
//             </button>
//           ))}
//         </div>
//       </div>

//       {/* -----------------------------------------------------------------
//           2. TRADING / LINE GRAPH SECTION
//          ----------------------------------------------------------------- */}
//       <div className="bg-[#FAF9F5] p-6 rounded-2xl border border-gray-100">
//         <div className="flex items-center justify-between mb-4">
//           <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
//             Total Traffic:{" "}
//             <strong className="text-gray-900 text-sm">
//               {totalVisits.toLocaleString()}
//             </strong>
//           </span>
//           <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
//             ▲ Active Analytics
//           </span>
//         </div>

//         <div className="h-[280px] w-full">
//           <ResponsiveContainer width="100%" height="100%">
//             <LineChart data={currentData}>
//               <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
//               <XAxis
//                 dataKey="label"
//                 tickLine={false}
//                 axisLine={false}
//                 tick={{ fill: "#6B7280", fontSize: 12 }}
//               />
//               <YAxis
//                 tickLine={false}
//                 axisLine={false}
//                 tick={{ fill: "#6B7280", fontSize: 12 }}
//               />
//               <Tooltip
//                 contentStyle={{
//                   backgroundColor: "#FFFFFF",
//                   borderRadius: "12px",
//                   border: "1px solid #E5E7EB",
//                   boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
//                 }}
//               />
//               <Line
//                 type="monotone"
//                 dataKey="visits"
//                 stroke="#FB7820"
//                 strokeWidth={3}
//                 dot={{ r: 4, fill: "#FB7820" }}
//                 activeDot={{ r: 7 }}
//               />
//             </LineChart>
//           </ResponsiveContainer>
//         </div>
//       </div>

//       {/* -----------------------------------------------------------------
//           3. DYNAMIC METRIC CARDS (DONATIONS & CONTACT US)
//          ----------------------------------------------------------------- */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//         {/* Donation Count Button/Card */}
//         <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-200/60 flex items-center gap-4 transition-all hover:shadow-xs">
//           <div className="p-3 bg-[#FBC212] text-white rounded-xl shadow-xs">
//             <IndianRupee className="w-6 h-6" />
//           </div>
//           <div>
//             <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
//               Donations Count ({filter})
//             </span>
//             <h3 className="text-2xl font-bold text-gray-900">
//               {totalDonations.toLocaleString()}
//             </h3>
//           </div>
//         </div>

//         {/* Contact Us Count Button/Card */}
//         <div className="p-5 rounded-2xl bg-orange-50/50 border border-orange-200/60 flex items-center gap-4 transition-all hover:shadow-xs">
//           <div className="p-3 bg-[#FB7820] text-white rounded-xl shadow-xs">
//             <MessageSquareQuote className="w-6 h-6" />
//           </div>
//           <div>
//             <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
//               Contact Form Inquiries ({filter})
//             </span>
//             <h3 className="text-2xl font-bold text-gray-900">
//               {totalContactRequests.toLocaleString()}
//             </h3>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }