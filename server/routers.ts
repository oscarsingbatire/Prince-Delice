import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { getDb } from "./db";
import { products, deliveryZones, orders, orderItems, returns, users } from "../drizzle/schema";
import { eq, desc, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

// Helper admin check
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Accès réservé aux administrateurs' });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
    updateMfa: protectedProcedure
      .input(z.object({
        mfaEnabled: z.boolean(),
        mfaMethod: z.enum(["sms", "app"]),
        phone: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        await db.update(users)
          .set({
            mfaEnabled: input.mfaEnabled,
            mfaMethod: input.mfaMethod,
            phone: input.phone || null,
            mfaSecret: input.mfaEnabled ? 'CENTRAFRIQUE_MFA_SECURE_' + Math.random().toString(36).substring(7) : null
          })
          .where(eq(users.id, ctx.user.id));
        return { success: true };
      }),
  }),

  shop: router({
    seedInitialData: publicProcedure.mutation(async () => {
      const db = await getDb();
      if (!db) return { success: false };

      // Check if products exist
      const existingProducts = await db.select().from(products).limit(1);
      if (existingProducts.length === 0) {
        await db.insert(products).values([
          {
            name: "Mangues Kent de Bangui",
            category: "Mangues",
            description: "Mangues Kent juteuses et sucrées récoltées à maturité optimale dans les vergers de la périphérie de Bangui.",
            price: "100",
            unit: "kg",
            stock: 85,
            lowStockThreshold: 15,
            freshnessStatus: "Fraîcheur optimale",
            imageUrl: "https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=800&q=80",
            featured: true
          },
          {
            name: "Ananas Victoria de Bimbo",
            category: "Ananas",
            description: "Ananas sucrés et parfumés cultivés à Bimbo. Chair dorée et juteuse, riche en vitamines.",
            price: "500",
            unit: "pièce",
            stock: 40,
            lowStockThreshold: 10,
            freshnessStatus: "Arrivage du jour",
            imageUrl: "https://images.unsplash.com/photo-1550258987-190a2d41a8ba?auto=format&fit=crop&w=800&q=80",
            featured: true
          },
          {
            name: "Bananes Douces Dessert",
            category: "Bananes",
            description: "Bananes de table bien fermes et naturellement sucrées, idéales pour vos desserts et encas.",
            price: "100",
            unit: "kg",
            stock: 120,
            lowStockThreshold: 20,
            freshnessStatus: "Fraîcheur optimale",
            imageUrl: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=800&q=80",
            featured: true
          },
          {
            name: "Papayes Géantes de Centrafrique",
            category: "Papayes",
            description: "Papayes charnues à la chair orangée fondante, gorgées de soleil et de saveurs tropicales.",
            price: "100",
            unit: "pièce",
            stock: 8,
            lowStockThreshold: 10,
            freshnessStatus: "Dernières unités",
            imageUrl: "https://images.unsplash.com/photo-1617112848923-cc227639f098?auto=format&fit=crop&w=800&q=80",
            featured: true
          },
          {
            name: "Agrumes & Mandarines Juteuses",
            category: "Agrumes",
            description: "Mandarines et oranges acidulées fraîchement cueillies pour le petit-déjeuner et les desserts vitaminés.",
            price: "100",
            unit: "kg",
            stock: 60,
            lowStockThreshold: 15,
            freshnessStatus: "Fraîcheur optimale",
            imageUrl: "https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?auto=format&fit=crop&w=800&q=80",
            featured: false
          },
          {
            name: "Pastèque Rafraîchissante",
            category: "Pastèques",
            description: "Grosses pastèques désaltérantes, cultivées localement dans les plaines fertiles.",
            price: "100",
            unit: "pièce",
            stock: 25,
            lowStockThreshold: 5,
            freshnessStatus: "Arrivage du jour",
            imageUrl: "https://images.unsplash.com/photo-1587049352847-4a222e784d38?auto=format&fit=crop&w=800&q=80",
            featured: false
          }
        ]);
      }

      // Check delivery zones
      const existingZones = await db.select().from(deliveryZones).limit(1);
      if (existingZones.length === 0) {
        await db.insert(deliveryZones).values([
          { arrondissement: "1er Arrondissement", neighborhood: "Centre-Ville / Mosquée Centrale", fee: "1000", estimatedTime: "25-35 min" },
          { arrondissement: "2e Arrondissement", neighborhood: "Sica / Katinango", fee: "1200", estimatedTime: "30-45 min" },
          { arrondissement: "3e Arrondissement", neighborhood: "PK5 / Combattant", fee: "1500", estimatedTime: "35-50 min" },
          { arrondissement: "4e Arrondissement", neighborhood: "Batalimo / Avenue de France", fee: "1200", estimatedTime: "30-40 min" },
          { arrondissement: "5e Arrondissement", neighborhood: "Fatim / Sica 3", fee: "1300", estimatedTime: "30-45 min" },
          { arrondissement: "6e Arrondissement", neighborhood: "Bimbo / Périphérie Sud", fee: "2000", estimatedTime: "45-60 min" },
          { arrondissement: "7e Arrondissement", neighborhood: "Ngola / Boy-Rabe", fee: "1500", estimatedTime: "35-50 min" },
          { arrondissement: "8e Arrondissement", neighborhood: "Lakouanga / Port", fee: "1000", estimatedTime: "20-30 min" }
        ]);
      }

      return { success: true };
    }),

    getProducts: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      return await db.select().from(products);
    }),

    getProductById: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const res = await db.select().from(products).where(eq(products.id, input.id)).limit(1);
      return res[0] || null;
    }),

    getDeliveryZones: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      return await db.select().from(deliveryZones);
    }),

    createOrder: protectedProcedure
      .input(z.object({
        customerName: z.string().min(2),
        customerPhone: z.string().min(8),
        deliveryAddress: z.string().min(5),
        arrondissement: z.string(),
        neighborhood: z.string(),
        paymentMethod: z.enum(["orange_money", "visa_mastercard", "cash_on_delivery"]),
        items: z.array(z.object({
          productId: z.number(),
          productName: z.string(),
          price: z.string(),
          quantity: z.number().min(1),
        })),
        deliveryFee: z.string(),
        totalAmount: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });

        // Insert order
        const [orderResult] = await db.insert(orders).values({
          userId: ctx.user.id,
          customerName: input.customerName,
          customerPhone: input.customerPhone,
          deliveryAddress: input.deliveryAddress,
          arrondissement: input.arrondissement,
          neighborhood: input.neighborhood,
          totalAmount: input.totalAmount,
          deliveryFee: input.deliveryFee,
          paymentMethod: input.paymentMethod,
          paymentStatus: input.paymentMethod === 'cash_on_delivery' ? 'pending' : 'paid',
          status: 'Validée',
        });

        const orderId = Number(orderResult.insertId);

        // Insert items and deduct stock
        for (const item of input.items) {
          await db.insert(orderItems).values({
            orderId,
            productId: item.productId,
            productName: item.productName,
            price: item.price,
            quantity: item.quantity,
          });

          // Update product stock
          await db.update(products)
            .set({
              stock: sql`GREATEST(0, stock - ${item.quantity})`
            })
            .where(eq(products.id, item.productId));
        }

        return { success: true, orderId };
      }),

    getUserOrders: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return [];
      const userOrders = await db.select().from(orders).where(eq(orders.userId, ctx.user.id)).orderBy(desc(orders.createdAt));
      
      const result = [];
      for (const ord of userOrders) {
        const items = await db.select().from(orderItems).where(eq(orderItems.orderId, ord.id));
        result.push({ ...ord, items });
      }
      return result;
    }),

    submitReturn: protectedProcedure
      .input(z.object({
        orderId: z.number(),
        reason: z.string().min(5),
        photoUrl: z.string().url(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });

        await db.insert(returns).values({
          orderId: input.orderId,
          userId: ctx.user.id,
          reason: input.reason,
          photoUrl: input.photoUrl,
          status: 'En attente',
        });

        return { success: true };
      }),

    getUserReturns: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return [];
      return await db.select().from(returns).where(eq(returns.userId, ctx.user.id)).orderBy(desc(returns.createdAt));
    }),
  }),

  admin: router({
    getStats: adminProcedure.query(async () => {
      const db = await getDb();
      if (!db) return { totalOrders: 0, totalRevenue: 0, lowStockCount: 0, totalProducts: 0 };

      const allOrders = await db.select().from(orders);
      const allProducts = await db.select().from(products);

      let totalRevenue = 0;
      for (const ord of allOrders) {
        totalRevenue += Number(ord.totalAmount);
      }

      const lowStockCount = allProducts.filter(p => p.stock <= p.lowStockThreshold).length;

      return {
        totalOrders: allOrders.length,
        totalRevenue,
        lowStockCount,
        totalProducts: allProducts.length,
      };
    }),

    getAllOrders: adminProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      const allOrders = await db.select().from(orders).orderBy(desc(orders.createdAt));
      const result = [];
      for (const ord of allOrders) {
        const items = await db.select().from(orderItems).where(eq(orderItems.orderId, ord.id));
        result.push({ ...ord, items });
      }
      return result;
    }),

    updateOrderStatus: adminProcedure
      .input(z.object({
        orderId: z.number(),
        status: z.enum(["Validée", "En préparation", "En cours de livraison", "Livrée"]),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        await db.update(orders).set({ status: input.status }).where(eq(orders.id, input.orderId));
        return { success: true };
      }),

    getAllReturns: adminProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      return await db.select().from(returns).orderBy(desc(returns.createdAt));
    }),

    processReturn: adminProcedure
      .input(z.object({
        returnId: z.number(),
        status: z.enum(["Approuvée", "Rejetée"]),
        compensationType: z.enum(["avoir", "remboursement", "remplacement"]).optional(),
        adminNotes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        await db.update(returns)
          .set({
            status: input.status,
            compensationType: input.compensationType || null,
            adminNotes: input.adminNotes || null,
          })
          .where(eq(returns.id, input.returnId));
        return { success: true };
      }),

    addProduct: adminProcedure
      .input(z.object({
        name: z.string().min(2),
        category: z.string(),
        description: z.string(),
        price: z.string(),
        unit: z.string(),
        stock: z.number(),
        lowStockThreshold: z.number(),
        freshnessStatus: z.enum(["Fraîcheur optimale", "Arrivage du jour", "Dernières unités"]),
        imageUrl: z.string(),
        featured: z.boolean(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        await db.insert(products).values(input);
        return { success: true };
      }),

    updateStock: adminProcedure
      .input(z.object({
        productId: z.number(),
        stock: z.number(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        await db.update(products).set({ stock: input.stock }).where(eq(products.id, input.productId));
        return { success: true };
      }),

    addDeliveryZone: adminProcedure
      .input(z.object({
        arrondissement: z.string(),
        neighborhood: z.string(),
        fee: z.string(),
        estimatedTime: z.string(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        await db.insert(deliveryZones).values(input);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
