import type { NextApiRequest, NextApiResponse } from "next";
import { LoanState } from "@prisma/client";
import * as utils from "../../../common/utils";
import prisma from "../../../common/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const query = req.query;
  const result = await prisma.loan.findMany({
    where: query,
    include: {
      Collection: true,
    },
  });

  res.json(utils.parseBitInts(result));
}
