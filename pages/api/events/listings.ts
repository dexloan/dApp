import type { NextApiRequest, NextApiResponse } from "next";
import { web3 } from "@project-serum/anchor";
import { Collection } from "@prisma/client";
import { snakeCase } from "snake-case";
import { sha256 } from "js-sha256";
import base58 from "bs58";

import * as utils from "../../../common/utils";
import * as query from "../../../common/query";
import { IDL } from "../../../common/idl/OndaListings";
import { getProgram, getProvider } from "../../../common/provider";
import { genIxIdentifier } from "../../../common/utils/idl";
import prisma from "../../../common/lib/prisma";
import { CallOptionBidData, LoanData } from "../../../common/types";

const ixIds = IDL.instructions.map((ix) => {
  return {
    name: ix.name,
    id: genIxIdentifier(ix.name),
  };
});

const connection = new web3.Connection(
  process.env.BACKEND_RPC_ENDPOINT as string,
  "processed"
);
const provider = getProvider(connection);
const program = getProgram(provider);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const events = req.body as any;

  for (const event of events) {
    const message = event.transaction.message;

    for (const ix of message.instructions) {
      const decoded = base58.decode(ix.data);
      const ixId = base58.encode(decoded.slice(0, 8));
      const ixName = ixIds.find((i) => i.id === ixId)?.name;
      const ixAccounts = IDL.instructions.find(
        (i) => i.name === ixName
      )?.accounts;

      if (ixName && ixAccounts) {
        switch (ixName) {
          case "initCollection":
          case "updateCollection": {
            const collectionAccountIndex = ixAccounts.findIndex(
              (a) => a.name === "collection"
            );
            const collectionMintIndex = ixAccounts.findIndex(
              (a) => a.name === "mint"
            );
            const collectionPda = new web3.PublicKey(
              message.accountKeys[ix.accounts[collectionAccountIndex]]
            );
            const collectionMint = new web3.PublicKey(
              message.accountKeys[ix.accounts[collectionMintIndex]]
            );

            const [data, metadata] = await Promise.all([
              program.account.collection.fetch(collectionPda),
              query.fetchMetadata(connection, collectionMint),
            ]);

            const collection: Collection = {
              mint: data.mint.toBase58(),
              authority: data.authority.toBase58(),
              disabled: false,
              // @ts-ignore
              ...(data.config as LoanData["config"]),
            };

            if (metadata) {
              collection.uri = utils.trimNullChars(metadata.data.uri);
              collection.name = utils.trimNullChars(metadata.data.name);
              collection.symbol = utils.trimNullChars(metadata.data.symbol);
            }

            await prisma.collection.upsert({
              where: {
                address: collectionPda.toBase58(),
              },
              update: {
                ...collection,
              },
              create: {
                ...collection,
                address: collectionPda.toBase58(),
                floorPrice: 0,
              },
            });
            break;
          }

          case "closeCollection": {
            const collectionAccountIndex = ixAccounts.findIndex(
              (a) => a.name === "collection"
            );
            const collectionPda = new web3.PublicKey(
              message.accountKeys[ix.accounts[collectionAccountIndex]]
            );

            await prisma.collection.update({
              where: {
                address: collectionPda.toBase58(),
              },
              data: {
                disabled: true,
              },
            });

            break;
          }

          /**
           * Loans
           */

          case "askLoan":
          case "giveLoan":
          case "repossess":
          case "repossessWithRental": {
            const loanAccountIndex = ixAccounts.findIndex(
              (a) => a.name === "loan"
            );
            const mintAccountIndex = ixAccounts.findIndex(
              (a) => a.name === "mint"
            );
            const loanPda = new web3.PublicKey(
              message.accountKeys[ix.accounts[loanAccountIndex]]
            );
            const mint = new web3.PublicKey(
              message.accountKeys[ix.accounts[mintAccountIndex]]
            );

            await upsertLoan(loanPda, mint);

            break;
          }

          case "repayLoan":
          case "closeLoan": {
            const loanAccountIndex = ixAccounts.findIndex(
              (a) => a.name === "loan"
            );
            const loanPda = new web3.PublicKey(
              message.accountKeys[ix.accounts[loanAccountIndex]]
            );

            await closeLoan(loanPda);

            break;
          }

          case "offerLoan": {
            const loanOfferAccountIndex = ixAccounts.findIndex(
              (a) => a.name === "loanOffer"
            );
            const collectionAccountIndex = ixAccounts.findIndex(
              (a) => a.name === "collection"
            );
            const loanOfferPda = new web3.PublicKey(
              message.accountKeys[ix.accounts[loanOfferAccountIndex]]
            );
            const collectionPda = new web3.PublicKey(
              message.accountKeys[ix.accounts[collectionAccountIndex]]
            );

            await createLoanOffer(loanOfferPda, collectionPda);

            break;
          }

          case "takeLoanOffer": {
            const loanAccountIndex = ixAccounts.findIndex(
              (a) => a.name === "loan"
            );
            const mintAccountIndex = ixAccounts.findIndex(
              (a) => a.name === "mint"
            );
            const loanOfferAccountIndex = ixAccounts.findIndex(
              (a) => a.name === "loanOffer"
            );
            const loanPda = new web3.PublicKey(
              message.accountKeys[ix.accounts[loanAccountIndex]]
            );
            const mint = new web3.PublicKey(
              message.accountKeys[ix.accounts[mintAccountIndex]]
            );
            const loanOfferPda = new web3.PublicKey(
              message.accountKeys[ix.accounts[loanOfferAccountIndex]]
            );

            await Promise.all([
              deleteLoanOffer(loanOfferPda),
              upsertLoan(loanPda, mint),
            ]);

            break;
          }

          case "closeLoanOffer": {
            const loanOfferAccountIndex = ixAccounts.findIndex(
              (a) => a.name === "loanOffer"
            );
            const loanOfferPda = new web3.PublicKey(
              message.accountKeys[ix.accounts[loanOfferAccountIndex]]
            );

            await deleteLoanOffer(loanOfferPda);

            break;
          }

          /**
           * Call Options
           **/

          case "askCallOption":
          case "buyCallOption":
          case "exerciseCallOption":
          case "exerciseCallOptionWithRental": {
            const callOptionAccountIndex = ixAccounts.findIndex(
              (a) => a.name === "callOption"
            );
            const mintAccountIndex = ixAccounts.findIndex(
              (a) => a.name === "mint"
            );
            const callOptionPda = new web3.PublicKey(
              message.accountKeys[ix.accounts[callOptionAccountIndex]]
            );
            const mint = new web3.PublicKey(
              message.accountKeys[ix.accounts[mintAccountIndex]]
            );

            await upsertCallOption(callOptionPda, mint);

            break;
          }

          case "closeCallOption": {
            const callOptionAccountIndex = ixAccounts.findIndex(
              (a) => a.name === "callOption"
            );
            const callOptionPda = new web3.PublicKey(
              message.accountKeys[ix.accounts[callOptionAccountIndex]]
            );

            await closeCallOption(callOptionPda);

            break;
          }

          case "bidCallOption": {
            const callOptionBidAccountIndex = ixAccounts.findIndex(
              (a) => a.name === "callOptionBid"
            );
            const collectionAccountIndex = ixAccounts.findIndex(
              (a) => a.name === "collection"
            );
            const callOptionBidPda = new web3.PublicKey(
              message.accountKeys[ix.accounts[callOptionBidAccountIndex]]
            );
            const collectionPda = new web3.PublicKey(
              message.accountKeys[ix.accounts[collectionAccountIndex]]
            );

            await createCallOptionBid(callOptionBidPda, collectionPda);

            break;
          }

          case "sellCallOption": {
            const callOptionAccountIndex = ixAccounts.findIndex(
              (a) => a.name === "callOption"
            );
            const callOptionBidAccountIndex = ixAccounts.findIndex(
              (a) => a.name === "callOptionBid"
            );
            const mintAccountIndex = ixAccounts.findIndex(
              (a) => a.name === "mint"
            );
            const callOptionPda = new web3.PublicKey(
              message.accountKeys[ix.accounts[callOptionAccountIndex]]
            );
            const mint = new web3.PublicKey(
              message.accountKeys[ix.accounts[mintAccountIndex]]
            );
            const callOptionBidPda = new web3.PublicKey(
              message.accountKeys[ix.accounts[callOptionBidAccountIndex]]
            );

            await Promise.all([
              deleteCallOptionBid(callOptionBidPda),
              upsertCallOption(callOptionPda, mint),
            ]);

            break;
          }

          case "closeCallOptionBid": {
            const callOptionBidAccountIndex = ixAccounts.findIndex(
              (a) => a.name === "callOptionBid"
            );
            const callOptionBidPda = new web3.PublicKey(
              message.accountKeys[ix.accounts[callOptionBidAccountIndex]]
            );

            await deleteCallOptionBid(callOptionBidPda);

            break;
          }

          default: {
            // Do nothing
          }
        }
      }
    }
  }

  res.status(200).end();
}

