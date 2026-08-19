import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { getDb } from "./db";
import { products, deliveryZones, orders, orderItems, returns, users, reviews, salesReports, referrals, pushSubscriptions, userLoyalty, smsGatewayLogs, drivers } from "../drizzle/schema";
import { eq, desc } from "drizzle-orm";
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
        
        let mfaSecret = ctx.user.mfaSecret;
        if (input.mfaEnabled && !mfaSecret) {
          mfaSecret = Array.from({ length: 16 }, () => Math.random().toString(36)[2]).join('').toUpperCase();
        }

        await db.update(users)
          .set({
            mfaEnabled: input.mfaEnabled,
            mfaMethod: input.mfaMethod,
            phone: input.phone !== undefined ? input.phone : ctx.user.phone,
            mfaSecret: mfaSecret,
          })
          .where(eq(users.id, ctx.user.id));
        return { success: true, mfaSecret };
      }),
  }),

  shop: router({
    getProducts: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      return await db.select().from(products);
    }),

    getDeliveryZones: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      return await db.select().from(deliveryZones);
    }),

    getAvailableDrivers: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      return await db.select().from(drivers).where(eq(drivers.status, "Disponible"));
    }),

    seedInitialData: publicProcedure.mutation(async () => {
      const db = await getDb();
      if (!db) return { success: false };

      // Re-seed or update with new products including user's specific images and prices (100 to 500 XAF)
      const existingProducts = await db.select().from(products);
      if (existingProducts.length < 9) {
        // Clear or insert new batch
        await db.delete(products);
        await db.insert(products).values([
          {
            name: "Pomme Rouge Croquante",
            category: "Pommes",
            description: "Pommes rouges juteuses et sucrées, fraîchement sélectionnées pour un dessert croquant et vitaminé.",
            price: "200",
            unit: "pièce",
            stock: 90,
            lowStockThreshold: 15,
            freshnessStatus: "Fraîcheur optimale",
            imageUrl: "/manus-storage/Screenshot_20260813-083513_e2715bfe.png",
            featured: true
          },
          {
            name: "Fraises Fraîches et Parfumées",
            category: "Baies",
            description: "Fraises pulpeuses et délicatement sucrées, idéales pour agrémenter vos pâtisseries et desserts.",
            price: "500",
            unit: "barquette",
            stock: 35,
            lowStockThreshold: 10,
            freshnessStatus: "Arrivage du jour",
            imageUrl: "/manus-storage/Screenshot_20260813-083434_e1324662.png",
            featured: true
          },
          {
            name: "Jacque Tropical de Centrafrique",
            category: "Exotiques",
            description: "Fruits du jacquier savoureux aux arômes tropicaux incomparables, riches en énergie et en nutriments.",
            price: "300",
            unit: "portion",
            stock: 25,
            lowStockThreshold: 5,
            freshnessStatus: "Fraîcheur optimale",
            imageUrl: "/manus-storage/Screenshot_20260813-083926_e9293cec.png",
            featured: true
          },
          {
            name: "Avocat Fondant de Bangui",
            category: "Avocats",
            description: "Avocats onctueux à la chair généreuse, parfaits pour vos salades de fruits salées-sucrées ou en toast.",
            price: "100",
            unit: "pièce",
            stock: 110,
            lowStockThreshold: 20,
            freshnessStatus: "Arrivage du jour",
            imageUrl: "/manus-storage/Screenshot_20260813-083814_9b31eb0d.png",
            featured: true
          },
          {
            name: "Grains de Raisin Dorés et Noirs",
            category: "Raisins",
            description: "Grappes de raisin juteuses gorgées de sucre naturel, sélectionnées avec le plus grand soin.",
            price: "400",
            unit: "grappe",
            stock: 50,
            lowStockThreshold: 10,
            freshnessStatus: "Fraîcheur optimale",
            imageUrl: "/manus-storage/Screenshot_20260813-083319_78475f38.png",
            featured: true
          },
          {
            name: "Dattes Moelleuses & Sucrées",
            category: "Secs & Moelleux",
            description: "Dattes fondantes de première qualité, un concentré d'énergie naturelle pour vos en-cas.",
            price: "500",
            unit: "sachet",
            stock: 65,
            lowStockThreshold: 15,
            freshnessStatus: "Fraîcheur optimale",
            imageUrl: "/manus-storage/Screenshot_20260813-083710_f018aa15.png",
            featured: false
          },
          {
            name: "Papaye Géante Fondante",
            category: "Papayes",
            description: "Papayes charnues à la chair orangée fondante, gorgées de soleil et de saveurs tropicales.",
            price: "500",
            unit: "pièce",
            stock: 30,
            lowStockThreshold: 8,
            freshnessStatus: "Arrivage du jour",
            imageUrl: "/manus-storage/Screenshot_20260813-084207_90967e9f.png",
            featured: true
          },
          {
            name: "Noix de Coco Fraîche",
            category: "Coco",
            description: "Noix de coco fraîche avec eau désaltérante et chair blanche croquante. Un délice tropical.",
            price: "300",
            unit: "pièce",
            stock: 45,
            lowStockThreshold: 10,
            freshnessStatus: "Fraîcheur optimale",
            imageUrl: "/manus-storage/Screenshot_20260813-084128_e0a5008c.png",
            featured: false
          },
          {
            name: "Pastèque Juteuse de Bangui",
            category: "Pastèques",
            description: "Tranches et morceaux de pastèque ultra-fraîche et désaltérante pour vos chaudes journées.",
            price: "100",
            unit: "tranche",
            stock: 80,
            lowStockThreshold: 20,
            freshnessStatus: "Arrivage du jour",
            imageUrl: "/manus-storage/Screenshot_20260813-084100_ee75c831.png",
            featured: true
          }
        ]);
      }

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

    createOrder: protectedProcedure
      .input(z.object({
        customerName: z.string().min(2),
        customerPhone: z.string().min(6),
        deliveryAddress: z.string().min(3),
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
        driverId: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });

        const [orderResult] = await db.insert(orders).values({
          userId: ctx.user.id,
          customerName: input.customerName,
          customerPhone: input.customerPhone,
          deliveryAddress: input.deliveryAddress,
          arrondissement: input.arrondissement,
          neighborhood: input.neighborhood,
          paymentMethod: input.paymentMethod,
          paymentStatus: input.paymentMethod === 'cash_on_delivery' ? 'pending' : 'paid',
          deliveryFee: input.deliveryFee,
          totalAmount: input.totalAmount,
          status: "Validée",
        });

        const orderId = (orderResult as any).insertId;

        if (input.driverId) {
          // Assign driver immediately if selected by customer
          await db.update(drivers)
            .set({ status: 'En tournée', assignedOrderId: orderId, currentLocation: 'En route vers client (Bangui)' })
            .where(eq(drivers.id, input.driverId));
          await db.update(orders)
            .set({ status: 'En cours de livraison' })
            .where(eq(orders.id, orderId));
        }

        for (const item of input.items) {
          await db.insert(orderItems).values({
            orderId,
            productId: item.productId,
            productName: item.productName,
            price: item.price,
            quantity: item.quantity,
          });

          const [prod] = await db.select().from(products).where(eq(products.id, item.productId));
          if (prod) {
            const newStock = Math.max(0, prod.stock - item.quantity);
            await db.update(products).set({ stock: newStock }).where(eq(products.id, item.productId));
          }
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
        // Trouver le livreur assigné à cette commande s'il existe
        const [assignedDriver] = await db.select().from(drivers).where(eq(drivers.assignedOrderId, ord.id));
        result.push({ ...ord, items, driver: assignedDriver || null });
      }
      return result;
    }),

    submitReturn: protectedProcedure
      .input(z.object({
        orderId: z.number(),
        reason: z.string().min(5),
        photoUrl: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        await db.insert(returns).values({
          orderId: input.orderId,
          userId: ctx.user.id,
          reason: input.reason,
          photoUrl: input.photoUrl,
          status: "En attente",
        });
        return { success: true };
      }),

    getUserReturns: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return [];
      return await db.select().from(returns).where(eq(returns.userId, ctx.user.id)).orderBy(desc(returns.createdAt));
    }),

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

    deleteOrder: adminProcedure
      .input(z.object({ orderId: z.number() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        await db.delete(orderItems).where(eq(orderItems.orderId, input.orderId));
        await db.delete(orders).where(eq(orders.id, input.orderId));
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

    getReviews: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      return await db.select().from(reviews).orderBy(desc(reviews.createdAt));
    }),

    addReview: protectedProcedure
      .input(z.object({
        productId: z.number().optional(),
        rating: z.number().min(1).max(5),
        comment: z.string().min(3),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        await db.insert(reviews).values({
          userId: ctx.user.id,
          userName: ctx.user.name || "Client Prince Délice",
          productId: input.productId || null,
          rating: input.rating,
          comment: input.comment,
        });
        return { success: true };
      }),

    getSalesReports: adminProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      const reports = await db.select().from(salesReports).orderBy(desc(salesReports.reportDate));
      if (reports.length === 0) {
        const today = new Date().toISOString().split("T")[0];
        const allOrd = await db.select().from(orders);
        const totalRev = allOrd.reduce((acc, o) => acc + Number(o.totalAmount), 0);
        await db.insert(salesReports).values({
          reportDate: today,
          totalOrders: allOrd.length,
          totalRevenue: totalRev.toString(),
          summary: "Rapport automatisé des ventes généré avec succès pour Prince Délice.",
        });
        return await db.select().from(salesReports).orderBy(desc(salesReports.reportDate));
      }
      return reports;
    }),

    generateSalesReport: adminProcedure.mutation(async () => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
      const today = new Date().toISOString().split("T")[0];
      const allOrd = await db.select().from(orders);
      const totalRev = allOrd.reduce((acc, o) => acc + Number(o.totalAmount), 0);
      
      const existing = await db.select().from(salesReports).where(eq(salesReports.reportDate, today));
      if (existing.length > 0) {
        await db.update(salesReports)
          .set({ totalOrders: allOrd.length, totalRevenue: totalRev.toString(), summary: `Rapport mis à jour le ${today}. Chiffre d'affaires total : ${totalRev} XAF.` })
          .where(eq(salesReports.reportDate, today));
      } else {
        await db.insert(salesReports).values({
          reportDate: today,
          totalOrders: allOrd.length,
          totalRevenue: totalRev.toString(),
          summary: `Rapport quotidien généré le ${today}. Ventes dynamiques à Bangui.`,
        });
      }
      return { success: true };
    }),

    getReferralCode: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return null;
      const res = await db.select().from(referrals).where(eq(referrals.userId, ctx.user.id)).limit(1);
      if (res.length > 0) return res[0];
      // Generate default code
      const code = `PRINCE-${ctx.user.id}-${Math.floor(1000 + Math.random() * 9000)}`;
      await db.insert(referrals).values({
        userId: ctx.user.id,
        code,
        discountPercent: 10,
        usesCount: 0,
      });
      const created = await db.select().from(referrals).where(eq(referrals.userId, ctx.user.id)).limit(1);
      return created[0];
    }),

    applyReferralCode: publicProcedure
      .input(z.object({ code: z.string() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        const res = await db.select().from(referrals).where(eq(referrals.code, input.code.trim())).limit(1);
        if (res.length === 0) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Code de parrainage invalide.' });
        }
        return { success: true, discountPercent: res[0].discountPercent, code: res[0].code };
      }),

    subscribePush: protectedProcedure
      .input(z.object({ endpoint: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        await db.insert(pushSubscriptions).values({
          userId: ctx.user.id,
          endpoint: input.endpoint,
        });
        return { success: true };
      }),

    getLoyaltyStatus: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return { points: 150, tier: "VIP Or" };
      const res = await db.select().from(userLoyalty).where(eq(userLoyalty.userId, ctx.user.id)).limit(1);
      if (res.length > 0) return res[0];
      await db.insert(userLoyalty).values({ userId: ctx.user.id, points: 150, tier: "VIP Or" });
      const created = await db.select().from(userLoyalty).where(eq(userLoyalty.userId, ctx.user.id)).limit(1);
      return created[0];
    }),

    convertLoyaltyPoints: protectedProcedure
      .input(z.object({ pointsToConvert: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        const res = await db.select().from(userLoyalty).where(eq(userLoyalty.userId, ctx.user.id)).limit(1);
        const current = res.length > 0 ? res[0] : { points: 150 };
        if (current.points < input.pointsToConvert) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Points insuffisants.' });
        }
        const newPoints = current.points - input.pointsToConvert;
        if (res.length > 0) {
          await db.update(userLoyalty).set({ points: newPoints }).where(eq(userLoyalty.userId, ctx.user.id));
        } else {
          await db.insert(userLoyalty).values({ userId: ctx.user.id, points: newPoints, tier: "VIP Or" });
        }
        const discountValue = input.pointsToConvert * 10; // 1 pt = 10 FCFA
        return { success: true, remainingPoints: newPoints, discountValue };
      }),

    sendSmsOtp: publicProcedure
      .input(z.object({ phone: z.string() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const message = `[Prince Délice Bangui] Votre code de sécurité OTP est : ${otpCode}. Valide 5 minutes.`;
        await db.insert(smsGatewayLogs).values({
          phone: input.phone,
          message,
          otpCode,
          status: 'Envoyé',
        });
        return { success: true, otpCode, message };
      }),

    getSmsLogs: adminProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      return await db.select().from(smsGatewayLogs).orderBy(desc(smsGatewayLogs.createdAt)).limit(50);
    }),

    getDrivers: adminProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      return await db.select().from(drivers).orderBy(desc(drivers.createdAt));
    }),

    addDriver: adminProcedure
      .input(z.object({
        name: z.string().min(2),
        phone: z.string().min(8),
        vehicle: z.string(),
        arrondissement: z.string(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        await db.insert(drivers).values({
          name: input.name,
          phone: input.phone,
          vehicle: input.vehicle,
          arrondissement: input.arrondissement,
          status: 'Disponible',
          currentLocation: 'Dépôt PK0 / Centre (Prêt)',
        });
        return { success: true };
      }),

    assignDriver: adminProcedure
      .input(z.object({
        driverId: z.number(),
        orderId: z.number(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        // Update driver status & assigned order
        await db.update(drivers)
          .set({ status: 'En tournée', assignedOrderId: input.orderId, currentLocation: 'En route vers client (Bangui)' })
          .where(eq(drivers.id, input.driverId));
        // Update order status
        await db.update(orders)
          .set({ status: 'En cours de livraison' })
          .where(eq(orders.id, input.orderId));
        return { success: true };
      }),

    updateDriverStatus: adminProcedure
      .input(z.object({
        driverId: z.number(),
        status: z.enum(["Disponible", "En tournée", "De retour"]),
        currentLocation: z.string(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        await db.update(drivers)
          .set({
            status: input.status,
            currentLocation: input.currentLocation,
            ...(input.status === 'Disponible' || input.status === 'De retour' ? { assignedOrderId: null } : {}),
          })
          .where(eq(drivers.id, input.driverId));
        return { success: true };
      }),

    deleteDriver: adminProcedure
      .input(z.object({ driverId: z.number() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        await db.delete(drivers).where(eq(drivers.id, input.driverId));
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
