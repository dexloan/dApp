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

  const hire = await query.findHireAddress(mint, wallet.publicKey);
  const tokenManager = await query.findTokenManagerAddress(
    mint,
    wallet.publicKey
  );
  const tokenAccount = (await connection.getTokenLargestAccounts(mint)).value[0]
    .address;
  const [edition] = await query.findEditionAddress(mint);

  await program.methods
    .initHire({ amount, expiry, borrower })
    .accounts({
      hire,
      tokenManager,
      mint,
      edition,
      lender: wallet.publicKey,
      depositTokenAccount: tokenAccount,
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

  const hire = await query.findHireAddress(mint, lender);
  const hireEscrow = await query.findHireEscrowAddress(mint, lender);
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

  const method = program.methods.takeHire(days).accounts({
    lender,
    mint,
    edition,
    hire,
    hireEscrow,
    tokenManager,
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

  await method.rpc();
}

export async function extendHire(
  connection: anchor.web3.Connection,
  wallet: AnchorWallet,
  mint: anchor.web3.PublicKey,
  lender: anchor.web3.PublicKey,
  metadata: Metadata,
  days: number
) {
  const provider = getProvider(connection, wallet);
  const program = getProgram(provider);

  const hire = await query.findHireAddress(mint, lender);
  const hireEscrow = await query.findHireEscrowAddress(mint, lender);
  const tokenManager = await query.findTokenManagerAddress(mint, lender);
  const [metadataAddress] = await query.findMetadataAddress(mint);

  const creatorAccounts = metadata.data.creators?.map((creator) => ({
    pubkey: creator.address,
    isSigner: false,
    isWritable: true,
  }));

  const method = program.methods.extendHire(days).accounts({
    lender,
    mint,
    hire,
    hireEscrow,
    tokenManager,
    metadata: metadataAddress,
    borrower: wallet.publicKey,
    systemProgram: anchor.web3.SystemProgram.programId,
    tokenProgram: splToken.TOKEN_PROGRAM_ID,
    clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
  });

  if (creatorAccounts?.length) {
    method.remainingAccounts(creatorAccounts);
  }

  await method.rpc();
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

  const hire = await query.findHireAddress(mint, wallet.publicKey);
  const hireEscrow = await query.findHireEscrowAddress(mint, wallet.publicKey);
  const tokenManager = await query.findTokenManagerAddress(
    mint,
    wallet.publicKey
  );
  const [edition] = await query.findEditionAddress(mint);

  const hireTokenAccount = (await connection.getTokenLargestAccounts(mint))
    .value[0].address;

  await program.methods
    .recoverHire()
    .accounts({
      borrower,
      mint,
      hire,
      hireEscrow,
      tokenManager,
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
