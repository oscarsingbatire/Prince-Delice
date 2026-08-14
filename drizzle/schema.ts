import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 32 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  mfaEnabled: boolean("mfaEnabled").default(false).notNull(),
  mfaSecret: varchar("mfaSecret", { length: 64 }),
  mfaMethod: mysqlEnum("mfaMethod", ["sms", "app"]).default("app").notNull(),
  mfaPhoneCode: varchar("mfaPhoneCode", { length: 8 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(), // mangues, ananas, bananes, papayes, agrumes, etc.
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(), // en XAF (Franc CFA)
  unit: varchar("unit", { length: 50 }).notNull(), // kg, pièce, barquette, panier
  stock: int("stock").default(0).notNull(),
  lowStockThreshold: int("lowStockThreshold").default(10).notNull(),
  freshnessStatus: mysqlEnum("freshnessStatus", ["Fraîcheur optimale", "Arrivage du jour", "Dernières unités"]).default("Fraîcheur optimale").notNull(),
  imageUrl: text("imageUrl").notNull(),
  featured: boolean("featured").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const deliveryZones = mysqlTable("deliveryZones", {
  id: int("id").autoincrement().primaryKey(),
  arrondissement: varchar("arrondissement", { length: 100 }).notNull(), // 1er Arrondissement, etc.
  neighborhood: varchar("neighborhood", { length: 100 }).notNull(), // Quartier spécifique (ex: PK5, Sica, Lakouanga)
  fee: decimal("fee", { precision: 10, scale: 2 }).notNull(), // Frais de livraison en XAF
  estimatedTime: varchar("estimatedTime", { length: 100 }).notNull(), // Ex: 30-45 min
});

export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  customerName: varchar("customerName", { length: 255 }).notNull(),
  customerPhone: varchar("customerPhone", { length: 32 }).notNull(),
  deliveryAddress: text("deliveryAddress").notNull(),
  arrondissement: varchar("arrondissement", { length: 100 }).notNull(),
  neighborhood: varchar("neighborhood", { length: 100 }).notNull(),
  totalAmount: decimal("totalAmount", { precision: 10, scale: 2 }).notNull(),
  deliveryFee: decimal("deliveryFee", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: mysqlEnum("paymentMethod", ["orange_money", "visa_mastercard", "cash_on_delivery"]).notNull(),
  paymentStatus: mysqlEnum("paymentStatus", ["pending", "paid", "failed"]).default("pending").notNull(),
  status: mysqlEnum("status", ["Validée", "En préparation", "En cours de livraison", "Livrée"]).default("Validée").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const orderItems = mysqlTable("orderItems", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  productId: int("productId").notNull(),
  productName: varchar("productName", { length: 255 }).notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  quantity: int("quantity").notNull(),
});

export const returns = mysqlTable("returns", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  userId: int("userId").notNull(),
  reason: text("reason").notNull(),
  photoUrl: text("photoUrl").notNull(), // Soumission de photos sous 24h
  status: mysqlEnum("status", ["En attente", "Approuvée", "Rejetée"]).default("En attente").notNull(),
  compensationType: mysqlEnum("compensationType", ["avoir", "remboursement", "remplacement"]),
  adminNotes: text("adminNotes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;
export type DeliveryZone = typeof deliveryZones.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type ReturnRecord = typeof returns.$inferSelect;

export const reviews = mysqlTable("reviews", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  userName: varchar("userName", { length: 255 }).notNull(),
  productId: int("productId"),
  rating: int("rating").notNull(), // 1 to 5
  comment: text("comment").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const salesReports = mysqlTable("salesReports", {
  id: int("id").autoincrement().primaryKey(),
  reportDate: varchar("reportDate", { length: 50 }).notNull(), // YYYY-MM-DD
  totalOrders: int("totalOrders").notNull(),
  totalRevenue: decimal("totalRevenue", { precision: 12, scale: 2 }).notNull(),
  summary: text("summary").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Review = typeof reviews.$inferSelect;
export type SalesReport = typeof salesReports.$inferSelect;
