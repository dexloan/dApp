import type { NextApiRequest, NextApiResponse } from "next";
import * as utils from "../../../common/utils";
import prisma from "../../../common/lib/prisma";
import { LoanState } from "@prisma/client";

function getSortOrder(query: NextApiRequest["query"]) {
  switch (query.sortOrder) {
    case "asc":
      return "asc";
    case "desc":
    default:
      return "desc";
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const {
    state,
    collectionAddress,
    orderBy = "amount",
    sortOrder = "desc",
  } = req.query;

  const result = await prisma.loan.findMany({
    where: {
      state: typeof state === "string" ? (state as LoanState) : undefined,
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
