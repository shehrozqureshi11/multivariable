import { getDemoAnimalById } from "@/lib/demo-catalog";
import {
  fail,
  okWithPortfolio,
  parseDemoToken,
  readPortfolio,
  sharesHeld,
} from "../_lib";

export async function POST(req: Request) {
  const user = parseDemoToken(req.headers.get("authorization"));
  if (!user) return fail("UNAUTHORIZED", "Missing access token", 401);
  if (user.role !== "INVESTOR") {
    return fail("FORBIDDEN", "Only investor accounts can fund shares", 403);
  }

  let animalId = "";
  let shares = 1;
  let arrangement = "";
  let acceptAgreement = false;
  try {
    const body = await req.json();
    animalId = String(body.animalId || "");
    shares = Number(body.shares) || 0;
    arrangement = String(body.arrangement || "");
    acceptAgreement = Boolean(body.acceptAgreement);
  } catch {
    return fail("VALIDATION_ERROR", "Invalid request body");
  }

  if (!acceptAgreement) {
    return fail("VALIDATION_ERROR", "You must accept the investment agreement");
  }
  if (!["FARM_PURCHASES", "INVESTOR_PROVIDES"].includes(arrangement)) {
    return fail("VALIDATION_ERROR", "Select a valid purchase arrangement");
  }
  if (shares < 1) return fail("VALIDATION_ERROR", "shares must be at least 1");

  const animal = getDemoAnimalById(animalId);
  if (!animal) return fail("NOT_FOUND", "Animal not found", 404);

  const portfolio = await readPortfolio();
  const alreadyHeld = sharesHeld(portfolio, animal.slug);
  const remaining = animal.availableShares - alreadyHeld;
  if (shares > remaining) {
    return fail(
      "NO_SHARES",
      remaining > 0
        ? `Only ${remaining} share(s) left in this listing`
        : "This listing is fully funded"
    );
  }

  const sharePrice = Number(animal.sharePricePkr || animal.pricePkr);
  const amountPkr = sharePrice * shares;
  const investment = {
    id: `demo-inv-${Date.now()}`,
    animalSlug: animal.slug,
    shares,
    amountPkr,
    arrangement: arrangement as "FARM_PURCHASES" | "INVESTOR_PROVIDES",
    status: "PENDING_DISCUSSION" as const,
    createdAt: new Date().toISOString(),
  };
  const next = {
    ...portfolio,
    investments: [...portfolio.investments, investment],
  };

  return okWithPortfolio(
    {
      id: investment.id,
      shares,
      amountPkr,
      arrangement: investment.arrangement,
      status: investment.status,
      animal: {
        name: animal.name,
        slug: animal.slug,
        farm: { name: animal.farm.name },
      },
    },
    next
  );
}
