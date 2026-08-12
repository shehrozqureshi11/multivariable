import { fail, ok, parseDemoToken } from "../../_lib";

export async function GET(req: Request) {
  const user = parseDemoToken(req.headers.get("authorization"));
  if (!user) return fail("UNAUTHORIZED", "Missing access token", 401);
  if (user.role !== "ADMIN") return fail("FORBIDDEN", "Admin only", 403);
  return ok({
    users: 3,
    farms: 2,
    animals: 10,
    investments: 0,
  });
}
