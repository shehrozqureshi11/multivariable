import { listFarms } from "../_lib";

export async function GET(req: Request) {
  return listFarms(new URL(req.url).searchParams);
}
