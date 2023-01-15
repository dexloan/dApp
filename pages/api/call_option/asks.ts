import type { NextApiRequest, NextApiResponse } from "next";
import { CallOptionState } from "@prisma/client";

import * as utils from "../../../common/utils";
import prisma from "../../../common/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const {
    state,
    buyer,
    seller,
    collectionAddress,
    orderBy = "amount",
    sortOrder = "desc",
  } = req.query;

  const result = await prisma.callOption.findMany({
    where: {
      state: typeof state === "string" ? (state as CallOptionState) : undefined,
      buyer: typeof buyer === "string" ? buyer : undefined,
      seller: typeof seller === "string" ? seller : undefined,
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
