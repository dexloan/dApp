import * as anchor from "@project-serum/anchor";
import * as splToken from "@solana/spl-token";
import { AnchorWallet } from "@solana/wallet-adapter-react";
import {
  Metadata,
  PROGRAM_ID as METADATA_PROGRAM_ID,
} from "@metaplex-foundation/mpl-token-metadata";

import * as query from "../query";
import { getProgram, getProvider } from "../provider";

export async function initHire(
  connection: anchor.web3.Connection,
  wallet: AnchorWallet,
  mint: anchor.web3.PublicKey,
  depositTokenAccount: anchor.web3.PublicKey,
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

  const hireAccount = await query.findHireAddress(mint, wallet.publicKey);
  const [edition] = await query.findEditionAddress(mint);

  await program.methods
    .initHire({ amount, expiry, borrower })
    .accounts({
      mint,
      edition,
      hireAccount,
      lender: wallet.publicKey,
      depositTokenAccount: depositTokenAccount,
      metadataProgram: METADATA_PROGRAM_ID,
      systemProgram: anchor.web3.SystemProgram.programId,
      tokenProgram: splToken.TOKEN_PROGRAM_ID,
      clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
    })
    .rpc();
}

export async function takeHire(
  connection: anchor.web3.Connection,
  wallet: AnchorWallet,
  mint: anchor.web3.PublicKey,
  lender: anchor.web3.PublicKey,
  hireTokenAccount: anchor.web3.PublicKey,
  metadata: Metadata,
  days: number
) {
  const provider = getProvider(connection, wallet);
  const program = getProgram(provider);

  const hireAccount = await query.findHireAddress(mint, lender);
  const [edition] = await query.findEditionAddress(mint);
  const [metadataAddress] = await query.findMetadataAddress(mint);

  const depositTokenAccount = (await connection.getTokenLargestAccounts(mint))
    .value[0].address;

  const creatorAccounts = metadata.data.creators?.map((creator) => ({
    pubkey: creator.address,
    isSigner: false,
    isWritable: true,
  }));

  const method = program.methods.takeHire(days).accounts({
    lender,
    mint,
    edition,
    hireAccount,
    hireTokenAccount,
    depositTokenAccount,
    metadata: metadataAddress,
    borrower: wallet.publicKey,
    metadataProgram: METADATA_PROGRAM_ID,
    systemProgram: anchor.web3.SystemProgram.programId,
    tokenProgram: splToken.TOKEN_PROGRAM_ID,
    clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
  });

  if (creatorAccounts?.length) {
    method.remainingAccounts(creatorAccounts);
  }

  return method.rpc();
}

export async function recoverHire(
  connection: anchor.web3.Connection,
  wallet: AnchorWallet,
  mint: anchor.web3.PublicKey,
  borrower: anchor.web3.PublicKey,
  depositTokenAccount: anchor.web3.PublicKey
) {
  const provider = getProvider(connection, wallet);
  const program = getProgram(provider);

  const hireAccount = await query.findHireAddress(mint, wallet.publicKey);
  const [edition] = await query.findEditionAddress(mint);

  const hireTokenAccount = (await connection.getTokenLargestAccounts(mint))
    .value[0].address;

  await program.methods
    .recoverHire()
    .accounts({
      borrower,
      mint,
      hireAccount,
      edition,
      depositTokenAccount,
      hireTokenAccount,
      lender: wallet.publicKey,
      metadataProgram: METADATA_PROGRAM_ID,
      systemProgram: anchor.web3.SystemProgram.programId,
      tokenProgram: splToken.TOKEN_PROGRAM_ID,
      clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
    })
    .rpc();
}
