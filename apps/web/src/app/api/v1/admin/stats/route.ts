import { DEMO_ANIMALS, DEMO_FARMS } from "@/lib/demo-catalog";
import { DEMO_USERS, fail, ok, parseDemoToken, readPortfolio } from "../../_lib";

export async function GET(req: Request) {
  const user = parseDemoToken(req.headers.get("authorization"));
  if (!user) return fail("UNAUTHORIZED", "Missing access token", 401);
  if (user.role !== "ADMIN") return fail("FORBIDDEN", "Admin only", 403);

  const { investments } = await readPortfolio();
  const volumePkr = investments.reduce((sum, i) => sum + i.amountPkr, 0);

  return ok({
    users: DEMO_USERS.length,
    farmsPending: 0,
    farmsApproved: DEMO_FARMS.filter((f) => f.status === "APPROVED").length,
    animals: DEMO_ANIMALS.length,
    investments: investments.length,
    volumePkr,
    openDisputes: 0,
  });
}
