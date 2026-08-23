import { beforeEach, describe, expect, it, vi } from "vitest";
import { deliveryReviews, drivers, orders } from "../drizzle/schema";
import type { TrpcContext } from "./_core/context";
import { getFeedbackNotification, matchesFeedbackSearch } from "../shared/feedback-utils";

const inserted: Array<{ table: unknown; values: unknown }> = [];
const updates: Array<{ table: unknown; values: unknown }> = [];

const mockDb = {
  select: () => ({
    from: (table: unknown) => ({
      where: () => ({
        limit: async () => {
          if (table === orders) return [{ id: 42, userId: 1, status: "Livrée", driverId: 7 }];
          if (table === deliveryReviews) return [];
          if (table === drivers) return [{ id: 7 }];
          return [];
        },
      }),
    }),
  }),
  insert: (table: unknown) => ({
    values: async (values: unknown) => {
      inserted.push({ table, values });
      return { insertId: 1 };
    },
  }),
  update: (table: unknown) => ({
    set: (values: unknown) => ({
      where: async () => {
        updates.push({ table, values });
        return { success: true };
      },
    }),
  }),
};

vi.mock("./db", () => ({ getDb: vi.fn(async () => mockDb) }));

const { appRouter } = await import("./routers");

function createContext(role: "user" | "admin" = "user"): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "persistence-test-user",
      email: "persistence@example.com",
      name: "Client Persistence",
      loginMethod: "manus",
      role,
      mfaEnabled: true,
      mfaSecret: "secret123",
      mfaMethod: "app",
      mfaPhoneCode: null,
      phone: "+23675000000",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as TrpcContext["res"],
  };
}

describe("Feedback persistence success paths", () => {
  beforeEach(() => {
    inserted.length = 0;
    updates.length = 0;
  });

  it("persists a delivered-order review with its driver", async () => {
    const caller = appRouter.createCaller(createContext("user"));
    const result = await caller.shop.submitDeliveryReview({ orderId: 42, rating: 5, comment: "Livraison rapide et fruits très frais." });

    expect(result).toEqual({ success: true });
    expect(inserted[0]?.values).toMatchObject({ orderId: 42, userId: 1, driverId: 7, rating: 5, status: "Nouveau" });
  });

  it("persists an expert support request and lets an admin update its status", async () => {
    const userCaller = appRouter.createCaller(createContext("user"));
    await userCaller.shop.submitSupportRequest({ message: "Je souhaite attendre l'avis d'un expert sur ma réclamation." });
    expect(inserted[0]?.values).toMatchObject({ userId: 1, requiresExpert: true, status: "Nouveau" });

    const adminCaller = appRouter.createCaller(createContext("admin"));
    const result = await adminCaller.shop.updateSupportRequestStatus({ requestId: 1, status: "En cours", adminReply: "Votre demande est prise en charge par notre expert." });
    expect(result).toEqual({ success: true });
    expect(updates[0]?.values).toMatchObject({ status: "En cours", adminReply: "Votre demande est prise en charge par notre expert." });
  });

  it("supports an admin reply on a delivery review", async () => {
    const adminCaller = appRouter.createCaller(createContext("admin"));
    const result = await adminCaller.shop.updateDeliveryReviewStatus({ reviewId: 1, status: "Traité", adminReply: "Merci pour votre retour." });
    expect(result).toEqual({ success: true });
    expect(updates[0]?.values).toMatchObject({ status: "Traité", adminReply: "Merci pour votre retour." });
  });

  it("returns client notifications and matches multi-criteria searches", () => {
    const notification = getFeedbackNotification([{ id: "support-1", updatedAt: new Date("2026-08-23T10:00:00Z"), status: "Traité", adminReply: "Réponse" }]);
    expect(notification).toContain("répondu");
    expect(matchesFeedbackSearch("Oscar Singbatire +23675000000 commande 42", "75000000")).toBe(true);
    expect(matchesFeedbackSearch("Oscar Singbatire commande 42", "inexistant")).toBe(false);
  });
});
