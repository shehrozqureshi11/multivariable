import { fail, ok, parseDemoToken } from "../_lib";

export async function GET(req: Request) {
  const user = parseDemoToken(req.headers.get("authorization"));
  if (!user) return fail("UNAUTHORIZED", "Missing access token", 401);
  return ok([
    {
      id: "demo-note-1",
      title: "Welcome to HerdShare",
      body: "You are signed in with a demo account. Marketplace listings are available.",
      isRead: false,
    },
  ]);
}
