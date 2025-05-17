import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision, foreignKey, json, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Users / Merchants table
export const merchants = pgTable("merchants", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const merchantsRelations = relations(merchants, ({ one, many }) => ({
  shop: one(shops),
  products: many(products),
  orders: many(orders),
  rentals: many(rentals),
  maintenanceRequests: many(maintenanceRequests),
  notifications: many(notifications)
}));

// Shop details table
export const shops = pgTable("shops", {
  id: serial("id").primaryKey(),
  merchantId: integer("merchant_id").notNull().references(() => merchants.id, { onDelete: 'cascade' }),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  address: text("address").notNull(),
  bannerUrl: text("banner_url"),
  logoUrl: text("logo_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const shopsRelations = relations(shops, ({ one, many }) => ({
  merchant: one(merchants, {
    fields: [shops.merchantId],
    references: [merchants.id]
  }),
  products: many(products),
  rentals: many(rentals),
  maintenanceRequests: many(maintenanceRequests)
}));

// Products table
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  merchantId: integer("merchant_id").notNull().references(() => merchants.id, { onDelete: 'cascade' }),
  shopId: integer("shop_id").notNull().references(() => shops.id, { onDelete: 'cascade' }),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: doublePrecision("price").notNull(),
  stock: integer("stock").notNull().default(0),
  imageUrl: text("image_url"),
  category: text("category"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const productsRelations = relations(products, ({ one, many }) => ({
  merchant: one(merchants, {
    fields: [products.merchantId],
    references: [merchants.id]
  }),
  shop: one(shops, {
    fields: [products.shopId],
    references: [shops.id]
  }),
  orderItems: many(orderItems)
}));

// Customers table
export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone").notNull(),
  address: text("address").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const customersRelations = relations(customers, ({ many }) => ({
  orders: many(orders)
}));

// Orders table
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  merchantId: integer("merchant_id").notNull().references(() => merchants.id, { onDelete: 'cascade' }),
  customerId: integer("customer_id").notNull().references(() => customers.id, { onDelete: 'cascade' }),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  customerAddress: text("customer_address").notNull(),
  status: text("status").notNull().default("new"),
  totalAmount: doublePrecision("total_amount").notNull(),
  paymentMethod: text("payment_method").notNull(),
  isPaid: boolean("is_paid").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const ordersRelations = relations(orders, ({ one, many }) => ({
  merchant: one(merchants, {
    fields: [orders.merchantId],
    references: [merchants.id]
  }),
  customer: one(customers, {
    fields: [orders.customerId],
    references: [customers.id]
  }),
  items: many(orderItems)
}));

// Order Items table
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().references(() => orders.id, { onDelete: 'cascade' }),
  productId: integer("product_id").notNull().references(() => products.id, { onDelete: 'cascade' }),
  quantity: integer("quantity").notNull(),
  price: doublePrecision("price").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id]
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id]
  })
}));

// Rentals table
export const rentals = pgTable("rentals", {
  id: serial("id").primaryKey(),
  merchantId: integer("merchant_id").notNull().references(() => merchants.id, { onDelete: 'cascade' }),
  shopId: integer("shop_id").notNull().references(() => shops.id, { onDelete: 'cascade' }),
  amount: doublePrecision("amount").notNull(),
  startDate: timestamp("start_date").notNull(),
  dueDate: timestamp("due_date").notNull(),
  isPaid: boolean("is_paid").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const rentalsRelations = relations(rentals, ({ one }) => ({
  merchant: one(merchants, {
    fields: [rentals.merchantId],
    references: [merchants.id]
  }),
  shop: one(shops, {
    fields: [rentals.shopId],
    references: [shops.id]
  })
}));

// Maintenance Requests table
export const maintenanceRequests = pgTable("maintenance_requests", {
  id: serial("id").primaryKey(),
  merchantId: integer("merchant_id").notNull().references(() => merchants.id, { onDelete: 'cascade' }),
  shopId: integer("shop_id").notNull().references(() => shops.id, { onDelete: 'cascade' }),
  issueType: text("issue_type").notNull(),
  description: text("description").notNull(),
  priority: text("priority").notNull().default("medium"),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const maintenanceRequestsRelations = relations(maintenanceRequests, ({ one }) => ({
  merchant: one(merchants, {
    fields: [maintenanceRequests.merchantId],
    references: [merchants.id]
  }),
  shop: one(shops, {
    fields: [maintenanceRequests.shopId],
    references: [shops.id]
  })
}));

// Notifications table
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  merchantId: integer("merchant_id").notNull().references(() => merchants.id, { onDelete: 'cascade' }),
  type: text("type").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const notificationsRelations = relations(notifications, ({ one }) => ({
  merchant: one(merchants, {
    fields: [notifications.merchantId],
    references: [merchants.id]
  })
}));

// Schema validation with Zod
export const insertMerchantSchema = createInsertSchema(merchants).omit({ id: true, createdAt: true, updatedAt: true });
export const insertShopSchema = createInsertSchema(shops).omit({ id: true, createdAt: true, updatedAt: true });
export const insertProductSchema = createInsertSchema(products).omit({ id: true, createdAt: true, updatedAt: true });
export const insertCustomerSchema = createInsertSchema(customers).omit({ id: true, createdAt: true, updatedAt: true });
export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, createdAt: true, updatedAt: true });
export const insertOrderItemSchema = createInsertSchema(orderItems).omit({ id: true, createdAt: true, updatedAt: true });
export const insertRentalSchema = createInsertSchema(rentals).omit({ id: true, createdAt: true, updatedAt: true });
export const insertMaintenanceRequestSchema = createInsertSchema(maintenanceRequests).omit({ id: true, createdAt: true, updatedAt: true });
export const insertNotificationSchema = createInsertSchema(notifications).omit({ id: true, createdAt: true, updatedAt: true });

// Login schema
export const loginSchema = z.object({
  username: z.string().min(1, { message: "Username is required" }),
  password: z.string().min(1, { message: "Password is required" }),
});

// Update schemas
export const updateProductSchema = insertProductSchema.partial();
export const updateOrderSchema = z.object({ status: z.string() });
export const updateShopSchema = insertShopSchema.partial();
export const updateNotificationSchema = z.object({ isRead: z.boolean() });
export const updateMaintenanceRequestSchema = z.object({ status: z.string() });

// Types
export type InsertMerchant = z.infer<typeof insertMerchantSchema>;
export type InsertShop = z.infer<typeof insertShopSchema>;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type InsertRental = z.infer<typeof insertRentalSchema>;
export type InsertMaintenanceRequest = z.infer<typeof insertMaintenanceRequestSchema>;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

export type LoginData = z.infer<typeof loginSchema>;

export type UpdateProduct = z.infer<typeof updateProductSchema>;
export type UpdateOrder = z.infer<typeof updateOrderSchema>;
export type UpdateShop = z.infer<typeof updateShopSchema>;
export type UpdateNotification = z.infer<typeof updateNotificationSchema>;
export type UpdateMaintenanceRequest = z.infer<typeof updateMaintenanceRequestSchema>;

export type Merchant = typeof merchants.$inferSelect;
export type Shop = typeof shops.$inferSelect;
export type Product = typeof products.$inferSelect;
export type Customer = typeof customers.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type Rental = typeof rentals.$inferSelect;
export type MaintenanceRequest = typeof maintenanceRequests.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
