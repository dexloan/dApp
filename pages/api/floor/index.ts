import type { NextApiRequest, NextApiResponse } from "next";
import { Redis } from "@upstash/redis";
import * as utils from "../../../common/utils";

type Data = {
  floorPrice?: number;
  error?: string;
};

const EXPIRY = 60 * 30; // 30 minutes

const client = new Redis({
  url: process.env.REDIS_URL as string,
  token: process.env.REDIS_TOKEN as string,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const symbolsIterator = utils.nameMap.keys();

  let nextSymbol = symbolsIterator.next();

  const floorPrices: Record<string, number> = {};

  while (!nextSymbol.done) {
    const symbol = nextSymbol.value as string;
    const floorPrice = await client.get<string>(symbol);

    if (floorPrice) {
      floorPrices[symbol.toLowerCase()] = parseInt(floorPrice);
    } else {
      const name = utils.mapSymbolToCollectionName(symbol);
      const stats = await queuedTimeout(() =>
        fetchMagicEdenCollectionStats(name)
      );
      client.set(symbol, stats.floorPrice, { ex: EXPIRY });
      floorPrices[symbol.toLowerCase()] = parseInt(stats.floorPrice);
    }
    nextSymbol = symbolsIterator.next();
  }

  return res.status(200).json(floorPrices);
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

async function fetchMagicEdenCollectionStats(symbol: string) {
  const response = await fetch(
    `https://api-mainnet.magiceden.dev/v2/collections/${symbol}/stats`
  );

  return response.json();
}