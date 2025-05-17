import { OrderStatus } from "@/components/ui/status-badge";
import { NotificationType } from "@/components/Notification";

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl?: string;
  category?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: number;
  orderId: number;
  product: Product;
  productId: number;
  quantity: number;
  price: number;
}

export interface Order {
  id: number;
  merchantId: number;
  customerId: number;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  status: OrderStatus;
  totalAmount: number;
  paymentMethod: string;
  isPaid: boolean;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface Shop {
  id: number;
  merchantId: number;
  name: string;
  phone: string;
  address: string;
  bannerUrl?: string;
  logoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Rental {
  id: number;
  merchantId: number;
  shopId: number;
  shopName: string;
  amount: number;
  startDate: string;
  dueDate: string;
  isPaid: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MaintenanceRequest {
  id: number;
  merchantId: number;
  shopId: number;
  issueType: string;
  description: string;
  priority: "low" | "medium" | "high";
  status: "pending" | "in-progress" | "resolved";
  createdAt: string;
  updatedAt: string;
}

export interface SalesSummary {
  totalSale: number;
  orderCount: number;
  avgOrderValue: number;
}

export interface Notification {
  id: number;
  merchantId: number;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface StatChangeData {
  value: number;
  trend: "up" | "down";
}

export interface DashboardStats {
  ordersChange: StatChangeData;
  revenueChange: StatChangeData;
  productsChange: StatChangeData;
}

export interface DashboardAlert {
  title: string;
  message: string;
}

export interface DashboardData {
  recentOrders: Order[];
  lowStockProducts: Product[];
  upcomingRental?: Rental;
  stats: DashboardStats;
  alerts: DashboardAlert[];
}

export interface Merchant {
  id: number;
  username: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
}
