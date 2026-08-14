import { fail, hydrateInvestments, ok, parseDemoToken, readPortfolio } from "../../_lib";

export async function GET(req: Request) {
  const user = parseDemoToken(req.headers.get("authorization"));
  if (!user) return fail("UNAUTHORIZED", "Missing access token", 401);
  return ok(hydrateInvestments(await readPortfolio()));
}
