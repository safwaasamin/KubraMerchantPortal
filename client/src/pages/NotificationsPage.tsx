import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Notification, { NotificationType } from "@/components/Notification";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

interface NotificationData {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
}

const NotificationsPage: React.FC = () => {
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: notifications, isLoading } = useQuery<NotificationData[]>({
    queryKey: ["/api/notifications"],
  });
  
  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("PATCH", `/api/notifications/${id}`, { isRead: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
    onError: (error) => {
      toast({
        title: "Failed to mark notification as read",
        description: String(error),
        variant: "destructive",
      });
    },
  });
  
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/notifications/mark-all-read", {});
    },
    onSuccess: () => {
      toast({
        title: "All notifications marked as read",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
    onError: (error) => {
      toast({
        title: "Failed to mark all notifications as read",
        description: String(error),
        variant: "destructive",
      });
    },
  });

  const handleNotificationClick = (id: number) => {
    markAsReadMutation.mutate(id);
  };

  return (
    <>
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            className="mr-2 rounded-full bg-primary/10 text-primary" 
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-xl font-semibold text-gray-800">Notifications</h2>
        </div>
        
        {(notifications?.some(n => !n.isRead)) && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => markAllAsReadMutation.mutate()}
            disabled={markAllAsReadMutation.isPending}
          >
            {markAllAsReadMutation.isPending ? "Marking..." : "Mark all as read"}
          </Button>
        )}
      </div>
      
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm p-4 animate-pulse">
              <div className="flex">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="ml-4 flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="w-12 h-4 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      ) : notifications?.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <p className="text-gray-500">No notifications</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Unread Notifications */}
          {notifications?.some(n => !n.isRead) && (
            <>
              <h3 className="text-sm font-medium text-gray-500 mb-2">NEW</h3>
              {notifications
                ?.filter(n => !n.isRead)
                .map(notification => (
                  <Notification
                    key={notification.id}
                    {...notification}
                    onClick={() => handleNotificationClick(notification.id)}
                  />
                ))}
              
              <Separator className="my-4" />
            </>
          )}
          
          {/* Read Notifications */}
          {notifications?.some(n => n.isRead) && (
            <>
              <h3 className="text-sm font-medium text-gray-500 mb-2">EARLIER</h3>
              {notifications
                ?.filter(n => n.isRead)
                .map(notification => (
                  <Notification
                    key={notification.id}
                    {...notification}
                    onClick={() => {}}
                  />
                ))}
            </>
          )}
        </div>
      )}
    </>
  );
};

export default NotificationsPage;
