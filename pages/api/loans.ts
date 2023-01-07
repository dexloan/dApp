import type { NextApiRequest, NextApiResponse } from "next";
import type { Loan } from "@prisma/client";
import prisma from "../../common/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const result = await prisma.loan.findMany();

  res.json(
    JSON.parse(
      JSON.stringify(result, (key, value) =>
        typeof value === "bigint" ? value.toString() : value
      )
    )
  );
}
