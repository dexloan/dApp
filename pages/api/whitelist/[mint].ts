import type { NextApiRequest, NextApiResponse } from "next";
import Redis from "ioredis";

const client = new Redis(process.env.REDIS_URL as string);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<string>
) {
  const mint = req.query.mint as string;
  const isMember = await client.sismember("whitelist", mint);

  if (isMember === 1) {
    return res.status(200).json("OK");
  }

  return res.status(422).json("Mint not whitelisted");
}
