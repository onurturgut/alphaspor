import { GET as getPlayerCard } from "../admin/player-card/route";

export const runtime = "nodejs";

export async function GET(request: Request) {
  return getPlayerCard(request);
}
