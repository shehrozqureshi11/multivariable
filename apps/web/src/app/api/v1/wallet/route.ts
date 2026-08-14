import { fail, ok, parseDemoToken, readPortfolio, walletFromPortfolio } from "../_lib";

export async function GET(req: Request) {
  const user = parseDemoToken(req.headers.get("authorization"));
  if (!user) return fail("UNAUTHORIZED", "Missing access token", 401);
  return ok(walletFromPortfolio(await readPortfolio()));
}
