import { web3, Program } from "@project-serum/anchor";
import { LoanState, CallOptionState } from "@prisma/client";
import { Metadata } from "@metaplex-foundation/mpl-token-metadata";
import camelcase from "camelcase";

import * as utils from "./utils";
import {
  CallOptionBidData,
  CallOptionData,
  LoanData,
  LoanOfferData,
} from "./types";
import { DexloanListings } from "./idl";
import prisma from "./lib/prisma";
import { findMetadataAddress, findCollectionAddress } from "./query";

type OndaProgram = Program<DexloanListings>;

export function getState<T>(state: unknown) {
  let formattedState;

  if (typeof state === "object" && state !== null) {
    formattedState = camelcase(Object.keys(state)[0], {
      pascalCase: true,
    }) as T;
  }

  return formattedState;
}

export async function fetchLoan(program: OndaProgram, loanPda: web3.PublicKey) {
  return utils.asyncRetry<LoanData>(async () => {
    return (await program.account.loan.fetch(loanPda)) as LoanData;
  });
}

export async function fetchLoanOffer(
  program: OndaProgram,
  loanOfferPda: web3.PublicKey
) {
  return utils.asyncRetry<LoanOfferData>(async () => {
    return (await program.account.loanOffer.fetch(
      loanOfferPda
    )) as LoanOfferData;
  });
}

export async function fetchCallOption(
  program: OndaProgram,
  callOptionPda: web3.PublicKey
) {
  return utils.asyncRetry<CallOptionData>(async () => {
    return (await program.account.callOption.fetch(
      callOptionPda
    )) as CallOptionData;
  });
}

export async function fetchCallOptionBid(
  program: OndaProgram,
  callOptionBidPda: web3.PublicKey
) {
  return utils.asyncRetry<CallOptionBidData>(async () => {
    return (await program.account.callOptionBid.fetch(
      callOptionBidPda
    )) as CallOptionBidData;
  });
}

export function mapLoanEntry(data: LoanData) {
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

export function mapCallOptionEntry(data: CallOptionData) {
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

export async function upsertLoan(
  program: OndaProgram,
  loanPda: web3.PublicKey,
  mint: web3.PublicKey
) {
  const [data, metadata] = await Promise.all([
    fetchLoan(program, loanPda),
    getMetadata(program.provider.connection, mint),
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

  const collectionPda = await findCollectionAddress(metadata.collection?.key);

  const entry = {
    ...mapLoanEntry(data),
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

export async function closeLoan(loanPda: web3.PublicKey) {
  await prisma.loan.delete({
    where: {
      address: loanPda.toBase58(),
    },
  });
}

export async function createLoanOffer(
  program: OndaProgram,
  loanOfferPda: web3.PublicKey,
  collectionPda: web3.PublicKey
) {
  const data = await fetchLoanOffer(program, loanOfferPda);

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

export async function deleteLoanOffer(loanOfferPda: web3.PublicKey) {
  await prisma.loanOffer.delete({
    where: {
      address: loanOfferPda.toBase58(),
    },
  });
}

export async function upsertCallOption(
  program: OndaProgram,
  callOptionPda: web3.PublicKey,
  mint: web3.PublicKey,
  collectionPda: web3.PublicKey
) {
  const [data, metadata] = await Promise.all([
    fetchCallOption(program, callOptionPda),
    getMetadata(program.provider.connection, mint),
  ]);

  if (!data) {
    throw new Error("call option not found");
  }

  if (!metadata?.data.uri) {
    throw new Error("metadata uri not found");
  }

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

export async function closeCallOption(callOptionPda: web3.PublicKey) {
  await prisma.callOption.delete({
    where: {
      address: callOptionPda.toBase58(),
    },
  });
}

export async function createCallOptionBid(
  program: OndaProgram,
  callOptionBidPda: web3.PublicKey,
  collectionPda: web3.PublicKey
) {
  console.log("fetching call option bid", callOptionBidPda.toBase58());
  const data = await fetchCallOptionBid(program, callOptionBidPda);

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

export async function deleteCallOptionBid(callOptionBidPda: web3.PublicKey) {
  console.log("deleting call option bid", callOptionBidPda.toBase58());
  await prisma.callOptionBid.delete({
    where: {
      address: callOptionBidPda.toBase58(),
    },
  });
}

export async function getMetadata(
  connection: web3.Connection,
  mint: web3.PublicKey
) {
  const [metadataPda] = await findMetadataAddress(mint);

  // Sometimes collection mints don't have metadata
  let metadata = null;

  try {
    metadata = await Metadata.fromAccountAddress(connection, metadataPda);
  } catch {}

  return metadata;
}
