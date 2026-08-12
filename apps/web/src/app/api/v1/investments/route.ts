import { fail, parseDemoToken } from "../_lib";

export async function POST(req: Request) {
  const user = parseDemoToken(req.headers.get("authorization"));
  if (!user) return fail("UNAUTHORIZED", "Missing access token", 401);
  if (user.role !== "INVESTOR") {
    return fail("FORBIDDEN", "Only investors can invest", 403);
  }
  return fail(
    "DEMO_MODE",
    "Demo listings are browse-only. Connect Railway + Supabase for live investing."
  );
}
