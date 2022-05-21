import type { NextApiRequest, NextApiResponse } from "next";
import Redis from "ioredis";
import * as utils from "../../../utils";
import { fetchMagicEdenCollectionStats } from "../../../common/query";

type Data = {
  floorPrice?: number;
  error?: string;
};

const EXPIRY = 60 * 5; // 5 minutes
const client = new Redis(process.env.REDIS_URL as string);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const symbol = req.query.symbol as string;
  const floorPrice = await client.get(symbol);

  if (floorPrice) {
    return res.status(200).json({ floorPrice: parseInt(floorPrice) });
  }

  try {
    const name = utils.mapSymbolToCollectionName(symbol);
    const stats = await queuedTimeout(() =>
      fetchMagicEdenCollectionStats(name)
    );
    client.set(symbol, stats.floorPrice, "EX", EXPIRY);

    return res.status(200).json({ floorPrice: stats.floorPrice });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Internal Server Error";

    return res.status(500).json({ error: errorMessage });
  }
}

let queued = 0;

function queuedTimeout(callback: () => Promise<any>): Promise<any> {
  queued++;

  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      callback()
        .then((response) => {
          queued--;
          resolve(response);
        })
        .catch(reject);
    }, queued * 100);
  });
}
