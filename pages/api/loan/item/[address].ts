import type { NextApiRequest, NextApiResponse } from "next";

import * as utils from "../../../../common/utils";
import prisma from "../../../../common/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { address } = req.query;

  const result = await prisma.loan.findFirst({
    where: {
      address: address as string,
    },
    include: {
      Collection: true,
    },
  });

  res.json(utils.parseBigInts(result));
}
