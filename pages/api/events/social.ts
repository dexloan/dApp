import type { NextApiRequest, NextApiResponse } from "next";
import { web3, AnchorProvider, Program, Wallet } from "@project-serum/anchor";
import { EntryType } from "@prisma/client";
import { snakeCase } from "snake-case";
import { sha256 } from "js-sha256";
import base58 from "bs58";

import { SOCIAL_PROGRAM_ID } from "../../../common/constants";
import { LeafSchema, EntryData } from "../../../common/types";
import { IDL, OndaSocial } from "../../../common/idl/OndaSocial";
import prisma from "../../../common/lib/prisma";
import * as query from "../../../common/query";

const connection = new web3.Connection(
  process.env.BACKEND_RPC_ENDPOINT as string,
  "processed"
);

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
    const transaction = event.transaction;
    const innerInstructions = transaction.meta.innerInstructions[0];
    const noopIx = innerInstructions.instructions[0];
    const serializedEvent = noopIx.data;
    const schemaEvent = base58.decode(serializedEvent);
    const schemaEventBuffer = Buffer.from(schemaEvent.slice(8));
    const schemaEventDecoded = program.coder.types.decode(
      "LeafSchema",
      schemaEventBuffer
    ) as LeafSchema;
    console.log("Decoded: ", schemaEventDecoded);

    const outerIx = transaction.transaction.message.instructions[0];
    const data = outerIx.data;
    const entry = base58.decode(data);
    const buffer = Buffer.from(entry.slice(8));
    const entryDecoded = program.coder.types.decode(
      "EntryData",
      buffer
    ) as EntryData;
    console.log("Entry: ", entryDecoded);

    const entryType = query.getState<EntryType>(schemaEventDecoded.entry_type);

    if (entryType === undefined) {
      throw new Error(`Unknown entry type: ${schemaEventDecoded.entry_type}`);
    }

    await prisma.entry.create({
      data: {
        id: schemaEventDecoded.id.toBase58(),
        author: schemaEventDecoded.author.toBase58(),
        type: entryType,
        title: entryDecoded.title,
        content: entryDecoded.body || entryDecoded.src || entryDecoded.url,
        createdAt: schemaEventDecoded.created_at.toNumber(),
        nonce: schemaEventDecoded.nonce.toNumber(),
        parent: entryDecoded.parent?.toBase58(),
      },
    });
  }

  res.status(200).end();
}
