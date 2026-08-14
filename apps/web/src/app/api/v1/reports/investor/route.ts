import { getDemoAnimal } from "@/lib/demo-catalog";
import { fail, ok, parseDemoToken, readPortfolio } from "../../_lib";

export async function GET(req: Request) {
  const user = parseDemoToken(req.headers.get("authorization"));
  if (!user) return fail("UNAUTHORIZED", "Missing access token", 401);

  const { investments } = await readPortfolio();
  const totalInvested = investments.reduce((sum, i) => sum + i.amountPkr, 0);
  // Projected payout on the demo listings, not realised profit.
  const totalProfit = investments.reduce((sum, i) => {
    const roi = getDemoAnimal(i.animalSlug)?.expectedRoiPercent || 0;
    return sum + Math.round((i.amountPkr * roi) / 100);
  }, 0);

  return ok({
    activeInvestments: investments.length,
    totalInvested,
    totalProfit,
  });
}
