import type { NextApiRequest, NextApiResponse } from "next";
import { web3 } from "@project-serum/anchor";
import { LoanState, CallOptionState } from "@prisma/client";
import camelcase from "camelcase";
import { snakeCase } from "snake-case";
import { sha256 } from "js-sha256";
import base58 from "bs58";

import { IDL } from "../../common/idl";
import * as utils from "../../common/utils";
import { getProgram, getProvider } from "../../common/provider";
import prisma from "../../common/lib/prisma";
import {
  CallOptionBidData,
  CallOptionData,
  CollectionData,
  LoanData,
  LoanOfferData,
} from "../../common/types";
import { Metadata } from "@metaplex-foundation/mpl-token-metadata";
import { findMetadataAddress } from "../../common/query";

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
  console.log("rpcEndpoint: ", connection.rpcEndpoint);
  for (const event of events) {
    const message = event.transaction.message;

    for (const ix of message.instructions) {
      console.log("ixIds: ", ixIds);
      console.log("ix:", ix);

      const decoded = base58.decode(ix.data);
      console.log("decoded: ", decoded);
      const ixId = base58.encode(decoded.slice(0, 8));
      console.log("ixId: ", ixId);
      const ixName = ixIds.find((i) => i.id === ixId)?.name;
      const ixAccounts = IDL.instructions.find(
        (i) => i.name === ixName
      )?.accounts;
      console.log("ixName: ", ixName);
      console.log("ixAccounts: ", ixAccounts);

      if (ixName && ixAccounts) {
        switch (ixName) {
          case "initCollection":
          case "updateCollection": {
            const collectionAccountIndex = ixAccounts.findIndex(
              (a) => a.name === "collection"
            );
            const collectionPda = new web3.PublicKey(
              message.accountKeys[ix.accounts[collectionAccountIndex]]
            );

            const data = (await program.account.collection.fetch(
              collectionPda
            )) as CollectionData;

            const [metadataPda] = await findMetadataAddress(data.mint);

            // Sometimes collection mints don't have metadata
            let metadata = null;

            try {
              metadata = await Metadata.fromAccountAddress(
                connection,
                metadataPda
              );
            } catch {}

            const collection = {
              mint: data.mint.toBase58(),
              authority: data.authority.toBase58(),
              disabled: false,
              // @ts-ignore
              ...data.config,
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
                address: collectionPda.toBase58(),
                floorPrice: 0,
                ...collection,
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

            console.log("where address: ", collectionPda.toBase58());
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

          case "askLoan": {
            const loanAccountIndex = ixAccounts.findIndex(
              (a) => a.name === "loan"
            );
            const collectionAccountIndex = ixAccounts.findIndex(
              (a) => a.name === "collection"
            );
            const loanPda = new web3.PublicKey(
              message.accountKeys[ix.accounts[loanAccountIndex]]
            );
            const collectionPda = new web3.PublicKey(
              message.accountKeys[ix.accounts[collectionAccountIndex]]
            );

            await createLoan(loanPda, collectionPda);

            break;
          }

          case "giveLoan": {
            const loanAccountIndex = ixAccounts.findIndex(
              (a) => a.name === "loan"
            );
            const loanPda = new web3.PublicKey(
              message.accountKeys[ix.accounts[loanAccountIndex]]
            );

            await updateLoan(loanPda, LoanState.Listed);

            break;
          }

          case "repossess":
          case "repossessWithRental": {
            const loanAccountIndex = ixAccounts.findIndex(
              (a) => a.name === "loan"
            );
            const loanPda = new web3.PublicKey(
              message.accountKeys[ix.accounts[loanAccountIndex]]
            );

            await updateLoan(loanPda, LoanState.Active);

            break;
          }

          case "repayLoan": {
            const loanAccountIndex = ixAccounts.findIndex(
              (a) => a.name === "loan"
            );
            const loanPda = new web3.PublicKey(
              message.accountKeys[ix.accounts[loanAccountIndex]]
            );

            await updateLoan(loanPda, LoanState.Repaid);

            break;
          }

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
            const loanOfferAccountIndex = ixAccounts.findIndex(
              (a) => a.name === "loanOffer"
            );
            const collectionAccountIndex = ixAccounts.findIndex(
              (a) => a.name === "collection"
            );
            const loanPda = new web3.PublicKey(
              message.accountKeys[ix.accounts[loanAccountIndex]]
            );
            const loanOfferPda = new web3.PublicKey(
              message.accountKeys[ix.accounts[loanOfferAccountIndex]]
            );
            const collectionPda = new web3.PublicKey(
              message.accountKeys[ix.accounts[collectionAccountIndex]]
            );

            await Promise.all([
              deleteLoanOffer(loanOfferPda),
              createLoan(loanPda, collectionPda),
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

          /* Call Options */

          case "askCallOption": {
            const callOptionAccountIndex = ixAccounts.findIndex(
              (a) => a.name === "callOption"
            );
            const collectionAccountIndex = ixAccounts.findIndex(
              (a) => a.name === "collection"
            );
            const callOptionPda = new web3.PublicKey(
              message.accountKeys[ix.accounts[callOptionAccountIndex]]
            );
            const collectionPda = new web3.PublicKey(
              message.accountKeys[ix.accounts[collectionAccountIndex]]
            );

            await createCallOption(callOptionPda, collectionPda);

            break;
          }

          case "buyCallOption": {
            const callOptionAccountIndex = ixAccounts.findIndex(
              (a) => a.name === "callOption"
            );
            const callOptionPda = new web3.PublicKey(
              message.accountKeys[ix.accounts[callOptionAccountIndex]]
            );

            await updateCallOption(callOptionPda, CallOptionState.Listed);

            break;
          }

          case "closeCallOption": {
            const callOptionAccountIndex = ixAccounts.findIndex(
              (a) => a.name === "loan"
            );
            const callOptionPda = new web3.PublicKey(
              message.accountKeys[ix.accounts[callOptionAccountIndex]]
            );

            await closeCallOption(callOptionPda);

            break;
          }

          case "exerciseCallOption":
          case "exerciseCallOptionWithRental": {
            const callOptionAccountIndex = ixAccounts.findIndex(
              (a) => a.name === "callOption"
            );
            const callOptionPda = new web3.PublicKey(
              message.accountKeys[ix.accounts[callOptionAccountIndex]]
            );

            await updateCallOption(callOptionPda, CallOptionState.Active);

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
            const collectionAccountIndex = ixAccounts.findIndex(
              (a) => a.name === "collection"
            );
            const callOptionPda = new web3.PublicKey(
              message.accountKeys[ix.accounts[callOptionAccountIndex]]
            );
            const callOptionBidPda = new web3.PublicKey(
              message.accountKeys[ix.accounts[callOptionBidAccountIndex]]
            );
            const collectionPda = new web3.PublicKey(
              message.accountKeys[ix.accounts[collectionAccountIndex]]
            );

            await Promise.all([
              deleteCallOptionBid(callOptionBidPda),
              createCallOption(callOptionPda, collectionPda),
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

function genIxIdentifier(ixName: string) {
  const namespace = "global";
  const name = snakeCase(ixName);
  const preimage = `${namespace}:${name}`;
  return base58.encode(sha256.digest(preimage).slice(0, 8));
}

function getState<T>(state: unknown) {
  let formattedState;

  if (typeof state === "object" && state !== null) {
    formattedState = camelcase(Object.keys(state)[0], {
      pascalCase: true,
    }) as T;
  }

  return formattedState;
}

async function fetchLoan(loanPda: web3.PublicKey) {
  return utils.asyncRetry<LoanData>(async () => {
    return (await program.account.loan.fetch(loanPda)) as LoanData;
  });
}

async function fetchLoanOffer(loanOfferPda: web3.PublicKey) {
  return utils.asyncRetry<LoanOfferData>(async () => {
    return (await program.account.loanOffer.fetch(
      loanOfferPda
    )) as LoanOfferData;
  });
}

async function fetchCallOption(callOptionPda: web3.PublicKey) {
  return utils.asyncRetry<CallOptionData>(async () => {
    return (await program.account.callOption.fetch(
      callOptionPda
    )) as CallOptionData;
  });
}

async function fetchCallOptionBid(callOptionBidPda: web3.PublicKey) {
  return utils.asyncRetry<CallOptionBidData>(async () => {
    return (await program.account.callOptionBid.fetch(
      callOptionBidPda
    )) as CallOptionBidData;
  });
}

function mapLoanEntry(data: LoanData) {
  const state = getState<LoanState>(data.state);

  if (state === undefined) {
    throw new Error("state not found");
  }

  return {
    state,
    amount: data.amount ? utils.toBigInt(data.amount) : undefined,
    basisPoints: data.basisPoints,
    creatorBasisPoints: data.creatorBasisPoints,
    outstanding: utils.toBigInt(data.outstanding),
    threshold: data.threshold,
    borrower: data.borrower.toBase58(),
    lender: data.lender?.toBase58(),
    installments: data.installments,
    currentInstallment: data.currentInstallment,
    noticeIssued: data.noticeIssued
      ? utils.toBigInt(data.noticeIssued)
      : undefined,
    duration: utils.toBigInt(data.duration),
    startDate: data.startDate ? utils.toBigInt(data.startDate) : undefined,
    mint: data.mint.toBase58(),
    tokenMint: data.tokenMint?.toBase58(),
  };
}

function mapCallOptionEntry(data: CallOptionData) {
  const state = getState<CallOptionState>(data.state);

  if (state === undefined) {
    throw new Error("state not found");
  }

  return {
    state,
    amount: utils.toBigInt(data.amount),
    creatorBasisPoints: data.creatorBasisPoints,
    seller: data.seller?.toBase58(),
    buyer: data.buyer?.toBase58(),
    expiry: utils.toBigInt(data.expiry),
    strikePrice: utils.toBigInt(data.strikePrice),
    mint: data.mint.toBase58(),
    tokenMint: data.tokenMint?.toBase58(),
  };
}

async function createLoan(
  loanPda: web3.PublicKey,
  collectionPda: web3.PublicKey
) {
  const data = await fetchLoan(loanPda);

  if (!data) {
    throw new Error("loan not found");
  }

  return prisma.loan.create({
    data: {
      ...mapLoanEntry(data),
      address: loanPda.toBase58(),
      Collection: {
        connect: {
          address: collectionPda.toBase58(),
        },
      },
    },
  });
}

async function updateLoan(loanPda: web3.PublicKey, states: LoanState) {
  const [current, data] = await Promise.all([
    prisma.loan.findFirst({
      where: {
        address: loanPda.toBase58(),
        state: states,
      },
    }),
    fetchLoan(loanPda),
  ]);

  if (current === null) {
    throw new Error("loan entry not found");
  }

  if (data === null) {
    throw new Error("loan data not found");
  }

  await prisma.loan.update({
    where: {
      id_address: {
        id: current.id,
        address: loanPda.toBase58(),
      },
    },
    data: mapLoanEntry(data),
  });
}

async function closeLoan(loanPda: web3.PublicKey) {
  const current = await prisma.loan.findFirst({
    where: {
      address: loanPda.toBase58(),
      state: LoanState.Listed,
    },
  });

  if (current) {
    await prisma.loan.delete({
      where: {
        id_address: {
          id: current.id,
          address: loanPda.toBase58(),
        },
      },
    });
  }
}

async function createLoanOffer(
  loanOfferPda: web3.PublicKey,
  collectionPda: web3.PublicKey
) {
  const data = await fetchLoanOffer(loanOfferPda);

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

async function createCallOption(
  callOptionPda: web3.PublicKey,
  collectionPda: web3.PublicKey
) {
  const data = await fetchCallOption(callOptionPda);

  await prisma.callOption.create({
    data: {
      ...mapCallOptionEntry(data),
      address: callOptionPda.toBase58(),
      Collection: {
        connect: {
          address: collectionPda.toBase58(),
        },
      },
    },
  });
}

async function updateCallOption(
  callOptionPda: web3.PublicKey,
  states: CallOptionState
) {
  const [current, data] = await Promise.all([
    prisma.callOption.findFirst({
      where: {
        address: callOptionPda.toBase58(),
        state: states,
      },
    }),
    fetchCallOption(callOptionPda),
  ]);

  if (current === null) {
    throw new Error("loan entry not found");
  }

  if (data === null) {
    throw new Error("loan data not found");
  }

  await prisma.callOption.update({
    where: {
      id_address: {
        id: current.id,
        address: callOptionPda.toBase58(),
      },
    },
    data: mapCallOptionEntry(data),
  });
}

async function closeCallOption(callOptionPda: web3.PublicKey) {
  const current = await prisma.callOption.findFirst({
    where: {
      address: callOptionPda.toBase58(),
      state: CallOptionState.Listed,
    },
  });

  if (current) {
    await prisma.callOption.delete({
      where: {
        id_address: {
          id: current.id,
          address: callOptionPda.toBase58(),
        },
      },
    });
  }
}

async function createCallOptionBid(
  callOptionBidPda: web3.PublicKey,
  collectionPda: web3.PublicKey
) {
  console.log("fetching call option bid", callOptionBidPda.toBase58());
  const data = await fetchCallOptionBid(callOptionBidPda);

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
  console.log("deleting call option bid", callOptionBidPda.toBase58());
  await prisma.callOptionBid.delete({
    where: {
      address: callOptionBidPda.toBase58(),
    },
  });
}
