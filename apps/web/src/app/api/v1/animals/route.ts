import { listAnimals } from "../_lib";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  return listAnimals(searchParams);
}
