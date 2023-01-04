import type { NextApiRequest, NextApiResponse } from "next";
import { web3 } from "@project-serum/anchor";
import camelcase from "camelcase";
import { sha256 } from "js-sha256";

import { LISTINGS_PROGRAM_ID } from "../../common/constants";
import { IDL } from "../../common/idl/dexloan";
import { getProgram, getProvider } from "../../common/provider";
import prisma from "../../common/lib/prisma";
import { Collection, Loan } from "../../common/model";
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

const SAMPLE_EVENT = [
  {
    blockTime: 1672851756,
    indexWithinBlock: 965,
    meta: {
      err: null,
      fee: 10000,
      innerInstructions: [
        {
          index: 0,
          instructions: [
            {
              accounts: [0, 3],
              data: "11114XfZCGKrze4PNou1GXiYCJhfEXe1R3V3X5d8LkafsNuTt2bkkxWM9AyzDR23aUNcDp",
              programIdIndex: 5,
            },
            {
              accounts: [2, 4, 0],
              data: "3xSnUGQKaGEB",
              programIdIndex: 13,
            },
            {
              accounts: [4, 2, 7, 9, 13],
              data: "T",
              programIdIndex: 11,
            },
            {
              accounts: [2, 9, 7],
              data: "B",
              programIdIndex: 13,
            },
          ],
        },
      ],
      loadedAddresses: {
        readonly: [],
        writable: [],
      },
      logMessages: [
        "Program F2BTn5cmYkTzo52teXhG6jyLS3y2BujdE56yZaGyvxwC invoke [1]",
        "Program log: Instruction: AskLoan",
        "Program 11111111111111111111111111111111 invoke [2]",
        "Program 11111111111111111111111111111111 success",
        "Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA invoke [2]",
        "Program log: Instruction: Approve",
        "Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA consumed 2904 of 142866 compute units",
        "Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA success",
        "Program metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s invoke [2]",
        "Program log: Instruction: Freeze Delegated Account",
        "Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA invoke [3]",
        "Program log: Instruction: FreezeAccount",
        "Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA consumed 4310 of 126765 compute units",
        "Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA success",
        "Program metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s consumed 13716 of 135794 compute units",
        "Program metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s success",
        "Program F2BTn5cmYkTzo52teXhG6jyLS3y2BujdE56yZaGyvxwC consumed 80628 of 200000 compute units",
        "Program F2BTn5cmYkTzo52teXhG6jyLS3y2BujdE56yZaGyvxwC success",
      ],
      postBalances: [
        162516456, 0, 2039280, 2241120, 974400, 1, 1907040, 2853600, 1141440,
        1461600, 5616720, 1141440, 1009200, 934087680,
      ],
      postTokenBalances: [
        {
          accountIndex: 2,
          mint: "GXBx29EjcbgrjLgRq4EfjZ5TMb9pmm27KLkBQ9NqRaTt",
          owner: "AH7F2EPHXWhfF5yc7xnv1zPbwz3YqD6CtAqbCyE9dy7r",
          programId: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
          uiTokenAmount: {
            amount: "1",
            decimals: 0,
            uiAmount: 1,
            uiAmountString: "1",
          },
        },
      ],
      preBalances: [
        164767576, 0, 2039280, 0, 974400, 1, 1907040, 2853600, 1141440, 1461600,
        5616720, 1141440, 1009200, 934087680,
      ],
      preTokenBalances: [
        {
          accountIndex: 2,
          mint: "GXBx29EjcbgrjLgRq4EfjZ5TMb9pmm27KLkBQ9NqRaTt",
          owner: "AH7F2EPHXWhfF5yc7xnv1zPbwz3YqD6CtAqbCyE9dy7r",
          programId: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
          uiTokenAmount: {
            amount: "1",
            decimals: 0,
            uiAmount: 1,
            uiAmountString: "1",
          },
        },
      ],
      rewards: [],
    },
    slot: 170801186,
    transaction: {
      message: {
        accountKeys: [
          "AH7F2EPHXWhfF5yc7xnv1zPbwz3YqD6CtAqbCyE9dy7r",
          "4RfijtGGJnnaLYYByWGTbkPrGgvmKeAP1bZBhwZApLPq",
          "Bs7Q5S5CfgEfrdZJebUfebwJoSUhAi267XrBzCBCdt4r",
          "BsTjoSSVf5BJX23SzXM6Xj9Z2G2wSPJKB3YbxdE1GbUY",
          "kpSKJ4aJhLVGDkyhQjycRXcioopgmb3dsmJaA4XViG1",
          "11111111111111111111111111111111",
          "24agmXvK712wzskSFoEfyB5dvmeykS9nxcCsCRPXxGvh",
          "D6JKajZga2odak3FPuitfUvaa5p1XrE7SAL1fTtRA7jt",
          "F2BTn5cmYkTzo52teXhG6jyLS3y2BujdE56yZaGyvxwC",
          "GXBx29EjcbgrjLgRq4EfjZ5TMb9pmm27KLkBQ9NqRaTt",
          "HVnSjueFBijwDwMMpg332dzssPHY2oX5uynPj6pE51mL",
          "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s",
          "SysvarRent111111111111111111111111111111111",
          "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        ],
        addressTableLookups: null,
        header: {
          numReadonlySignedAccounts: 1,
          numReadonlyUnsignedAccounts: 9,
          numRequiredSignatures: 2,
        },
        instructions: [
          {
            accounts: [1, 0, 2, 3, 4, 6, 9, 10, 7, 11, 5, 13, 12],
            data: "YjMZY2iLLZinp6N5qh8wzEuL5f64dtWL7zP",
            programIdIndex: 8,
          },
        ],
        recentBlockhash: "3GbiZRAm2g9j1nCs3vXhMyYMCGVLTLxMYFcNXhDY6Lxe",
      },
      signatures: [
        "94M1Aar1jmm6YQ5q8iB8kaFxTKbgdo43y45NeBg92qmMWn4FVPCEnCauouPsvrwN9heiQyDiwWc2gunMjBrjWjG",
        "osmFirH49Vc46xjvXC1EX7k4QgRTonAjhveNETxmMobH4geMvDBYLkLCuXR9trLRsZzPkz9dJVEcxyNXBLsiVYf",
      ],
    },
  },
];

const connection = new web3.Connection(
  process.env.BACKEND_RPC_ENDPOINT as string
);
const provider = getProvider(connection);
const program = getProgram(provider);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const events = JSON.parse(req.body) as web3.TransactionResponse[];

  const accounts = events
    .map(
      (transactionResponse) =>
        transactionResponse.transaction.message.accountKeys
    )
    .flat();

  const accountInfos = await connection.getMultipleAccountsInfo(accounts);
  const filteredAccounts = accountInfos
    .map((account, index) => ({
      info: account,
      pubkey: accounts[index],
    }))
    .filter((account) => account.info?.owner.equals(LISTINGS_PROGRAM_ID));

  for (let account of filteredAccounts) {
    if (account.info) {
      const discriminator = account.info?.data.slice(0, 8);
      const accountName = accountDiscriminators.find((account) =>
        account.discriminator.compare(discriminator)
      )?.name;

      switch (accountName) {
        case "collection": {
          const data = program.coder.accounts.decode<CollectionData>(
            accountName,
            account.info.data
          );

          await prisma.collection.upsert({
            where: {
              address: account.pubkey.toBase58(),
            },
            create: {
              address: account.pubkey.toBase58(),
              authority: data.authority.toBase58(),
              mint: data.mint.toBase58(),
              config: JSON.stringify(data.config),
            },
            update: {
              authority: data.authority.toBase58(),
              config: JSON.stringify(data.config),
            },
          });
        }

        case "loan": {
          const data = program.coder.accounts.decode<LoanData>(
            accountName,
            account.info.data
          );

          let state;

          if (typeof data.state === "object" && data.state !== null) {
            state = camelcase(Object.keys(data.state)[0], {
              pascalCase: true,
            }) as LoanStateEnum;
          }

          if (state === undefined) {
            return;
          }

          const prettyData = {
            state,
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
            tokenMint: data.tokenMint?.toBase58(),
          };

          await prisma.loan.upsert({
            where: {
              address: account.pubkey.toBase58(),
            },
            create: {
              address: account.pubkey.toBase58(),
              mint: data.mint.toBase58(),
              ...prettyData,
            },
            update: {
              ...prettyData,
            },
          });
        }

        case "loanOffer":
        case "callOption":
        case "callOptionBid":
        case "rental":
        default: {
          // Do nothing
        }
      }
    }
  }

  console.log(JSON.stringify(req.body, null, 2));
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
