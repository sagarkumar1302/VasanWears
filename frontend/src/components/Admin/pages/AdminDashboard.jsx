import React, { useState } from "react";

import MainContent from "../MainContent";

const AdminDashboard = () => {
  // State to manage the sidebar's open/collapsed status
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Function to toggle the sidebar (this is where you'd integrate GSAP for smooth animation)
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
    // 💡 GSAP TIP: Use a GSAP timeline here to animate the 'w-72' to 'w-20' on the sidebar
    // and the 'ml-72' to 'ml-20' on the main content simultaneously.
  };

  return (
    <div>
      <MainContent />;
    </div>
  );
};

export default AdminDashboard;
