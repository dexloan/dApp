import type { NextApiRequest, NextApiResponse } from "next";
import * as utils from "../../../../common/utils";
import prisma from "../../../../common/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const {
    buyer,
    amount,
    strikePrice,
    expiry,
    collectionAddress,
    orderBy = "amount",
    sortOrder = "desc",
  } = req.query;

  const result = await prisma.callOptionBid.findMany({
    where: {
      buyer: typeof buyer === "string" ? buyer : undefined,
      amount: typeof amount === "string" ? BigInt(amount) : undefined,
      strikePrice:
        typeof strikePrice === "string" ? BigInt(strikePrice) : undefined,
      expiry: typeof expiry === "string" ? BigInt(expiry) : undefined,
      collectionAddress: {
        in: collectionAddress,
      },
    },
    include: {
      Collection: true,
    },
    orderBy: {
      [orderBy as string]: sortOrder,
    },
  });

  res.json(utils.parseBitInts(result));
}