export async function upsertLoan(
  loanPda: web3.PublicKey,
  mint: web3.PublicKey
) {
  const [data, metadata] = await Promise.all([
    query.fetchLoan(program, loanPda),
    query.fetchMetadata(program.provider.connection, mint),
  ]);

  if (!data) {
    throw new Error("loan not found");
  }

  if (!metadata?.data.uri) {
    throw new Error("metadata uri not found");
  }

  if (!metadata.collection) {
    throw new Error("collection not found");
  }

  const collectionPda = await query.findCollectionAddress(
    metadata.collection?.key
  );

  const entry = {
    ...query.mapLoanEntry(data),
    uri: utils.trimNullChars(metadata.data.uri),
    Collection: {
      connect: {
        address: collectionPda.toBase58(),
      },
    },
  };

  return prisma.loan.upsert({
    where: {
      address: loanPda.toBase58(),
    },
    update: {
      ...entry,
    },
    create: {
      address: loanPda.toBase58(),
      ...entry,
    },
  });
}

async function closeLoan(loanPda: web3.PublicKey) {
  await prisma.loan.delete({
    where: {
      address: loanPda.toBase58(),
    },
  });
}

async function createLoanOffer(
  loanOfferPda: web3.PublicKey,
  collectionPda: web3.PublicKey
) {
  const data = await query.fetchLoanOffer(program, loanOfferPda);

  await prisma.loanOffer.create({
    data: {
      address: loanOfferPda.toBase58(),
      offerId: data.id,
      lender: data.lender.toBase58(),
      amount: data.amount ? utils.toBigInt(data.amount) : null,
      basisPoints: data.basisPoints,
      duration: utils.toBigInt(data.duration),
      ltv: data.ltv,
      threshold: data.threshold,
      Collection: {
        connect: {
          address: collectionPda.toBase58(),
        },
      },
    },
  });
}

