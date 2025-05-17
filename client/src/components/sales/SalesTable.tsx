import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Order } from "@/lib/types";
import { format } from "date-fns";

export const SalesTable: React.FC = () => {
  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ["/api/sales/orders"],
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Order Break Down</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center p-10">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </CardContent>
      </Card>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Order Break Down</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center py-10 text-gray-500">No orders found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Break Down</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Order status</TableHead>
                <TableHead>Total Price</TableHead>
                <TableHead>Total Product</TableHead>
                <TableHead>Payment Method</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">#{order.id}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {format(new Date(order.createdAt), "dd MMM yyyy")}
                      <br />
                      {format(new Date(order.createdAt), "hh:mm a")}
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={order.status} />
                  </TableCell>
                  <TableCell>₹ {order.totalAmount}</TableCell>
                  <TableCell>{order.items.length}</TableCell>
                  <TableCell>{order.paymentMethod}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
