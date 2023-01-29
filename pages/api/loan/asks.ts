import type { NextApiRequest, NextApiResponse } from "next";
import { LoanState } from "@prisma/client";

import * as utils from "../../../common/utils";
import prisma from "../../../common/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const {
    state,
    lender,
    borrower,
    collectionAddress,
    orderBy = "amount",
    sortOrder = "desc",
  } = req.query;

  const result = await prisma.loan.findMany({
    where: {
      state: typeof state === "string" ? (state as LoanState) : undefined,
      lender: typeof lender === "string" ? lender : undefined,
      borrower: typeof borrower === "string" ? borrower : undefined,
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

/**
 * Queries for LTV (Loan-to-Value) of a loan.
 * ================================
 * SELECT * FROM Loan
 * JOIN Collection ON Loan.collectionAddress = Collection.address
 * WHERE (Loan.amount / Collection.floorPrice) * 100 = [specified LTV value];
 * ================================
 * SELECT * FROM Loan
 * JOIN Collection ON Loan.collectionAddress = Collection.address
 * ORDER BY (Loan.amount / Collection.floorPrice) * 100 DESC;
 * ================================
 * const loans = await prisma.loan.findMany({
 * include: { Collection: true },
 * orderBy: {
 *   'amount / Collection.floorPrice': 'desc'
 * }
 * });
 */
