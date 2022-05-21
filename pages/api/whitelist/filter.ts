import type { NextApiRequest, NextApiResponse } from "next";
import Redis from "ioredis";

const client = new Redis(process.env.REDIS_URL as string);

interface FilteredMintsResponse {
  mints: string[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<FilteredMintsResponse>
) {
  const mints = JSON.parse(req.body).mints as string[];
  const members = await client.smismember("whitelist", mints);
  const whitelisted = mints.filter((_, i) => members[i] === 1);

  return res.status(200).json({ mints: whitelisted });
}
