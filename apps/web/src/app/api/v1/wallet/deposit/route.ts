import {
  fail,
  okWithPortfolio,
  parseDemoToken,
  readPortfolio,
  walletFromPortfolio,
} from "../../_lib";

export async function POST(req: Request) {
  const user = parseDemoToken(req.headers.get("authorization"));
  if (!user) return fail("UNAUTHORIZED", "Missing access token", 401);
  let amount = 0;
  try {
    const body = await req.json();
    amount = Number(body.amountPkr) || 0;
  } catch {
    return fail("VALIDATION_ERROR", "Invalid body");
  }
  if (amount <= 0) return fail("VALIDATION_ERROR", "amountPkr must be positive");

  const portfolio = await readPortfolio();
  const next = {
    ...portfolio,
    deposits: [
      ...portfolio.deposits,
      {
        id: `demo-dep-${Date.now()}`,
        amountPkr: amount,
        createdAt: new Date().toISOString(),
      },
    ],
  };
  return okWithPortfolio(walletFromPortfolio(next), next);
}
