import type { NextApiRequest, NextApiResponse } from "next";
import { web3 } from "@project-serum/anchor";
import camelcase from "camelcase";
import { snakeCase } from "snake-case";
import { sha256 } from "js-sha256";
import base58 from "bs58";

import { IDL } from "../../common/idl";
import { getProgram, getProvider } from "../../common/provider";
import prisma from "../../common/lib/prisma";
import { CollectionData, LoanData, LoanStateEnum } from "../../common/types";
import { wait } from "../../common/utils";

type AccountNames = typeof IDL.accounts[number]["name"];

const accountDiscriminators = IDL.accounts.map<{
  name: AccountNames;
  discriminator: Buffer;
}>((account) => {
  return {
    name: account.name,
    discriminator: accountDiscriminator(account.name),
  };
});

const ixIds = IDL.instructions.map((ix) => {
  return {
    name: ix.name,
    id: genIxIdentifier(ix.name),
  };
});

const connection = new web3.Connection(
  process.env.BACKEND_RPC_ENDPOINT as string,
  "confirmed"
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

            const collection = {
              mint: data.mint.toBase58(),
              authority: data.authority.toBase58(),
              // @ts-ignore
              ...data.config,
            };

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

            // TODO check is deleted on-chain
            await prisma.collection.delete({
              where: {
                address: collectionPda.toBase58(),
              },
            });
          }

          case "askLoan":
          case "repayLoan":
          case "repossess":
          case "repossessWithRental": {
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
            const data = await asyncRetry<LoanData>(async () => {
              return (await program.account.loan.fetch(loanPda)) as LoanData;
            });

            const state = getState<LoanStateEnum>(data.state);

            if (state === undefined) {
              return;
            }

            await prisma.loan.create({
              data: {
                state,
                address: loanPda.toBase58(),
                amount: data.amount?.toNumber(),
                basisPoints: data.basisPoints,
                creatorBasisPoints: data.creatorBasisPoints,
                outstanding: data.outstanding.toNumber(),
                threshold: data.threshold,
                borrower: data.borrower.toBase58(),
                lender: data.lender?.toBase58(),
                installments: data.installments,
                currentInstallment: data.currentInstallment,
                noticeIssued: data.noticeIssued?.toNumber(),
                duration: data.duration.toNumber(),
                startDate: data.startDate?.toNumber(),
                mint: data.mint.toBase58(),
                tokenMint: data.tokenMint?.toBase58(),
                Collection: {
                  connect: {
                    address: collectionPda.toBase58(),
                  },
                },
              },
            });
            break;
          }

          case "closeLoan": {
            const loanAccountIndex = ixAccounts.findIndex(
              (a) => a.name === "loan"
            );
            const loanPda = new web3.PublicKey(
              message.accountKeys[ix.accounts[loanAccountIndex]]
            );

            // TODO check is deleted on-chain
            await prisma.loan.delete({
              where: {
                address: loanPda.toBase58(),
              },
            });
            break;
          }

          case "offerLoan":
          case "takeLoanOffer":
          case "closeLoanOffer":
          case "giveLoan":

          case "bidCallOption":
          case "closeCallOptionBid":
          case "sellCallOption":
          case "askCallOption":
          case "buyCallOption":
          case "exerciseCallOption":
          case "exerciseCallOptionWithRental":
          case "closeCallOption":

          // case "initRental":
          // case "takeRental":
          // case "extendRental":
          // case "recoverRental":
          // case "withdrawFromRentalEscrow":
          // case "closeRental":

          default: {
            // Do nothing
          }
        }
      }
    }
  }

  res.status(200).end();
}

function accountDiscriminator(name: string): Buffer {
  return Buffer.from(
    sha256.digest(
      `account:${camelcase(name, {
        pascalCase: true,
      })}`
    )
  ).slice(0, 8);
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

async function asyncRetry<T>(cb: () => Promise<T>) {
  const retry = async (num: number): Promise<T> => {
    console.log("retry: ", num);
    try {
      const result = await cb();
      return result;
    } catch (err) {
      if (num > 5) {
        throw err;
      }
      await wait(500);
      return retry(num + 1);
    }
  };

  return retry(0);
}
