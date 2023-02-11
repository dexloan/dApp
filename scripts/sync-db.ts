import { web3 } from "@project-serum/anchor";
import { Collection } from "@prisma/client";

import * as utils from "../common/utils";
import prisma from "../common/lib/prisma";
import {
  fetchMetadata,
  mapLoanEntry,
  mapCallOptionEntry,
} from "../common/query";
import {
  LoanData,
  CallOptionData,
  LoanOfferData,
  CallOptionBidData,
  CollectionData,
} from "../common/types";
import { getProgram, getProvider } from "../common/provider";
import { findCollectionAddress } from "../common/query";

const connection = new web3.Connection(
  process.env.BACKEND_RPC_ENDPOINT as string,
  "processed"
);
const provider = getProvider(connection);
const program = getProgram(provider);

async function main() {
  const collections = await program.account.collection.all();
  console.log(`syncing ${collections.length} collections`);

  for (const collection of collections) {
    const address = collection.publicKey.toBase58();
    const data = collection.account as CollectionData;
    const metadata = await fetchMetadata(connection, data.mint);

    const update: Collection = {
      mint: data.mint.toBase58(),
      authority: data.authority.toBase58(),
      disabled: false,
      // @ts-ignore
      ...(data.config as LoanData["config"]),
    };

    if (metadata) {
      update.uri = utils.trimNullChars(metadata.data.uri);
      update.name = utils.trimNullChars(metadata.data.name);
      update.symbol = utils.trimNullChars(metadata.data.symbol);
    }

    await prisma.collection.upsert({
      where: {
        address,
      },
      update: {
        ...update,
      },
      create: {
        ...update,
        address,
        floorPrice: 0,
      },
    });
  }
  console.log("done syncing collections.");

  const loans = await program.account.loan.all();
  console.log(`syncing ${loans.length} loans`);

  for (const loan of loans) {
    const address = loan.publicKey.toBase58();
    const data = loan.account as LoanData;
    const metadata = await fetchMetadata(
      program.provider.connection,
      loan.account.mint
    );

    if (!metadata?.data.uri) {
      throw new Error(
        "metadata uri not found for mint " + loan.account.mint.toBase58()
      );
    }

    if (!metadata.collection?.key) {
      throw new Error(
        "collection not found for mint " + loan.account.mint.toBase58()
      );
    }

    const collectionPda = await findCollectionAddress(
      metadata?.collection?.key
    );

    const entry = {
      ...mapLoanEntry(data),
      uri: utils.trimNullChars(metadata.data.uri),
      Collection: {
        connect: {
          address: collectionPda.toBase58(),
        },
      },
    };

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
      console.log(
        "deleting loan entry " +
          loanAddress.toBase58() +
          " because it does not exist on chain"
      );
      await prisma.loan.delete({
        where: {
          address: loanAddress.toBase58(),
        },
      });
    }
  }

  console.log("Done syncing loans.");

  const loanOffers = await program.account.loanOffer.all();
  console.log(`syncing ${loanOffers.length} loan offers`);

  for (const loanOffer of loanOffers) {
    const address = loanOffer.publicKey.toBase58();
    const data = loanOffer.account as LoanOfferData;

    await prisma.loanOffer.create({
      data: {
        address,
        offerId: data.id,
        lender: data.lender.toBase58(),
        amount: data.amount ? utils.toBigInt(data.amount) : null,
        basisPoints: data.basisPoints,
        duration: utils.toBigInt(data.duration),
        ltv: data.ltv,
        threshold: data.threshold,
        Collection: {
          connect: {
            address: data.collection.toBase58(),
          },
        },
      },
    });
    console.log("synced loan offer: " + address);
  }

  console.log("Done syncing loan offers.");

  const callOptions = await program.account.callOption.all();
  console.log(`syncing ${callOptions.length} call options`);

  for (const callOption of callOptions) {
    const address = callOption.publicKey.toBase58();
    const data = callOption.account as CallOptionData;
    const metadata = await fetchMetadata(
      program.provider.connection,
      data.mint
    );

    if (!metadata?.data.uri) {
      throw new Error(
        "metadata uri not found for mint " + data.mint.toBase58()
      );
    }

    if (!metadata.collection?.key) {
      throw new Error("collection not found for mint " + data.mint.toBase58());
    }

    const collectionPda = await findCollectionAddress(
      metadata?.collection?.key
    );

    const entry = {
      ...mapCallOptionEntry(data),
      uri: utils.trimNullChars(metadata.data.uri),
      Collection: {
        connect: {
          address: collectionPda.toBase58(),
        },
      },
    };

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
  console.log("Done syncing call options.");

  const callOptionBids = await program.account.callOptionBid.all();
  console.log(`syncing ${callOptionBids.length} call option bids`);

  for (const callOptionBid of callOptionBids) {
    const address = callOptionBid.publicKey.toBase58();
    const data = callOptionBid.account as CallOptionBidData;

    await prisma.callOptionBid.create({
      data: {
        address,
        bidId: data.id,
        buyer: data.buyer.toBase58(),
        amount: utils.toBigInt(data.amount),
        expiry: utils.toBigInt(data.expiry),
        strikePrice: utils.toBigInt(data.strikePrice),
        Collection: {
          connect: {
            address: data.collection.toBase58(),
          },
        },
      },
    });

    console.log("synced call option bid: " + address);
  }

  console.log("Done syncing call option bids.");
}

main();
