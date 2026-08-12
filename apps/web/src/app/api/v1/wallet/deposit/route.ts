import { fail, ok, parseDemoToken } from "../../_lib";

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
  return ok({
    balancePkr: 500000 + amount,
    txns: [],
  });
}
