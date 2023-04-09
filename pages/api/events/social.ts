import type { NextApiRequest, NextApiResponse } from "next";
import { web3, AnchorProvider, Program, Wallet } from "@project-serum/anchor";
import { EntryType } from "@prisma/client";
import base58 from "bs58";

import { SOCIAL_PROGRAM_ID } from "../../../common/constants";
import { LeafSchema, EntryData } from "../../../common/types";
import { IDL, OndaSocial } from "../../../common/idl/OndaSocial";
import prisma from "../../../common/lib/prisma";
import { genIxIdentifier } from "../../../common/utils/idl";
import * as query from "../../../common/query";

const connection = new web3.Connection(
  process.env.BACKEND_RPC_ENDPOINT as string,
  "processed"
);

const ixIds = IDL.instructions.map((ix) => {
  return {
    name: ix.name,
    id: genIxIdentifier(ix.name),
  };
});

const wallet = new Wallet(web3.Keypair.generate());
const provider = new AnchorProvider(connection, wallet, {
  preflightCommitment: "confirmed",
  commitment: "confirmed",
});
const program = new Program<OndaSocial>(IDL, SOCIAL_PROGRAM_ID, provider);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const events = req.body as any;

  for (const event of events) {
    const message = event.transaction.message;

    for (const ix of message.instructions) {
      const ixData = base58.decode(ix.data);
      const ixId = base58.encode(ixData.slice(0, 8));
      const ixName = ixIds.find((i) => i.id === ixId)?.name;
      const ixAccounts = IDL.instructions.find(
        (i) => i.name === ixName
      )?.accounts;

      if (ixName === undefined || ixAccounts === undefined) {
        throw new Error(`Unknown instruction: ${ixId}`);
      }

      switch (ixName) {
        case "initForum": {
          break;
        }

        case "addEntry": {
          // Decode entry data
          const buffer = Buffer.from(ixData.slice(8));
          const entryDecoded = program.coder.types.decode(
            "EntryData",
            buffer
          ) as EntryData;
          // Decode schema event data
          const innerIx = event.transaction.meta.innerInstructions[0];
          const noopIx = innerIx.instructions[0];
          const serializedSchemaEvent = noopIx.data;
          const schemaEvent = base58.decode(serializedSchemaEvent);
          const schemaEventBuffer = Buffer.from(schemaEvent.slice(8));
          const schemaEventDecoded = program.coder.types.decode(
            "LeafSchema",
            schemaEventBuffer
          ) as LeafSchema;
          // Get forum address
          const forumConfigIndex = ixAccounts.findIndex(
            (account) => account.name === "forumConfig"
          );
          const forumAddress = message.accountKeys[forumConfigIndex];
          // Parse entry type
          const entryType = query.getState<EntryType>(
            schemaEventDecoded.entry_type
          );

          if (entryType === undefined) {
            throw new Error(
              `Unknown entry type: ${schemaEventDecoded.entry_type}`
            );
          }

          await prisma.entry.create({
            data: {
              id: schemaEventDecoded.id.toBase58(),
              forum: forumAddress,
              author: schemaEventDecoded.author.toBase58(),
              type: entryType,
              title: entryDecoded.title,
              content:
                entryDecoded.body || entryDecoded.src || entryDecoded.url,
              createdAt: schemaEventDecoded.created_at.toNumber(),
              nonce: schemaEventDecoded.nonce.toNumber(),
              parent: entryDecoded.parent?.toBase58(),
            },
          });

          break;
        }
      }
    }
  }

  res.status(200).end();
}
