import type { NextApiRequest, NextApiResponse } from "next";

import * as utils from "../../../../common/utils";
import prisma from "../../../../common/lib/prisma";
import { Collection } from "@prisma/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const {
    collectionAddress,
    orderBy = "amount",
    sortOrder = "desc",
  } = req.query;

  const [offers, collections] = await Promise.all([
    prisma.loanOffer.groupBy({
      by: ["collectionAddress", "amount", "basisPoints", "duration"],
      _count: true,
      where: {
        collectionAddress: {
          in: collectionAddress,
        },
      },
      orderBy: {
        // TODO: Fix this type error
        [orderBy as "amount"]: sortOrder as "asc" | "desc",
      },
    }),
    prisma.collection.findMany({
      where: {
        address: {
          in: collectionAddress,
        },
      },
    }),
  ]);
  const collectionMap = collections.reduce((acc, collection) => {
    acc[collection.address] = collection;
    return acc;
  }, {} as Record<string, Collection>);
  const result = offers.map(({ collectionAddress, ...offer }) => {
    return {
      ...offer,
      Collection: collectionMap[collectionAddress],
    };
  });

  res.json(utils.parseBitInts(result));
}
