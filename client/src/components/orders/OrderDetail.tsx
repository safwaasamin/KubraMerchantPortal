import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { ArrowLeft, Download } from "lucide-react";
import { StatusBadge, OrderStatus } from "@/components/ui/status-badge";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Order, OrderItem } from "@/lib/types";
import { format } from "date-fns";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";

interface OrderDetailProps {
  orderId: number;
  onBack: () => void;
}

export const OrderDetail: React.FC<OrderDetailProps> = ({ orderId, onBack }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<OrderStatus | "">("");
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  
  const { data: order, isLoading } = useQuery<Order>({
    queryKey: [`/api/orders/${orderId}`],
  });
  
  const updateStatusMutation = useMutation({
    mutationFn: async () => {
      if (!status) throw new Error("Please select a status");
      await apiRequest("PATCH", `/api/orders/${orderId}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/orders/${orderId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      setSuccessModalOpen(true);
    },
    onError: (error) => {
      toast({
        title: "Failed to update order status",
        description: String(error),
        variant: "destructive",
      });
    },
  });

  if (isLoading || !order) {
    return (
      <div className="text-center py-10">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="mt-2 text-gray-500">Loading order details...</p>
      </div>
    );
  }

  const handleStatusChange = (value: string) => {
    setStatus(value as OrderStatus);
  };

  const handleUpdateStatus = () => {
    setConfirmModalOpen(false);
    updateStatusMutation.mutate();
  };

  return (
    <>
      <div className="mb-5 flex items-center">
        <Button 
          variant="ghost" 
          size="icon" 
          className="mr-2 rounded-full bg-primary/10 text-primary" 
          onClick={onBack}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-xl font-semibold text-gray-800">Order Summary</h2>
      </div>

      <Card className="mb-6">
        <CardContent className="p-6 grid grid-cols-2 gap-4">
          <div className="col-span-2 sm:col-span-1">
            <div className="text-sm text-gray-500">Order ID</div>
            <div className="font-medium text-primary">#{order.id}</div>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <div className="text-sm text-gray-500">Date</div>
            <div>{format(new Date(order.createdAt), "dd MMM yyyy | h:mm a")}</div>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <div className="text-sm text-gray-500">Total Price</div>
            <div className="font-medium">₹ {order.totalAmount}</div>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <div className="text-sm text-gray-500">Total Products</div>
            <div>{order.items.length}</div>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <div className="text-sm text-gray-500">Payment Method</div>
            <div>{order.paymentMethod}</div>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <div className="text-sm text-gray-500">Current Status</div>
            <div className="mt-1">
              <StatusBadge status={order.status} />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4 mb-6">
        {order.items.map((item: OrderItem) => (
          <Card key={item.id}>
            <CardContent className="p-4 flex items-center">
              {item.product.imageUrl ? (
                <img
                  src={item.product.imageUrl}
                  alt={item.product.name}
                  className="w-20 h-20 object-cover rounded-md"
                />
              ) : (
                <div className="w-20 h-20 bg-gray-200 rounded-md flex items-center justify-center">
                  <span className="text-gray-400">No image</span>
                </div>
              )}
              <div className="ml-4 flex-1">
                <h3 className="font-medium text-gray-800">{item.product.name}</h3>
                <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
              </div>
              <div className="font-semibold text-primary">₹ {item.price}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6">
        <div className="mb-3 text-gray-700">Update Order Status</div>
        <div className="mb-4">
          <Select onValueChange={handleStatusChange} value={status}>
            <SelectTrigger className="w-full p-3">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-3">
          <Button 
            className="w-full"
            disabled={!status || updateStatusMutation.isPending}
            onClick={() => setConfirmModalOpen(true)}
          >
            {updateStatusMutation.isPending ? "Updating..." : "Update"}
          </Button>
          
          <Button variant="outline" className="w-full" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Button>
          
          <Button variant="outline" className="w-full" onClick={() => {}}>
            <Download className="mr-2 h-4 w-4" />
            Download Invoice
          </Button>
        </div>
      </div>
      
      {/* Confirmation Modal */}
      <ConfirmationModal
        open={confirmModalOpen}
        onOpenChange={setConfirmModalOpen}
        title="Update Order Status"
        description={`Are you sure you want to change the order status to ${status}?`}
        confirmText="Update"
        onConfirm={handleUpdateStatus}
      />
      
      {/* Success Modal */}
      <ConfirmationModal
        open={successModalOpen}
        onOpenChange={setSuccessModalOpen}
        title="Order Status Updated"
        description="The order status has been successfully updated."
        onConfirm={() => setSuccessModalOpen(false)}
        isSuccess
      />
    </>
  );
};
