// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import cache from "memory-cache";
import * as utils from "../../../utils";
import { fetchMagicEdenCollectionStats } from "../../../common/query";

type Data = {
  floorPrice?: number;
  error?: string;
};

const priceCache = new cache.Cache<string, number>();
const CACHE_TIME = 30000;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const symbol = req.query.symbol as string;
  const floorPrice = priceCache.get(symbol);

  if (floorPrice) {
    return res.status(200).json({ floorPrice });
  }

  try {
    const name = utils.mapSymbolToCollectionName(symbol);
    const stats = await fetchMagicEdenCollectionStats(name);
    priceCache.put(symbol, stats.floorPrice, CACHE_TIME);

    return res.status(200).json({ floorPrice: stats.floorPrice });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Internal Server Error";

    return res.status(500).json({ error: errorMessage });
  }
}
