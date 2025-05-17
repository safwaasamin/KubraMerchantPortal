import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import { storage } from "./storage";
import { 
  loginSchema, 
  insertProductSchema, 
  updateProductSchema,
  updateOrderSchema,
  insertShopSchema,
  updateShopSchema,
  insertMaintenanceRequestSchema
} from "@shared/schema";
import { ZodError } from "zod";

// Define session data type
declare module "express-session" {
  interface SessionData {
    merchantId: number;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up session middleware
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "kubra-market-secret",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      },
    })
  );

  // Authentication middleware for protected routes
  const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    if (!req.session.merchantId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  };

  // Error handling for Zod validation
  const validateRequest = (schema: any) => {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        schema.parse(req.body);
        next();
      } catch (error) {
        if (error instanceof ZodError) {
          return res.status(400).json({
            message: "Validation failed",
            errors: error.errors,
          });
        }
        next(error);
      }
    };
  };

  // ==================== Authentication Routes ====================
  app.post("/api/auth/login", validateRequest(loginSchema), async (req, res) => {
    try {
      const { username, password } = req.body;
      const merchant = await storage.validateMerchantCredentials(username, password);
      
      if (!merchant) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Store merchant ID in session
      req.session.merchantId = merchant.id;
      
      // Return merchant details (excluding password)
      const { password: _, ...merchantData } = merchant;
      return res.status(200).json(merchantData);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.clearCookie("connect.sid");
      return res.status(200).json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/current-merchant", async (req, res) => {
    try {
      const merchantId = req.session.merchantId;
      if (!merchantId) {
        return res.status(401).json(null);
      }
      
      const merchant = await storage.getMerchant(merchantId);
      if (!merchant) {
        return res.status(401).json(null);
      }
      
      // Return merchant details (excluding password)
      const { password, ...merchantData } = merchant;
      return res.status(200).json(merchantData);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // ==================== Shop Routes ====================
  app.get("/api/shop", isAuthenticated, async (req, res) => {
    try {
      const merchantId = req.session.merchantId!;
      const shop = await storage.getShopByMerchantId(merchantId);
      
      if (!shop) {
        return res.status(404).json({ message: "Shop not found" });
      }
      
      return res.status(200).json(shop);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/shop", isAuthenticated, validateRequest(insertShopSchema), async (req, res) => {
    try {
      const merchantId = req.session.merchantId!;
      const shopData = { ...req.body, merchantId };
      
      // Check if merchant already has a shop
      const existingShop = await storage.getShopByMerchantId(merchantId);
      if (existingShop) {
        return res.status(400).json({ message: "Merchant already has a shop" });
      }
      
      const newShop = await storage.createShop(shopData);
      return res.status(201).json(newShop);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/shop", isAuthenticated, validateRequest(updateShopSchema), async (req, res) => {
    try {
      const merchantId = req.session.merchantId!;
      const shop = await storage.getShopByMerchantId(merchantId);
      
      if (!shop) {
        return res.status(404).json({ message: "Shop not found" });
      }
      
      const updatedShop = await storage.updateShop(shop.id, req.body);
      return res.status(200).json(updatedShop);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // ==================== Product Routes ====================
  app.get("/api/products", isAuthenticated, async (req, res) => {
    try {
      const merchantId = req.session.merchantId!;
      const products = await storage.getProductsByMerchantId(merchantId);
      return res.status(200).json(products);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/products/:id", isAuthenticated, async (req, res) => {
    try {
      const merchantId = req.session.merchantId!;
      const productId = parseInt(req.params.id);
      
      if (isNaN(productId)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }
      
      const product = await storage.getProduct(productId);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      if (product.merchantId !== merchantId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      return res.status(200).json(product);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/products", isAuthenticated, validateRequest(insertProductSchema), async (req, res) => {
    try {
      const merchantId = req.session.merchantId!;
      
      // Get merchant's shop
      const shop = await storage.getShopByMerchantId(merchantId);
      if (!shop) {
        return res.status(400).json({ message: "Merchant has no shop, please create a shop first" });
      }
      
      const productData = { ...req.body, merchantId, shopId: shop.id };
      const newProduct = await storage.createProduct(productData);
      
      return res.status(201).json(newProduct);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/products/:id", isAuthenticated, validateRequest(updateProductSchema), async (req, res) => {
    try {
      const merchantId = req.session.merchantId!;
      const productId = parseInt(req.params.id);
      
      if (isNaN(productId)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }
      
      const product = await storage.getProduct(productId);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      if (product.merchantId !== merchantId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const updatedProduct = await storage.updateProduct(productId, req.body);
      return res.status(200).json(updatedProduct);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/products/:id", isAuthenticated, async (req, res) => {
    try {
      const merchantId = req.session.merchantId!;
      const productId = parseInt(req.params.id);
      
      if (isNaN(productId)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }
      
      const product = await storage.getProduct(productId);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      if (product.merchantId !== merchantId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const success = await storage.deleteProduct(productId);
      
      if (!success) {
        return res.status(500).json({ message: "Failed to delete product" });
      }
      
      return res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // ==================== Order Routes ====================
  app.get("/api/orders", isAuthenticated, async (req, res) => {
    try {
      const merchantId = req.session.merchantId!;
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string) : 10;
      
      if (isNaN(page) || isNaN(pageSize) || page < 1 || pageSize < 1) {
        return res.status(400).json({ message: "Invalid pagination parameters" });
      }
      
      const { orders, total } = await storage.getOrdersByMerchantId(merchantId, page, pageSize);
      
      // For each order, fetch the items
      const ordersWithItems = await Promise.all(
        orders.map(async (order) => {
          const items = await storage.getOrderItems(order.id);
          
          // For each item, fetch the product details
          const itemsWithProducts = await Promise.all(
            items.map(async (item) => {
              const details = await storage.getOrderItemWithProduct(item.id);
              return {
                ...item,
                product: details?.product || null
              };
            })
          );
          
          return {
            ...order,
            items: itemsWithProducts
          };
        })
      );
      
      return res.status(200).json({
        orders: ordersWithItems,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize)
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/orders/:id", isAuthenticated, async (req, res) => {
    try {
      const merchantId = req.session.merchantId!;
      const orderId = parseInt(req.params.id);
      
      if (isNaN(orderId)) {
        return res.status(400).json({ message: "Invalid order ID" });
      }
      
      const order = await storage.getOrder(orderId);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      if (order.merchantId !== merchantId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      // Fetch order items
      const items = await storage.getOrderItems(orderId);
      
      // For each item, fetch the product details
      const itemsWithProducts = await Promise.all(
        items.map(async (item) => {
          const details = await storage.getOrderItemWithProduct(item.id);
          return {
            ...item,
            product: details?.product || null
          };
        })
      );
      
      return res.status(200).json({
        ...order,
        items: itemsWithProducts
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/orders/:id", isAuthenticated, validateRequest(updateOrderSchema), async (req, res) => {
    try {
      const merchantId = req.session.merchantId!;
      const orderId = parseInt(req.params.id);
      
      if (isNaN(orderId)) {
        return res.status(400).json({ message: "Invalid order ID" });
      }
      
      const order = await storage.getOrder(orderId);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      if (order.merchantId !== merchantId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const { status } = req.body;
      const updatedOrder = await storage.updateOrderStatus(orderId, status);
      
      // Create a notification for order status update
      await storage.createNotification({
        merchantId,
        type: "order",
        title: `Order #${orderId} Status Updated`,
        message: `Order status has been updated to ${status}`,
        isRead: false
      });
      
      return res.status(200).json(updatedOrder);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // ==================== Rental Routes ====================
  app.get("/api/rental", isAuthenticated, async (req, res) => {
    try {
      const merchantId = req.session.merchantId!;
      
      // Get current (upcoming) rental
      const rental = await storage.getCurrentRental(merchantId);
      
      if (!rental) {
        return res.status(404).json({ message: "No current rental found" });
      }
      
      // Get shop name
      const shop = await storage.getShop(rental.shopId);
      
      return res.status(200).json({
        ...rental,
        shopName: shop?.name || ""
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/rental/pay", isAuthenticated, async (req, res) => {
    try {
      const merchantId = req.session.merchantId!;
      const { rentalId } = req.body;
      
      if (!rentalId) {
        return res.status(400).json({ message: "Rental ID is required" });
      }
      
      const rental = await storage.getRental(rentalId);
      
      if (!rental) {
        return res.status(404).json({ message: "Rental not found" });
      }
      
      if (rental.merchantId !== merchantId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      if (rental.isPaid) {
        return res.status(400).json({ message: "Rental is already paid" });
      }
      
      const updatedRental = await storage.updateRentalPaymentStatus(rentalId, true);
      
      // Create notification for payment
      await storage.createNotification({
        merchantId,
        type: "rental",
        title: "Rental Payment Successful",
        message: `Your rental payment of ₹${rental.amount} has been processed successfully.`,
        isRead: false
      });
      
      return res.status(200).json(updatedRental);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // ==================== Maintenance Request Routes ====================
  app.post("/api/maintenance-requests", isAuthenticated, validateRequest(insertMaintenanceRequestSchema), async (req, res) => {
    try {
      const merchantId = req.session.merchantId!;
      
      // Get merchant's shop
      const shop = await storage.getShopByMerchantId(merchantId);
      if (!shop) {
        return res.status(400).json({ message: "Merchant has no shop" });
      }
      
      const requestData = {
        ...req.body,
        merchantId,
        shopId: shop.id
      };
      
      const newRequest = await storage.createMaintenanceRequest(requestData);
      
      // Create notification for maintenance request
      await storage.createNotification({
        merchantId,
        type: "system",
        title: "Maintenance Request Submitted",
        message: `Your maintenance request for ${req.body.issueType} has been submitted successfully.`,
        isRead: false
      });
      
      return res.status(201).json(newRequest);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/maintenance-requests", isAuthenticated, async (req, res) => {
    try {
      const merchantId = req.session.merchantId!;
      const requests = await storage.getMaintenanceRequestsByMerchantId(merchantId);
      return res.status(200).json(requests);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // ==================== Notification Routes ====================
  app.get("/api/notifications", isAuthenticated, async (req, res) => {
    try {
      const merchantId = req.session.merchantId!;
      const notifications = await storage.getNotificationsByMerchantId(merchantId);
      return res.status(200).json(notifications);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/notifications/:id", isAuthenticated, async (req, res) => {
    try {
      const merchantId = req.session.merchantId!;
      const notificationId = parseInt(req.params.id);
      
      if (isNaN(notificationId)) {
        return res.status(400).json({ message: "Invalid notification ID" });
      }
      
      const notification = await storage.getNotification(notificationId);
      
      if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
      }
      
      if (notification.merchantId !== merchantId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const updatedNotification = await storage.markNotificationAsRead(notificationId);
      return res.status(200).json(updatedNotification);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/notifications/mark-all-read", isAuthenticated, async (req, res) => {
    try {
      const merchantId = req.session.merchantId!;
      await storage.markAllNotificationsAsRead(merchantId);
      return res.status(200).json({ message: "All notifications marked as read" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // ==================== Sales Routes ====================
  app.get("/api/sales/summary", isAuthenticated, async (req, res) => {
    try {
      const merchantId = req.session.merchantId!;
      const summary = await storage.getSalesSummary(merchantId);
      return res.status(200).json(summary);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/sales/orders", isAuthenticated, async (req, res) => {
    try {
      const merchantId = req.session.merchantId!;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      
      if (isNaN(limit) || limit < 1) {
        return res.status(400).json({ message: "Invalid limit parameter" });
      }
      
      const orders = await storage.getSalesOrders(merchantId, limit);
      
      // For each order, fetch the items
      const ordersWithItems = await Promise.all(
        orders.map(async (order) => {
          const items = await storage.getOrderItems(order.id);
          return {
            ...order,
            items
          };
        })
      );
      
      return res.status(200).json(ordersWithItems);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // ==================== Dashboard Routes ====================
  app.get("/api/dashboard", isAuthenticated, async (req, res) => {
    try {
      const merchantId = req.session.merchantId!;
      const dashboardData = await storage.getDashboardStats(merchantId);
      return res.status(200).json(dashboardData);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
