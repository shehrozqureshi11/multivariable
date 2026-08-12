import { NextResponse } from "next/server";
import { DEMO_USERS, fail } from "../../_lib";

export async function POST(req: Request) {
  let body: {
    email?: string;
    password?: string;
    fullName?: string;
    role?: string;
  } = {};
  try {
    body = await req.json();
  } catch {
    return fail("VALIDATION_ERROR", "Invalid JSON body");
  }
  const email = (body.email || "").trim().toLowerCase();
  if (!email || !body.password || !body.fullName) {
    return fail("VALIDATION_ERROR", "Missing required fields");
  }
  if (DEMO_USERS.some((u) => u.email === email)) {
    return fail("EMAIL_TAKEN", "Email already registered", 409);
  }
  const role =
    body.role === "FARM_OWNER" || body.role === "ADMIN" ? body.role : "INVESTOR";
  const user = {
    id: `demo-${Date.now()}`,
    email,
    fullName: body.fullName,
    role,
    password: body.password,
  };
  return NextResponse.json(
    {
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
        },
        accessToken: `demo.${Buffer.from(
          JSON.stringify({
            sub: user.id,
            role: user.role,
            email: user.email,
            fullName: user.fullName,
          })
        ).toString("base64url")}.token`,
        refreshToken: `demo-refresh.${user.id}.${Date.now()}`,
      },
    },
    { status: 201 }
  );
}
