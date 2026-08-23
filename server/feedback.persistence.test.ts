import { beforeEach, describe, expect, it, vi } from "vitest";
import { customerNotificationLogs, deliveryReviews, drivers, orders, supportRequests, supportMessages, users } from "../drizzle/schema";
import type { TrpcContext } from "./_core/context";
import { buildFeedbackCsv, getFeedbackNotification, matchesFeedbackSearch, paginateItems } from "../shared/feedback-utils";

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
          if (table === supportRequests) return [{ id: 1, userId: 1 }];
          if (table === supportMessages) return [];
          if (table === users) return [{ id: 1, phone: "+23675000000" }];

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
      dataOrigin: "live",
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
    const result = await caller.shop.submitDeliveryReview({ orderId: 42, rating: 5, comment: "automated-test-payload" });

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
    const notificationInsert = inserted.find(entry => entry.table === customerNotificationLogs)?.values as unknown[];
    expect(notificationInsert).toEqual(expect.arrayContaining([
      expect.objectContaining({ channel: "sms", status: "Simulée", supportRequestId: 1 }),
      expect.objectContaining({ channel: "whatsapp", status: "Simulée", supportRequestId: 1 }),
    ]));
  });

  it("builds a French CSV with escaped cells and a BOM", () => {
    const csv = buildFeedbackCsv([["Client", "Message"], ["Aline", "Très bon; merci"]]);
    expect(csv.startsWith("\uFEFF")).toBe(true);
    expect(csv).toContain('"Très bon; merci"');
    expect(csv.split("\n")).toHaveLength(2);
  });

  it("paginates feedback records deterministically", () => {
    expect(paginateItems([1, 2, 3, 4, 5, 6], 2, 2)).toEqual([3, 4]);
    expect(paginateItems([1, 2, 3], 0, 2)).toEqual([1, 2]);
  });

  it("persists a follow-up client message in the conversation", async () => {
    const caller = appRouter.createCaller(createContext("user"));
    const result = await caller.shop.sendSupportMessage({ supportRequestId: 1, message: "Je souhaite ajouter une précision à ma demande." });
    expect(result).toEqual({ success: true });
    expect(inserted.at(-1)?.values).toMatchObject({ supportRequestId: 1, senderType: "client", senderId: 1, message: "Je souhaite ajouter une précision à ma demande." });
  });

  it("supports an admin reply on a delivery review", async () => {
    const adminCaller = appRouter.createCaller(createContext("admin"));
    const result = await adminCaller.shop.updateDeliveryReviewStatus({ reviewId: 1, status: "Traité", adminReply: "Merci pour votre retour." });
    expect(result).toEqual({ success: true });
    expect(updates[0]?.values).toMatchObject({ status: "Traité", adminReply: "Merci pour votre retour." });
  });

  it("returns client notifications and matches multi-criteria searches", () => {
    const notification = getFeedbackNotification([{ id: "support-live-1", updatedAt: new Date("2026-08-23T10:00:00Z"), status: "Traité", adminReply: "Réponse" }]);
    expect(notification).toContain("répondu");
    expect(matchesFeedbackSearch("client-reel +23675000000 commande 42", "75000000")).toBe(true);
    expect(matchesFeedbackSearch("client-reel commande 42", "inexistant")).toBe(false);
  });
});
