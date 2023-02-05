import { web3 } from "@project-serum/anchor";

import * as helpers from '../common/helpers';
import * as utils from '../common/utils';
import prisma from "../common/lib/prisma"
import { LoanData, CallOptionData } from "../common/types";
import { getProgram, getProvider } from "../common/provider";
import { findCollectionAddress } from "../common/query"; 

const connection = new web3.Connection(
  process.env.BACKEND_RPC_ENDPOINT as string,
  "processed"
);
const provider = getProvider(connection);
const program = getProgram(provider);

async function main() {
  const [loans, callOptions] = await Promise.all([
    program.account.loan.all(),
    program.account.callOption.all(),
  ]);


  console.log(`syncing ${loans.length} loans`);

  for (const loan of loans) {
    const address = loan.publicKey.toBase58();
    const data = loan.account as LoanData;
    const metadata = await helpers.getMetadata(program.provider.connection, loan.account.mint);

    if (!metadata?.data.uri) {
      throw new Error("metadata uri not found for mint " + loan.account.mint.toBase58());
    }

    if (!metadata.collection?.key) {
      throw new Error("collection not found for mint " + loan.account.mint.toBase58());
    }

    const collectionPda = await findCollectionAddress(metadata?.collection?.key);
    
    const entry = {
      ...helpers.mapLoanEntry(data),
      uri: utils.trimNullChars(metadata.data.uri),
      Collection: {
        connect: {
          address: collectionPda.toBase58(),
        },
      },
    }
  
    await prisma.loan.upsert({
      where: {
       address, 
      },
      update: {
        ...entry,
      },
      create: {
        address,
        ...entry,
      },
    });
    console.log("synced loan: " + address);
  }

  const updatedLoans = await prisma.loan.findMany();

  for (const loan of updatedLoans) {
    const loanAddress = new web3.PublicKey(loan.address);
    // check if loan exists on chain
    const loanAccount = await program.account.loan.fetch(loanAddress);
    if (!loanAccount) {
      console.log("deleting loan entry " + loanAddress.toBase58() + " because it does not exist on chain");
      await prisma.loan.delete({
        where: {
          address: loanAddress.toBase58(),
        },
      });
    }
  }

  console.log("Done syncing loans.");
  console.log(updatedLoans);

  console.log(`syncing ${callOptions.length} call options`);

  for (const callOption of callOptions) {
    const address = callOption.publicKey.toBase58();
    const data = callOption.account as CallOptionData;
    const metadata = await helpers.getMetadata(program.provider.connection, data.mint);

    if (!metadata?.data.uri) {
      throw new Error("metadata uri not found for mint " + data.mint.toBase58());
    }

    if (!metadata.collection?.key) {
      throw new Error("collection not found for mint " + data.mint.toBase58());
    }

    const collectionPda = await findCollectionAddress(metadata?.collection?.key);
    
    const entry = {
      ...helpers.mapCallOptionEntry(data),
      uri: utils.trimNullChars(metadata.data.uri),
      Collection: {
        connect: {
          address: collectionPda.toBase58(),
        },
      },
    }
  
    await prisma.callOption.upsert({
      where: {
       address, 
      },
      update: {
        ...entry,
      },
      create: {
        address,
        ...entry,
      },
    });
    console.log("synced call option: " + address);
  }
}

main();