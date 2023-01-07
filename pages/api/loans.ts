import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../common/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const result = await prisma.loan.findMany();
  console.log("result: ", result);
  res.json(result);
}
