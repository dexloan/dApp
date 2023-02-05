import type { NextApiRequest, NextApiResponse } from "next";
import { web3 } from "@project-serum/anchor";
import { Collection } from "@prisma/client";
import { snakeCase } from "snake-case";
import { sha256 } from "js-sha256";
import base58 from "bs58";

import { IDL } from "../../common/idl";
import * as utils from "../../common/utils";
import * as helpers from "../../common/helpers";
import { getProgram, getProvider } from "../../common/provider";
import prisma from "../../common/lib/prisma";
import { LoanData } from "../../common/types";

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
              helpers.getMetadata(connection, collectionMint),
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

            await helpers.upsertLoan(program, loanPda, mint);

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

            await helpers.closeLoan(loanPda);

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

            await helpers.createLoanOffer(program, loanOfferPda, collectionPda);

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
              helpers.deleteLoanOffer(loanOfferPda),
              helpers.upsertLoan(program, loanPda, mint),
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

            await helpers.deleteLoanOffer(loanOfferPda);

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
            const collectionAccountIndex = ixAccounts.findIndex(
              (a) => a.name === "collection"
            );
            const callOptionPda = new web3.PublicKey(
              message.accountKeys[ix.accounts[callOptionAccountIndex]]
            );
            const mint = new web3.PublicKey(
              message.accountKeys[ix.accounts[mintAccountIndex]]
            );
            const collectionPda = new web3.PublicKey(
              message.accountKeys[ix.accounts[collectionAccountIndex]]
            );

            await helpers.upsertCallOption(
              program,
              callOptionPda,
              mint,
              collectionPda
            );

            break;
          }

          case "closeCallOption": {
            const callOptionAccountIndex = ixAccounts.findIndex(
              (a) => a.name === "loan"
            );
            const callOptionPda = new web3.PublicKey(
              message.accountKeys[ix.accounts[callOptionAccountIndex]]
            );

            await helpers.closeCallOption(callOptionPda);

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

            await helpers.createCallOptionBid(
              program,
              callOptionBidPda,
              collectionPda
            );

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
            const collectionAccountIndex = ixAccounts.findIndex(
              (a) => a.name === "collection"
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
            const collectionPda = new web3.PublicKey(
              message.accountKeys[ix.accounts[collectionAccountIndex]]
            );

            await Promise.all([
              helpers.deleteCallOptionBid(callOptionBidPda),
              helpers.upsertCallOption(
                program,
                callOptionPda,
                mint,
                collectionPda
              ),
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

            await helpers.deleteCallOptionBid(callOptionBidPda);

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
