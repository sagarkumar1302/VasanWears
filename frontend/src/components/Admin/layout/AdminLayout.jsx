import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";
import AdminHeader from "../components/AdminHeader";

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      
      {/* MOBILE OVERLAY */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <AdminSidebar
        isOpen={isSidebarOpen}
        isMobileOpen={isMobileSidebarOpen}
        closeMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* MAIN AREA */}
      <div
        className={`flex flex-col flex-1 transition-all duration-300
          ${isSidebarOpen ? "lg:ml-72" : "lg:ml-20"}
        `}
      >
        <AdminHeader
          toggleSidebar={toggleSidebar}
          openMobileSidebar={() => setIsMobileSidebarOpen(true)}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet /> {/* 👈 ROUTED CONTENT LOADS HERE */}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
