import type { NextApiRequest, NextApiResponse } from "next";
import * as utils from "../../../common/utils";
import prisma from "../../../common/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const query = req.query;
  const result = await prisma.collection.findMany({
    where: query,
  });

  res.json(utils.parseBitInts(result));
}
