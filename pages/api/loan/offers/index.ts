import type { NextApiRequest, NextApiResponse } from "next";
import * as utils from "../../../../common/utils";
import prisma from "../../../../common/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const {
    lender,
    amount,
    duration,
    basisPoints,
    collectionAddress,
    orderBy = "amount",
    sortOrder = "desc",
  } = req.query;

  const result = await prisma.loanOffer.findMany({
    where: {
      lender: typeof lender === "string" ? lender : undefined,
      amount: typeof amount === "string" ? BigInt(amount) : undefined,
      duration: typeof duration === "string" ? BigInt(duration) : undefined,
      basisPoints:
        typeof basisPoints === "string" ? Number(basisPoints) : undefined,
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

  res.json(utils.parseBigInts(result));
}
