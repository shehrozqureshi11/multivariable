import { fail, ok, parseDemoToken } from "../../../_lib";
import { DEMO_ANIMALS, DEMO_FARMS } from "@/lib/demo-catalog";

export async function GET(req: Request) {
  const user = parseDemoToken(req.headers.get("authorization"));
  if (!user) return fail("UNAUTHORIZED", "Missing access token", 401);
  const farm = {
    ...DEMO_FARMS[0],
    animals: DEMO_ANIMALS.filter((a) => a.farm.slug === DEMO_FARMS[0].slug),
    expenses: [],
    _count: { animals: 6 },
  };
  return ok(farm);
}
