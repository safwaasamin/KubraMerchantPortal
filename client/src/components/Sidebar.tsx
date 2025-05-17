import React from "react";
import { Link, useLocation } from "wouter";
import { Home, Package, Store, Building, FileText, LogOut } from "lucide-react";
import { KubraLogo } from "@/assets/logo";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const Sidebar: React.FC = () => {
  const [location] = useLocation();
  const { toast } = useToast();
  
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/auth/logout", {});
    },
    onSuccess: () => {
      window.location.href = "/login";
    },
    onError: (error) => {
      toast({
        title: "Logout failed",
        description: String(error),
        variant: "destructive",
      });
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const navLinks = [
    { href: "/", label: "Home", icon: <Home className="h-5 w-5 mr-3" /> },
    { href: "/products", label: "Products", icon: <Package className="h-5 w-5 mr-3" /> },
    { href: "/shop", label: "Shop", icon: <Store className="h-5 w-5 mr-3" /> },
    { href: "/rental", label: "Rental", icon: <Building className="h-5 w-5 mr-3" /> },
    { href: "/orders", label: "Orders", icon: <FileText className="h-5 w-5 mr-3" /> },
  ];

  return (
    <aside className="bg-sidebar w-64 flex-shrink-0 h-full shadow-lg z-20">
      <div className="p-5">
        <div className="flex items-center mb-8">
          <div className="text-primary font-bold text-xl">
            <KubraLogo />
          </div>
        </div>

        <nav className="space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`sidebar-nav-link group ${
                (location === link.href || 
                (link.href !== "/" && location.startsWith(link.href)))
                  ? "active"
                  : ""
              }`}
            >
              {link.icon}
              <span>{link.label}</span>
            </Link>
          ))}
          
          <div className="pt-6 mt-6 border-t border-sidebar-border">
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-3 text-gray-600 rounded-lg hover:bg-red-100 hover:text-red-700 transition-colors w-full"
            >
              <LogOut className="h-5 w-5 mr-3" />
              <span>Logout</span>
            </button>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
