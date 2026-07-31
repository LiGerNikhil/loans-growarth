/**
 * RBAC Automated Test Suite
 *
 * Tests that every restricted API action returns 403 when attempted
 * by a lower-privileged role.
 *
 * Prerequisites:
 *   - MongoDB running with seeded SUPER_ADMIN user
 *   - Three test users exist: agent@test.com, manager@test.com, admin@test.com
 *   - At least one lead exists in the database
 *
 * Run: npx playwright test tests/rbac.spec.ts
 */

import { test, expect } from "@playwright/test";

const BASE = "https://loans.growarthcapita.com";

const CREDENTIALS: Record<string, { email: string; password: string }> = {
  AGENT: { email: "agent@test.com", password: "Agent@1234" },
  MANAGER: { email: "manager@test.com", password: "Manager@1234" },
  SUPER_ADMIN: { email: "admin@growarthcapita.com", password: "Admin@1234" },
};

/** Sign in via NextAuth credentials and return the session cookie */
async function signInAs(role: string, page: import("@playwright/test").Page) {
  await page.goto(`${BASE}/admin/login`);
  const creds = CREDENTIALS[role];
  await page.fill("#email", creds.email);
  await page.fill("#password", creds.password);
  await page.click('button[type="submit"]');
  await page.waitForURL("**/admin/dashboard");
}

/** Fetch an API endpoint with session cookies attached */
async function apiFetch(
  page: import("@playwright/test").Page,
  url: string,
  options?: { method?: string; body?: unknown }
) {
  const cookies = await page.context().cookies();
  const cookieHeader = cookies.map((c) => `${c.name}=${c.value}`).join("; ");

  return fetch(`${BASE}${url}`, {
    method: options?.method || "GET",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieHeader,
    },
    body: options?.body ? JSON.stringify(options.body) : undefined,
  });
}

// ──────────────────────────────────────────────────────────
// HELPER: resolves to a valid lead ID for use in tests
// ──────────────────────────────────────────────────────────
let cachedLeadId: string | null = null;
async function getLeadId(page: import("@playwright/test").Page): Promise<string> {
  if (cachedLeadId) return cachedLeadId;
  await signInAs("SUPER_ADMIN", page);
  const res = await apiFetch(page, "/api/leads?limit=1");
  const data = await res.json();
  cachedLeadId = data.leads?.[0]?._id || "";
  return cachedLeadId;
}

// ──────────────────────────────────────────────────────────
// TESTS
// ──────────────────────────────────────────────────────────

test.describe("RBAC — API route access control", () => {
  test.describe("AGENT role", () => {
    test("POST /api/leads/assign returns 403", async ({ page }) => {
      await signInAs("AGENT", page);
      const res = await apiFetch(page, "/api/leads/assign", {
        method: "POST",
        body: { leadIds: ["dummy"], assignedTo: "dummy" },
      });
      expect(res.status).toBe(403);
    });

    test("GET /api/leads/export returns 403", async ({ page }) => {
      await signInAs("AGENT", page);
      const res = await apiFetch(page, "/api/leads/export?format=csv");
      expect(res.status).toBe(403);
    });

    test("GET /api/reports returns 403", async ({ page }) => {
      await signInAs("AGENT", page);
      const res = await apiFetch(page, "/api/reports");
      expect(res.status).toBe(403);
    });

    test("GET /api/activities returns 403", async ({ page }) => {
      await signInAs("AGENT", page);
      const res = await apiFetch(page, "/api/activities");
      expect(res.status).toBe(403);
    });

    test("GET /api/users returns 403", async ({ page }) => {
      await signInAs("AGENT", page);
      const res = await apiFetch(page, "/api/users");
      expect(res.status).toBe(403);
    });

    test("POST /api/users returns 403", async ({ page }) => {
      await signInAs("AGENT", page);
      const res = await apiFetch(page, "/api/users", {
        method: "POST",
        body: { name: "X", email: "x@x.com", password: "12345678", role: "AGENT" },
      });
      expect(res.status).toBe(403);
    });
  });

  test.describe("MANAGER role", () => {
    test("GET /api/activities returns 403", async ({ page }) => {
      await signInAs("MANAGER", page);
      const res = await apiFetch(page, "/api/activities");
      expect(res.status).toBe(403);
    });

    test("GET /api/users returns 403", async ({ page }) => {
      await signInAs("MANAGER", page);
      const res = await apiFetch(page, "/api/users");
      expect(res.status).toBe(403);
    });

    test("POST /api/users returns 403", async ({ page }) => {
      await signInAs("MANAGER", page);
      const res = await apiFetch(page, "/api/users", {
        method: "POST",
        body: { name: "X", email: "x@x.com", password: "12345678", role: "AGENT" },
      });
      expect(res.status).toBe(403);
    });
  });

  test.describe("SUPER_ADMIN — full access", () => {
    test("GET /api/activities returns 200", async ({ page }) => {
      await signInAs("SUPER_ADMIN", page);
      const res = await apiFetch(page, "/api/activities");
      expect(res.status).toBe(200);
    });

    test("GET /api/users returns 200", async ({ page }) => {
      await signInAs("SUPER_ADMIN", page);
      const res = await apiFetch(page, "/api/users");
      expect(res.status).toBe(200);
    });
  });

  test.describe("Lead-level RBAC — AGENT cross-lead access", () => {
    test("PATCH another agent's lead returns 403", async ({ page }) => {
      const leadId = await getLeadId(page);
      if (!leadId) return; // skip if no leads
      await signInAs("AGENT", page);
      const res = await apiFetch(page, `/api/leads/${leadId}`, {
        method: "PATCH",
        body: { status: "CONTACTED" },
      });
      // expects 403 OR 404 depending on whether lead is assigned to this agent
      expect([403, 404]).toContain(res.status);
    });
  });

  test.describe("Unauthenticated access", () => {
    test("GET /api/leads returns 401", async () => {
      const res = await fetch(`${BASE}/api/leads`);
      expect(res.status).toBe(401);
    });

    test("GET /api/users returns 401", async () => {
      const res = await fetch(`${BASE}/api/users`);
      expect(res.status).toBe(401);
    });

    test("GET /admin/dashboard redirects to login", async ({ page }) => {
      await page.goto(`${BASE}/admin/dashboard`);
      expect(page.url()).toContain("/admin/login");
    });
  });
});
