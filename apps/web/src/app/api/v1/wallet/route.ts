import { fail, ok, parseDemoToken } from "../_lib";

export async function GET(req: Request) {
  const user = parseDemoToken(req.headers.get("authorization"));
  if (!user) return fail("UNAUTHORIZED", "Missing access token", 401);
  return ok({
    balancePkr: 500000,
    txns: [
      {
        id: "demo-txn-1",
        type: "DEPOSIT",
        amountPkr: 500000,
        note: "Demo starting balance",
        createdAt: new Date().toISOString(),
      },
    ],
  });
}
