import { NextResponse } from "next/server";
import { DEMO_USERS, fail, issueDemoTokens } from "../../_lib";

export async function POST(req: Request) {
  let body: { email?: string; password?: string } = {};
  try {
    body = await req.json();
  } catch {
    return fail("VALIDATION_ERROR", "Invalid JSON body");
  }
  const email = (body.email || "").trim().toLowerCase();
  const password = body.password || "";
  if (!email || !password) {
    return fail("VALIDATION_ERROR", "Email and password are required");
  }
  const user = DEMO_USERS.find((u) => u.email === email);
  if (!user || user.password !== password) {
    return fail("INVALID_CREDENTIALS", "Invalid email or password", 401);
  }
  return NextResponse.json({ success: true, data: issueDemoTokens(user) });
}
