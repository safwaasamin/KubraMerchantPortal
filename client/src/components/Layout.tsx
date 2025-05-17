import React from "react";
import Sidebar from "./Sidebar";
import MainContent from "./MainContent";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <MainContent>{children}</MainContent>
    </div>
  );
};

export default Layout;
