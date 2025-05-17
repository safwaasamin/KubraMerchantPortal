import React from "react";
import { Bell, ShoppingBag, Truck, Home, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type NotificationType = "order" | "shipping" | "rental" | "delivery" | "system";

interface NotificationProps {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  onClick?: () => void;
}

const NotificationIcon: React.FC<{ type: NotificationType }> = ({ type }) => {
  const iconClassName = "h-5 w-5 text-white";
  
  switch (type) {
    case "order":
      return <ShoppingBag className={iconClassName} />;
    case "shipping":
      return <Truck className={iconClassName} />;
    case "rental":
      return <Home className={iconClassName} />;
    case "delivery":
      return <Truck className={iconClassName} />;
    case "system":
    default:
      return <AlertCircle className={iconClassName} />;
  }
};

const Notification: React.FC<NotificationProps> = ({
  id,
  type,
  title,
  message,
  time,
  isRead,
  onClick,
}) => {
  return (
    <Card 
      className={cn(
        "hover:shadow-md transition-shadow cursor-pointer",
        isRead ? "bg-white" : "bg-primary-light/10"
      )}
      onClick={onClick}
    >
      <CardContent className="p-4 flex">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
            <NotificationIcon type={type} />
          </div>
        </div>
        <div className="ml-4 flex-1">
          <h3 className="font-medium text-gray-800">{title}</h3>
          <p className="text-gray-600">{message}</p>
        </div>
        <div className="text-sm text-gray-500">{time}</div>
      </CardContent>
    </Card>
  );
};

export default Notification;
