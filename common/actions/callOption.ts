import * as anchor from "@project-serum/anchor";
import * as splToken from "@solana/spl-token";
import { AnchorWallet } from "@solana/wallet-adapter-react";
import {
  Metadata,
  PROGRAM_ID as METADATA_PROGRAM_ID,
} from "@metaplex-foundation/mpl-token-metadata";

import * as query from "../query";
import { CallOptionBidJson, RentalData } from "../types";
import { CallOptionBid } from "../model";
import { SIGNER } from "../constants";
import { getProgram, getProvider } from "../provider";
import { submitTransaction } from "./common";

export async function bidCallOption(
  connection: anchor.web3.Connection,
  wallet: AnchorWallet,
  collection: anchor.web3.PublicKey,
  collectionMint: anchor.web3.PublicKey,
  options: {
    amount: number;
    strikePrice: number;
    expiry: number;
  },
  ids: number[]
) {
  const amount = new anchor.BN(options.amount);
  const strikePrice = new anchor.BN(options.strikePrice);
  const expiry = new anchor.BN(options.expiry);

  const provider = getProvider(connection, wallet);
  const program = getProgram(provider);

  const tx = new anchor.web3.Transaction();

  for (const id of ids) {
    const callOptionBid = await query.findCallOptionBidAddress(
      collectionMint,
      wallet.publicKey,
      id
    );
    const callOptionBidVault = await query.findCallOptionBidTreasury(
      callOptionBid
    );

    const ix = await program.methods
      .bidCallOption(amount, strikePrice, expiry, id)
      .accounts({
        callOptionBid,
        collection,
        escrowPaymentAccount: callOptionBidVault,
        buyer: wallet.publicKey,
        signer: SIGNER,
      })
      .instruction();

    tx.add(ix);
  }

  await submitTransaction(connection, wallet, tx);
}
export async function closeBid(
  connection: anchor.web3.Connection,
  wallet: AnchorWallet,
  bid: CallOptionBidJson
) {
  const provider = getProvider(connection, wallet);
  const program = getProgram(provider);

  const callOptionBid = new anchor.web3.PublicKey(bid.address);
  const collection = new anchor.web3.PublicKey(bid.Collection.address);
  const escrowPaymentAccount = await query.findCallOptionBidTreasury(
    callOptionBid
  );

  const transaction = await program.methods
    .closeCallOptionBid(bid.bidId)
    .accounts({
      signer: SIGNER,
      buyer: wallet.publicKey,
      callOptionBid,
      escrowPaymentAccount,
      collection,
      rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .transaction();

  await submitTransaction(connection, wallet, transaction);
}

export async function sellCallOption(
  connection: anchor.web3.Connection,
  wallet: AnchorWallet,
  mint: anchor.web3.PublicKey,
  bid: CallOptionBidJson
): Promise<void> {
  const provider = getProvider(connection, wallet);
  const program = getProgram(provider);

  const buyer = new anchor.web3.PublicKey(bid.buyer);
  const callOptionBid = new anchor.web3.PublicKey(bid.address);
  const collection = new anchor.web3.PublicKey(bid.Collection.address);

  const callOption = await query.findCallOptionAddress(mint, wallet.publicKey);
  const callOptionBidVault = await query.findCallOptionBidTreasury(
    callOptionBid
  );
  const tokenManager = await query.findTokenManagerAddress(
    mint,
    wallet.publicKey
  );
  const tokenAccount = (await connection.getTokenLargestAccounts(mint)).value[0]
    .address;
  const [metadata] = await query.findMetadataAddress(mint);
  const [edition] = await query.findEditionAddress(mint);

  const transaction = await program.methods
    .sellCallOption(bid.bidId)
    .accounts({
      callOption,
      callOptionBid,
      tokenManager,
      collection,
      mint,
      metadata,
      edition,
      buyer,
      seller: wallet.publicKey,
      depositTokenAccount: tokenAccount,
      escrowPaymentAccount: callOptionBidVault,
      systemProgram: anchor.web3.SystemProgram.programId,
      metadataProgram: METADATA_PROGRAM_ID,
      tokenProgram: splToken.TOKEN_PROGRAM_ID,
      rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
      signer: SIGNER,
    })
    .transaction();

  await submitTransaction(connection, wallet, transaction);
}

export async function askCallOption(
  connection: anchor.web3.Connection,
  wallet: AnchorWallet,
  mint: anchor.web3.PublicKey,
  collectionMint: anchor.web3.PublicKey,
  options: {
    amount: number;
    strikePrice: number;
    expiry: number;
  }
) {
  const amount = new anchor.BN(options.amount);
  const strikePrice = new anchor.BN(options.strikePrice);
  const expiry = new anchor.BN(options.expiry);

  const provider = getProvider(connection, wallet);
  const program = getProgram(provider);

  const [edition] = await query.findEditionAddress(mint);
  const [metadata] = await query.findMetadataAddress(mint);
  const callOption = await query.findCallOptionAddress(mint, wallet.publicKey);
  const tokenManager = await query.findTokenManagerAddress(
    mint,
    wallet.publicKey
  );
  const collection = await query.findCollectionAddress(collectionMint);
  const tokenAccount = (await connection.getTokenLargestAccounts(mint)).value[0]
    .address;

  const transaction = await program.methods
    .askCallOption(amount, strikePrice, expiry)
    .accounts({
      callOption,
      collection,
      tokenManager,
      mint,
      metadata,
      edition,
      seller: wallet.publicKey,
      depositTokenAccount: tokenAccount,
      metadataProgram: METADATA_PROGRAM_ID,
      tokenProgram: splToken.TOKEN_PROGRAM_ID,
      rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      systemProgram: anchor.web3.SystemProgram.programId,
      clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
      signer: SIGNER,
    })
    .transaction();

  await submitTransaction(connection, wallet, transaction);
}

export async function buyCallOption(
  connection: anchor.web3.Connection,
  wallet: AnchorWallet,
  mint: anchor.web3.PublicKey,
  seller: anchor.web3.PublicKey
) {
  const provider = getProvider(connection, wallet);
  const program = getProgram(provider);

  const [edition] = await query.findEditionAddress(mint);
  const callOption = await query.findCallOptionAddress(mint, seller);
  const tokenManager = await query.findTokenManagerAddress(mint, seller);

  const transaction = await program.methods
    .buyCallOption()
    .accounts({
      callOption,
      tokenManager,
      mint,
      edition,
      seller,
      buyer: wallet.publicKey,
      metadataProgram: METADATA_PROGRAM_ID,
      systemProgram: anchor.web3.SystemProgram.programId,
      tokenProgram: splToken.TOKEN_PROGRAM_ID,
      clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
      signer: SIGNER,
    })
    .transaction();

  await submitTransaction(connection, wallet, transaction);
}

export async function exerciseCallOption(
  connection: anchor.web3.Connection,
  wallet: AnchorWallet,
  mint: anchor.web3.PublicKey,
  buyerTokenAccount: anchor.web3.PublicKey,
  seller: anchor.web3.PublicKey,
  metadata: Metadata
) {
  const provider = getProvider(connection, wallet);
  const program = getProgram(provider);

  const callOption = await query.findCallOptionAddress(mint, seller);
  const tokenManager = await query.findTokenManagerAddress(mint, seller);
  const rental = await query.findRentalAddress(mint, seller);
  const rentalEscrow = await query.findRentalEscrowAddress(mint, seller);
  const [metadataAddress] = await query.findMetadataAddress(mint);
  const [edition] = await query.findEditionAddress(mint);

  const tokenAccount = (await connection.getTokenLargestAccounts(mint)).value[0]
    .address;

  const creatorAccounts = metadata.data.creators?.map((creator) => ({
    pubkey: creator.address,
    isSigner: false,
    isWritable: true,
  }));

  let hireAccount: RentalData | null = null;

  try {
    hireAccount = (await program.account.rental.fetch(rental)) as RentalData;
  } catch (err) {
    // account does not exist
  }

  if (hireAccount) {
    const method = program.methods.exerciseCallOptionWithRental().accounts({
      buyerTokenAccount,
      callOption,
      tokenManager,
      rental,
      rentalEscrow,
      mint,
      edition,
      seller,
      tokenAccount,
      buyer: wallet.publicKey,
      metadata: metadataAddress,
      metadataProgram: METADATA_PROGRAM_ID,
      systemProgram: anchor.web3.SystemProgram.programId,
      tokenProgram: splToken.TOKEN_PROGRAM_ID,
      clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
      rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      signer: SIGNER,
    });

    const remainingAccounts = [];

    if (creatorAccounts?.length) {
      remainingAccounts.push(...creatorAccounts);
    }

    if (hireAccount.borrower) {
      remainingAccounts.push({
        isSigner: false,
        isWritable: true,
        pubkey: hireAccount.borrower,
      });
    }

    if (remainingAccounts.length) {
      method.remainingAccounts(remainingAccounts);
    }

    const transaction = await method.transaction();
    await submitTransaction(connection, wallet, transaction);
  } else {
    const method = program.methods.exerciseCallOption().accounts({
      buyerTokenAccount,
      callOption,
      tokenManager,
      mint,
      edition,
      seller,
      buyer: wallet.publicKey,
      depositTokenAccount: tokenAccount,
      metadata: metadataAddress,
      metadataProgram: METADATA_PROGRAM_ID,
      systemProgram: anchor.web3.SystemProgram.programId,
      tokenProgram: splToken.TOKEN_PROGRAM_ID,
      clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
      rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      signer: SIGNER,
    });

    if (creatorAccounts?.length) {
      method.remainingAccounts(creatorAccounts);
    }

    const transaction = await method.transaction();
    await submitTransaction(connection, wallet, transaction);
  }
}

export async function closeCallOption(
  connection: anchor.web3.Connection,
  wallet: AnchorWallet,
  mint: anchor.web3.PublicKey,
  depositTokenAccount: anchor.web3.PublicKey
) {
  const provider = getProvider(connection, wallet);
  const program = getProgram(provider);

  const callOption = await query.findCallOptionAddress(mint, wallet.publicKey);
  const tokenManager = await query.findTokenManagerAddress(
    mint,
    wallet.publicKey
  );

  const [edition] = await query.findEditionAddress(mint);

  const transaction = await program.methods
    .closeCallOption()
    .accounts({
      depositTokenAccount,
      callOption,
      tokenManager,
      mint,
      edition,
      metadataProgram: METADATA_PROGRAM_ID,
      systemProgram: anchor.web3.SystemProgram.programId,
      tokenProgram: splToken.TOKEN_PROGRAM_ID,
      clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
      signer: SIGNER,
    })
    .transaction();

  await submitTransaction(connection, wallet, transaction);
}
