import * as anchor from "@project-serum/anchor";
import * as splToken from "@solana/spl-token";
import { AnchorWallet } from "@solana/wallet-adapter-react";
import {
  Metadata,
  PROGRAM_ID as METADATA_PROGRAM_ID,
} from "@metaplex-foundation/mpl-token-metadata";

import * as query from "../query";
import { SIGNER } from "../constants";
import { getProgram, getProvider } from "../provider";
import { submitTransaction } from "./common";

export async function initRental(
  connection: anchor.web3.Connection,
  wallet: AnchorWallet,
  mint: anchor.web3.PublicKey,
  collectionMint: anchor.web3.PublicKey,
  options: {
    amount: number;
    expiry: number;
    borrower?: anchor.web3.PublicKey;
  }
) {
  const amount = new anchor.BN(options.amount);
  const expiry = new anchor.BN(options.expiry);
  const borrower = options.borrower ?? null;

  const provider = getProvider(connection, wallet);
  const program = getProgram(provider);

  const rental = await query.findRentalAddress(mint, wallet.publicKey);
  const collection = await query.findCollectionAddress(collectionMint);
  const tokenManager = await query.findTokenManagerAddress(
    mint,
    wallet.publicKey
  );
  const tokenAccount = (await connection.getTokenLargestAccounts(mint)).value[0]
    .address;
  const [edition] = await query.findEditionAddress(mint);
  const [metadata] = await query.findMetadataAddress(mint);

  const transaction = await program.methods
    .initRental({ amount, expiry, borrower })
    .accounts({
      rental,
      tokenManager,
      mint,
      collection,
      edition,
      metadata,
      lender: wallet.publicKey,
      depositTokenAccount: tokenAccount,
      metadataProgram: METADATA_PROGRAM_ID,
      systemProgram: anchor.web3.SystemProgram.programId,
      tokenProgram: splToken.TOKEN_PROGRAM_ID,
      clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
      signer: SIGNER,
    })
    .transaction();

  await submitTransaction(connection, wallet, transaction);
}

export async function takeRental(
  connection: anchor.web3.Connection,
  wallet: AnchorWallet,
  mint: anchor.web3.PublicKey,
  lender: anchor.web3.PublicKey,
  rentalTokenAccount: anchor.web3.PublicKey,
  metadata: Metadata,
  days: number
) {
  const provider = getProvider(connection, wallet);
  const program = getProgram(provider);

  const rental = await query.findRentalAddress(mint, lender);
  const rentalEscrow = await query.findRentalEscrowAddress(mint, lender);
  const tokenManager = await query.findTokenManagerAddress(mint, lender);
  const [edition] = await query.findEditionAddress(mint);
  const [metadataAddress] = await query.findMetadataAddress(mint);

  const depositTokenAccount = (await connection.getTokenLargestAccounts(mint))
    .value[0].address;

  const creatorAccounts = metadata.data.creators?.map((creator) => ({
    pubkey: creator.address,
    isSigner: false,
    isWritable: true,
  }));

  const method = program.methods.takeRental(days).accounts({
    lender,
    mint,
    edition,
    rental,
    rentalEscrow,
    tokenManager,
    rentalTokenAccount,
    depositTokenAccount,
    metadata: metadataAddress,
    borrower: wallet.publicKey,
    metadataProgram: METADATA_PROGRAM_ID,
    systemProgram: anchor.web3.SystemProgram.programId,
    tokenProgram: splToken.TOKEN_PROGRAM_ID,
    clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
    signer: SIGNER,
  });

  if (creatorAccounts?.length) {
    method.remainingAccounts(creatorAccounts);
  }

  const transaction = await method.transaction();

  await submitTransaction(connection, wallet, transaction);
}

