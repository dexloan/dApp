import type { NextApiRequest, NextApiResponse } from "next";
import { Collection, Prisma } from "@prisma/client";

import * as utils from "../../../../common/utils";
import prisma from "../../../../common/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const {
    collectionAddress,
    orderBy = "amount",
    sortOrder = "desc",
  } = req.query;

  let sortProp = Prisma.raw(orderBy as string);

  if (orderBy === "ltv") {
    sortProp = Prisma.sql`amount_floorPrice_ratio`;
  }

  const where = collectionAddress
    ? Prisma.sql`WHERE "collectionAddress" IN (${
        collectionAddress instanceof Array
          ? Prisma.join(
              collectionAddress.map((collection) => `'${collection}'`)
            )
          : Prisma.raw(`'${collectionAddress}'`)
      })`
    : Prisma.empty;

  const ascending = Prisma.sql`ASC`;
  const descending = Prisma.sql`DESC`;
  const order = Prisma.sql`ORDER BY ${sortProp} ${
    sortOrder === "asc" ? ascending : descending
  }`;
  const query = Prisma.sql`
    SELECT "collectionAddress", "amount", "basisPoints", "duration", "Collection"."floorPrice", (amount / "Collection"."floorPrice") AS "amount_floorPrice_ratio", COUNT(*) as _count
    FROM "LoanOffer"
    LEFT JOIN "Collection" ON "LoanOffer"."collectionAddress" = "Collection"."address"
    ${where}
    GROUP BY "collectionAddress", "amount", "basisPoints", "duration", "Collection"."floorPrice"
    ${order}
  `;

  const [offers, collections] = await Promise.all([
    prisma.$queryRaw(query),
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

  const result = (offers as any[]).map(
    ({ _count, amount_floorPrice_ratio, collectionAddress, ...offer }) => {
      return {
        ...offer,
        _count: Number(_count),
        Collection: collectionMap[collectionAddress],
      };
    }
  );

  res.json(utils.parseBigInts(result));
}
