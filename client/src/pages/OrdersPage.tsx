import React, { useState } from "react";
import { OrderList } from "@/components/orders/OrderList";
import { OrderDetail } from "@/components/orders/OrderDetail";

const OrdersPage: React.FC = () => {
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  
  const handleViewOrder = (orderId: number) => {
    setSelectedOrderId(orderId);
  };
  
  const handleBackToList = () => {
    setSelectedOrderId(null);
  };

  return (
    <>
      {selectedOrderId ? (
        <OrderDetail orderId={selectedOrderId} onBack={handleBackToList} />
      ) : (
        <OrderList onViewOrder={handleViewOrder} />
      )}
    </>
  );
};

export default OrdersPage;
