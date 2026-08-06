export const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "HerdShare API",
    version: "1.0.0",
    description:
      "Flutter-ready REST API for the HerdShare livestock investment platform.",
  },
  servers: [{ url: "/api/v1" }],
  components: {
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
    },
  },
  paths: {
    "/auth/register": {
      post: {
        summary: "Register investor or farm owner",
        tags: ["Auth"],
      },
    },
    "/auth/login": { post: { summary: "Login", tags: ["Auth"] } },
    "/auth/me": {
      get: {
        summary: "Current user",
        tags: ["Auth"],
        security: [{ bearerAuth: [] }],
      },
    },
    "/farms": {
      get: { summary: "List verified farms", tags: ["Farms"] },
      post: {
        summary: "Create farm",
        tags: ["Farms"],
        security: [{ bearerAuth: [] }],
      },
    },
    "/animals": {
      get: { summary: "Marketplace animal listings", tags: ["Animals"] },
      post: {
        summary: "List animal",
        tags: ["Animals"],
        security: [{ bearerAuth: [] }],
      },
    },
    "/investments": {
      post: {
        summary: "Invest in animal shares",
        tags: ["Investments"],
        security: [{ bearerAuth: [] }],
      },
    },
    "/investments/mine": {
      get: {
        summary: "Investor portfolio",
        tags: ["Investments"],
        security: [{ bearerAuth: [] }],
      },
    },
    "/wallet": {
      get: {
        summary: "Wallet balance and ledger",
        tags: ["Wallet"],
        security: [{ bearerAuth: [] }],
      },
    },
    "/payments/mine": {
      get: {
        summary: "Payment history",
        tags: ["Payments"],
        security: [{ bearerAuth: [] }],
      },
    },
    "/notifications": {
      get: {
        summary: "In-app notifications",
        tags: ["Notifications"],
        security: [{ bearerAuth: [] }],
      },
    },
    "/reports/investor": {
      get: {
        summary: "Investor KPIs",
        tags: ["Reports"],
        security: [{ bearerAuth: [] }],
      },
    },
    "/admin/stats": {
      get: {
        summary: "Admin dashboard stats",
        tags: ["Admin"],
        security: [{ bearerAuth: [] }],
      },
    },
  },
};
