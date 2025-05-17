import { 
  merchants,
  shops,
  products,
  customers,
  orders,
  orderItems,
  rentals,
  maintenanceRequests,
  notifications,
  type Merchant,
  type Shop,
  type Product,
  type Customer,
  type Order,
  type OrderItem,
  type Rental,
  type MaintenanceRequest,
  type Notification,
  type InsertMerchant,
  type InsertShop,
  type InsertProduct,
  type InsertCustomer,
  type InsertOrder,
  type InsertOrderItem,
  type InsertRental,
  type InsertMaintenanceRequest,
  type InsertNotification,
  type UpdateProduct,
  type UpdateOrder,
  type UpdateShop,
  type UpdateNotification,
  type UpdateMaintenanceRequest
} from "@shared/schema";

import { db } from "./db";
import { eq, and, gt, lt, desc, asc, sql, count, sum, avg } from "drizzle-orm";
import bcrypt from "bcrypt";

// Storage interface for all CRUD operations
export interface IStorage {
  // Merchant/Auth methods
  getMerchant(id: number): Promise<Merchant | undefined>;
  getMerchantByUsername(username: string): Promise<Merchant | undefined>;
  createMerchant(merchant: InsertMerchant): Promise<Merchant>;
  validateMerchantCredentials(username: string, password: string): Promise<Merchant | undefined>;
  
  // Shop methods
  getShop(id: number): Promise<Shop | undefined>;
  getShopByMerchantId(merchantId: number): Promise<Shop | undefined>;
  createShop(shop: InsertShop): Promise<Shop>;
  updateShop(id: number, updates: UpdateShop): Promise<Shop>;
  
  // Product methods
  getProduct(id: number): Promise<Product | undefined>;
  getProductsByMerchantId(merchantId: number): Promise<Product[]>;
  getLowStockProducts(merchantId: number, threshold?: number): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, updates: UpdateProduct): Promise<Product>;
  deleteProduct(id: number): Promise<boolean>;
  
  // Order methods
  getOrder(id: number): Promise<Order | undefined>;
  getOrdersByMerchantId(merchantId: number, page?: number, pageSize?: number): Promise<{orders: Order[], total: number}>;
  getRecentOrders(merchantId: number, limit?: number): Promise<Order[]>;
  createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order>;
  
  // Order item methods
  getOrderItems(orderId: number): Promise<OrderItem[]>;
  getOrderItemWithProduct(orderItemId: number): Promise<{orderItem: OrderItem, product: Product} | undefined>;
  
  // Rental methods
  getRental(id: number): Promise<Rental | undefined>;
  getRentalsByMerchantId(merchantId: number): Promise<Rental[]>;
  getCurrentRental(merchantId: number): Promise<Rental | undefined>;
  createRental(rental: InsertRental): Promise<Rental>;
  updateRentalPaymentStatus(id: number, isPaid: boolean): Promise<Rental>;
  
  // Maintenance Request methods
  getMaintenanceRequest(id: number): Promise<MaintenanceRequest | undefined>;
  getMaintenanceRequestsByMerchantId(merchantId: number): Promise<MaintenanceRequest[]>;
  createMaintenanceRequest(request: InsertMaintenanceRequest): Promise<MaintenanceRequest>;
  updateMaintenanceRequestStatus(id: number, status: string): Promise<MaintenanceRequest>;
  
  // Notification methods
  getNotification(id: number): Promise<Notification | undefined>;
  getNotificationsByMerchantId(merchantId: number): Promise<Notification[]>;
  getUnreadNotificationsCount(merchantId: number): Promise<number>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: number): Promise<Notification>;
  markAllNotificationsAsRead(merchantId: number): Promise<void>;
  
  // Sales and dashboard methods
  getSalesSummary(merchantId: number): Promise<{totalSale: number, orderCount: number, avgOrderValue: number}>;
  getSalesOrders(merchantId: number, limit?: number): Promise<Order[]>;
  getDashboardStats(merchantId: number): Promise<any>;
}

// Database implementation of the storage interface
export class DatabaseStorage implements IStorage {
  // Merchant/Auth methods
  async getMerchant(id: number): Promise<Merchant | undefined> {
    const [merchant] = await db.select().from(merchants).where(eq(merchants.id, id));
    return merchant;
  }

  async getMerchantByUsername(username: string): Promise<Merchant | undefined> {
    const [merchant] = await db.select().from(merchants).where(eq(merchants.username, username));
    return merchant;
  }

  async createMerchant(data: InsertMerchant): Promise<Merchant> {
    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);
    
    const [merchant] = await db
      .insert(merchants)
      .values({
        ...data,
        password: hashedPassword
      })
      .returning();
    