export async function extendRental(
  connection: anchor.web3.Connection,
  wallet: AnchorWallet,
  mint: anchor.web3.PublicKey,
  lender: anchor.web3.PublicKey,
  metadata: Metadata,
  days: number
) {
  const provider = getProvider(connection, wallet);
  const program = getProgram(provider);

  const rental = await query.findRentalAddress(mint, lender);
  const rentalEscrow = await query.findRentalEscrowAddress(mint, lender);
  const tokenManager = await query.findTokenManagerAddress(mint, lender);

  const creatorAccounts = metadata.data.creators?.map((creator) => ({
    pubkey: creator.address,
    isSigner: false,
    isWritable: true,
  }));

  const method = program.methods.extendRental(days).accounts({
    lender,
    mint,
    rental,
    rentalEscrow,
    tokenManager,
    borrower: wallet.publicKey,
    systemProgram: anchor.web3.SystemProgram.programId,
    tokenProgram: splToken.TOKEN_PROGRAM_ID,
    clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
    signer: SIGNER,
  });

  if (creatorAccounts?.length) {
    method.remainingAccounts(creatorAccounts);
  }

  const transaction = await method.transaction();
  await submitTransaction(connection, wallet, transaction);
}

export async function recoverRental(
  connection: anchor.web3.Connection,
  wallet: AnchorWallet,
  mint: anchor.web3.PublicKey,
  borrower: anchor.web3.PublicKey,
  depositTokenAccount: anchor.web3.PublicKey
) {
  const provider = getProvider(connection, wallet);
  const program = getProgram(provider);

  const rental = await query.findRentalAddress(mint, wallet.publicKey);
  const rentalEscrow = await query.findRentalEscrowAddress(
    mint,
    wallet.publicKey
  );
  const tokenManager = await query.findTokenManagerAddress(
    mint,
    wallet.publicKey
  );
  const [edition] = await query.findEditionAddress(mint);

  const rentalTokenAccount = (await connection.getTokenLargestAccounts(mint))
    .value[0].address;

  const transaction = await program.methods
    .recoverRental()
    .accounts({
      borrower,
      mint,
      rental,
      rentalEscrow,
      tokenManager,
      edition,
      depositTokenAccount,
      rentalTokenAccount,
      lender: wallet.publicKey,
      metadataProgram: METADATA_PROGRAM_ID,
      systemProgram: anchor.web3.SystemProgram.programId,
      tokenProgram: splToken.TOKEN_PROGRAM_ID,
      clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
      signer: SIGNER,
    })
    .transaction();

  await submitTransaction(connection, wallet, transaction);
}

export async function withdrawFromRentalEscrow(
  connection: anchor.web3.Connection,
  wallet: AnchorWallet,
  mint: anchor.web3.PublicKey
) {
  const provider = getProvider(connection, wallet);
  const program = getProgram(provider);

  const rental = await query.findRentalAddress(mint, wallet.publicKey);
  const rentalEscrow = await query.findRentalEscrowAddress(
    mint,
    wallet.publicKey
  );

  const transaction = await program.methods
    .withdrawFromRentalEscrow()
    .accounts({
      mint,
      rental,
      rentalEscrow,
      lender: wallet.publicKey,
      systemProgram: anchor.web3.SystemProgram.programId,
      tokenProgram: splToken.TOKEN_PROGRAM_ID,
      clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
      signer: SIGNER,
    })
    .transaction();

  await submitTransaction(connection, wallet, transaction);
}

export async function closeRental(
  connection: anchor.web3.Connection,
  wallet: AnchorWallet,
  mint: anchor.web3.PublicKey,
  depositTokenAccount: anchor.web3.PublicKey
) {
  const provider = getProvider(connection, wallet);
  const program = getProgram(provider);

  const rental = await query.findRentalAddress(mint, wallet.publicKey);
  const tokenManager = await query.findTokenManagerAddress(
    mint,
    wallet.publicKey
  );
  const [edition] = await query.findEditionAddress(mint);

  const transaction = await program.methods
    .closeRental()
    .accounts({
      rental,
      tokenManager,
      depositTokenAccount,
      mint,
      edition,
      lender: wallet.publicKey,
      metadataProgram: METADATA_PROGRAM_ID,
      systemProgram: anchor.web3.SystemProgram.programId,
      tokenProgram: splToken.TOKEN_PROGRAM_ID,
      clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
      signer: SIGNER,
    })
    .transaction();

  await submitTransaction(connection, wallet, transaction);
}