async function deleteLoanOffer(loanOfferPda: web3.PublicKey) {
  await prisma.loanOffer.delete({
    where: {
      address: loanOfferPda.toBase58(),
    },
  });
}

async function upsertCallOption(
  callOptionPda: web3.PublicKey,
  mint: web3.PublicKey
) {
  const [data, metadata] = await Promise.all([
    query.fetchCallOption(program, callOptionPda),
    query.fetchMetadata(program.provider.connection, mint),
  ]);

  if (!data) {
    throw new Error("call option not found");
  }

  if (!metadata?.data.uri) {
    throw new Error("metadata uri not found");
  }

  if (!metadata.collection) {
    throw new Error("collection not found");
  }

  const collectionPda = await query.findCollectionAddress(
    metadata.collection?.key
  );

  const entry = {
    ...query.mapCallOptionEntry(data),
    uri: utils.trimNullChars(metadata.data.uri),
    Collection: {
      connect: {
        address: collectionPda.toBase58(),
      },
    },
  };

  await prisma.callOption.upsert({
    where: {
      address: callOptionPda.toBase58(),
    },
    update: {
      ...entry,
    },
    create: {
      address: callOptionPda.toBase58(),
      ...entry,
    },
  });
}

async function closeCallOption(callOptionPda: web3.PublicKey) {
  await prisma.callOption.delete({
    where: {
      address: callOptionPda.toBase58(),
    },
  });
}

async function createCallOptionBid(
  callOptionBidPda: web3.PublicKey,
  collectionPda: web3.PublicKey
) {
  const data = (await program.account.callOptionBid.fetch(
    callOptionBidPda
  )) as CallOptionBidData;

  await prisma.callOptionBid.create({
    data: {
      address: callOptionBidPda.toBase58(),
      bidId: data.id,
      buyer: data.buyer.toBase58(),
      amount: utils.toBigInt(data.amount),
      expiry: utils.toBigInt(data.expiry),
      strikePrice: utils.toBigInt(data.strikePrice),
      Collection: {
        connect: {
          address: collectionPda.toBase58(),
        },
      },
    },
  });
}

async function deleteCallOptionBid(callOptionBidPda: web3.PublicKey) {
  await prisma.callOptionBid.delete({
    where: {
      address: callOptionBidPda.toBase58(),
    },
  });
}
