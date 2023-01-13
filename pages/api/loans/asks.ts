import type { NextApiRequest, NextApiResponse } from "next";
import * as utils from "../../../common/utils";
import prisma from "../../../common/lib/prisma";
import { LoanState } from "@prisma/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { state, collectionAddress } = req.query;

  const collections = [];

  if (collectionAddress instanceof Array) {
    collections.push(...collectionAddress);
  } else if (typeof collectionAddress === "string") {
    collections.push(collectionAddress);
  }

  const result = await prisma.loan.findMany({
    where: {
      state: typeof state === "string" ? (state as LoanState) : undefined,
      collectionAddress: {
        in: collectionAddress ? collections : undefined,
      },
    },
    include: {
      Collection: true,
    },
  });

  res.json(utils.parseBitInts(result));
}
