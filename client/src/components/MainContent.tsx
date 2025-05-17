import React, { useState } from "react";
import { useLocation } from "wouter";
import { Bell, Menu } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Sidebar from "./Sidebar";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";

interface MainContentProps {
  children: React.ReactNode;
}

interface Notification {
  id: number;
  isRead: boolean;
}

const pageLabels: Record<string, string> = {
  "/": "Dashboard",
  "/products": "Products",
  "/orders": "Orders",
  "/shop": "Shop",
  "/rental": "Rental Maintenance",
  "/sales": "Sales",
  "/notifications": "Notifications",
};

const MainContent: React.FC<MainContentProps> = ({ children }) => {
  const [location, navigate] = useLocation();
  
  // Check for notifications
  const { data: notifications } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
  });
  
  const unreadCount = notifications?.filter(n => !n.isRead).length || 0;
  
  // Get the current page title
  const pageTitle = pageLabels[location] || "Dashboard";

  return (
    <main className="flex-1 overflow-y-auto scrollbar-hide">
      {/* Top Navigation Bar */}
      <Card className="rounded-none border-x-0 border-t-0 shadow-sm">
        <div className="flex justify-between items-center p-4">
          <div className="flex items-center">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="mr-4 lg:hidden">
                  <Menu className="h-6 w-6 text-gray-600" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-64">
                <Sidebar />
              </SheetContent>
            </Sheet>
            <h1 className="text-xl font-semibold text-gray-800">{pageTitle}</h1>
          </div>
          
          {/* Notification Bell */}
          <Button
            variant="ghost"
            size="icon"
            className="relative p-2 text-primary hover:bg-primary-light rounded-full"
            onClick={() => navigate("/notifications")}
          >
            <Bell className="h-6 w-6" />
            {unreadCount > 0 && (
              <Badge variant="destructive" className="absolute top-1 right-1 w-2 h-2 p-0 rounded-full" />
            )}
          </Button>
        </div>
      </Card>

      {/* Page Content */}
      <div className="p-6">{children}</div>
    </main>
  );
};

export default MainContent;
