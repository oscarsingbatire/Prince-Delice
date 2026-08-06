import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createMockContext(role: 'user' | 'admin' = 'user'): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "test-user-openid",
      email: "test@example.com",
      name: "Jean Test",
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
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("Shop Router Tests", () => {
  it("allows public fetching of delivery zones and products", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const zones = await caller.shop.getDeliveryZones();
    expect(Array.isArray(zones)).toBe(true);

    const products = await caller.shop.getProducts();
    expect(Array.isArray(products)).toBe(true);
  });
});
