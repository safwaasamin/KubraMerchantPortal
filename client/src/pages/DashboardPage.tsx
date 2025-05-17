import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  ShoppingBag, 
  Package, 
  AlertCircle,
  ArrowRight,
  ChevronUp,
  ChevronDown
} from "lucide-react";
import { SalesSummary } from "@/components/sales/SalesSummary";
import { StatusBadge } from "@/components/ui/status-badge";
import { DashboardData, Order, Product } from "@/lib/types";
import { format } from "date-fns";

const DashboardPage: React.FC = () => {
  const [_, navigate] = useLocation();
  
  const { data, isLoading } = useQuery<DashboardData>({
    queryKey: ["/api/dashboard"],
  });

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-10 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-full mt-2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <>
      <h2 className="text-2xl font-bold tracking-tight mb-6">Dashboard</h2>
      
      <SalesSummary />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
        {/* Recent Orders */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Recent Orders</CardTitle>
            <CardDescription>
              You have {data?.recentOrders.length || 0} new orders
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {data?.recentOrders.slice(0, 3).map((order: Order) => (
              <div key={order.id} className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium">Order #{order.id}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(order.createdAt), "dd MMM yyyy")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">₹{order.totalAmount}</p>
                  <StatusBadge status={order.status} />
                </div>
              </div>
            ))}
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" onClick={() => navigate("/orders")}>
              View All Orders
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>

        {/* Low Stock Products */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Low Stock Products</CardTitle>
            <CardDescription>
              {data?.lowStockProducts.length || 0} products need restock
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {data?.lowStockProducts.slice(0, 3).map((product: Product) => (
              <div key={product.id} className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium">{product.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Category: {product.category || "Uncategorized"}
                  </p>
                </div>
                <div className="flex flex-col items-end">
                  <p className="text-sm font-medium">₹{product.price}</p>
                  <p className="text-xs text-red-500">Stock: {product.stock}</p>
                </div>
              </div>
            ))}
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" onClick={() => navigate("/products")}>
              Manage Products
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>

        {/* Statistics */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Performance</CardTitle>
            <CardDescription>Monthly comparison</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <ShoppingBag className="mr-2 h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium">Orders</p>
              </div>
              <div className="flex items-center">
                <p className="text-sm font-medium mr-2">
                  {data?.stats?.ordersChange.value}%
                </p>
                {data?.stats?.ordersChange.trend === "up" ? (
                  <ChevronUp className="h-4 w-4 text-green-500" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-red-500" />
                )}
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <TrendingUp className="mr-2 h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium">Revenue</p>
              </div>
              <div className="flex items-center">
                <p className="text-sm font-medium mr-2">
                  {data?.stats?.revenueChange.value}%
                </p>
                {data?.stats?.revenueChange.trend === "up" ? (
                  <ChevronUp className="h-4 w-4 text-green-500" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-red-500" />
                )}
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Package className="mr-2 h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium">Products</p>
              </div>
              <div className="flex items-center">
                <p className="text-sm font-medium mr-2">
                  {data?.stats?.productsChange.value}%
                </p>
                {data?.stats?.productsChange.trend === "up" ? (
                  <ChevronUp className="h-4 w-4 text-green-500" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-red-500" />
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" onClick={() => navigate("/sales")}>
              View Detailed Reports
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      {/* Alerts Section */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Alerts & Reminders</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {data?.alerts.map((alert, index) => (
            <Card key={index}>
              <CardContent className="p-4 flex items-start">
                <div className="mr-4 mt-1">
                  <AlertCircle className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <h4 className="font-medium">{alert.title}</h4>
                  <p className="text-sm text-gray-600">{alert.message}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
};

export default DashboardPage;