    return merchant;
  }

  async validateMerchantCredentials(username: string, password: string): Promise<Merchant | undefined> {
    const merchant = await this.getMerchantByUsername(username);
    if (!merchant) return undefined;
    
    const isPasswordValid = await bcrypt.compare(password, merchant.password);
    if (!isPasswordValid) return undefined;
    
    return merchant;
  }

  // Shop methods
  async getShop(id: number): Promise<Shop | undefined> {
    const [shop] = await db.select().from(shops).where(eq(shops.id, id));
    return shop;
  }

  async getShopByMerchantId(merchantId: number): Promise<Shop | undefined> {
    const [shop] = await db.select().from(shops).where(eq(shops.merchantId, merchantId));
    return shop;
  }

  async createShop(shop: InsertShop): Promise<Shop> {
    const [newShop] = await db
      .insert(shops)
      .values(shop)
      .returning();
    
    return newShop;
  }

  async updateShop(id: number, updates: UpdateShop): Promise<Shop> {
    const [updatedShop] = await db
      .update(shops)
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(eq(shops.id, id))
      .returning();
    
    return updatedShop;
  }

  // Product methods
  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async getProductsByMerchantId(merchantId: number): Promise<Product[]> {
    return await db
      .select()
      .from(products)
      .where(eq(products.merchantId, merchantId))
      .orderBy(desc(products.updatedAt));
  }

  async getLowStockProducts(merchantId: number, threshold: number = 10): Promise<Product[]> {
    return await db
      .select()
      .from(products)
      .where(and(
        eq(products.merchantId, merchantId),
        lt(products.stock, threshold)
      ))
      .orderBy(asc(products.stock));
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db
      .insert(products)
      .values(product)
      .returning();
    
    return newProduct;
  }

  async updateProduct(id: number, updates: UpdateProduct): Promise<Product> {
    const [updatedProduct] = await db
      .update(products)
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(eq(products.id, id))
      .returning();
    
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<boolean> {
    const result = await db
      .delete(products)
      .where(eq(products.id, id))
      .returning({ id: products.id });
    
    return result.length > 0;
  }

  // Order methods
  async getOrder(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }

  async getOrdersByMerchantId(merchantId: number, page: number = 1, pageSize: number = 10): Promise<{orders: Order[], total: number}> {
    const offset = (page - 1) * pageSize;
    
    const ordersList = await db
      .select()
      .from(orders)
      .where(eq(orders.merchantId, merchantId))
      .orderBy(desc(orders.createdAt))
      .limit(pageSize)
      .offset(offset);
    
    const [{ value: total }] = await db
      .select({ value: count() })
      .from(orders)
      .where(eq(orders.merchantId, merchantId));
    
    return { orders: ordersList, total };
  }

  async getRecentOrders(merchantId: number, limit: number = 5): Promise<Order[]> {
    return await db
      .select()
      .from(orders)
      .where(eq(orders.merchantId, merchantId))
      .orderBy(desc(orders.createdAt))
      .limit(limit);
  }

  async createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order> {
    let createdOrder: Order;
    
    // Transaction to create order and items
    const result = await db.transaction(async (tx) => {
      // Create order
      const [newOrder] = await tx
        .insert(orders)
        .values(order)
        .returning();
      
      // Create order items
      for (const item of items) {
        await tx
          .insert(orderItems)
          .values({
            ...item,
            orderId: newOrder.id
          });
        
        // Update product stock
        await tx
          .update(products)
          .set({
            stock: sql`${products.stock} - ${item.quantity}`,
            updatedAt: new Date()
          })
          .where(eq(products.id, item.productId));
      }
      
      return newOrder;
    });
    
    createdOrder = result;
    
    return createdOrder;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order> {
    const [updatedOrder] = await db
      .update(orders)
      .set({
        status,
        updatedAt: new Date()
      })
      .where(eq(orders.id, id))
      .returning();
    
    return updatedOrder;
  }

  // Order item methods
  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, orderId));
  }

  async getOrderItemWithProduct(orderItemId: number): Promise<{orderItem: OrderItem, product: Product} | undefined> {
    const result = await db
      .select({
        orderItem: orderItems,
        product: products
      })
      .from(orderItems)
      .innerJoin(products, eq(orderItems.productId, products.id))
      .where(eq(orderItems.id, orderItemId));
    
    if (result.length === 0) return undefined;
    return result[0];
  }

  // Rental methods
  async getRental(id: number): Promise<Rental | undefined> {
    const [rental] = await db.select().from(rentals).where(eq(rentals.id, id));
    return rental;
  }

  async getRentalsByMerchantId(merchantId: number): Promise<Rental[]> {
    return await db
      .select()
      .from(rentals)
      .where(eq(rentals.merchantId, merchantId))
      .orderBy(asc(rentals.dueDate));
  }

  async getCurrentRental(merchantId: number): Promise<Rental | undefined> {
    const [rental] = await db
      .select()
      .from(rentals)
      .where(and(
        eq(rentals.merchantId, merchantId),
        gt(rentals.dueDate, new Date()),
        eq(rentals.isPaid, false)
      ))
      .orderBy(asc(rentals.dueDate))
      .limit(1);
    
    return rental;
  }

  async createRental(rental: InsertRental): Promise<Rental> {
    const [newRental] = await db
      .insert(rentals)
      .values(rental)
      .returning();
    
    return newRental;
  }

  async updateRentalPaymentStatus(id: number, isPaid: boolean): Promise<Rental> {
    const [updatedRental] = await db
      .update(rentals)
      .set({
        isPaid,
        updatedAt: new Date()
      })
      .where(eq(rentals.id, id))
      .returning();
    
    return updatedRental;
  }

  // Maintenance Request methods
  async getMaintenanceRequest(id: number): Promise<MaintenanceRequest | undefined> {
    const [request] = await db.select().from(maintenanceRequests).where(eq(maintenanceRequests.id, id));
    return request;
  }

  async getMaintenanceRequestsByMerchantId(merchantId: number): Promise<MaintenanceRequest[]> {
    return await db
      .select()
      .from(maintenanceRequests)
      .where(eq(maintenanceRequests.merchantId, merchantId))
      .orderBy(desc(maintenanceRequests.createdAt));
  }

  async createMaintenanceRequest(request: InsertMaintenanceRequest): Promise<MaintenanceRequest> {
    const [newRequest] = await db
      .insert(maintenanceRequests)
      .values(request)
      .returning();
    
    return newRequest;
  }

  async updateMaintenanceRequestStatus(id: number, status: string): Promise<MaintenanceRequest> {
    const [updatedRequest] = await db
      .update(maintenanceRequests)
      .set({
        status,
        updatedAt: new Date()
      })
      .where(eq(maintenanceRequests.id, id))
      .returning();
    
    return updatedRequest;
  }

  // Notification methods
  async getNotification(id: number): Promise<Notification | undefined> {
    const [notification] = await db.select().from(notifications).where(eq(notifications.id, id));
    return notification;
  }

  async getNotificationsByMerchantId(merchantId: number): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.merchantId, merchantId))
      .orderBy(desc(notifications.createdAt));
  }

  async getUnreadNotificationsCount(merchantId: number): Promise<number> {
    const [{ value }] = await db
      .select({ value: count() })
      .from(notifications)
      .where(and(
        eq(notifications.merchantId, merchantId),
        eq(notifications.isRead, false)
      ));
    
    return value;
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [newNotification] = await db
      .insert(notifications)
      .values(notification)
      .returning();
    
    return newNotification;
  }

  async markNotificationAsRead(id: number): Promise<Notification> {
    const [updatedNotification] = await db
      .update(notifications)
      .set({
        isRead: true,
        updatedAt: new Date()
      })
      .where(eq(notifications.id, id))
      .returning();
    
    return updatedNotification;
  }

  async markAllNotificationsAsRead(merchantId: number): Promise<void> {
    await db
      .update(notifications)
      .set({
        isRead: true,
        updatedAt: new Date()
      })
      .where(and(
        eq(notifications.merchantId, merchantId),
        eq(notifications.isRead, false)
      ));
  }

  // Sales and dashboard methods
  async getSalesSummary(merchantId: number): Promise<{totalSale: number, orderCount: number, avgOrderValue: number}> {
    const [result] = await db
      .select({
        totalSale: sum(orders.totalAmount),
        orderCount: count(),
        avgOrderValue: avg(orders.totalAmount)
      })
      .from(orders)
      .where(eq(orders.merchantId, merchantId));
    
    return {
      totalSale: Number(result.totalSale || 0),
      orderCount: Number(result.orderCount || 0),
      avgOrderValue: Number(result.avgOrderValue || 0)
    };
  }

  async getSalesOrders(merchantId: number, limit: number = 10): Promise<Order[]> {
    return await db
      .select()
      .from(orders)
      .where(eq(orders.merchantId, merchantId))
      .orderBy(desc(orders.createdAt))
      .limit(limit);
  }

  async getDashboardStats(merchantId: number): Promise<any> {
    // Get orders stats
    const recentOrders = await this.getRecentOrders(merchantId, 5);
    const lowStockProducts = await this.getLowStockProducts(merchantId, 10);
    const upcomingRental = await this.getCurrentRental(merchantId);
    
    // Generate some trend stats (will need to be enhanced with real calculations)
    const stats = {
      ordersChange: { value: 15, trend: "up" as const },
      revenueChange: { value: 23, trend: "up" as const },
      productsChange: { value: 5, trend: "down" as const }
    };
    
    // Some alerts
    const alerts = [
      { title: "Low Stock Alert", message: `${lowStockProducts.length} products are running low on stock.` }
    ];
    
    if (upcomingRental) {
      alerts.push({
        title: "Rental Due",
        message: `Your rental payment of ₹${upcomingRental.amount} is due on ${new Date(upcomingRental.dueDate).toDateString()}.`
      });
    }
    
    return {
      recentOrders,
      lowStockProducts,
      upcomingRental,
      stats,
      alerts
    };
  }
}

export const storage = new DatabaseStorage();
