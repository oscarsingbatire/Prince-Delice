import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type Role = "user" | "admin";

function createMockContext(role: Role = "user"): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "feedback-test-user",
      email: "feedback@example.com",
      name: "Client Test",
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

describe("Feedback and support flows", () => {
  it("rejects a delivery review with an invalid rating or empty comment", async () => {
    const caller = appRouter.createCaller(createMockContext("user"));

    await expect(caller.shop.submitDeliveryReview({ orderId: 1, rating: 6, comment: "Avis invalide" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    await expect(caller.shop.submitDeliveryReview({ orderId: 1, rating: 5, comment: "  " })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("rejects an expert request that is too short", async () => {
    const caller = appRouter.createCaller(createMockContext("user"));

    await expect(caller.shop.submitSupportRequest({ message: "ok" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("protects review and support queues from non-admin users", async () => {
    const caller = appRouter.createCaller(createMockContext("user"));

    await expect(caller.shop.getAdminDeliveryReviews()).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.shop.getSupportRequests()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("allows an administrator to access both queues", async () => {
    const caller = appRouter.createCaller(createMockContext("admin"));

    const reviews = await caller.shop.getAdminDeliveryReviews();
    const requests = await caller.shop.getSupportRequests();

    expect(Array.isArray(reviews)).toBe(true);
    expect(Array.isArray(requests)).toBe(true);
  });
});
