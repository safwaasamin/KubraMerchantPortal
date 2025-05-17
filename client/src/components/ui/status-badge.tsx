import React from "react";
import { cn } from "@/lib/utils";

export type OrderStatus = "new" | "accepted" | "processing" | "delivered" | "cancelled";

interface StatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

const statusConfig: Record<OrderStatus, { label: string, className: string }> = {
  new: { 
    label: "New", 
    className: "bg-blue-100 text-blue-800" 
  },
  accepted: { 
    label: "Accepted", 
    className: "bg-purple-100 text-purple-800" 
  },
  processing: { 
    label: "Processing", 
    className: "bg-yellow-100 text-yellow-800" 
  },
  delivered: { 
    label: "Delivered", 
    className: "bg-green-100 text-green-800" 
  },
  cancelled: { 
    label: "Cancelled", 
    className: "bg-red-100 text-red-800" 
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const config = statusConfig[status] || statusConfig.new;
  
  return (
    <span 
      className={cn(
        "px-2 py-1 text-xs font-semibold rounded-full", 
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
};
