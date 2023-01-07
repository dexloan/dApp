import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../common/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  return prisma.loan.findMany();
}
