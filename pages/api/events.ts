import type { NextApiRequest, NextApiResponse } from "next";
import { web3 } from "@project-serum/anchor";
import camelcase from "camelcase";
import { snakeCase } from "snake-case";
import { sha256 } from "js-sha256";
import base58 from "bs58";

import * as utils from "../../common/utils";
import { LISTINGS_PROGRAM_ID } from "../../common/constants";
import { IDL } from "../../common/idl/dexloan";
import { getProgram, getProvider } from "../../common/provider";
import prisma from "../../common/lib/prisma";
import { CollectionData, LoanData, LoanStateEnum } from "../../common/types";

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
  process.env.BACKEND_RPC_ENDPOINT as string
);
const provider = getProvider(connection);
const program = getProgram(provider);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log(JSON.stringify(req.body));
  const events = req.body as any;

  for (const event of events) {
    const message = event.transaction.message;

    for (const ix of message.instructions) {
      const ixName = ixIds.find((i) => ix.data.includes(i.id))?.name;
      const ixAccounts = IDL.instructions.find(
        (i) => i.name === ixName
      )?.accounts;

      if (ixName && ixAccounts) {
        switch (ixName) {
          case "askLoan": {
            const loanAccountIndex = ixAccounts.findIndex(
              (a) => a.name === "loan"
            );
            const accountKey = new web3.PublicKey(
              message.accountKeys[ix.accounts[loanAccountIndex]]
            );
            const data = (await program.account.loan.fetch(
              accountKey
            )) as LoanData;

            let state;

            if (typeof data.state === "object" && data.state !== null) {
              state = camelcase(Object.keys(data.state)[0], {
                pascalCase: true,
              }) as keyof typeof LoanStateEnum;
            }

            if (state === undefined) {
              return;
            }

            await prisma.loan.create({
              data: {
                state,
                address: accountKey.toBase58(),
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
              },
            });
          }

          case "offerLoan":
          case "takeLoanOffer":
          case "closeLoanOffer":
          case "giveLoan":
          case "closeLoan":
          case "repayLoan":
          case "repossess":
          case "repossessWithRental":

          case "bidCallOption":
          case "closeCallOptionBid":
          case "sellCallOption":
          case "askCallOption":
          case "buyCallOption":
          case "exerciseCallOption":
          case "exerciseCallOptionWithRental":
          case "closeCallOption":

          case "initRental":
          case "takeRental":
          case "extendRental":
          case "recoverRental":
          case "withdrawFromRentalEscrow":
          case "closeRental":

          case "initCollection":
          case "updateCollection":
          case "closeCollection":

          default: {
            // Do nothing
          }
        }
      }
    }
  }

  // const filteredAccounts = accountInfos
  //   .map((account, index) => ({
  //     info: account,
  //     pubkey: accounts[index],
  //   }))
  //   .map((acc) => {
  //     console.log(acc);
  //     return acc;
  //   })
  //   .filter((account) => account.info?.owner.equals(LISTINGS_PROGRAM_ID));

  // console.log("filteredAccounts: ", filteredAccounts);

  // for (let account of filteredAccounts) {
  //   if (account.info) {
  //     const discriminator = account.info?.data.slice(0, 8);
  //     const accountName = accountDiscriminators.find((account) =>
  //       account.discriminator.compare(discriminator)
  //     )?.name;
  //     console.log("accountDiscriminators: ", accountDiscriminators);
  //     console.log("discriminator: ", discriminator);
  //     console.log("accountName: ", accountName);

  //     program.methods.askLoan.name;

  //     switch (accountName) {
  //       case "collection": {
  //         const data = program.coder.accounts.decode<CollectionData>(
  //           accountName,
  //           account.info.data
  //         );

  //         await prisma.collection.upsert({
  //           where: {
  //             address: account.pubkey.toBase58(),
  //           },
  //           create: {
  //             address: account.pubkey.toBase58(),
  //             authority: data.authority.toBase58(),
  //             mint: data.mint.toBase58(),
  //             config: JSON.stringify(data.config),
  //           },
  //           update: {
  //             authority: data.authority.toBase58(),
  //             config: JSON.stringify(data.config),
  //           },
  //         });
  //       }

  //       case "loan": {
  //         const data = program.coder.accounts.decode<LoanData>(
  //           accountName,
  //           account.info.data
  //         );

  //         let state;

  //         if (typeof data.state === "object" && data.state !== null) {
  //           state = camelcase(Object.keys(data.state)[0], {
  //             pascalCase: true,
  //           }) as keyof typeof LoanStateEnum;
  //         }

  //         if (state === undefined) {
  //           return;
  //         }

  //         const prettyData = {
  //           state,
  //           amount: data.amount?.toNumber(),
  //           basisPoints: data.basisPoints,
  //           creatorBasisPoints: data.creatorBasisPoints,
  //           outstanding: data.outstanding.toNumber(),
  //           threshold: data.threshold,
  //           borrower: data.borrower.toBase58(),
  //           lender: data.lender?.toBase58(),
  //           installments: data.installments,
  //           currentInstallment: data.currentInstallment,
  //           noticeIssued: data.noticeIssued?.toNumber(),
  //           duration: data.duration.toNumber(),
  //           startDate: data.startDate?.toNumber(),
  //           tokenMint: data.tokenMint?.toBase58(),
  //         };

  //         await prisma.loan.upsert({
  //           where: {
  //             address: account.pubkey.toBase58(),
  //           },
  //           create: {
  //             address: account.pubkey.toBase58(),
  //             mint: data.mint.toBase58(),
  //             ...prettyData,
  //           },
  //           update: {
  //             ...prettyData,
  //           },
  //         });
  //       }

  //       case "loanOffer":
  //       case "callOption":
  //       case "callOptionBid":
  //       case "rental":
  //       default: {
  //         // Do nothing
  //       }
  //     }
  //   }
  // }

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
